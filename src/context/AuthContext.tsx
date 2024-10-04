// contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';

interface AuthContextType {
  isLoggedIn: boolean;
  setIsLoggedIn: (value: boolean) => void;
  authToken: string | null;
  setAuthToken: (token: string | null) => void;
  handleLogout: () => void;
  walletConnected: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const { connected, disconnect } = useWallet();
  
  const [authToken, setAuthToken] = useState<string | null>(() => 
    localStorage.getItem('authToken')
  );
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => 
    localStorage.getItem('isLoggedIn') === 'true'
  );

  useEffect(() => {
    if (authToken) {
      localStorage.setItem('authToken', authToken);
      localStorage.setItem('isLoggedIn', 'true');
      setIsLoggedIn(true);
    } else {
      localStorage.removeItem('authToken');
      localStorage.removeItem('isLoggedIn');
      setIsLoggedIn(false);
    }
  }, [authToken]);

  const handleLogout = async () => {
    setAuthToken(null);
    setIsLoggedIn(false);
    if (connected) {
      await disconnect();
    }
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ 
      isLoggedIn,
      setIsLoggedIn,
      authToken, 
      setAuthToken, 
      handleLogout,
      walletConnected: connected
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};