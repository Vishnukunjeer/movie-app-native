import { View, Text, TouchableOpacity, Image } from "react-native";
import { Link, useFocusEffect } from "expo-router";
import { icons } from "@/constants/icons";
import { useCallback, useState } from "react";
import { useGlobalContext } from "@/context/GlobalProvider";
import {
  saveMovie,
  unsaveMovie,
  isMovieSaved,
} from "@/services/appwrite";

const MovieCard = ({
  id,
  poster_path,
  title,
  vote_average,
  release_date,
}: Movie) => {
  const { user } = useGlobalContext();
  const [savedDoc, setSavedDoc] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // 🔄 REFRESH when screen/tab gains focus
  useFocusEffect(
    useCallback(() => {
      if (!user) return;

      isMovieSaved(user.$id, id).then(setSavedDoc);
    }, [user, id])
  );

  // ❤️ Save / Unsave
  const handleToggleSave = async () => {
    if (!user || loading) return;

    try {
      setLoading(true);

      if (savedDoc) {
        await unsaveMovie(savedDoc.$id);
        setSavedDoc(null); // 🔥 local update
      } else {
        const doc = await saveMovie(user.$id, {
          id,
          title,
          poster_path,
        });
        setSavedDoc(doc);
      }
    } catch (error) {
      console.log("Save toggle error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="w-[30%] mb-5">
      {/* 🎬 NAVIGATION */}
      <Link href={`/movies/${id}`} asChild>
        <TouchableOpacity activeOpacity={0.8}>
          <Image
            source={{
              uri: poster_path
                ? `https://image.tmdb.org/t/p/w500/${poster_path}`
                : "https://placehold.co/600x400/1a1a1a/ffffff.png",
            }}
            className="w-full h-52 rounded-lg"
            resizeMode="cover"
          />

          <Text
            className="text-sm font-bold text-white mt-2"
            numberOfLines={1}
          >
            {title}
          </Text>

          <View className="flex-row items-center gap-x-1 mt-1">
            <Image source={icons.star} className="size-4" />
            <Text className="text-xs text-white font-bold">
              {Math.round(vote_average / 2)}
            </Text>
          </View>

          <Text className="text-xs text-light-300 font-medium mt-1">
            {release_date?.split("-")[0]}
          </Text>
        </TouchableOpacity>
      </Link>

      {/* ❤️ SAVE BUTTON */}
      <TouchableOpacity
        onPress={handleToggleSave}
        disabled={loading}
        activeOpacity={0.8}
        className={`mt-2 py-1.5 rounded-md flex-row justify-center items-center ${
          savedDoc ? "bg-red-500" : "bg-[#A8B5DB]"
        }`}
      >
        <Image
          source={icons.save}
          className="w-4 h-4 mr-1"
          tintColor={savedDoc ? "#fff" : "#0F0D23"}
        />
        <Text
          className={`text-xs font-semibold ${
            savedDoc ? "text-white" : "text-[#0F0D23]"
          }`}
        >
          {savedDoc ? "Unsave" : "Save"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default MovieCard;
