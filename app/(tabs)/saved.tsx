import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
} from "react-native";
import React, { useState, useCallback } from "react";
import { useGlobalContext } from "@/context/GlobalProvider";
import { getSavedMovies, unsaveMovie } from "@/services/appwrite";
import { Link, useFocusEffect } from "expo-router";

const Saved = () => {
  const { user } = useGlobalContext();
  const [movies, setMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔄 auto refresh when tab is focused
  useFocusEffect(
    useCallback(() => {
      if (!user) return;

      setLoading(true);
      getSavedMovies(user.$id)
        .then(setMovies)
        .finally(() => setLoading(false));
    }, [user])
  );

  const handleUnsave = async (docId: string) => {
    try {
      await unsaveMovie(docId);

      // 🔥 instant UI update
      setMovies(prev => prev.filter(movie => movie.$id !== docId));
    } catch (error) {
      console.log("Unsave error:", error);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-primary justify-center items-center">
        <Text className="text-gray-400">Loading saved movies...</Text>
      </View>
    );
  }

  if (movies.length === 0) {
    return (
      <View className="flex-1 bg-primary justify-center items-center px-6">
        <Text className="text-gray-400 text-base text-center">
          No saved movies yet ❤️
        </Text>
        <Text className="text-gray-500 text-sm mt-2 text-center">
          Save movies and they’ll appear here
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-primary px-5 pt-5">
      <FlatList
        data={movies}
        numColumns={3}
        keyExtractor={(item) => item.$id}
        columnWrapperStyle={{ gap: 16 }}
        contentContainerStyle={{ paddingBottom: 120 }}
        renderItem={({ item }) => (
          <View className="w-[30%] mb-5">
            <Link href={`/movies/${item.movieId}`} asChild>
              <TouchableOpacity activeOpacity={0.8}>
                <Image
                  source={{
                    uri: item.posterUrl
                      ? `https://image.tmdb.org/t/p/w500/${item.posterUrl}`
                      : "https://placehold.co/600x400/1a1a1a/ffffff.png",
                  }}
                  className="w-full h-52 rounded-lg"
                  resizeMode="cover"
                />

                <Text
                  className="text-sm font-bold text-white mt-2"
                  numberOfLines={1}
                >
                  {item.title}
                </Text>
              </TouchableOpacity>
            </Link>

            {/* 🔴 UNSAVE BUTTON */}
            <TouchableOpacity
              onPress={() => handleUnsave(item.$id)}
              activeOpacity={0.8}
              className="mt-2 bg-red-500 py-1.5 rounded-md"
            >
              <Text className="text-white text-xs font-semibold text-center">
                Unsave
              </Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
};

export default Saved;
