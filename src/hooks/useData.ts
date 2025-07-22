import { useState, useCallback } from 'react';
import { useAuth } from './useAuth';
import Constants from "expo-constants";

const API_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_API_URL;

export interface DataEntry {
  _id?: string;
  segmentID?: string;
  uploaderID?: string;
  username?: string;
  type: string;
  InfoID?: string;
  uploadTime: string; // ISO format
  processed?: boolean;
  processed_time?: string;
  TrainValTest?: string;
  location?: string;
}

export const useData = () => {
  const { accessToken, username } = useAuth();
  const base = `${API_URL}/data`;

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

        const json = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(json.error || res.statusText);
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

  const getAllData = useCallback(() => request<DataEntry[]>(`${base}/`), [request]);

  const getDataById = useCallback((id: string) =>
    request<DataEntry>(`${base}/${id}`),
  [request]);

  const addData = useCallback((data: DataEntry) =>
    request<DataEntry>(`${base}/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, username }),
    }),
  [request, username]);

  const updateData = useCallback((data: DataEntry) => {
    if (!data._id || data._id.length !== 24) {
      throw new Error("Invalid _id format for update");
    }

    return request<DataEntry>(`${base}/`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  }, [request]);

  const deleteData = useCallback((id: string) =>
    request<{ deleted: boolean }>(`${base}/${id}`, {
      method: 'DELETE',
    }),
  [request]);

  const addImageData = useCallback(
    async (data: DataEntry, image: File | Blob) => {
      setIsLoading(true);
      setError(null);
      try {
        const form = new FormData();
        form.append('fileUpload', image);
        form.append('username', username ?? '');
        form.append('type', data.type);
        form.append('uploadTime', data.uploadTime);
        if (data.InfoID) form.append('InfoID', data.InfoID);
        if (data.location) form.append('location', data.location);
        if (data.processed !== undefined) {
          form.append('processed', String(data.processed));
        }

        const res = await fetch(`${base}/data-image`, {
          method: 'POST',
          headers: {
            ...(accessToken ? { Authorization: accessToken } : {}),
          },
          body: form,
        });

        const json = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(json.error || res.statusText);
        }

        return json;
      } catch (err: any) {
        setError(err.message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [accessToken, username],
  );

  return {
    isLoading,
    error,
    getAllData,
    getDataById,
    addData,
    updateData,
    deleteData,
    addImageData
  };
};
