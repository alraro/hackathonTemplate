import { View, type ViewProps } from "react-native";
import { useTheme } from "./useTheme";

export function Card({ style, ...props }: ViewProps) {
  const { colors, radius } = useTheme();
  return (
    <View
      {...props}
      style={[
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderWidth: 1,
          borderRadius: radius,
          padding: 16,
          gap: 8,
        },
        style,
      ]}
    />
  );
}
