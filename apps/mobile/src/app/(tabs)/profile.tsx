import { useEffect, useState } from "react";
import { Alert, Linking, View } from "react-native";
import { BADGES, POINT_RULES, pointsFor } from "@trekne/brand";
import type { Role } from "@trekne/db";
import { Icon } from "@/components/icon";
import { BadgeTile, IconTile, LevelCard, Press, SectionTitle } from "@/components/kit";
import { Eyes } from "@/components/mascot";
import { Button, Pill, Row, Screen, T } from "@/components/ui";
import { useAuth } from "@/lib/auth";
import { useProgress } from "@/lib/progress";
import { supabase } from "@/lib/supabase";
import { F, radius, useBrand } from "@/lib/theme";

const REQUESTS = [
  { key: "ranger", label: "Ranger", body: "Report from the trail, capture 360 views", icon: "shield", tone: "green" },
  { key: "community", label: "Community steward", body: "Closures, sacred days, heritage", icon: "flag", tone: "yellow" },
  { key: "business", label: "Business", body: "Homestay, operator or guide", icon: "store", tone: "blue" },
] as const;

export default function Profile() {
  const b = useBrand();
  const { profile, role, previewFrom, previewAs, refresh } = useAuth();
  const { progress } = useProgress();
  const superAdmin = role?.key === "super_admin" || previewFrom?.key === "super_admin";
  const [roles, setRoles] = useState<Pick<Role, "key" | "name" | "color">[]>([]);
  useEffect(() => {
    if (!superAdmin) return;
    supabase.from("roles").select("key, name, color").lt("rank", 100).order("rank", { ascending: false }).then(({ data }) => setRoles(data ?? []));
  }, [superAdmin]);
  if (!profile) return null;
  const earned = BADGES.filter((x) => x.value(progress) >= x.goal).length;

  async function request(key: (typeof REQUESTS)[number]["key"] | null) {
    const { error } = await supabase.from("profiles").update({ requested_role: key }).eq("id", profile!.id);
    if (error) return Alert.alert("Couldn't send", error.message);
    await refresh();
  }

  return (
    <Screen>
      {/* Avatar */}
      <View style={{ backgroundColor: b.orange, borderRadius: radius.xl, padding: 22, alignItems: "center", gap: 10 }}>
        <View style={{ backgroundColor: b.yellow, borderRadius: 60, padding: 16 }}><Eyes size={46} /></View>
        <T v="h2" color={b.ink}>{profile.full_name || "Traveller"}</T>
        <T v="small" color={b.ink} style={{ opacity: 0.75 }}>{profile.email}</T>
        {/* Fixed colours: this sits on orange in both themes */}
        {role && <Pill label={role.name} color={role.color} bg="#FFFFFF" />}
      </View>

      <LevelCard progress={progress} />

      <SectionTitle title="Badges" action={`${earned}/${BADGES.length}`} />
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {BADGES.map((badge) => <BadgeTile key={badge.id} badge={badge} progress={progress} />)}
      </View>

      <SectionTitle title="How points work" />
      <View style={{ backgroundColor: b.surface, borderRadius: radius.lg, padding: 14, gap: 10 }}>
        {POINT_RULES.map((r) => (
          <Row key={r.key} gap={10}>
            <IconTile icon={r.icon} tone="yellow" size={34} round />
            <T style={{ flex: 1, fontFamily: F.semibold }}>{r.label}</T>
            <T v="mono" muted>{progress[r.key] ?? 0}×</T>
            <View style={{ minWidth: 48, alignItems: "flex-end" }}><T style={{ fontFamily: F.bold }}>+{r.points}</T></View>
          </Row>
        ))}
        <View style={{ height: 1.5, backgroundColor: b.line }} />
        <Row style={{ justifyContent: "space-between" }}><T style={{ fontFamily: F.bold }}>Total</T><T v="h3">{pointsFor(progress)} pts</T></Row>
        <T v="small" muted>Accuracy beats volume: a verified report is worth ten times a filed one.</T>
      </View>

      {profile.requested_role ? (
        <View style={{ backgroundColor: b.tint.pending, borderRadius: radius.lg, padding: 16, gap: 8 }}>
          <Row><IconTile icon="clock" tone="yellow" size={40} round /><T v="h3" style={{ flex: 1 }}>{`Waiting for approval: ${profile.requested_role}`}</T></Row>
          <T v="small" muted>The Trekne team reviews requests. Your new tools appear here the moment you're approved.</T>
          <Button title="Withdraw request" small variant="ghost" onPress={() => request(null)} />
        </View>
      ) : role?.key === "traveller" ? (
        <>
          <SectionTitle title="Do more with Trekne" />
          {REQUESTS.map((r) => (
            <Press key={r.key} onPress={() => request(r.key)} style={{ backgroundColor: b.surface, borderRadius: radius.lg, padding: 14, flexDirection: "row", gap: 12, alignItems: "center" }}>
              <IconTile icon={r.icon} tone={r.tone} size={46} />
              <View style={{ flex: 1 }}><T v="h3">{`Become a ${r.label}`}</T><T v="small" muted>{r.body}</T></View>
              <Icon name="chevronRight" color={b.muted} />
            </Press>
          ))}
        </>
      ) : null}

      {superAdmin && (
        <>
          <SectionTitle title="Preview as role" />
          <View style={{ backgroundColor: b.surface, borderRadius: radius.lg, padding: 14, gap: 12 }}>
            <T v="small" muted>
              {previewFrom ? `You're seeing the app as a ${role?.name}. Your data access stays the same.` : "See the app's tabs and tools as another role would."}
            </T>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {roles.map((r) => {
                const on = role?.key === r.key;
                return (
                  <Press key={r.key} onPress={() => previewAs(on ? null : r.key)} style={{ flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 8, paddingHorizontal: 12, borderRadius: radius.pill, backgroundColor: on ? b.text : b.chip }}>
                    <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: r.color }} />
                    <T style={{ fontFamily: F.bold, fontSize: 13 }} color={on ? b.bg : b.text}>{r.name}</T>
                  </Press>
                );
              })}
            </View>
            {previewFrom && <Button title="Stop preview" small icon="close" variant="ghost" onPress={() => previewAs(null)} />}
          </View>
        </>
      )}

      <Row>
        <Button title="trekne.in" variant="ghost" icon="globe" onPress={() => Linking.openURL("https://trekne.in")} style={{ flex: 1 }} />
        <Button title="Sign out" variant="ink" icon="logout" onPress={() => supabase.auth.signOut()} style={{ flex: 1 }} />
      </Row>
    </Screen>
  );
}
