import { Redirect, Tabs, useSegments } from "expo-router";
import features from "../../../features.json";
import { NotificationBell } from "../../src/components/common/NotificationBell";
import { useSession } from "../../src/lib/session";
import { TABS } from "../../src/app/tabs";

export default function TabsLayout() {
  const { user } = useSession();
  const userId = (features as Record<string, boolean>).notifications !== false ? user?.id : undefined;
  const segments: string[] = useSegments();
  const current = segments[1] ?? "index";
  if (TABS.some((t) => t.name === current && !t.enabled)) return <Redirect href="/" />;

  return (
    <Tabs screenOptions={{ headerRight: userId !== undefined ? () => <NotificationBell userId={userId} /> : undefined }}>
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
