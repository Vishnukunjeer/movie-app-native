import { View, Text, ScrollView, Image, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, router } from 'expo-router';
import FormField from '@/components/FormField';
import { createUser } from '@/services/appwrite'; // Import createUser
import { useGlobalContext } from '@/context/GlobalProvider'; // Import Global Context
import { icons } from '@/constants/icons';

const SignUp = () => {
  const { setUser, setIsLogged } = useGlobalContext();
  
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [isSubmitting, setSubmitting] = useState(false);

  const submit = async () => {
    // 1. Validation
    if (form.username === "" || form.email === "" || form.password === "") {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setSubmitting(true);

    try {
      // 2. Create User (This function in appwrite.ts also handles the Sign In)
      const result = await createUser(form.email, form.password, form.username);

      // 3. CRITICAL: Update Global State immediately
      // If we don't do this, the Profile page will be empty!
      setUser(result);
      setIsLogged(true);

      // 4. Navigate to Home
      router.replace('/(tabs)');
      
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="bg-[#0F0D23] h-full">
      <ScrollView>
        <View className="w-full justify-center min-h-[85vh] px-4 my-6">
          
          <Image source={icons.logo} resizeMode="contain" className="w-[115px] h-[35px]" />
          <Text className="text-2xl text-white font-semibold mt-10 font-psemibold">
            Sign up to <Text className="text-[#A8B5DB]">MovieApp</Text>
          </Text>

          <FormField
            title="Username"
            value={form.username}
            handleChangeText={(e: string) => setForm({ ...form, username: e })}
            otherStyles="mt-10"
            placeholder="Create a username"
          />

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
            placeholder="Create a password"
          />

          <TouchableOpacity 
            onPress={submit}
            activeOpacity={0.7}
            disabled={isSubmitting}
            className={`bg-[#A8B5DB] rounded-full min-h-[62px] justify-center items-center mt-7 ${isSubmitting ? 'opacity-50' : ''}`}
          >
             {isSubmitting ? (
                 <ActivityIndicator color="#0F0D23" />
            ) : (
                <Text className="text-[#0F0D23] font-bold text-lg">Sign Up</Text>
            )}
          </TouchableOpacity>

          <View className="justify-center pt-5 flex-row gap-2">
            <Text className="text-gray-100 font-regular">
              Already have an account?
            </Text>
            <Link href="/sign-in" className="text-[#A8B5DB] font-semibold">
              Sign In
            </Link>
          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SignUp;