import { Redirect, Tabs, useSegments } from "expo-router";
import { TABS } from "../../src/app/tabs";

export default function TabsLayout() {
  const segments: string[] = useSegments();
  const current = segments[1] ?? "index";
  if (TABS.some((t) => t.name === current && !t.enabled)) return <Redirect href="/" />;

  return (
    <Tabs>
      {TABS.map(({ name, title, icon: Icon, enabled }) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{
            title,
            href: enabled ? undefined : null,
            tabBarIcon: ({ color, size }) => <Icon color={color} size={size} />,
          }}
        />
      ))}
    </Tabs>
  );
}
