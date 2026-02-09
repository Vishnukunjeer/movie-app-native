import { Stack } from "expo-router";
import "./global.css";
import { StatusBar } from "expo-status-bar";
import GlobalProvider from "@/context/GlobalProvider";
import { SavedProvider } from "@/context/SavedProvider";

export default function RootLayout() {
  return (
    <GlobalProvider>
      <SavedProvider>
      <StatusBar style="light" backgroundColor="#0F0D23" hidden={true} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="sign-in" />
        <Stack.Screen name="sign-up" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="movies/[id]" />
      </Stack>
      </SavedProvider>
    </GlobalProvider>
  );
}