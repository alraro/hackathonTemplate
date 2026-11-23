import { Text as RNText, type TextProps as RNTextProps } from "react-native";
import { useTheme } from "./useTheme";

const scale = {
  display: { size: 32, line: 40, weight: "700", font: "display" },
  title: { size: 22, line: 28, weight: "600", font: "display" },
  body: { size: 16, line: 24, weight: "400", font: "body" },
  caption: { size: 13, line: 18, weight: "400", font: "body" },
  mono: { size: 14, line: 20, weight: "400", font: "mono" },
} as const;

export type TextVariant = keyof typeof scale;

export type TextProps = RNTextProps & { variant?: TextVariant; muted?: boolean };

export function Text({ variant = "body", muted, style, ...props }: TextProps) {
  const { colors, fonts } = useTheme();
  const v = scale[variant];
  return (
    <RNText
      accessibilityRole={variant === "display" || variant === "title" ? "header" : undefined}
      {...props}
      style={[
        {
          color: muted ? colors["muted-foreground"] : colors.foreground,
          fontFamily: fonts[v.font],
          fontSize: v.size,
          lineHeight: v.line,
          fontWeight: v.weight,
        },
        style,
      ]}
    />
  );
}
