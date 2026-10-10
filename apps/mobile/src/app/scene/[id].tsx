import { Stack, useLocalSearchParams } from "expo-router";
import { View } from "react-native";
import { PANORAMA_BUCKET, type PanoramaFrame } from "@trekne/db";
import PanoramaDom from "@/components/panorama-dom";
import { Empty, Loading, Pill, Row, T } from "@/components/ui";
import { ago, must, useLoad } from "@/lib/data";
import { supabase } from "@/lib/supabase";
import { useBrand } from "@/lib/theme";

export default function SceneScreen() {
  const b = useBrand();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, loading } = useLoad(async () => {
    const scene = await must(supabase.from("panoramas").select("id,title,status,frames,hfov,vfov,captured_at,destinations(name)").eq("id", id).single());
    const list = (scene.frames as unknown as PanoramaFrame[]) ?? [];
    const signed = list.length ? await must(supabase.storage.from(PANORAMA_BUCKET).createSignedUrls(list.map((f) => f.path), 3600)) : [];
    const byPath = new Map(signed.map((s) => [s.path, s.signedUrl]));
    return { scene, frames: list.flatMap((f) => (byPath.get(f.path) ? [{ url: byPath.get(f.path)!, q: f.q }] : [])) };
  }, [id]);

  if (loading && !data) return <Loading />;
  if (!data) return <Empty title="Scene not found" />;
  return (
    <View style={{ flex: 1, backgroundColor: b.ink }}>
      <Stack.Screen options={{ title: data.scene.destinations?.name ?? "360 scene" }} />
      {data.frames.length ? (
        <PanoramaDom frames={data.frames} hfov={data.scene.hfov} vfov={data.scene.vfov} dom={{ style: { flex: 1 }, scrollEnabled: false, contentInsetAdjustmentBehavior: "never" }} />
      ) : (
        <Empty icon="sphere" title="Still uploading" body="The photos for this scene haven't finished uploading." />
      )}
      <Row style={{ position: "absolute", top: 12, left: 12, right: 12, justifyContent: "space-between" }} >
        <Pill label={data.scene.status} level={data.scene.status === "published" ? "good" : "warn"} bg={b.white} />
        <T v="small" color={b.white}>{ago(data.scene.captured_at)} · drag to look around</T>
      </Row>
    </View>
  );
}
