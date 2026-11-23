import { ActivityIndicator, Pressable, type PressableProps } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { Text } from "./Text";
import { MIN_TARGET, useDuration, useTheme } from "./useTheme";

export type ButtonProps = Omit<PressableProps, "children" | "style"> & {
  label: string;
  variant?: "primary" | "secondary" | "destructive" | "ghost";
  loading?: boolean;
};

export function Button({ label, variant = "primary", loading, disabled, onPressIn, onPressOut, ...props }: ButtonProps) {
  const { colors, radius } = useTheme();
  const ms = useDuration("fast");
  const scale = useSharedValue(1);
  const animated = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const palette = {
    primary: { bg: colors.primary, fg: colors["primary-foreground"] },
    secondary: { bg: colors.secondary, fg: colors["secondary-foreground"] },
    destructive: { bg: colors.destructive, fg: "#ffffff" },
    ghost: { bg: "transparent", fg: colors.foreground },
  }[variant];
  const off = disabled || loading;

  return (
    <Animated.View style={animated}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ disabled: !!off, busy: !!loading }}
        disabled={off}
        {...props}
        onPressIn={(e) => {
          scale.value = withTiming(0.97, { duration: ms });
          onPressIn?.(e);
        }}
        onPressOut={(e) => {
          scale.value = withTiming(1, { duration: ms });
          onPressOut?.(e);
        }}
        style={{
          minHeight: MIN_TARGET,
          paddingHorizontal: 16,
          borderRadius: radius,
          backgroundColor: palette.bg,
          alignItems: "center",
          justifyContent: "center",
          opacity: off ? 0.5 : 1,
        }}
      >
        {loading ? (
          <ActivityIndicator color={palette.fg} />
        ) : (
          <Text style={{ color: palette.fg, fontWeight: "600" }}>{label}</Text>
        )}
      </Pressable>
    </Animated.View>
  );
}
