import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import type { ReactNode } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

const queryClient = new QueryClient();

/**
 * Font files by theme font name (theme.ts `fonts`). Add `"Inter Variable": require("...ttf")`
 * to ship a custom font; until then the system font is used. Keys must match theme.ts.
 */
const fontFiles: Record<string, number> = {};

export function Providers({ children }: { children: ReactNode }) {
  const [loaded, error] = useFonts(fontFiles);
  if (!loaded && !error) return null;
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </SafeAreaProvider>
  );
}
