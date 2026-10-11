import * as Haptics from "expo-haptics";
import { forwardRef } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View, type PressableProps, type ScrollViewProps, type StyleProp, type TextProps, type TextStyle, type ViewStyle } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { LEVEL_COLOR, REPORT_LABEL, RISK_LABEL, spring, type Level, type ReportStatus } from "@trekne/brand";
import { F, radius, tracking, useBrand } from "@/lib/theme";
import { Icon, type IconName } from "./icon";

// ---------- text ----------
type Variant = "hero" | "h1" | "h2" | "h3" | "body" | "small" | "label" | "mono" | "eyebrow";
const SIZES: Record<Variant, TextStyle> = {
  hero: { fontFamily: F.display, fontSize: 52, lineHeight: 46, letterSpacing: tracking(-0.055, 52) },
  h1: { fontFamily: F.display, fontSize: 36, lineHeight: 36, letterSpacing: tracking(-0.03, 36) },
  h2: { fontFamily: F.display, fontSize: 26, lineHeight: 28, letterSpacing: tracking(-0.03, 26) },
  h3: { fontFamily: F.displayBold, fontSize: 19, lineHeight: 22, letterSpacing: tracking(-0.02, 19) },
  body: { fontFamily: F.body, fontSize: 16, lineHeight: 24 },
  small: { fontFamily: F.medium, fontSize: 13.5, lineHeight: 19 },
  label: { fontFamily: F.bold, fontSize: 12, letterSpacing: 0.96, textTransform: "uppercase" },
  mono: { fontFamily: F.mono, fontSize: 12.5, letterSpacing: tracking(-0.01, 12.5) },
  eyebrow: { fontFamily: F.semibold, fontSize: 12.5, letterSpacing: 1.5, textTransform: "uppercase" },
};

export function T({ v = "body", muted, color, style, ...rest }: TextProps & { v?: Variant; muted?: boolean; color?: string }) {
  const b = useBrand();
  const c = color ?? (muted || v === "label" || v === "eyebrow" ? b.muted : b.text);
  return <Text {...rest} style={[SIZES[v], { color: c }, style]} />;
}

export function Eyebrow({ children }: { children: string }) {
  const b = useBrand();
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
      <View style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: b.orange }} />
      <T v="eyebrow">{children}</T>
    </View>
  );
}

// ---------- layout ----------
export const Screen = forwardRef<ScrollView, ScrollViewProps & { edges?: ("top" | "bottom")[]; pad?: boolean }>(
  function Screen({ children, edges = ["top"], pad = true, contentContainerStyle, ...rest }, ref) {
    const b = useBrand();
    return (
      <SafeAreaView edges={edges} style={{ flex: 1, backgroundColor: b.bg }}>
        <ScrollView ref={ref} contentInsetAdjustmentBehavior="automatic" {...rest}
          contentContainerStyle={[pad && { padding: 16, paddingBottom: 120, gap: 14 }, contentContainerStyle]}>
          {children}
        </ScrollView>
      </SafeAreaView>
    );
  },
);

export function Card({ children, style, tone }: { children: React.ReactNode; style?: StyleProp<ViewStyle>; tone?: "surface" | "surface2" | "deep" }) {
  const b = useBrand();
  const bg = tone === "deep" ? b.text : tone === "surface2" ? b.surface2 : b.surface;
  return <View style={[{ backgroundColor: bg, borderRadius: radius.md, padding: 16, gap: 10 }, style]}>{children}</View>;
}

export function Row({ children, style, gap = 10 }: { children: React.ReactNode; style?: StyleProp<ViewStyle>; gap?: number }) {
  return <View style={[{ flexDirection: "row", alignItems: "center", gap }, style]}>{children}</View>;
}

