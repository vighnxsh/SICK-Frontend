import React, { createContext, useContext, useState, useEffect } from 'react';
import { useOkto } from 'okto-sdk-react';

type User = {
  id: string;
  // Add other user properties as needed
};

type AuthContextType = {
  user: User | null;
  setUser: (user: User | null) => void;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
  isAuthenticated: false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  //@ts-ignore
  const { isLoggedIn } = useOkto();

  const isAuthenticated = Boolean(user && isLoggedIn);

  return (
    <AuthContext.Provider value={{ user, setUser, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);