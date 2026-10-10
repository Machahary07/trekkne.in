import { useState } from "react";
import { Alert, Pressable, TextInput, View } from "react-native";
import { DestinationPicker, type Picked } from "@/components/destination-picker";
import { Icon } from "@/components/icon";
import { Button, Card, Empty, Eyebrow, Pill, Row, Screen, T } from "@/components/ui";
import { useAuth } from "@/lib/auth";
import { addDays, fmtDay, must, todayIST, useLoad } from "@/lib/data";
import { supabase } from "@/lib/supabase";
import { F, radius, useBrand } from "@/lib/theme";

const KINDS = [
  { key: "sacred_day", label: "Sacred day" },
  { key: "closure", label: "Closure" },
  { key: "restriction", label: "Rule" },
  { key: "advisory", label: "Advice" },
] as const;
type Kind = (typeof KINDS)[number]["key"];

/** Community stewards: declare closures and sacred days, set rules, approve heritage, propose festivals. */
export default function Community() {
  const b = useBrand();
  const { profile } = useAuth();
  const today = todayIST();
  const [picking, setPicking] = useState<"notice" | "festival" | null>(null);
  const [place, setPlace] = useState<Picked | null>(null);
  const [kind, setKind] = useState<Kind>("sacred_day");
  const [from, setFrom] = useState(0);
  const [len, setLen] = useState(1);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [community, setCommunity] = useState("");
  const [busy, setBusy] = useState(false);
  const [fest, setFest] = useState<{ place: Picked | null; name: string; from: number; len: number }>({ place: null, name: "", from: 14, len: 1 });

  const { data, reload } = useLoad(async () => {
    const [notices, heritage, proposals] = await Promise.all([
      must(supabase.from("community_notices").select("id,kind,title,starts_on,ends_on,is_active,destinations(name)").eq("author_id", profile!.id).order("starts_on", { ascending: false })),
      must(supabase.from("heritage_sites").select("id,name,site_type,community,state_code,community_endorsed_at").eq("is_published", true).order("state_code").order("name")),
      must(supabase.from("events").select("id,name,starts_on,is_published").eq("created_by", profile!.id).order("starts_on")),
    ]);
    return { notices, heritage, proposals };
  });

  const input = { backgroundColor: b.surface2, borderRadius: radius.sm, padding: 13, fontFamily: F.body, fontSize: 16, color: b.text };

  async function publish() {
    if (!place) return;
    setBusy(true);
    const start = addDays(today, from);
    const { error } = await supabase.from("community_notices").insert({
      destination_id: place.id, kind, title: title.trim(), body: body.trim(), community: community.trim(),
      starts_on: start, ends_on: addDays(start, len - 1), author_id: profile!.id,
    });
    setBusy(false);
    if (error) return Alert.alert("Couldn't publish", error.message);
    Alert.alert("Published", "Travellers see this now, and planners treat closures and sacred days as closed.");
    setTitle(""); setBody("");
    reload();
  }

  async function proposeFestival() {
    if (!fest.place) return;
    const { data: d } = await supabase.from("destinations").select("state_code").eq("id", fest.place.id).single();
    const start = addDays(today, fest.from);
    const { error } = await supabase.from("events").insert({
      name: fest.name.trim(), community: community.trim(), state_code: d?.state_code ?? "ML", destination_id: fest.place.id,
      starts_on: start, ends_on: addDays(start, fest.len - 1),
    });
    if (error) return Alert.alert("Couldn't send", error.message);
    Alert.alert("Sent for review", "Trekne staff publish festivals after a quick check.");
    setFest({ place: null, name: "", from: 14, len: 1 });
    reload();
  }

  const step = (label: string, value: string, dec: () => void, inc: () => void) => (
    <Row style={{ justifyContent: "space-between" }}>
      <T v="label">{label}</T>
      <Row gap={8}>
        <Pressable onPress={dec} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: b.chip, alignItems: "center", justifyContent: "center" }}><T v="h3">−</T></Pressable>
        <T v="h3" style={{ minWidth: 120, textAlign: "center" }}>{value}</T>
        <Pressable onPress={inc} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: b.chip, alignItems: "center", justifyContent: "center" }}><T v="h3">+</T></Pressable>
      </Row>
    </Row>
  );

  return (
    <Screen>
      <T v="h1">Community</T>
      <T muted>You decide when visitors come and how your heritage is shown. Notices go live straight away.</T>

      <Card style={{ gap: 12 }}>
        <T v="h2">Declare a notice</T>
        <Row gap={4} style={{ backgroundColor: b.chip, borderRadius: radius.pill, padding: 3 }}>
          {KINDS.map((k) => (
            <Pressable key={k.key} onPress={() => setKind(k.key)} style={{ flex: 1, paddingVertical: 8, borderRadius: radius.pill, backgroundColor: kind === k.key ? b.yellow : "transparent", alignItems: "center" }}>
              <T v="small" color={kind === k.key ? b.ink : b.text} style={{ fontFamily: F.bold }}>{k.label}</T>
            </Pressable>
          ))}
        </Row>
        <Pressable onPress={() => setPicking("notice")} style={[input, { flexDirection: "row", justifyContent: "space-between", alignItems: "center" }]}>
          <T>{place?.name ?? "Choose the place"}</T><Icon name="chevronRight" size={18} color={b.muted} />
        </Pressable>
        {step("From", fmtDay(addDays(today, from)), () => setFrom(Math.max(0, from - 1)), () => setFrom(from + 1))}
        {step("Days", `${len} day${len > 1 ? "s" : ""}`, () => setLen(Math.max(1, len - 1)), () => setLen(Math.min(90, len + 1)))}
        <TextInput style={input} value={title} onChangeText={setTitle} placeholder="Short message, e.g. Village prayer day: trail closed" placeholderTextColor={b.muted} maxLength={120} />
        <TextInput style={[input, { minHeight: 80, textAlignVertical: "top" }]} value={body} onChangeText={setBody} multiline placeholder="Details for visitors (optional)" placeholderTextColor={b.muted} maxLength={1000} />
        <TextInput style={input} value={community} onChangeText={setCommunity} placeholder="Your village or council" placeholderTextColor={b.muted} />
        <Button title="Publish to travellers" icon="flag" onPress={publish} loading={busy} disabled={!place || title.trim().length < 3} />
      </Card>

      <Eyebrow>My notices</Eyebrow>
      {data?.notices.length ? data.notices.map((n) => (
        <Card key={n.id} style={{ gap: 6, opacity: n.is_active ? 1 : 0.55 }}>
          <Row style={{ justifyContent: "space-between" }}>
            <Pill label={KINDS.find((k) => k.key === n.kind)?.label ?? n.kind} level={n.kind === "closure" || n.kind === "sacred_day" ? "high" : "warn"} />
            <T v="mono" muted>{fmtDay(n.starts_on)}{n.ends_on !== n.starts_on ? ` – ${fmtDay(n.ends_on)}` : ""}</T>
          </Row>
          <T v="h3">{n.title}</T>
          <T v="small" muted>{n.destinations?.name}{n.ends_on < today ? " · ended" : n.is_active ? " · live" : " · off"}</T>
          <Row>
            <Button title={n.is_active ? "Withdraw" : "Republish"} small variant="chip" onPress={async () => {
              const { error } = await supabase.from("community_notices").update({ is_active: !n.is_active }).eq("id", n.id);
              if (error) Alert.alert("Couldn't update", error.message); else reload();
            }} />
          </Row>
        </Card>
      )) : <Empty icon="flag" title="No notices yet" body="Declare a sacred day or closure and every traveller planning that day is warned." />}

      <Eyebrow>Heritage descriptions</Eyebrow>
      <T v="small" muted>Approve the descriptions that represent your community correctly. Approved ones carry a community badge on trekne.in.</T>
      {data?.heritage.map((h) => (
        <Card key={h.id} style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <Icon name="temple" color={b.text} />
          <View style={{ flex: 1 }}>
            <T v="h3">{h.name}</T>
            <T v="small" muted>{h.site_type} · {h.community} · {h.state_code}</T>
          </View>
          <Button small title={h.community_endorsed_at ? "Approved" : "Approve"} variant={h.community_endorsed_at ? "green" : "chip"} icon={h.community_endorsed_at ? "check" : undefined}
            onPress={async () => {
              const { error } = await supabase.rpc("endorse_heritage", { site: h.id, endorse: !h.community_endorsed_at });
              if (error) Alert.alert("Couldn't update", error.message); else reload();
            }} />
        </Card>
      ))}

      <Card style={{ gap: 12 }}>
        <T v="h2">Propose a festival</T>
        <TextInput style={input} value={fest.name} onChangeText={(name) => setFest({ ...fest, name })} placeholder="Festival name" placeholderTextColor={b.muted} />
        <Pressable onPress={() => setPicking("festival")} style={[input, { flexDirection: "row", justifyContent: "space-between", alignItems: "center" }]}>
          <T>{fest.place?.name ?? "Where is it held?"}</T><Icon name="chevronRight" size={18} color={b.muted} />
        </Pressable>
        {step("Starts", fmtDay(addDays(today, fest.from)), () => setFest({ ...fest, from: Math.max(0, fest.from - 1) }), () => setFest({ ...fest, from: fest.from + 1 }))}
        {step("Days", `${fest.len}`, () => setFest({ ...fest, len: Math.max(1, fest.len - 1) }), () => setFest({ ...fest, len: Math.min(30, fest.len + 1) }))}
        <Button title="Send for review" variant="ghost" onPress={proposeFestival} disabled={!fest.place || fest.name.trim().length < 3} />
        {!!data?.proposals.length && data.proposals.map((p) => (
          <Row key={p.id} style={{ justifyContent: "space-between" }}>
            <T style={{ flex: 1 }}>{p.name} · {fmtDay(p.starts_on)}</T>
            <Pill label={p.is_published ? "Published" : "In review"} level={p.is_published ? "good" : "warn"} />
          </Row>
        ))}
      </Card>

      <DestinationPicker visible={!!picking} title={picking === "festival" ? "Where is the festival?" : "Which place?"}
        onClose={() => setPicking(null)}
        onPick={(d) => (picking === "festival" ? setFest((f) => ({ ...f, place: d })) : setPlace(d))} />
    </Screen>
  );
}