// ---------- buttons ----------
type BtnVariant = "ink" | "green" | "ghost" | "orange" | "chip";
export function Button({ title, icon, variant = "ink", onPress, disabled, loading, small, style, textColor, ...rest }: PressableProps & {
  title: string; icon?: IconName; variant?: BtnVariant; loading?: boolean; small?: boolean; style?: StyleProp<ViewStyle>; textColor?: string;
}) {
  const b = useBrand();
  const scale = useSharedValue(1);
  const anim = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const bg = { ink: b.text, green: b.green, ghost: "transparent", orange: b.orange, chip: b.chip }[variant];
  const fg = textColor ?? { ink: b.bg, green: b.ink, ghost: b.text, orange: b.white, chip: b.text }[variant];
  return (
    <Pressable
      {...rest}
      disabled={disabled || loading}
      accessibilityRole="button"
      onPressIn={() => { scale.value = withSpring(0.97, spring); }}
      onPressOut={() => { scale.value = withSpring(1, spring); }}
      onPress={(e) => { Haptics.selectionAsync(); onPress?.(e); }}
    >
      <Animated.View style={[{
        flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: radius.pill, backgroundColor: bg,
        paddingVertical: small ? 9 : 15, paddingHorizontal: small ? 14 : 22, opacity: disabled ? 0.45 : 1,
        borderWidth: variant === "ghost" ? 2 : 0, borderColor: b.line,
      }, anim, style]}>
        {loading ? <ActivityIndicator color={fg} /> : icon ? <Icon name={icon} size={small ? 16 : 19} color={fg} /> : null}
        <Text style={{ fontFamily: F.bold, fontSize: small ? 14 : 16, color: fg }}>{title}</Text>
      </Animated.View>
    </Pressable>
  );
}

// ---------- status ----------
export function Dot({ level, size = 12 }: { level: Level; size?: number }) {
  const b = useBrand();
  const c = LEVEL_COLOR[level];
  return <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: c ?? "transparent", borderWidth: c ? 0 : 2.5, borderColor: b.muted }} />;
}

/** Ink on light backgrounds, white on dark ones, so a pill is readable whatever colour it sits on. */
export function onColor(bg: string, ink = "#10131F") {
  const h = bg.replace("#", "");
  if (h.length !== 6) return ink;
  const [r, g, bl] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * bl > 0.4 ? ink : "#FFFFFF";
}

export function Pill({ label, level, color, bg }: { label: string; level?: Level; color?: string; bg?: string }) {
  const b = useBrand();
  const tint = level === "good" ? b.tint.verified : level === "warn" ? b.tint.pending : level === "high" ? b.tint.high : b.chip;
  const fill = bg ?? tint;
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 5, paddingHorizontal: 10, borderRadius: radius.pill, backgroundColor: fill, alignSelf: "flex-start" }}>
      {level ? <Dot level={level} size={8} /> : color ? <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color }} /> : null}
      <Text style={{ fontFamily: F.bold, fontSize: 12, color: onColor(fill, b.ink), textTransform: "capitalize" }}>{label}</Text>
    </View>
  );
}

export function RiskPill({ level, score }: { level: Level; score?: number }) {
  return <Pill level={level} label={score != null ? `${score} · ${RISK_LABEL[level]}` : RISK_LABEL[level]} />;
}

export function StatusPill({ status }: { status: ReportStatus }) {
  const b = useBrand();
  const map: Record<ReportStatus, [string, string]> = {
    verified: [b.tint.verified, b.green], official: [b.tint.official, b.blue], pending: [b.tint.pending, b.yellow],
    unverified: [b.chip, b.muted], rejected: [b.chip, "#D23C0A"],
  };
  return <Pill label={REPORT_LABEL[status]} bg={map[status][0]} color={map[status][1]} />;
}

export function Empty({ icon = "leaf", title, body }: { icon?: IconName; title: string; body?: string }) {
  const b = useBrand();
  return (
    <Card style={{ alignItems: "center", paddingVertical: 28 }}>
      <Icon name={icon} size={30} color={b.muted} />
      <T v="h3" style={{ textAlign: "center" }}>{title}</T>
      {body ? <T muted style={{ textAlign: "center" }}>{body}</T> : null}
    </Card>
  );
}

export function Loading() {
  const b = useBrand();
  return <View style={{ padding: 40, alignItems: "center" }}><ActivityIndicator color={b.orange} /></View>;
}

export const s = StyleSheet.create({ grow: { flex: 1, minWidth: 0 } });
