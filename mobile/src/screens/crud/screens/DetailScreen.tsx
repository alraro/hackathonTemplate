import { useLocalSearchParams, useRouter } from "expo-router";
import { Alert, View } from "react-native";
import { QueryState } from "../../../components/common/QueryState";
import { Button, Card, Screen, Text } from "../../../components/ui";
import { useDeleteItem, useItem, type Item } from "../api";

export default function DetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const itemId = Number(id);
  const query = useItem(Number.isFinite(itemId) ? itemId : undefined);
  const del = useDeleteItem();

  const confirmDelete = () =>
    Alert.alert("Delete item?", "This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => del.mutate(itemId, { onSuccess: () => router.back() }) },
    ]);

  return (
    <Screen scroll>
      <Button label="Back" variant="ghost" onPress={() => router.back()} />
      <QueryState query={query} isEmpty={() => false}>
        {(item: Item) => (
          <>
            <Text variant="display">{item.title}</Text>
            <Card>
              <Field label="Description" value={item.description || "-"} />
              <Field label="Status" value={item.status} />
              <Field label="Category" value={item.category || "-"} />
              <Field label="Created" value={new Date(item.created_at).toLocaleString()} />
            </Card>
            <View style={{ gap: 8 }}>
              <Button label="Edit" onPress={() => router.push({ pathname: "/crud/form", params: { id: String(item.id) } })} />
              <Button label="Delete" variant="destructive" loading={del.isPending} onPress={confirmDelete} />
            </View>
          </>
        )}
      </QueryState>
    </Screen>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <View>
      <Text variant="caption" muted>
        {label}
      </Text>
      <Text>{value}</Text>
    </View>
  );
}
