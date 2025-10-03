import { useState, useCallback } from 'react';
import { useAuth } from './useAuth';
import Constants from "expo-constants";
import axios, { AxiosRequestConfig } from "axios";

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
    async <T,>(url: string, options: AxiosRequestConfig = {}): Promise<T> => {
      setIsLoading(true);
      setError(null);

      try {
        const res = await axios<T>(url, {
          timeout: 10000,
          headers: {
            "Content-Type": "application/json",
            ...(accessToken ? { Authorization: accessToken } : {}),
            ...(options.headers || {}),
          },
          ...options
        });

        return res.data;
      } catch (err: any) {
        const message = err.response?.data?.error || err.message;
        setError(message);
        throw new Error(message);
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
      data: JSON.stringify(text),
    }), [request]);

  const updateText = useCallback((text: { _id: string, dataID: string, content: string }) =>
    request<TextEntry>(`${base}/`, {
      method: 'PUT',
      data: JSON.stringify(text),
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
