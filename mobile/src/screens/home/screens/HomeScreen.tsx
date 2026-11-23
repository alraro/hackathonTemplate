import { useRouter, type Href } from "expo-router";
import { TABS } from "../../../app/tabs";
import { Card, ListItem, Screen, Text } from "../../../components/ui";

/** Home: one row per enabled tab (from `src/app/tabs.ts`), so it follows `features.json`. */
export default function HomeScreen() {
  const router = useRouter();
  const links = TABS.filter((t) => t.enabled && t.name !== "index");
  return (
    <Screen scroll>
      <Text variant="display">Home</Text>
      <Text muted>Pick a screen to start.</Text>
      <Card>
        {links.map(({ name, title }) => (
          <ListItem key={name} title={title} onPress={() => router.push(`/${name}` as Href)} />
        ))}
      </Card>
    </Screen>
  );
}
