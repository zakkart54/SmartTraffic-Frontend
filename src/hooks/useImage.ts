import { useState, useCallback } from 'react';
import { useAuth } from './useAuth';
import Constants from "expo-constants";

const API_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_API_URL;

export interface ImageEntry {
  _id?: string;
  dataID: string;
  source: string;
  length: number;
  contentType: string;
  encoding: string;
}

export const useImage = () => {
  const { accessToken } = useAuth();

  const base = `${API_URL}/image`;

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

  const getAllImages = useCallback(() => request<ImageEntry[]>(`${base}/`), [request]);

  const getImageById = useCallback(
    (id: string) => request<ImageEntry>(`${base}/${id}`),
    [request],
  );

  const getImagesByUploaderId = useCallback(
    async () => {
      const metadataList = await request<ImageEntry[]>(`${base}/uploader`);
      
      const enriched = await Promise.all(
        metadataList.map(async (entry) => {
          try {
            const res = await fetch(`${base}/rawFile/${entry.source}`, {
              headers: accessToken ? { Authorization: accessToken } : {},
            });
            if (!res.ok) throw new Error(`Failed to load image ${entry._id}`);
            const blob = await res.blob();
  
            return {
              ...entry,
              imageBlob: blob,
            };
          } catch (e) {
            console.error(`Error loading image for ${entry._id}:`, e);
            return {
              ...entry,
              imageBlob: null,
            };
          }
        })
      );
  
      return enriched;
    },
    [accessToken],
  );

  const addImage = useCallback(
    async (image: ImageEntry | FormData) => {
      const isFormData = image instanceof FormData;
      return request<ImageEntry>(`${base}/`, {
        method: 'POST',
        body: isFormData ? image : JSON.stringify(image),
        headers: isFormData ? {} : { 'Content-Type': 'application/json' },
      });
    },
    [request],
  );

  const updateImage = useCallback(
    async (image: ImageEntry | FormData) => {
      const isFormData = image instanceof FormData;
      return request<ImageEntry>(`${base}/`, {
        method: 'PUT',
        body: isFormData ? image : JSON.stringify(image),
        headers: isFormData ? {} : { 'Content-Type': 'application/json' },
      });
    },
    [request],
  );

  const deleteImage = useCallback(
    (id: string) =>
      request<{ deleted: boolean }>(`${base}/${id}`, {
        method: 'DELETE',
      }),
    [request],
  );

  return {
    isLoading,
    error,
    getAllImages,
    getImageById,
    getImagesByUploaderId,
    addImage,
    updateImage,
    deleteImage,
  };
};
