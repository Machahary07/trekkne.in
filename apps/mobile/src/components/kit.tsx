/**
 * Visual building blocks for the app: photo place cards, glance signals, rings, action tiles, badges.
 * Follows DESIGN.md: flat brand-colour blocks, ink text on colour, very round shapes, no borders or shadows.
 */
import { Image } from "expo-image";
import { useEffect } from "react";
import { Pressable, ScrollView, View, type PressableProps, type StyleProp, type ViewStyle } from "react-native";
import Animated, { Easing, useAnimatedProps, useAnimatedStyle, useReducedMotion, useSharedValue, withSpring, withTiming } from "react-native-reanimated";
import Svg, { Circle } from "react-native-svg";
import { LEVEL_COLOR, MONTHS, levelFor, pointsFor, type Badge, type Level, type Progress } from "@trekne/brand";
import type { DestinationOverview } from "@trekne/db";
import { glance, type Signal } from "@/lib/glance";
import { photoFor } from "@/lib/photos";
import { F, radius, useBrand } from "@/lib/theme";
import { Icon, type IconName } from "./icon";
import { T } from "./ui";

type Brand = ReturnType<typeof useBrand>;
export type Tone = "orange" | "yellow" | "blue" | "green" | "ink";
const toneBg = (b: Brand, t: Tone) => (t === "ink" ? b.text : b[t]);
const toneFg = (b: Brand, t: Tone) => (t === "ink" ? b.bg : b.ink);
const levelBg = (b: Brand, l: Level) => LEVEL_COLOR[l] ?? b.chip;

// ---------- press feedback (scale on press-in, DESIGN.md: no hover, active scale only) ----------
export function Press({ children, style, onPress, ...rest }: PressableProps & { style?: StyleProp<ViewStyle>; children: React.ReactNode }) {
  const scale = useSharedValue(1);
  const anim = useAnimatedStyle(() => ({ transform: [{ scale: scale.get() }] }));
  return (
    <Pressable {...rest} onPress={onPress}
      onPressIn={() => scale.set(withTiming(0.97, { duration: 110, easing: Easing.bezier(0.23, 1, 0.32, 1) }))}
      onPressOut={() => scale.set(withSpring(1, { duration: 300, dampingRatio: 0.8 }))}>
      <Animated.View style={[anim, style]}>{children}</Animated.View>
    </Pressable>
  );
}

export function IconTile({ icon, tone = "orange", bg, size = 44, round }: { icon: IconName; tone?: Tone; bg?: string; size?: number; round?: boolean }) {
  const b = useBrand();
  return (
    <View style={{ width: size, height: size, borderRadius: round ? size / 2 : size * 0.32, backgroundColor: bg ?? toneBg(b, tone), alignItems: "center", justifyContent: "center" }}>
      <Icon name={icon} size={size * 0.5} color={bg ? b.ink : toneFg(b, tone)} />
    </View>
  );
}

// ---------- ring gauge ----------
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
export function Ring({ value, size = 64, stroke = 8, color, track, children }: { value: number; size?: number; stroke?: number; color: string; track?: string; children?: React.ReactNode }) {
  const b = useBrand();
  const reduced = useReducedMotion();
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const p = useSharedValue(0);
  useEffect(() => {
    const v = Math.max(0, Math.min(1, value));
    p.set(reduced ? v : withTiming(v, { duration: 700, easing: Easing.bezier(0.23, 1, 0.32, 1) }));
  }, [value, reduced, p]);
  const props = useAnimatedProps(() => ({ strokeDashoffset: c * (1 - p.get()) }));
  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <Svg width={size} height={size} style={{ position: "absolute" }}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={track ?? b.chip} strokeWidth={stroke} fill="none" />
        <AnimatedCircle cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth={stroke} fill="none" strokeLinecap="round"
          strokeDasharray={c} animatedProps={props} transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      </Svg>
      {children}
    </View>
  );
}

