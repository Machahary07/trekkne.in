// Per-weight imports so only the weights we use are bundled.
import { BricolageGrotesque_700Bold } from "@expo-google-fonts/bricolage-grotesque/700Bold";
import { BricolageGrotesque_800ExtraBold } from "@expo-google-fonts/bricolage-grotesque/800ExtraBold";
import { Figtree_400Regular } from "@expo-google-fonts/figtree/400Regular";
import { Figtree_500Medium } from "@expo-google-fonts/figtree/500Medium";
import { Figtree_600SemiBold } from "@expo-google-fonts/figtree/600SemiBold";
import { Figtree_700Bold } from "@expo-google-fonts/figtree/700Bold";
import { JetBrainsMono_500Medium } from "@expo-google-fonts/jetbrains-mono/500Medium";
import { useFonts } from "expo-font";
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AuthProvider, useAuth } from "@/lib/auth";
import { flush } from "@/lib/outbox";
import { F, useBrand } from "@/lib/theme";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fonts] = useFonts({
    BricolageGrotesque_700Bold, BricolageGrotesque_800ExtraBold,
    Figtree_400Regular, Figtree_500Medium, Figtree_600SemiBold, Figtree_700Bold,
    JetBrainsMono_500Medium,
  });
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <Navigator fontsReady={fonts} />
      </AuthProvider>
    </GestureHandlerRootView>
  );
}

function Navigator({ fontsReady }: { fontsReady: boolean }) {
  const { ready, session } = useAuth();
  const b = useBrand();
  const done = ready && fontsReady;

  useEffect(() => {
    if (done) SplashScreen.hideAsync();
  }, [done]);
  useEffect(() => {
    if (session) flush();
  }, [session]);
  if (!done) return null;

  const base = b.mode === "dark" ? DarkTheme : DefaultTheme;
  const theme = { ...base, colors: { ...base.colors, background: b.bg, card: b.bg, text: b.text, border: b.line, primary: b.orange } };

  return (
    <ThemeProvider value={theme}>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: b.bg },
          headerTitleStyle: { fontFamily: F.displayBold, color: b.text },
          headerTintColor: b.text,
          headerStyle: { backgroundColor: b.bg },
          headerShadowVisible: false,
          headerBackButtonDisplayMode: "minimal",
        }}
      >
        <Stack.Protected guard={!!session}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="destination/[slug]" options={{ headerShown: true, headerTransparent: true, title: "" }} />
          <Stack.Screen name="trip/[id]" options={{ headerShown: true, title: "Trip" }} />
          <Stack.Screen name="report" options={{ presentation: "modal", headerShown: true, title: "Field report" }} />
          <Stack.Screen name="capture" options={{ presentation: "fullScreenModal", gestureEnabled: false }} />
          <Stack.Screen name="scene/[id]" options={{ headerShown: true, title: "360 scene" }} />
        </Stack.Protected>
        <Stack.Protected guard={!session}>
          <Stack.Screen name="sign-in" />
        </Stack.Protected>
      </Stack>
    </ThemeProvider>
  );
}
