import { Alert, Linking } from "react-native";
import { Icon } from "@/components/icon";
import { Eyes } from "@/components/mascot";
import { Button, Card, Eyebrow, Pill, Row, Screen, T } from "@/components/ui";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { useBrand } from "@/lib/theme";

const REQUESTS = [
  { key: "ranger", label: "Ranger", body: "Local guide filing field reports and 360 views." },
  { key: "community", label: "Community steward", body: "Share heritage protocols and festival details for your village." },
  { key: "business", label: "Business", body: "Homestay, operator or guide business listing." },
] as const;

export default function Profile() {
  const b = useBrand();
  const { profile, role, refresh } = useAuth();
  if (!profile) return null;

  async function request(key: (typeof REQUESTS)[number]["key"] | null) {
    const { error } = await supabase.from("profiles").update({ requested_role: key }).eq("id", profile!.id);
    if (error) return Alert.alert("Couldn't send", error.message);
    await refresh();
  }

  return (
    <Screen>
      <Card style={{ alignItems: "center", paddingVertical: 24, backgroundColor: b.orange }}>
        <Eyes size={56} />
        <T v="h2" color={b.ink}>{profile.full_name || "Traveller"}</T>
        <T v="small" color={b.ink}>{profile.email}</T>
        {role && <Pill label={role.name} color={role.color} bg={b.white} />}
      </Card>

      {role && (
        <Card>
          <Eyebrow>What your role can do</Eyebrow>
          <T>{role.description}</T>
          {role.permissions.length === 0 && <T v="small" muted>Plan trips, read verified advisories and file traveller reports.</T>}
          {role.permissions.filter((p) => p !== "*").map((p) => (
            <Row key={p} gap={8}><Icon name="check" size={17} color={b.green} /><T v="mono">{p}</T></Row>
          ))}
        </Card>
      )}

      {profile.requested_role ? (
        <Card tone="surface2">
          <Row><Icon name="id" color={b.text} /><T v="h3" style={{ flex: 1 }}>Request pending: {profile.requested_role}</T></Row>
          <T v="small" muted>The Trekne team reviews requests in the CRM.</T>
          <Button title="Withdraw request" small variant="ghost" onPress={() => request(null)} />
        </Card>
      ) : role?.key === "traveller" ? (
        <>
          <Eyebrow>Contribute</Eyebrow>
          {REQUESTS.map((r) => (
            <Card key={r.key}>
              <T v="h3">Become a {r.label}</T>
              <T v="small" muted>{r.body}</T>
              <Button title="Request" small variant="chip" onPress={() => request(r.key)} />
            </Card>
          ))}
        </>
      ) : null}

      <Button title="trekne.in" variant="ghost" icon="globe" onPress={() => Linking.openURL("https://trekne.in")} />
      <Button title="Sign out" variant="ink" icon="logout" onPress={() => supabase.auth.signOut()} />
    </Screen>
  );
}
