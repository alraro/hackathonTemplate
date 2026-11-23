import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import type { ReactNode } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { fontFiles } from "./fonts";

const queryClient = new QueryClient();

export function Providers({ children }: { children: ReactNode }) {
  const [loaded, error] = useFonts(fontFiles);
  if (!loaded && !error) return null;
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </SafeAreaProvider>
  );
}
