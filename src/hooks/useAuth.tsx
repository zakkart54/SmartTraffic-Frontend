import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { Alert } from 'react-native';
import Constants from "expo-constants";
import axios from "axios";

const API_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_API_URL;

type LoginResponse = {
  access_token: string;
  refresh_token: string;
};

interface AuthContextType {
  accessToken: string | null;
  isLoading: boolean;
  username: string | null;
  fullName: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [fullName, setFullName] = useState<string | null>(null);
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
    await SecureStore.deleteItemAsync("fullName");
    setAccessToken(null);
    setUsername(null);
    setFullName(null);
  };

  const fetchAndSetFullName = useCallback(async (token: string) => {
    try {
      const res = await axios.get(`${API_URL}/user/profile`, {
        headers: { Authorization: token },
      });
      if (res.data?.fullName) {
        setFullName(res.data.fullName);
        await SecureStore.setItemAsync("fullName", res.data.fullName);
      }
    } catch (err) {
      console.warn("Failed to fetch profile:", err);
    }
  }, []);

  const login = useCallback(
    async (username: string, password: string) => {
      setIsLoading(true);
      try {
        const res = await axios.post<LoginResponse>(`${API_URL}/auth/login`, {
          username,
          password,
        }, {
          headers: { 'Content-Type': 'application/json' },
          timeout: 15000,
        });

        const data = res.data;
        await saveTokens(data.access_token, data.refresh_token, username);

        fetchAndSetFullName(data.access_token);

        return true;
      } catch (e: any) {
        const message = e.response?.data?.error || e.message || "Đăng nhập thất bại";
        Alert.alert('Đăng nhập thất bại', message);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [fetchAndSetFullName],
  );

  const refresh = useCallback(async () => {
    const refreshToken = await SecureStore.getItemAsync('refresh');
    const username = await SecureStore.getItemAsync('username');
    if (!refreshToken || !username) return logout();

    try {
      const res = await axios.post<Pick<LoginResponse, 'access_token'>>(
        `${API_URL}/auth/refresh`,
        { token: refreshToken, username },
        { headers: { 'Content-Type': 'application/json' }, timeout: 15000 }
      );

      const data = res.data;
      await saveTokens(data.access_token, refreshToken, username);

      fetchAndSetFullName(data.access_token);

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
      const storedUsername = await SecureStore.getItemAsync('username');
      if (existingAccess) {
        setAccessToken(existingAccess);
        if (storedUsername) setUsername(storedUsername);
      } else {
        await refresh();
      }
    })();
  }, [refresh]);

  const value: AuthContextType = {
    accessToken,
    isLoading,
    username,
    fullName,
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
