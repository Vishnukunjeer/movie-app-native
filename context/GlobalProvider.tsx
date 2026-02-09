import { getCurrentUser } from "@/services/appwrite"; // Adjust path if needed
import React, { createContext, ReactNode, useContext, useEffect, useState } from "react";

// Define the shape of the context data
interface GlobalContextType {
    isLogged: boolean;
    setIsLogged: React.Dispatch<React.SetStateAction<boolean>>;
    user: any;
    setUser: React.Dispatch<React.SetStateAction<any>>;
    isLoading: boolean;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export const useGlobalContext = () => {
    const context = useContext(GlobalContext);
    if (!context) {
        throw new Error("useGlobalContext must be used within a GlobalProvider");
    }
    return context;
};

interface GlobalProviderProps {
    children: ReactNode;
}

const GlobalProvider = ({ children }: GlobalProviderProps) => {
    const [isLogged, setIsLogged] = useState(false);
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        getCurrentUser()
            .then((res: any) => {
                if (res) {
                    setIsLogged(true);
                    setUser(res);
                } else {
                    setIsLogged(false);
                    setUser(null);
                }
            })
            .catch((error: any) => {
                console.log("Global Provider Error:", error);
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, []);

    return (
        <GlobalContext.Provider
            value={{
                isLogged,
                setIsLogged,
                user,
                setUser,
                isLoading,
            }}
        >
            {children}
        </GlobalContext.Provider>
    );
};

export default GlobalProvider;