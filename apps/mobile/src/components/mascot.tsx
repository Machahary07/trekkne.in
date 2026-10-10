import { useEffect } from "react";
import { View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withDelay, withRepeat, withSequence, withSpring, withTiming } from "react-native-reanimated";
import Svg, { Circle, Path } from "react-native-svg";
import { brand } from "@trekne/brand";

/** Logo mark: orange dome with two eyes (same paths as the site). */
export function LogoMark({ width = 40 }: { width?: number }) {
  return (
    <Svg width={width} height={(width * 30) / 40} viewBox="0 0 40 30">
      <Path d="M2 30a18 18 0 0 1 36 0z" fill={brand.orange} />
      <Circle cx={13.5} cy={20} r={5.5} fill="#fff" />
      <Circle cx={26.5} cy={20} r={5.5} fill="#fff" />
      <Circle cx={14.5} cy={20.5} r={2.8} fill={brand.ink} />
      <Circle cx={27.5} cy={20.5} r={2.8} fill={brand.ink} />
    </Svg>
  );
}

export type EyeMode = "idle" | "look" | "closed" | "peek";

const LOOK = { duration: 400, dampingRatio: 1 } as const;
const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);

/**
 * The mascot's eyes.
 * - idle: looking at the user, blinking every few seconds (like the site)
 * - look: pupils follow `look` (-1..1 on each axis), e.g. a text cursor
 * - closed: both eyes shut (a password is being typed)
 * - peek: one eye shut, the other squinting and darting (the password is visible)
 */
export function Eyes({ size = 96, mode = "idle", look }: { size?: number; mode?: EyeMode; look?: { x: number; y: number } }) {
  const reduced = useReducedMotion();
  const blink = useSharedValue(1);
  const px = useSharedValue(0);
  const py = useSharedValue(0);
  const dart = useSharedValue(0);
  const lidL = useSharedValue(1);
  const lidR = useSharedValue(1);
  const lx = look?.x ?? 0;
  const ly = look?.y ?? 0;

  useEffect(() => {
    if (reduced || mode === "closed" || mode === "peek") {
      blink.set(withTiming(1, { duration: 100 }));
      return;
    }
    blink.set(withRepeat(withSequence(withDelay(5200, withTiming(0.08, { duration: 90 })), withTiming(1, { duration: 120 })), -1));
  }, [blink, mode, reduced]);

  useEffect(() => {
    const lid = (v: number) => (reduced ? v : withTiming(v, { duration: 180, easing: EASE_OUT }));
    const move = (v: number) => (reduced ? v : withSpring(v, LOOK));
    if (mode === "closed") {
      lidL.set(lid(0.06)); lidR.set(lid(0.06));
      px.set(move(0)); py.set(move(0.6)); dart.set(0);
    } else if (mode === "peek") {
      lidL.set(lid(0.06)); lidR.set(lid(0.45));
      px.set(move(lx)); py.set(move(0.8));
      dart.set(reduced ? 0 : withRepeat(withSequence(withTiming(-0.35, { duration: 420, easing: EASE_OUT }), withTiming(0.35, { duration: 420, easing: EASE_OUT })), -1, true));
    } else {
      lidL.set(lid(1)); lidR.set(lid(1));
      px.set(move(mode === "look" ? lx : 0)); py.set(move(mode === "look" ? ly : 0));
      dart.set(reduced ? 0 : withTiming(0, { duration: 150 }));
    }
  }, [mode, lx, ly, reduced, lidL, lidR, px, py, dart]);

  const range = size * 0.17;
  const leftEye = useAnimatedStyle(() => ({ transform: [{ scaleY: lidL.get() * blink.get() }] }));
  const rightEye = useAnimatedStyle(() => ({ transform: [{ scaleY: lidR.get() * blink.get() }] }));
  const pupil = useAnimatedStyle(() => ({ transform: [{ translateX: (px.get() + dart.get()) * range }, { translateY: py.get() * range }] }));

  const pupilSize = size * 0.58;
  const eye = (style: typeof leftEye) => (
    <Animated.View style={[{ width: size, height: size, borderRadius: size / 2, backgroundColor: "#fff", alignItems: "center", justifyContent: "center", overflow: "hidden" }, style]}>
      <Animated.View style={pupil}>
        <Svg width={pupilSize} height={pupilSize} viewBox="0 0 100 100">
          {/* conic pupil with the site's highlight notch */}
          <Path d="M50 50 L84.7 14 A50 50 0 1 1 50 0 Z" fill={brand.ink} transform="rotate(18 50 50)" />
        </Svg>
      </Animated.View>
    </Animated.View>
  );
  return (
    <View style={{ flexDirection: "row", gap: size * 0.14 }} accessible={false} importantForAccessibility="no-hide-descendants">
      {eye(leftEye)}
      {eye(rightEye)}
    </View>
  );
}
