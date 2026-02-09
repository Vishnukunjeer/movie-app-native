
import React, { useState } from 'react';
import {  Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const FormField = ({ title, value, placeholder, handleChangeText, otherStyles, ...props }: any) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <View className={`space-y-2 ${otherStyles}`}>
            <Text className="text-base text-gray-100 font-medium ml-1">{title}</Text>

            <View className="w-full h-16 px-4 bg-black/20 border-2 border-[#2b2b3d] rounded-2xl focus:border-[#A8B5DB] items-center flex-row">
                <TextInput
                    className="flex-1 text-white font-semibold text-base"
                    value={value}
                    placeholder={placeholder}
                    placeholderTextColor="#7b7b8b"
                    onChangeText={handleChangeText}
                    secureTextEntry={title === 'Password' && !showPassword}
                    {...props}
                />

                {title === 'Password' && (
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                        {/* Replace with your eye icon or a simple Text if you don't have icons yet */}
                        <Ionicons
                            name={!showPassword ? "eye" : "eye-off"}
                            size={24}
                            color="#A8B5DB"
                        />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};

export default FormField;