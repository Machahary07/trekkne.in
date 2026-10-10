import { useEffect } from "react";
import { View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withTiming } from "react-native-reanimated";
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

/** The mascot's eyes, blinking every 7s like the site. `look` shifts the pupils (-1..1). */
export function Eyes({ size = 96, look = { x: 0.2, y: -0.15 } }: { size?: number; look?: { x: number; y: number } }) {
  const blink = useSharedValue(1);
  useEffect(() => {
    blink.value = withRepeat(withSequence(withDelay(6500, withTiming(0.08, { duration: 90 })), withTiming(1, { duration: 120 })), -1);
  }, [blink]);
  const eyeStyle = useAnimatedStyle(() => ({ transform: [{ scaleY: blink.value }] }));
  const pupil = size * 0.58;
  const eye = (
    <Animated.View style={[{ width: size, height: size, borderRadius: size / 2, backgroundColor: "#fff", alignItems: "center", justifyContent: "center" }, eyeStyle]}>
      <Svg width={pupil} height={pupil} viewBox="0 0 100 100" style={{ transform: [{ translateX: look.x * size * 0.14 }, { translateY: look.y * size * 0.14 }] }}>
        {/* conic pupil with the site's 44° highlight notch */}
        <Path d="M50 50 L84.7 14 A50 50 0 1 1 50 0 Z" fill={brand.ink} transform="rotate(18 50 50)" />
      </Svg>
    </Animated.View>
  );
  return <View style={{ flexDirection: "row", gap: size * 0.14 }}>{eye}{eye}</View>;
}
