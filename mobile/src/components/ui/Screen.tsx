import type { ReactNode } from "react";
import { ScrollView, View, type ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "./useTheme";

export type ScreenProps = { children: ReactNode; scroll?: boolean; style?: ViewStyle };

export function Screen({ children, scroll, style }: ScreenProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const base: ViewStyle = {
    flexGrow: 1,
    padding: 16,
    paddingTop: insets.top + 16,
    paddingBottom: insets.bottom + 16,
    gap: 12,
  };
  if (scroll) {
    return (
      <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={[base, style]}>
        {children}
      </ScrollView>
    );
  }
  return <View style={[{ flex: 1, backgroundColor: colors.background }, base, style]}>{children}</View>;
}
