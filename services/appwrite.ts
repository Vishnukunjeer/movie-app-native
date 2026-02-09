import {
    Account,
    Avatars,
    Client,
    Databases,
    ID,
    Query,
    Storage,
    
} from 'react-native-appwrite';

// 1. Configuration
export const appwriteConfig = {
    endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!,
    platform: 'com.jsm.movieapp',
    projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!,
    databaseId: process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
    userCollectionId: process.env.EXPO_PUBLIC_APPWRITE_USER_COLLECTION_ID!,
    searchCollectionId: process.env.EXPO_PUBLIC_APPWRITE_COLLECTION_ID!,
    videoCollectionId: process.env.EXPO_PUBLIC_APPWRITE_VIDEO_COLLECTION_ID!, 
    storageId: process.env.EXPO_PUBLIC_APPWRITE_STORAGE_ID!,
    savedCollectionId: process.env.EXPO_PUBLIC_APPWRITE_SAVED_COLLECTION_ID!,
};

// 2. Setup Client
const client = new Client();

client
    .setEndpoint(appwriteConfig.endpoint)
    .setProject(appwriteConfig.projectId)
    .setPlatform(appwriteConfig.platform);

const account = new Account(client);
const avatars = new Avatars(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

// ====================================================
//                 AUTH FUNCTIONS
// ====================================================

export const signIn = async (email: string, password: string) => {
    try {
        // FIX: Force delete current session if it exists to avoid "session active" error
        try {
            await account.deleteSession('current');
        } catch (error) {
            // If delete fails, it means no session existed, which is fine.
            // We ignore this error and proceed to login.
        }

        const session = await account.createEmailPasswordSession(email, password);
        return session;
    } catch (error: any) {
        console.log("Error signing in:", error);
        throw new Error(error.message || String(error));
    }
};
export const createUser = async (
  email: string,
  password: string,
  username: string
) => {
  try {
    const newAccount = await account.create(
      ID.unique(),
      email,
      password,
      username
    );

    if (!newAccount) throw new Error("Account creation failed");

    // ✅ FIXED: convert avatar URL to string

    await signIn(email, password);

    const newUser = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      ID.unique(),
      {
        accountId: newAccount.$id,
        email,
        username, // ✅ now valid
        createdAt: new Date().toISOString(),
      }
    );

    return newUser;
  } catch (error: any) {
    console.log("Error creating user:", error);
    throw new Error(error.message || String(error));
  }
};

export const signOut = async () => {
    try {
        const session = await account.deleteSession('current');
        return session;
    } catch (error: any) {
        throw new Error(error.message || String(error));
    }
}


export const getCurrentUser = async () => {
    try {
        const currentAccount = await account.get();
        if (!currentAccount) throw Error;

        const currentUser = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            [Query.equal('accountId', currentAccount.$id)]
        );

        if (!currentUser || currentUser.documents.length === 0) throw Error;

        return currentUser.documents[0];
    } catch (error) {
        console.log("Appwrite Error (getCurrentUser):", error); 
        return null;
    }
};

// ====================================================
//                 SEARCH / MOVIE FUNCTIONS
// ====================================================

export const updateSearchCount = async (query: string, movie: any) => {
    try {
        const result = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.searchCollectionId,
            [Query.equal('searchTerm', query)]
        );

        if (result.documents.length > 0) {
            const existingMovie = result.documents[0];
            await databases.updateDocument(
                appwriteConfig.databaseId,
                appwriteConfig.searchCollectionId,
                existingMovie.$id,
                { count: existingMovie.count + 1 }
            );
        } else {
            await databases.createDocument(
                appwriteConfig.databaseId,
                appwriteConfig.searchCollectionId,
                ID.unique(),
                {
                    searchTerm: query,
                    movie_id: movie.id,
                    title: movie.title,
                    count: 1,
                    poster_url: `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                }
            );
        }
    } catch (error: any) {
        console.error("Error updating search count:", error);
        throw new Error(error.message || String(error));
    }
};

export const getTrendingMovies = async () => {
    try {
        const result = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.searchCollectionId,
            [
                Query.limit(5),
                Query.orderDesc('count'),
            ]
        );
        return result.documents;
    } catch (error) {
        console.log(error);
        return [];
    }
}

// ====================================================
//                 POSTS & PROFILE FUNCTIONS (NEW)
// ====================================================

// 1. Get User Posts
export const getUserPosts = async (userId: string) => {
    try {
        const posts = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.videoCollectionId, 
            [Query.equal('creator', userId)]  
        );
        return posts.documents;
    } catch (error: any) {
        console.log("Error fetching user posts:", error);
        return [];
    }
}

// 2. Upload File (Helper)
export const uploadFile = async (file: any) => {
  if (!file?.uri) {
    throw new Error("Invalid image file");
  }

  const asset = {
    name: file.fileName ?? `avatar-${Date.now()}.jpg`,
    type: file.mimeType ?? "image/jpeg",
    size: file.fileSize ?? 0,
    uri: file.uri, // ✅ local file path (gallery/camera)
  };

  const uploaded = await storage.createFile(
    appwriteConfig.storageId,
    ID.unique(),
    asset
  );

  // ✅ Build PUBLIC URL manually (RN SAFE)
  const fileUrl = `${appwriteConfig.endpoint}/storage/buckets/${appwriteConfig.storageId}/files/${uploaded.$id}/view?project=${appwriteConfig.projectId}`;

  console.log("AVATAR URL:", fileUrl);

  return fileUrl; // ✅ STRING URL
};


// 3. Get File Preview (Helper)
export const getFilePreview = async (
  fileId: string,
  type: 'image' | 'video'
) => {
  try {
    if (type === 'video') {
      return storage.getFileView(appwriteConfig.storageId, fileId);
    }

    // ✅ FREE PLAN FIX (no transformations)
    return storage.getFileView(appwriteConfig.storageId, fileId);

  } catch (error: any) {
    throw new Error(error.message || String(error));
  }
};
// check saved
export const isMovieSaved = async (userId: string, movieId: number) => {
  const res = await databases.listDocuments(
    appwriteConfig.databaseId,
    appwriteConfig.savedCollectionId,
    [
      Query.equal("userId", userId),
      Query.equal("movieId", movieId),
    ]
  );
  return res.documents[0] ?? null;
};

// save
export const saveMovie = async (userId: string, movie: any) => {
  return databases.createDocument(
    appwriteConfig.databaseId,
    appwriteConfig.savedCollectionId,
    ID.unique(),
    {
      userId,
      movieId: movie.id,
      title: movie.title,
      posterUrl: movie.poster_path,
      createdAt: new Date().toISOString(),
    }
  );
};

// unsave
export const unsaveMovie = async (docId: string) => {
  return databases.deleteDocument(
    appwriteConfig.databaseId,
    appwriteConfig.savedCollectionId,
    docId
  );
};
export const getSavedMovies = async (userId: string) => {
  const res = await databases.listDocuments(
    appwriteConfig.databaseId,
    appwriteConfig.savedCollectionId,
    [Query.equal("userId", userId)]
  );
  return res.documents;
};



// 4. Update User Avatar
export const updateUserAvatar = async (
  userId: string,
  avatarUrl: string
) => {
  if (typeof avatarUrl !== "string") {
    throw new Error("Avatar URL must be a string");
  }

  return databases.updateDocument(
    appwriteConfig.databaseId,
    appwriteConfig.userCollectionId,
    userId,
    {
      avatar: avatarUrl, // ✅ STRING ONLY
    }
  );
};
