import { useState, useCallback } from 'react';
import { useAuth } from './useAuth';
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_API_URL;

export interface Notification {
  type: string;
  content: string;
  timestamp: string;
  [key: string]: any;
}

export const useNotification = () => {
  const saveReadNotifications = async (ids: string[]) => {
    await AsyncStorage.setItem("readNotiIds", JSON.stringify(ids));
  };

  const getReadNotifications = async () => {
    const json = await AsyncStorage.getItem("readNotiIds");
    return json ? JSON.parse(json) : [];
  };

  const markNotificationsAsRead = async (notifications: Notification[]) => {
    const readIds = await getReadNotifications();
    const newIds = notifications.map(n => n._id).filter(id => !readIds.includes(id));
    if (newIds.length > 0) {
      await saveReadNotifications([...readIds, ...newIds]);
    }
  };

  const processNotifications = async (
    notifications: Notification[]
  ): Promise<any> => {
    const json = await AsyncStorage.getItem("readNotiIds");
    const readIds: string[] = json ? JSON.parse(json) : [];
  
    const processed = notifications.map(n => ({
      ...n,
      had_read: n._id ? readIds.includes(n._id) : false
    }));
  
    const hasUnread = processed.some(n => !n.had_read);
  
    return { notifications: processed, hasUnread };
  };

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

  const getNotificationUsingGps = useCallback(
    (lat: number, lon: number) =>
      request<Notification[]>(`${base}/gps`, {
        method: 'POST',
        body: JSON.stringify({ lat, lon }),
      }),
    [request]
  );

  const getNotificationByUser = useCallback(
    () =>
      request<Notification[]>(`${base}/user`, {
        method: 'GET'
      }),
    [request]
  );


  return {
    isLoading,
    error,
    getAllNotifications,
    getNotificationById,
    addNotification,
    updateNotification,
    deleteNotification,
    getNotificationUsingGps,
    getNotificationByUser,
    markNotificationsAsRead,
    processNotifications
  };
};
