import type { ReactNode } from "react";
import { ActivityIndicator, View } from "react-native";
import { Button } from "../ui/Button";
import { Text } from "../ui/Text";
import { useTheme } from "../ui/useTheme";
import { EmptyState } from "./EmptyState";

export type QueryStateProps<T> = {
  /** Subset of a TanStack Query result. */
  query: { data: T | undefined; isPending: boolean; isError: boolean; error?: unknown; refetch: () => unknown };
  /** Treat data as empty (default: empty array). */
  isEmpty?: (data: T) => boolean;
  emptyTitle?: string;
  emptyHint?: string;
  children: (data: T) => ReactNode;
};

/** Renders loading, error (with retry), empty, or the data. */
export function QueryState<T>({ query, isEmpty, emptyTitle = "Nothing here yet", emptyHint, children }: QueryStateProps<T>) {
  const { colors } = useTheme();
  if (query.isPending) {
    return (
      <View style={{ padding: 24, alignItems: "center" }} accessibilityLabel="Loading" accessibilityRole="progressbar">
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }
  if (query.isError || query.data === undefined) {
    const msg = query.error instanceof Error ? query.error.message : "Something went wrong.";
    return (
      <View style={{ alignItems: "center", gap: 8, padding: 24 }} accessibilityLiveRegion="polite">
        <Text variant="title">Could not load</Text>
        <Text muted style={{ textAlign: "center" }}>
          {msg}
        </Text>
        <Button label="Retry" variant="secondary" onPress={() => query.refetch()} />
      </View>
    );
  }
  const empty = isEmpty ? isEmpty(query.data) : Array.isArray(query.data) && query.data.length === 0;
  if (empty) return <EmptyState title={emptyTitle} hint={emptyHint} />;
  return <>{children(query.data)}</>;
}
