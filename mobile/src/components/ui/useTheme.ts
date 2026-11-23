import { useEffect, useState } from "react";
import { AccessibilityInfo, useColorScheme } from "react-native";
import { colors, duration, fonts, radius } from "../../../theme";

/** Palette for the current color scheme (falls back to light when the preset has no dark). */
export function useTheme() {
  const scheme = useColorScheme();
  const palette = scheme === "dark" && "dark" in colors ? colors.dark : colors.light;
  return { colors: palette, radius, fonts, duration };
}

/** True when the OS asks for reduced motion. */
export function useReduceMotion() {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduce);
    const sub = AccessibilityInfo.addEventListener("reduceMotionChanged", setReduce);
    return () => sub.remove();
  }, []);
  return reduce;
}

/** Animation duration in ms: 0 under reduce-motion. */
export function useDuration(name: keyof typeof duration) {
  return useReduceMotion() ? 0 : duration[name];
}

export const MIN_TARGET = 44;
