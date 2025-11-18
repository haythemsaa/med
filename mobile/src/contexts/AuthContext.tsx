import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { api } from '../config/api';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  cabinetId?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const token = await SecureStore.getItemAsync('authToken');
      const userData = await SecureStore.getItemAsync('user');

      if (token && userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Error loading stored auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user: userData } = response.data.data;

      await SecureStore.setItemAsync('authToken', token);
      await SecureStore.setItemAsync('user', JSON.stringify(userData));

      setUser(userData);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await SecureStore.deleteItemAsync('authToken');
      await SecureStore.deleteItemAsync('user');
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const register = async (data: any) => {
    try {
      const response = await api.post('/auth/register', data);
      const { token, user: userData } = response.data.data;

      await SecureStore.setItemAsync('authToken', token);
      await SecureStore.setItemAsync('user', JSON.stringify(userData));

      setUser(userData);
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  };

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    register,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
