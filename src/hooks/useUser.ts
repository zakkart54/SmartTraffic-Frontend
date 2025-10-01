import { useState, useCallback } from 'react';
import { useAuth } from './useAuth';   // lấy accessToken nếu cần Auth header
import Constants from "expo-constants";

const API_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_API_URL;

export interface UserProfile {
  fullName: string;
  username: string;
  email: string;
  DoB?: string | null;
  phoneNum?: string | null;
  [key: string]: any;
}

export const useUser = () => {
  const { accessToken } = useAuth();
  const base = `${API_URL}/user`;

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]       = useState<string | null>(null);

  const request = useCallback(
    async <T,>(path: string, options: RequestInit = {}): Promise<T> => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(path, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            ...(accessToken ? { Authorization: accessToken } : {}),
            ...(options.headers || {}),
          },
        });

        if (!res.ok) {
          const errJson = await res.json().catch(() => ({}));
          throw new Error(errJson.error ?? res.statusText);
        }
        return (await res.json()) as T;
      } catch (e: any) {
        setError(e.message);
        throw e;
      } finally {
        setIsLoading(false);
      }
    },
    [accessToken],
  );

  const getUserProfile = useCallback(() => request<UserProfile>(`${base}/profile`), [request]);

  const updateUserProfile = useCallback(
    (data: Partial<UserProfile>) =>
      request<UserProfile>(`${base}/profile`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    [request]
  );

  const changePassword = useCallback(
    (old_password: string, new_password: string) =>
      request<{ message: string }>(`${base}/change-password`, {
        method: "PUT",
        body: JSON.stringify({ old_password, new_password }),
      }),
    [request]
  );

  const addUser = useCallback((user: UserProfile) =>
    request<UserProfile>(`${base}/`, { method: 'POST', body: JSON.stringify(user) }),
  [request]);

  return {
    isLoading,
    error,
    getUserProfile,
    updateUserProfile,
    changePassword,
    addUser
  };
};