// ---------- glance signals ----------
export function SignalChip({ s, onPhoto, size = "md" }: { s: Signal; onPhoto?: boolean; size?: "sm" | "md" }) {
  const b = useBrand();
  const d = size === "sm" ? 22 : 28;
  const unknown = s.level === "none";
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 6, paddingRight: 10, paddingLeft: 3, paddingVertical: 3, borderRadius: radius.pill, backgroundColor: onPhoto ? "rgba(16,19,31,.55)" : b.surface2 }}>
      <View style={{ width: d, height: d, borderRadius: d / 2, backgroundColor: unknown ? "transparent" : levelBg(b, s.level), borderWidth: unknown ? 2 : 0, borderColor: onPhoto ? "#fff" : b.muted, alignItems: "center", justifyContent: "center" }}>
        <Icon name={s.icon} size={d * 0.55} color={unknown ? (onPhoto ? "#fff" : b.muted) : b.ink} />
      </View>
      <T v="small" color={onPhoto ? "#fff" : b.text} style={{ fontFamily: F.bold, fontSize: size === "sm" ? 12 : 13 }}>{s.word}</T>
    </View>
  );
}

export function SignalRow({ o, onPhoto, size }: { o: Parameters<typeof glance>[0]; onPhoto?: boolean; size?: "sm" | "md" }) {
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
      {glance(o).map((s) => <SignalChip key={s.key} s={s} onPhoto={onPhoto} size={size} />)}
    </View>
  );
}

/** Big glance tile used on a place page: icon in a coloured circle, one word, a label. */
export function SignalTile({ s, detail }: { s: Signal; detail?: string }) {
  const b = useBrand();
  const unknown = s.level === "none";
  return (
    <View style={{ flex: 1, minWidth: 96, backgroundColor: b.surface, borderRadius: radius.md, padding: 12, gap: 8, alignItems: "flex-start" }}>
      <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: unknown ? "transparent" : levelBg(b, s.level), borderWidth: unknown ? 2.5 : 0, borderColor: b.muted, alignItems: "center", justifyContent: "center" }}>
        <Icon name={s.icon} size={21} color={unknown ? b.muted : b.ink} />
      </View>
      <T v="h3" color={unknown ? b.muted : b.text}>{s.word}</T>
      <T v="label">{s.label}</T>
      {detail ? <T v="small" muted numberOfLines={2}>{detail}</T> : null}
    </View>
  );
}

// ---------- photo place card ----------
export function PlaceCard({ slug, name, sub, overview, onPress, width, height = 190, badge }: {
  slug: string; name: string; sub?: string; overview?: Parameters<typeof glance>[0] | null; onPress?: () => void;
  width?: number; height?: number; badge?: { label: string; tone: Tone; icon?: IconName };
}) {
  const b = useBrand();
  const photo = photoFor(slug);
  return (
    <Press onPress={onPress} style={{ width, height, borderRadius: radius.lg, overflow: "hidden", backgroundColor: b.blue }} accessibilityRole="button" accessibilityLabel={name}>
      {photo ? <Image source={photo.src} style={{ position: "absolute", inset: 0 }} contentFit="cover" accessibilityLabel={photo.alt} transition={150} />
        : <View style={{ position: "absolute", inset: 0, alignItems: "center", justifyContent: "center" }}><Icon name="mountain" size={64} color={b.ink} /></View>}
      {/* scrim so white text stays readable on any photo */}
      <View style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: "70%", backgroundColor: "rgba(16,19,31,.0)" }}>
        <View style={{ flex: 1, backgroundColor: "rgba(16,19,31,.15)" }} />
        <View style={{ flex: 1, backgroundColor: "rgba(16,19,31,.5)" }} />
        <View style={{ flex: 1.2, backgroundColor: "rgba(16,19,31,.72)" }} />
      </View>
      {badge && (
        <View style={{ position: "absolute", top: 12, left: 12, flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: toneBg(b, badge.tone), paddingVertical: 5, paddingHorizontal: 10, borderRadius: radius.pill }}>
          {badge.icon && <Icon name={badge.icon} size={14} color={toneFg(b, badge.tone)} />}
          <T v="small" color={toneFg(b, badge.tone)} style={{ fontFamily: F.bold, fontSize: 12 }}>{badge.label}</T>
        </View>
      )}
      <View style={{ position: "absolute", left: 14, right: 14, bottom: 14, gap: 8 }}>
        <View>
          <T v="h3" color="#fff" numberOfLines={1} style={{ fontSize: 21, lineHeight: 24 }}>{name}</T>
          {sub ? <T v="small" color="rgba(255,255,255,.85)" numberOfLines={1}>{sub}</T> : null}
        </View>
        {overview ? <SignalRow o={overview} onPhoto size="sm" /> : null}
      </View>
    </Press>
  );
}

