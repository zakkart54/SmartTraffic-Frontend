import { useState, useCallback } from 'react';
import { useAuth } from './useAuth';
import Constants from "expo-constants";

const API_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_API_URL;

export interface Notification {
  _id?: string;
  userID: string;
  type: string;
  content: string;
}

export const useNotification = () => {
  const { accessToken } = useAuth();
  
  const base = `${API_URL}/notifications`;

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const request = useCallback(
    async <T,>(url: string, options: RequestInit = {}): Promise<T> => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(url, {
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
      } catch (err: any) {
        setError(err.message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [accessToken],
  );

  const getAllNotifications = useCallback(() => request<Notification[]>(`${base}/`), [request]);
  const getNotificationById = useCallback((id: string) => request<Notification>(`${base}/${id}`), [request]);

  const addNotification = useCallback((data: Notification) =>
    request<Notification>(`${base}/`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  [request]);

  const updateNotification = useCallback((data: Notification) =>
    request<Notification>(`${base}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  [request]);

  const deleteNotification = useCallback((id: string) =>
    request<{ deleted: boolean }>(`${base}/${id}`, {
      method: 'DELETE',
    }),
  [request]);

  return {
    isLoading,
    error,
    getAllNotifications,
    getNotificationById,
    addNotification,
    updateNotification,
    deleteNotification,
  };
};
