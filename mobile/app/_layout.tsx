import { Stack } from "expo-router";
import { Providers } from "../src/app/providers";
import { SessionProvider } from "../src/lib/session";

export default function RootLayout() {
  return (
    <Providers>
      <SessionProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </SessionProvider>
    </Providers>
  );
}
