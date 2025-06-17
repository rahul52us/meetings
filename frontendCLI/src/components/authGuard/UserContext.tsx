// context/UserContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
} from "react";
import { ToastAndroid, Platform, Alert } from "react-native";

type ToastOptions = {
  title: string;
  status?: "success" | "error" | "info";
};

type UserContextType = {
  isLoggedIn: boolean;
  setIsLoggedIn: (value: boolean) => void;
  accountDetails: any | null;
  setAccountDetails: (user: any | null) => void;
  toastNotify: (options: ToastOptions) => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [accountDetails, setAccountDetails] = useState<any | null>(null);

  const toastNotify = ({ title, status = "info" }: ToastOptions) => {
    const prefix =
      status === "success"
        ? "✅ "
        : status === "error"
        ? "❌ "
        : "ℹ️ ";

    if (Platform.OS === "android") {
      ToastAndroid.show(prefix + title, ToastAndroid.SHORT);
    } else {
      Alert.alert(status.toUpperCase(), title);
    }
  };

  return (
    <UserContext.Provider
      value={{
        isLoggedIn,
        setIsLoggedIn,
        accountDetails,
        setAccountDetails,
        toastNotify,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
