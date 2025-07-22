import { useState, useCallback } from 'react';
import { useAuth } from './useAuth';
import Constants from "expo-constants";

const API_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_API_URL;

export interface TextEntry {
  _id?: string;
  dataID: string;
  source?: string; 
  content: string;
}

export const useText = () => {
  const { accessToken } = useAuth();
  const base = `${API_URL}/text`;

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const request = useCallback(
    async <T,>(url: string, options: RequestInit = {}): Promise<T> => {
      setIsLoading(true);
      setError(null);
      try {
        console.log(accessToken)
        const res = await fetch(url, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            ...(accessToken ? { Authorization: accessToken } : {}),
            ...(options.headers || {}),
          },
        });

        const json = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(json.error ?? res.statusText);
        }

        return json as T;
      } catch (err: any) {
        setError(err.message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [accessToken],
  );

  const getAllText = useCallback(() =>
    request<TextEntry[]>(`${base}/`), [request]);

  const getTextById = useCallback((id: string) =>
    request<TextEntry>(`${base}/${id}`), [request]);

  const getTextByUploader = useCallback((uploaderId: string) =>
    request<TextEntry[]>(`${base}/uploader/${uploaderId}`), [request]);

  const addText = useCallback((text: { dataID: string, content: string }) =>
    request<TextEntry>(`${base}/`, {
      method: 'POST',
      body: JSON.stringify(text),
    }), [request]);

  const updateText = useCallback((text: { _id: string, dataID: string, content: string }) =>
    request<TextEntry>(`${base}/`, {
      method: 'PUT',
      body: JSON.stringify(text),
    }), [request]);

  const deleteText = useCallback((id: string) =>
    request<{ deleted: boolean }>(`${base}/${id}`, {
      method: 'DELETE',
    }), [request]);

  return {
    isLoading,
    error,
    getAllText,
    getTextById,
    getTextByUploader,
    addText,
    updateText,
    deleteText,
  };
};
