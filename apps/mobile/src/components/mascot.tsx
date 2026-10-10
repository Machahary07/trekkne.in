import { useEffect, useMemo } from "react";
import { View } from "react-native";
import Animated, { Easing, interpolateColor, useAnimatedStyle, useReducedMotion, useSharedValue, withDelay, withRepeat, withSequence, withSpring, withTiming } from "react-native-reanimated";
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
// Same curves and timings as the site's sign-in eyes (apps/web/app/globals.css, `[data-eyes]`).
const SHUT = Easing.bezier(0.55, 0, 0.45, 1);
const SPRING_OPEN = Easing.bezier(0.2, 0.9, 0.3, 1.12);

/**
 * The mascot's eyes, matching the site.
 * - idle: looking at the user, blinking every 7 s
 * - look: pupils follow `look` (-1..1 on each axis), e.g. a text cursor
 * - closed: both eyes squeeze shut into an ink line (a password is being typed)
 * - peek: the left eye stays shut, the right one is open and keeps looking (the password is visible)
 */
export function Eyes({ size = 96, mode = "idle", look }: { size?: number; mode?: EyeMode; look?: { x: number; y: number } }) {
  const reduced = useReducedMotion();
  const blink = useSharedValue(1);
  const px = useSharedValue(0);
  const py = useSharedValue(0);
  const left = useEyeLid();
  const right = useEyeLid();
  const lx = look?.x ?? 0;
  const ly = look?.y ?? 0;

  useEffect(() => {
    if (reduced || mode === "closed") {
      blink.set(1);
      return;
    }
    // 7 s loop: shut over ~140 ms at 93%, open over ~350 ms (the site's `blink` keyframes).
    blink.set(withRepeat(withSequence(withDelay(6510, withTiming(0.08, { duration: 140 })), withTiming(1, { duration: 350 })), -1));
  }, [blink, mode, reduced]);

  useEffect(() => {
    const shutL = mode === "closed" || mode === "peek";
    const shutR = mode === "closed";
    left.set(shutL, reduced);
    right.set(shutR, reduced);
    const move = (v: number) => (reduced ? v : withSpring(v, LOOK));
    const following = mode === "look" || mode === "peek";
    px.set(move(following ? lx : 0));
    py.set(move(following ? ly : 0));
  }, [mode, lx, ly, reduced, left, right, px, py]);

  const range = size * 0.2;
  const pupilMove = useAnimatedStyle(() => ({ transform: [{ translateX: px.get() * range }, { translateY: py.get() * range }] }));
  const leftEye = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(left.ink.get(), [0, 1], ["#FFFFFF", brand.ink]),
    transform: [{ scaleY: left.scale.get() * blink.get() }],
  }));
  const rightEye = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(right.ink.get(), [0, 1], ["#FFFFFF", brand.ink]),
    transform: [{ scaleY: right.scale.get() * blink.get() }],
  }));
  const leftPupil = useAnimatedStyle(() => ({ opacity: left.pupil.get() }));
  const rightPupil = useAnimatedStyle(() => ({ opacity: right.pupil.get() }));

  const pupilSize = size * 0.58;
  const eye = (style: typeof leftEye, pupilFade: typeof leftPupil) => (
    <Animated.View style={[{ width: size, height: size, borderRadius: size / 2, alignItems: "center", justifyContent: "center", overflow: "hidden" }, style]}>
      <Animated.View style={[pupilMove, pupilFade]}>
        <Svg width={pupilSize} height={pupilSize} viewBox="0 0 100 100">
          {/* conic pupil with the site's highlight notch */}
          <Path d="M50 50 L84.7 14 A50 50 0 1 1 50 0 Z" fill={brand.ink} transform="rotate(18 50 50)" />
        </Svg>
      </Animated.View>
    </Animated.View>
  );
  return (
    <View style={{ flexDirection: "row", gap: size * 0.14 }} accessible={false} importantForAccessibility="no-hide-descendants">
      {eye(leftEye, leftPupil)}
      {eye(rightEye, rightPupil)}
    </View>
  );
}

/** One eye's lid: `scale` squeezes it, `ink` turns it into an ink line, `pupil` fades the pupil out while shut. */
function useEyeLid() {
  const scale = useSharedValue(1);
  const ink = useSharedValue(0);
  const pupil = useSharedValue(1);
  return useMemo(
    () => ({
      scale,
      ink,
      pupil,
      set(shut: boolean, reduced: boolean) {
        if (reduced) {
          scale.set(shut ? 0.08 : 1); ink.set(shut ? 1 : 0); pupil.set(shut ? 0 : 1);
        } else if (shut) {
          // Ease shut, going ink as it thins; the pupil disappears just before it's a line.
          scale.set(withTiming(0.08, { duration: 300, easing: SHUT }));
          ink.set(withDelay(140, withTiming(1, { duration: 180 })));
          pupil.set(withDelay(200, withTiming(0, { duration: 80 })));
        } else {
          // Turn white at once and spring open.
          scale.set(withDelay(50, withTiming(1, { duration: 420, easing: SPRING_OPEN })));
          ink.set(withTiming(0, { duration: 140 }));
          pupil.set(withTiming(1, { duration: 100 }));
        }
      },
    }),
    [scale, ink, pupil],
  );
}