/** Small square photo of a place (falls back to a mountain tile). */
export function PlaceThumb({ slug, size = 52 }: { slug?: string | null; size?: number }) {
  const photo = photoFor(slug);
  return photo
    ? <Image source={photo.src} style={{ width: size, height: size, borderRadius: size * 0.27 }} contentFit="cover" accessibilityLabel={photo.alt} />
    : <IconTile icon="mountain" tone="blue" size={size} />;
}

// ---------- tiles, sections ----------
export function ActionTile({ icon, title, sub, tone, onPress, badge }: { icon: IconName; title: string; sub?: string; tone: Tone; onPress: () => void; badge?: number }) {
  const b = useBrand();
  const fg = toneFg(b, tone);
  return (
    <Press onPress={onPress} accessibilityRole="button" accessibilityLabel={title}
      style={{ flex: 1, minHeight: 128, backgroundColor: toneBg(b, tone), borderRadius: radius.lg, padding: 16, justifyContent: "space-between" }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
        <View style={{ width: 46, height: 46, borderRadius: 23, backgroundColor: tone === "ink" ? b.bg : "#fff", alignItems: "center", justifyContent: "center" }}>
          <Icon name={icon} size={23} color={b.ink} />
        </View>
        {!!badge && <View style={{ minWidth: 26, height: 26, borderRadius: 13, backgroundColor: b.ink, alignItems: "center", justifyContent: "center", paddingHorizontal: 7 }}><T v="small" color="#fff" style={{ fontFamily: F.bold }}>{badge}</T></View>}
      </View>
      <View>
        <T v="h3" color={fg}>{title}</T>
        {sub ? <T v="small" color={fg} style={{ opacity: 0.8 }} numberOfLines={1}>{sub}</T> : null}
      </View>
    </Press>
  );
}

export function SectionTitle({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  const b = useBrand();
  return (
    <View style={{ flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", marginTop: 8 }}>
      <T v="h2" style={{ fontSize: 24 }}>{title}</T>
      {action ? <Pressable onPress={onAction} hitSlop={10}><T v="small" color={b.orange} style={{ fontFamily: F.bold }}>{action}</T></Pressable> : null}
    </View>
  );
}

/** Horizontal strip that bleeds to the screen edges (pass the screen's padding). */
export function Carousel({ children, pad = 16, gap = 12 }: { children: React.ReactNode; pad?: number; gap?: number }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -pad }} contentContainerStyle={{ paddingHorizontal: pad, gap }}>
      {children}
    </ScrollView>
  );
}

export function DateTile({ iso, tone = "orange" }: { iso: string; tone?: Tone }) {
  const b = useBrand();
  const d = new Date(iso + "T00:00:00");
  return (
    <View style={{ width: 56, borderRadius: 16, backgroundColor: toneBg(b, tone), alignItems: "center", paddingVertical: 8 }}>
      <T v="h2" color={toneFg(b, tone)} style={{ fontSize: 24, lineHeight: 26 }}>{d.getDate()}</T>
      <T v="label" color={toneFg(b, tone)}>{MONTHS[d.getMonth()]}</T>
    </View>
  );
}

export function StatTile({ icon, value, label, tone }: { icon: IconName; value: number | string; label: string; tone: Tone }) {
  const b = useBrand();
  return (
    <View style={{ flex: 1, minWidth: 90, backgroundColor: b.surface, borderRadius: radius.md, padding: 12, gap: 6 }}>
      <IconTile icon={icon} tone={tone} size={34} />
      <T v="h2" style={{ fontSize: 26, lineHeight: 28 }}>{value}</T>
      <T v="label" numberOfLines={1}>{label}</T>
    </View>
  );
}

// ---------- gamification ----------
export function LevelCard({ progress, onPress, compact }: { progress: Progress; onPress?: () => void; compact?: boolean }) {
  const b = useBrand();
  const pts = pointsFor(progress);
  const lv = levelFor(pts);
  return (
    <Press onPress={onPress} disabled={!onPress} accessibilityRole={onPress ? "button" : undefined}
      style={{ backgroundColor: b.text, borderRadius: radius.lg, padding: compact ? 14 : 18, flexDirection: "row", alignItems: "center", gap: 14 }}>
      <Ring value={lv.progress} size={compact ? 58 : 76} stroke={compact ? 7 : 9} color={b.yellow} track={b.mode === "dark" ? "#2A3042" : "#2A3042"}>
        <T v="h2" color={b.bg} style={{ fontSize: compact ? 20 : 26 }}>{lv.level}</T>
      </Ring>
      <View style={{ flex: 1, gap: 2 }}>
        <T v="label" color={b.mode === "dark" ? b.muted : b.deepMuted}>Level {lv.level}</T>
        <T v="h3" color={b.bg}>{lv.name}</T>
        <T v="small" color={b.mode === "dark" ? b.muted : b.deepMuted}>
          {pts} points{lv.next ? ` · ${lv.toNext} to ${lv.next}` : " · top level"}
        </T>
      </View>
      {onPress ? <Icon name="chevronRight" color={b.bg} size={20} /> : <Icon name="trophy" color={b.yellow} size={26} />}
    </Press>
  );
}

export function BadgeTile({ badge, progress }: { badge: Badge; progress: Progress }) {
  const b = useBrand();
  const v = Math.min(badge.value(progress), badge.goal);
  const earned = v >= badge.goal;
  return (
    <View style={{ width: "31%", flexGrow: 1, alignItems: "center", gap: 6, backgroundColor: b.surface, borderRadius: radius.md, paddingVertical: 14, paddingHorizontal: 8, opacity: earned ? 1 : 0.9 }}
      accessible accessibilityLabel={`${badge.name}: ${earned ? "earned" : `${v} of ${badge.goal}`}. ${badge.hint}`}>
      <Ring value={v / badge.goal} size={62} stroke={5} color={earned ? b[badge.color] : b.muted}>
        <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: earned ? b[badge.color] : b.chip, alignItems: "center", justifyContent: "center" }}>
          <Icon name={badge.icon} size={22} color={earned ? b.ink : b.muted} />
        </View>
      </Ring>
      <T v="small" style={{ fontFamily: F.bold, textAlign: "center" }} numberOfLines={2}>{badge.name}</T>
      <T v="small" muted style={{ fontSize: 11.5, textAlign: "center" }} numberOfLines={2}>{earned ? "Earned" : `${v}/${badge.goal} · ${badge.hint}`}</T>
    </View>
  );
}

/** "+30" style hint that tells people what a choice is worth. */
export function PointsHint({ points, label }: { points: number; label: string }) {
  const b = useBrand();
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start", backgroundColor: b.tint.pending, paddingVertical: 4, paddingHorizontal: 10, borderRadius: radius.pill }}>
      <Icon name="star" size={14} color={b.mode === "dark" ? b.yellow : b.ink} />
      <T v="small" style={{ fontFamily: F.bold, fontSize: 12 }}>+{points} · {label}</T>
    </View>
  );
}

export type { DestinationOverview };
