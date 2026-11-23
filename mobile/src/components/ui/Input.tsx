import { TextInput, View, type TextInputProps } from "react-native";
import { Text } from "./Text";
import { MIN_TARGET, useTheme } from "./useTheme";

export type InputProps = Omit<TextInputProps, "style"> & { label: string; error?: string };

export function Input({ label, error, ...props }: InputProps) {
  const { colors, radius, fonts } = useTheme();
  return (
    <View style={{ gap: 4 }}>
      <Text variant="caption" muted>
        {label}
      </Text>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={colors["muted-foreground"]}
        {...props}
        style={{
          minHeight: MIN_TARGET,
          paddingHorizontal: 12,
          borderRadius: radius,
          borderWidth: 1,
          borderColor: error ? colors.destructive : colors.input,
          backgroundColor: colors.background,
          color: colors.foreground,
          fontFamily: fonts.body,
          fontSize: 16,
        }}
      />
      {error ? (
        <Text variant="caption" style={{ color: colors.destructive }} accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : null}
    </View>
  );
}
