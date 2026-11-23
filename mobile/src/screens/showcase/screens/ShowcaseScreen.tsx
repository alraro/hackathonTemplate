import type { ReactNode } from "react";
import { View } from "react-native";
import { Button, Card, Input, ListItem, Screen, Text, useTheme, type TextVariant } from "../../../components/ui";

const VARIANTS: TextVariant[] = ["display", "title", "body", "caption", "mono"];
const noop = () => {};

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={{ gap: 8 }}>
      <Text variant="title">{title}</Text>
      {children}
    </View>
  );
}

/** Static design reference: palette, type scale, every primitive in its states. */
export default function ShowcaseScreen() {
  const { colors, radius } = useTheme();
  return (
    <Screen scroll style={{ gap: 24 }}>
      <Text variant="display">Showcase</Text>

      <Section title="Palette">
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {Object.entries(colors).map(([name, value]) => (
            <View key={name} style={{ width: 100, gap: 4 }} accessibilityLabel={`${name} ${value}`}>
              <View style={{ height: 40, borderRadius: radius, backgroundColor: value, borderWidth: 1, borderColor: colors.border }} />
              <Text variant="caption">{name}</Text>
              <Text variant="caption" muted>
                {value}
              </Text>
            </View>
          ))}
        </View>
        <Text variant="caption" muted>
          Shows the current color scheme; switch the OS theme to see the other.
        </Text>
      </Section>

      <Section title="Type scale">
        {VARIANTS.map((v) => (
          <Text key={v} variant={v}>
            {v}: The quick brown fox
          </Text>
        ))}
        <Text muted>body (muted)</Text>
      </Section>

      <Section title="Button">
        {(["primary", "secondary", "destructive", "ghost"] as const).map((v) => (
          <View key={v} style={{ gap: 8 }}>
            <Button label={v} variant={v} onPress={noop} />
            <Button label={`${v} disabled`} variant={v} disabled onPress={noop} />
          </View>
        ))}
        <Button label="loading" loading onPress={noop} />
        <Text variant="caption" muted>
          Pressed state: hold a button; it scales to 97%.
        </Text>
      </Section>

      <Section title="Input">
        <Input label="Default" placeholder="Type here" />
        <Input label="With error" defaultValue="oops" error="This field is invalid" />
        <Input label="Disabled" defaultValue="Read only" editable={false} />
      </Section>

      <Section title="Card">
        <Card>
          <Text variant="title">Card title</Text>
          <Text muted>Card body text.</Text>
        </Card>
      </Section>

      <Section title="ListItem">
        <ListItem title="Pressable row" subtitle="With subtitle" onPress={noop} />
        <ListItem title="Static row" />
      </Section>

      <Section title="Reduced motion">
        <Text muted>
          Animations (the button press scale) use useDuration, which returns 0 ms when the OS asks for reduced motion.
        </Text>
      </Section>
    </Screen>
  );
}
