import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { Alert } from 'react-native';
import Constants from "expo-constants";

const API_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_API_URL;

type LoginResponse = {
  access_token: string;
  refresh_token: string;
};

interface AuthContextType {
  accessToken: string | null;
  isLoading: boolean;
  username: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const saveTokens = async (access: string, refresh: string, username: string) => {
    await SecureStore.setItemAsync('access', access);
    await SecureStore.setItemAsync('refresh', refresh);
    await SecureStore.setItemAsync('username', username);
    setAccessToken(access);
    setUsername(username);
  };

  const clearTokens = async () => {
    await SecureStore.deleteItemAsync('access');
    await SecureStore.deleteItemAsync('refresh');
    await SecureStore.deleteItemAsync('username');
    setAccessToken(null);
    setUsername(null);
  };

  const login = useCallback(
    async (username: string, password: string) => {
      setIsLoading(true);
      try {
        const res = await fetch(`${API_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ "username":username,"password": password }),
        });
        if (!res.ok) {
          const errText = await res.text();
          throw new Error(errText || 'Đăng nhập thất bại');
        }
        const data: LoginResponse = await res.json();
        await saveTokens(data.access_token, data.refresh_token, username);
        return true;
      } catch (e: any) {
        Alert.alert('Đăng nhập thất bại', e.message);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const refresh = useCallback(async () => {
    const refreshToken = await SecureStore.getItemAsync('refresh');
    const username = await SecureStore.getItemAsync('username');
    if (!refreshToken || !username) return logout();

    try {
      const res = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: refreshToken, username: username }),
      });
      if (!res.ok) throw new Error('Token expired');

      const data: Pick<LoginResponse, 'access_token'> = await res.json();
      await saveTokens(data.access_token, refreshToken, username);
    } catch {
      await logout();
    }
  }, []);

  const logout = useCallback(async () => {
    await clearTokens();
  }, []);

  useEffect(() => {
    (async () => {
      const existingAccess = await SecureStore.getItemAsync('access');
      // const storedUsername = await SecureStore.getItemAsync('username');
      if (existingAccess) {
        setAccessToken(existingAccess);
        // if (storedUsername) setUsername(storedUsername);
      } else {
        await refresh();
      }
    })();
  }, [refresh]);

  const value: AuthContextType = {
    accessToken,
    isLoading,
    username,
    login,
    logout,
    refresh
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
