import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Icon } from "@/components/icon";
import { Eyes, LogoMark, type EyeMode } from "@/components/mascot";
import { Button, Row, T } from "@/components/ui";
import { supabase } from "@/lib/supabase";
import { F, radius, useBrand } from "@/lib/theme";

const ROLES = [
  { key: null, label: "Travelling" },
  { key: "ranger", label: "Guide / Ranger" },
  { key: "community", label: "Community steward" },
  { key: "business", label: "Business" },
] as const;

export default function SignIn() {
  const b = useBrand();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [req, setReq] = useState<(typeof ROLES)[number]["key"]>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [focus, setFocus] = useState<"name" | "email" | "password" | null>(null);
  const [caret, setCaret] = useState(0);
  const [showPw, setShowPw] = useState(false);

  // The mascot reads along with whatever is typed, shuts its eyes for a hidden password and peeks at a visible one.
  const eyeMode: EyeMode = focus === "password" ? (showPw ? "peek" : "closed") : focus ? "look" : "idle";
  const eyeLook = { x: Math.max(-1, Math.min(1, -1 + (2 * caret) / 26)), y: 0.85 };
  const track = (field: "name" | "email" | "password", value: string) => ({
    onFocus: () => { setFocus(field); setCaret(value.length); },
    onBlur: () => setFocus((f) => (f === field ? null : f)),
    onSelectionChange: (e: { nativeEvent: { selection: { end: number } } }) => setCaret(e.nativeEvent.selection.end),
  });

  const input = { backgroundColor: b.surface, color: b.text, borderRadius: radius.sm, paddingHorizontal: 16, paddingVertical: 14, fontFamily: F.body, fontSize: 16, borderWidth: 1.5, borderColor: b.line };

  async function submit() {
    setBusy(true);
    setMsg(null);
    const { data, error } =
      mode === "in"
        ? await supabase.auth.signInWithPassword({ email: email.trim(), password })
        : await supabase.auth.signUp({ email: email.trim(), password, options: { data: { full_name: name.trim(), requested_role: req }, emailRedirectTo: `${process.env.EXPO_PUBLIC_SITE_URL ?? "https://trekne.in"}/welcome` } });
    setBusy(false);
    if (error) return setMsg(error.message);
    if (mode === "up" && !data.session) setMsg("Check your email to confirm your account, then sign in.");
  }

  return (
    <View style={{ flex: 1, backgroundColor: b.orange }}>
      <SafeAreaView edges={["top"]} style={{ paddingHorizontal: 20, paddingTop: 8, gap: 18 }}>
        <Row gap={8}><LogoMark width={34} /><T v="h2" color={b.ink}>trekne</T></Row>
        <T v="hero" color={b.ink} style={{ marginTop: 6 }}>Know before{"\n"}<T v="hero" color={b.white}>you go.</T></T>
        <View style={{ alignSelf: "flex-end", marginRight: 4 }}><Eyes size={72} mode={eyeMode} look={eyeLook} /></View>
      </SafeAreaView>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <View style={{ flex: 1, backgroundColor: b.bg, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, padding: 20, gap: 12, marginTop: 12 }}>
          <T v="h1">{mode === "in" ? "Welcome back" : "Join Trekne"}</T>
          {mode === "up" && <TextInput style={input} placeholder="Full name" placeholderTextColor={b.muted} value={name} onChangeText={(v) => { setName(v); setCaret(v.length); }} autoComplete="name" {...track("name", name)} />}
          <TextInput style={input} placeholder="Email" placeholderTextColor={b.muted} value={email} onChangeText={(v) => { setEmail(v); setCaret(v.length); }} autoCapitalize="none" keyboardType="email-address" autoComplete="email" {...track("email", email)} />
          <View style={[input, { flexDirection: "row", alignItems: "center", paddingVertical: 0, paddingRight: 4 }]}>
            <TextInput style={{ flex: 1, paddingVertical: 14, fontFamily: F.body, fontSize: 16, color: b.text }} placeholder="Password (8+ characters)" placeholderTextColor={b.muted}
              value={password} onChangeText={(v) => { setPassword(v); setCaret(v.length); }} secureTextEntry={!showPw}
              autoComplete={mode === "in" ? "current-password" : "new-password"} autoCapitalize="none" {...track("password", password)} />
            <Pressable onPress={() => setShowPw((v) => !v)} hitSlop={8} accessibilityRole="button"
              accessibilityLabel={showPw ? "Hide password" : "Show password"}
              style={{ width: 44, height: 44, alignItems: "center", justifyContent: "center" }}>
              <Icon name={showPw ? "eyeoff" : "eye"} size={21} color={b.muted} />
            </Pressable>
          </View>
          {mode === "up" && (
            <View style={{ gap: 8 }}>
              <T v="label">I&rsquo;m</T>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {ROLES.map((r) => (
                  <Pressable key={r.label} onPress={() => setReq(r.key)}
                    style={{ paddingVertical: 9, paddingHorizontal: 14, borderRadius: radius.pill, backgroundColor: req === r.key ? b.text : b.chip }}>
                    <T v="small" color={req === r.key ? b.bg : b.text} style={{ fontFamily: F.bold }}>{r.label}</T>
                  </Pressable>
                ))}
              </View>
              {req && <T v="small" muted>You start as a traveller. Trekne staff approve {req === "ranger" ? "Rangers" : req === "community" ? "community stewards" : "businesses"} before the extra tools unlock.</T>}
            </View>
          )}
          {msg && <T v="small" color={b.orangeDeep}>{msg}</T>}
          <Button title={mode === "in" ? "Sign in" : "Create account"} icon="arrow" onPress={submit} loading={busy} disabled={!email || password.length < 8 || (mode === "up" && !name)} />
          <Button title={mode === "in" ? "New here? Create an account" : "I already have an account"} variant="ghost" onPress={() => { setMode(mode === "in" ? "up" : "in"); setMsg(null); }} />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
