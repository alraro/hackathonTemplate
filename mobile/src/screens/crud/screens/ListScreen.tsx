import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { FlatList, View } from "react-native";
import { EmptyState } from "../../../components/common/EmptyState";
import { QueryState } from "../../../components/common/QueryState";
import { Button, Input, ListItem, Screen, Text, useTheme } from "../../../components/ui";
import { useItems, type Item } from "../api";

function useDebounced<T>(value: T, ms: number) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

export default function ListScreen() {
  const router = useRouter();
  const { colors, radius } = useTheme();
  const [search, setSearch] = useState("");
  const q = useDebounced(search.trim(), 300);
  const query = useItems(q);
  const rows = useMemo(() => query.data?.pages.flatMap((p) => p.items), [query.data]);
  const create = () => router.push("/crud/form");

  return (
    <Screen>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <Text variant="display">Items</Text>
        <Button label="New" onPress={create} />
      </View>
      <Input label="Search" value={search} onChangeText={setSearch} placeholder="Search items" returnKeyType="search" />
      <QueryState query={{ ...query, data: rows }} isEmpty={() => false}>
        {(items: Item[]) => (
          <FlatList
            data={items}
            keyExtractor={(i) => String(i.id)}
            refreshing={query.isRefetching && !query.isFetchingNextPage}
            onRefresh={() => query.refetch()}
            onEndReached={() => query.hasNextPage && !query.isFetchingNextPage && query.fetchNextPage()}
            onEndReachedThreshold={0.5}
            ListEmptyComponent={
              <EmptyState
                title={q ? "No matches" : "No items yet"}
                hint={q ? "Try a different search." : "Create your first item."}
                actionLabel="Create item"
                onAction={create}
              />
            }
            renderItem={({ item }) => (
              <ListItem
                title={item.title}
                subtitle={item.category || undefined}
                onPress={() => router.push({ pathname: "/crud/[id]", params: { id: String(item.id) } })}
                trailing={
                  <View style={{ backgroundColor: colors.secondary, borderRadius: radius, paddingHorizontal: 8, paddingVertical: 2 }}>
                    <Text variant="caption" style={{ color: colors["secondary-foreground"] }}>
                      {item.status}
                    </Text>
                  </View>
                }
              />
            )}
          />
        )}
      </QueryState>
    </Screen>
  );
}
