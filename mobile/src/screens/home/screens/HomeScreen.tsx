import { EmptyState } from "../../../components/common/EmptyState";
import { Button, Card, Screen, Text } from "../../../components/ui";

// TODO(#92): replace this placeholder with the real HomeScreen.
export default function HomeScreen() {
  return (
    <Screen scroll>
      <Text variant="display">Home</Text>
      <Card>
        <Text variant="title">Placeholder</Text>
        <Text muted>Built with the theme primitives.</Text>
        <Button label="Primary" onPress={() => {}} />
      </Card>
      <EmptyState title="Nothing here yet" />
    </Screen>
  );
}
