import { View } from "react-native";
import { Button } from "../ui/Button";
import { Text } from "../ui/Text";

export type EmptyStateProps = { title: string; hint?: string; actionLabel?: string; onAction?: () => void };

export function EmptyState({ title, hint, actionLabel, onAction }: EmptyStateProps) {
  return (
    <View style={{ alignItems: "center", gap: 8, padding: 24 }}>
      <Text variant="title">{title}</Text>
      {hint ? (
        <Text muted style={{ textAlign: "center" }}>
          {hint}
        </Text>
      ) : null}
      {actionLabel && onAction ? <Button label={actionLabel} onPress={onAction} /> : null}
    </View>
  );
}
