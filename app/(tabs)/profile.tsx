import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Alert,
  ScrollView,
  TextInput,
} from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";

import { icons } from "@/constants/icons";
import { useGlobalContext } from "@/context/GlobalProvider";
import {
  signOut,
  uploadFile,
  updateUserAvatar,
  databases,
  appwriteConfig,
} from "@/services/appwrite";

const Profile = () => {
  const { user, setUser, setIsLogged } = useGlobalContext();

  const [username, setUsername] = useState(user?.username ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [saving, setSaving] = useState(false);

  // 🔴 Logout
  const logout = async () => {
    try {
      await signOut();
    } catch {}
    setUser(null);
    setIsLogged(false);
    router.replace("/sign-in");
  };

  // 📸 Pick image (Gallery or Camera)
  const pickImage = async (fromCamera = false) => {
    const permission =
      fromCamera
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permission required");
      return;
    }

    const result = fromCamera
      ? await ImagePicker.launchCameraAsync({
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        })
      : await ImagePicker.launchImageLibraryAsync({
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });

    if (result.canceled) return;

    try {
      const imageUrl = await uploadFile(result.assets[0]);
      await updateUserAvatar(user.$id, imageUrl);
      setUser({ ...user, avatar: imageUrl });
      Alert.alert("Success", "Profile image updated");
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }
  };

  // ✏️ Update profile info
  const updateProfile = async () => {
    if (!username.trim()) {
      Alert.alert("Username required");
      return;
    }

    try {
      setSaving(true);

      const updated = await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.userCollectionId,
        user.$id,
        {
          username,
          phone, // ✅ phone saved in DB
        }
      );

      setUser(updated);
      Alert.alert("Profile updated");
    } catch (err: any) {
      Alert.alert("Error", err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView className="bg-[#0F0D23] h-full">
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View className="px-5 pt-5">

          {/* Logout */}
          <View className="flex-row justify-end mb-6">
            <TouchableOpacity onPress={logout} className="flex-row gap-2">
              <Text className="text-red-400 font-semibold">Logout</Text>
              <Image source={icons.logout} className="w-5 h-5" tintColor="#F87171" />
            </TouchableOpacity>
          </View>

          {/* Avatar */}
          <View className="items-center mb-6">
            <View className="w-32 h-32 rounded-full border border-[#A8B5DB] justify-center items-center">
              <Image
                source={{
                  uri: user?.avatar
                    ? user.avatar
                    : "https://placehold.co/200x200/1a1a1a/ffffff.png",
                }}
                className="w-[95%] h-[95%] rounded-full"
              />

              {/* Camera */}
              <TouchableOpacity
                onPress={() => pickImage(true)}
                className="absolute bottom-1 left-1 bg-white p-2 rounded-full"
              >
                <Ionicons name="camera" size={18} color="#0F0D23" />
              </TouchableOpacity>

              {/* Gallery */}
              <TouchableOpacity
                onPress={() => pickImage(false)}
                className="absolute bottom-1 right-1 bg-white p-2 rounded-full"
              >
                <Ionicons name="image" size={18} color="#0F0D23" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Email (readonly) */}
          <Text className="text-gray-400 mb-1">Email</Text>
          <TextInput
            value={user?.email}
            editable={false}
            className="bg-[#1F1D3A] text-gray-400 px-4 py-3 rounded-lg mb-4"
          />

          {/* Username */}
          <Text className="text-gray-400 mb-1">Username</Text>
          <TextInput
            value={username}
            onChangeText={setUsername}
            className="bg-[#1F1D3A] text-white px-4 py-3 rounded-lg mb-4"
          />

          {/* Phone */}
          <Text className="text-gray-400 mb-1">Phone Number</Text>
          <TextInput
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            className="bg-[#1F1D3A] text-white px-4 py-3 rounded-lg mb-6"
          />

          {/* Save */}
          <TouchableOpacity
            onPress={updateProfile}
            disabled={saving}
            className="bg-[#A8B5DB] py-4 rounded-xl"
          >
            <Text className="text-center text-[#0F0D23] font-bold">
              {saving ? "Saving..." : "Save Changes"}
            </Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Profile;
