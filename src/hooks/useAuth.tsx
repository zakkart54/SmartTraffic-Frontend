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
  userFullName: string | null;
  username: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  fetchUserFullName: (name?:string | null) => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [userFullName, setUserFullName] = useState<string | null>(null);
  const [username, setUserName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const saveTokens = async (access: string, refresh: string, username:string) => {
    await SecureStore.setItemAsync('access', access);
    await SecureStore.setItemAsync('refresh', refresh);
    await SecureStore.setItemAsync('username', username);
    setAccessToken(access);
  };

  const clearTokens = async () => {
    await SecureStore.deleteItemAsync('access');
    await SecureStore.deleteItemAsync('refresh');
    await SecureStore.deleteItemAsync('username');
    setUserFullName(null);
    setAccessToken(null);
    setUserName(null);
  };

  const fetchUserFullName = useCallback(async (name?:string) => {
    if (name) {
      setUserFullName(name);
      return;
    }
    if (!accessToken) {
      setUserFullName(null);
      return null;
    }
    const profile = await getUserProfile();
    setUserFullName(profile.fullName);
    return profile.fullName;
  },[]);

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
        return true;
      } catch (e: any) {
        const message = e.response?.data?.error || e.message || "Đăng nhập thất bại";
        Alert.alert('Đăng nhập thất bại', message);
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
      const res = await axios.post<Pick<LoginResponse, 'access_token'>>(
        `${API_URL}/auth/refresh`,
        { token: refreshToken, username },
        { headers: { 'Content-Type': 'application/json' }, timeout: 15000 }
      );

      const data = res.data;
      await saveTokens(data.access_token, refreshToken, username);
    } catch {
      await logout();
    }
  }, []);

  const logout = useCallback(async () => {
    await clearTokens();
  }, []);

  const getUserProfile = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/user/profile`, {
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { Authorization: accessToken } : {}),
        },
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error ?? res.statusText);
      }
      const data = await res.json();
      return data;
    } catch (e: any) {
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    (async () => {
      const existingAccess = await SecureStore.getItemAsync('access');
      const storedUsername = await SecureStore.getItemAsync('username');
      if (existingAccess) {
        setAccessToken(existingAccess);
      } else {
        await refresh();
      }
    })();
  }, [refresh]);

  const value: AuthContextType = {
    accessToken,
    isLoading,
    userFullName,
    fetchUserFullName,
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
