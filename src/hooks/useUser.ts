import { useState, useCallback } from 'react';
import { useAuth } from './useAuth';   // lấy accessToken nếu cần Auth header
import Constants from "expo-constants";

const API_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_API_URL;

export interface User {
  _id?: string;
  fullName: string;
  username: string;
  password?: string;          // không gửi trong response; chỉ dùng khi insert/update
  phoneNum?: string;
  DoB?: string;               // ISO YYYY/MM/DD
  status?: boolean;      
  loginType?: string;
  email?: string;
}

export const useUser = () => {
  const { accessToken } = useAuth();
  const base = `${API_URL}/user`;

  /* --- state chung --- */
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]       = useState<string | null>(null);

  /** tiny helper chung cho mọi request */
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

  const getAllUsers  = useCallback(() => request<User[]>(`${base}/`), [request]);
  const getUserById  = useCallback((id: string) => request<User>(`${base}/${id}`), [request]);

  const addUser      = useCallback((user: User) =>
    request<User>(`${base}/`, { method: 'POST', body: JSON.stringify(user) }),
  [request]);

  const updateUser   = useCallback((user: User) =>
    request<User>(`${base}/`, { method: 'PUT',  body: JSON.stringify(user) }),
  [request]);

  const deleteUser   = useCallback((id: string) =>
    request<{ deleted: boolean }>(`${base}/${id}`, { method: 'DELETE' }),
  [request]);

  return {
    isLoading,
    error,

    getAllUsers,
    getUserById,
    addUser,
    updateUser,
    deleteUser,
  };
};
