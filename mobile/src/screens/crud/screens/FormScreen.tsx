import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, View } from "react-native";
import { QueryState } from "../../../components/common/QueryState";
import { Button, Input, Screen, Text, useTheme } from "../../../components/ui";
import { itemSchema, STATUSES, useItem, useSaveItem, type Item, type ItemStatus } from "../api";

type Values = { title: string; description: string; status: ItemStatus; category: string };
type Errors = Partial<Record<keyof Values, string>>;
const EMPTY: Values = { title: "", description: "", status: "todo", category: "" };

/** Create (no `id` param) or edit (`id` param). Plain controlled inputs + zod; no form library. */
export default function FormScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const itemId = id ? Number(id) : undefined;
  const query = useItem(itemId);
  return (
    <Screen scroll>
      {itemId === undefined ? (
        <Form />
      ) : (
        <QueryState query={query} isEmpty={() => false}>
          {(item: Item) => <Form item={item} />}
        </QueryState>
      )}
    </Screen>
  );
}

function Form({ item }: { item?: Item }) {
  const router = useRouter();
  const { colors, radius } = useTheme();
  const save = useSaveItem(item?.id);
  const [values, setValues] = useState<Values>(
    item ? { title: item.title, description: item.description, status: item.status, category: item.category } : EMPTY,
  );
  const [errors, setErrors] = useState<Errors>({});
  const set = <K extends keyof Values>(k: K, v: Values[K]) => {
    setValues((s) => ({ ...s, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const submit = () => {
    const parsed = itemSchema.safeParse(values);
    if (!parsed.success) {
      const next: Errors = {};
      for (const issue of parsed.error.issues) next[issue.path[0] as keyof Values] ??= issue.message;
      setErrors(next);
      return;
    }
    // The list is invalidated by useSaveItem; go back on success.
    save.mutate(parsed.data, { onSuccess: () => router.back() });
  };

  return (
    <>
      <Text variant="display">{item ? "Edit item" : "New item"}</Text>
      <Input label="Title" value={values.title} onChangeText={(t) => set("title", t)} error={errors.title} />
      <Input label="Description" value={values.description} onChangeText={(t) => set("description", t)} multiline error={errors.description} />
      <View style={{ gap: 4 }}>
        <Text variant="caption" muted>
          Status
        </Text>
        <View style={{ flexDirection: "row", gap: 8 }}>
          {STATUSES.map((s) => {
            const on = values.status === s;
            return (
              <Pressable
                key={s}
                accessibilityRole="radio"
                accessibilityState={{ selected: on }}
                accessibilityLabel={s}
                onPress={() => set("status", s)}
                style={{
                  minHeight: 44,
                  paddingHorizontal: 16,
                  justifyContent: "center",
                  borderRadius: radius,
                  borderWidth: 1,
                  borderColor: on ? colors.primary : colors.input,
                  backgroundColor: on ? colors.primary : colors.background,
                }}
              >
                <Text style={{ color: on ? colors["primary-foreground"] : colors.foreground }}>{s}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>
      <Input label="Category" value={values.category} onChangeText={(t) => set("category", t)} error={errors.category} />
      {save.isError ? <Text style={{ color: colors.destructive }}>{save.error.message}</Text> : null}
      <Button label="Save" loading={save.isPending} onPress={submit} />
      <Button label="Cancel" variant="ghost" onPress={() => router.back()} />
    </>
  );
}
