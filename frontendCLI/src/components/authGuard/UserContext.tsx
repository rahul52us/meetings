import React, { createContext, useContext, useState, ReactNode } from 'react';

type UserContextType = {
  isLoggedIn: boolean;
  setIsLoggedIn: (value: boolean) => void;
  accountDetails: any | null;
  setAccountDetails: (user: any | null) => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [accountDetails, setAccountDetails] = useState<any | null>(null);

  return (
    <UserContext.Provider value={{ isLoggedIn, setIsLoggedIn, setAccountDetails, accountDetails }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
