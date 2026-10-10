/**
 * Offline-first outbox for Ranger reports and 360 scenes.
 * Items (and their photos, copied into the app's documents folder) survive restarts and
 * upload when there's signal. client_id makes every retry idempotent on the server.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import { Directory, File, Paths } from "expo-file-system";
import { randomUUID } from "expo-crypto";
import { useEffect, useState } from "react";
import { PANORAMA_BUCKET, REPORT_PHOTO_BUCKET, type Enums, type Json, type PanoramaFrame, type Quat } from "@trekne/db";
import { supabase } from "./supabase";

export interface ReportItem {
  kind: "report";
  client_id: string;
  destination_id: string;
  destination_name: string;
  category: Enums<"report_category">;
  body: string;
  lat: number | null;
  lng: number | null;
  accuracy_m: number | null;
  captured_at: string;
  photos: string[];
}

export interface SceneItem {
  kind: "scene";
  client_id: string;
  destination_id: string;
  destination_name: string;
  title: string;
  lat: number | null;
  lng: number | null;
  hfov: number;
  vfov: number;
  captured_at: string;
  frames: { i: number; uri: string; q: Quat }[];
}

export type OutboxItem = (ReportItem | SceneItem) & { error?: string; progress?: string };

const KEY = "trekne.outbox.v1";
const listeners = new Set<(items: OutboxItem[]) => void>();
let items: OutboxItem[] = [];
let loaded = false;
let flushing = false;

async function load() {
  if (loaded) return;
  const raw = await AsyncStorage.getItem(KEY);
  items = raw ? JSON.parse(raw) : [];
  loaded = true;
}
async function persist() {
  await AsyncStorage.setItem(KEY, JSON.stringify(items));
  listeners.forEach((l) => l([...items]));
}
async function update(id: string, patch: Partial<OutboxItem>) {
  items = items.map((x) => (x.client_id === id ? ({ ...x, ...patch } as OutboxItem) : x));
  await persist();
}

/** Copy a temporary camera file somewhere the OS won't clear. */
export async function keepFile(uri: string, folder: string, name: string) {
  const dir = new Directory(Paths.document, "outbox", folder);
  if (!dir.exists) dir.create({ intermediates: true });
  const dest = new File(dir, name);
  if (dest.exists) dest.delete();
  await new File(uri).copy(dest);
  return dest.uri;
}

export const newId = () => randomUUID();

export async function enqueue(item: ReportItem | SceneItem) {
  await load();
  items = [...items.filter((x) => x.client_id !== item.client_id), item];
  await persist();
  flush();
}

async function upload(bucket: string, path: string, uri: string) {
  const bytes = await new File(uri).bytes();
  const { error } = await supabase.storage.from(bucket).upload(path, bytes, { contentType: "image/jpeg", upsert: false });
  // A retry after a partial upload hits an existing object — that's fine.
  if (error && !/exists|duplicate/i.test(error.message)) throw new Error(error.message);
}

async function sendReport(r: ReportItem) {
  const ins = await supabase.from("reports").upsert(
    {
      client_id: r.client_id, destination_id: r.destination_id, category: r.category, body: r.body,
      lat: r.lat, lng: r.lng, accuracy_m: r.accuracy_m, captured_at: r.captured_at,
    },
    { onConflict: "client_id", ignoreDuplicates: true },
  );
  if (ins.error) throw new Error(ins.error.message);
  const { data: row, error } = await supabase.from("reports").select("id, report_photos(storage_path)").eq("client_id", r.client_id).single();
  if (error) throw new Error(error.message);
  const have = new Set(row.report_photos.map((p) => p.storage_path));
  for (let k = 0; k < r.photos.length; k++) {
    const path = `${row.id}/${k}.jpg`;
    if (have.has(path)) continue;
    await update(r.client_id, { progress: `Photo ${k + 1} of ${r.photos.length}` });
    await upload(REPORT_PHOTO_BUCKET, path, r.photos[k]);
    const p = await supabase.from("report_photos").insert({ report_id: row.id, storage_path: path });
    if (p.error) throw new Error(p.error.message);
  }
}

async function sendScene(s: SceneItem) {
  const ins = await supabase.from("panoramas").upsert(
    {
      client_id: s.client_id, destination_id: s.destination_id, title: s.title, lat: s.lat, lng: s.lng,
      hfov: s.hfov, vfov: s.vfov, captured_at: s.captured_at, author_id: (await supabase.auth.getUser()).data.user?.id,
    },
    { onConflict: "client_id", ignoreDuplicates: true },
  );
  if (ins.error) throw new Error(ins.error.message);
  const { data: row, error } = await supabase.from("panoramas").select("id").eq("client_id", s.client_id).single();
  if (error) throw new Error(error.message);
  const frames: PanoramaFrame[] = [];
  for (const f of s.frames) {
    const path = `${row.id}/${String(f.i).padStart(2, "0")}.jpg`;
    await update(s.client_id, { progress: `Photo ${frames.length + 1} of ${s.frames.length}` });
    await upload(PANORAMA_BUCKET, path, f.uri);
    frames.push({ i: f.i, path, q: f.q });
  }
  const done = await supabase
    .from("panoramas")
    .update({ frames: frames as unknown as Json, frame_count: frames.length, cover_path: frames[0]?.path ?? null })
    .eq("id", row.id);
  if (done.error) throw new Error(done.error.message);
}

function cleanup(item: OutboxItem) {
  try {
    const dir = new Directory(Paths.document, "outbox", item.client_id);
    if (dir.exists) dir.delete();
  } catch {}
}

/** Try to upload everything. Safe to call often; runs one pass at a time. */
export async function flush() {
  await load();
  if (flushing || !items.length) return;
  const net = await NetInfo.fetch();
  if (net.isConnected === false) return;
  flushing = true;
  try {
    for (const item of [...items]) {
      try {
        await update(item.client_id, { error: undefined, progress: "Uploading" });
        if (item.kind === "report") await sendReport(item);
        else await sendScene(item);
        items = items.filter((x) => x.client_id !== item.client_id);
        await persist();
        cleanup(item);
      } catch (e) {
        await update(item.client_id, { error: e instanceof Error ? e.message : String(e), progress: undefined });
      }
    }
  } finally {
    flushing = false;
  }
}

export async function discard(clientId: string) {
  await load();
  const item = items.find((x) => x.client_id === clientId);
  items = items.filter((x) => x.client_id !== clientId);
  await persist();
  if (item) cleanup(item);
}

/** Live outbox contents; also retries whenever connectivity comes back. */
export function useOutbox() {
  const [list, setList] = useState<OutboxItem[]>(items);
  useEffect(() => {
    listeners.add(setList);
    load().then(() => setList([...items]));
    const unsub = NetInfo.addEventListener((s) => {
      if (s.isConnected) flush();
    });
    return () => {
      listeners.delete(setList);
      unsub();
    };
  }, []);
  return list;
}
