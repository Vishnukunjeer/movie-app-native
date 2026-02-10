import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useGlobalContext } from "@/context/GlobalProvider";

export default function Index() {
  const { isLogged, isLoading } = useGlobalContext();

  // ⏳ Wait until Appwrite session check finishes
  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-[#0F0D23]">
        <ActivityIndicator size="large" color="#A8B5DB" />
      </View>
    );
  }

  // 🔐 Not logged in → Sign In
  if (!isLogged) {
    return <Redirect href="/sign-in" />;
  }

  // ✅ Logged in → Tabs
  return <Redirect href="/(tabs)" />;
}
