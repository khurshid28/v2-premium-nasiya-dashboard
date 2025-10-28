import React, { createContext, useContext, useState, useEffect } from 'react';

export interface UserData {
  id?: number;
  fullname: string;
  phone: string;
  image?: string | null;
  role?: string;
  work_status?: string;
}

interface UserContextValue {
  user: UserData | null;
  setUser: (user: UserData | null) => void;
  isLoading: boolean;
  logout: () => void;
}

const UserContext = createContext<UserContextValue | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

interface UserProviderProps {
  children: React.ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUserState] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user data from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('userData');
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUserState(parsedUser);
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('userData');
        localStorage.removeItem('token');
      }
    }
    setIsLoading(false);
  }, []);

  const setUser = (userData: UserData | null) => {
    setUserState(userData);
    if (userData) {
      localStorage.setItem('userData', JSON.stringify(userData));
    } else {
      localStorage.removeItem('userData');
    }
  };

  const logout = () => {
    setUserState(null);
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
  };

  const value = {
    user,
    setUser,
    isLoading,
    logout,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};