import { Link, router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, ScrollView, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FormField from '@/components/FormField';
import { icons } from '@/constants/icons'; // Ensure this path is correct
import { getCurrentUser, signIn } from '@/services/appwrite';
import { useGlobalContext } from '@/context/GlobalProvider';

const SignIn = () => {
  const [form, setForm] = useState({
    email: '',
    password: '',
  });
  const [isSubmitting, setSubmitting] = useState(false);
  const { setUser, setIsLogged } = useGlobalContext();

  const submit = async () => {
    if (form.email === "" || form.password === "") {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setSubmitting(true);

    try {
      // 1. Log the user in
      await signIn(form.email, form.password);

      // 2. Fetch their account details immediately
      const result = await getCurrentUser();

      // 3. CRITICAL CHECK: If no data returned, permissions are wrong
      if (!result) {
        throw new Error("Login succeeded but failed to fetch user data. Check Appwrite Permissions.");
      }

      // 4. Update Global State
      setUser(result);
      setIsLogged(true);

      Alert.alert("Success", "User signed in successfully");
      
      // 5. Navigate to Home (or Profile)
      router.replace('/(tabs)');
      
    } catch (error: any) {
      console.log("Sign In Error:", error);
      Alert.alert('Error', error.message || 'Failed to sign in. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="bg-[#0F0D23] h-full">
      <ScrollView>
        <View className="w-full justify-center min-h-[85vh] px-4 my-6">

          {/* Logo Section */}
          <View className="items-center">
             <Image source={icons.logo} resizeMode="contain" className="w-[115px] h-[35px]" />
          </View>

          <Text className="text-2xl text-white font-semibold mt-10 font-psemibold">
            Log in to <Text className="text-[#A8B5DB]">MovieApp</Text>
          </Text>

          {/* Form Fields */}
          <FormField
            title="Email"
            value={form.email}
            handleChangeText={(e: string) => setForm({ ...form, email: e })}
            otherStyles="mt-7"
            keyboardType="email-address"
            placeholder="Enter your email"
          />

          <FormField
            title="Password"
            value={form.password}
            handleChangeText={(e: string) => setForm({ ...form, password: e })}
            otherStyles="mt-7"
            placeholder="Enter your password"
          />

          {/* Submit Button */}
          <TouchableOpacity
            onPress={submit}
            activeOpacity={0.7}
            disabled={isSubmitting} // Prevent double clicking
            className={`bg-[#A8B5DB] rounded-full min-h-[62px] justify-center items-center mt-7 ${isSubmitting ? 'opacity-50' : ''}`}
          >
            {isSubmitting ? (
                 <ActivityIndicator color="#0F0D23" />
            ) : (
                 <Text className="text-[#0F0D23] font-bold text-lg">Sign In</Text>
            )}
          </TouchableOpacity>

          {/* Sign Up Link */}
          <View className="justify-center pt-5 flex-row gap-2">
            <Text className="text-gray-100 font-regular">
              {"Don't have an account?"}
            </Text>
            <Link href="/sign-up" className="text-[#A8B5DB] font-semibold">
              Sign Up
            </Link>
          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SignIn;