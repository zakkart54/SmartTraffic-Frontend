import { useState, useCallback } from 'react';
import { useAuth } from './useAuth';
import Constants from "expo-constants";
import axios, { AxiosRequestConfig } from "axios";

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
  dataID?: string; //use for test, remove later
}

export const useData = () => {
  const { accessToken, username } = useAuth();
  const base = `${API_URL}/data`;

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const request = useCallback(
    async <T,>(url: string, options: AxiosRequestConfig = {}): Promise<T> => {
      setError(null);
      setIsLoading(true); 
      try {
        const res = await axios({
          url,
          method: options.method || "GET",
          data: options.data,
          params: options.params,
          headers: {
            ...(accessToken ? { Authorization: accessToken } : {}),
            ...(options.headers || {}),
          },
          timeout: 10000,
        });

        return res.data as T;
      } catch (err: any) {
        setError(err.message);
        throw err;
      }finally {
        setIsLoading(false);
      }
    },
    [accessToken]
  );

  const getAllData = useCallback(() => request<DataEntry[]>(`${base}/`), [request]);

  const getDataByUploader = useCallback(() =>
    request<DataEntry>(`${base}/dataByUploader`),
  [request]);

  const addData = useCallback((data: DataEntry) =>
    request<DataEntry>(`${base}/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      data: JSON.stringify({ ...data, username })
    }),
  [request, username]);

  const updateData = useCallback((data: DataEntry) => {
    if (!data._id || data._id.length !== 24) {
      throw new Error("Invalid _id format for update");
    }

    return request<DataEntry>(`${base}/`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      data: JSON.stringify(data)
    });
  }, [request]);

  const deleteData = useCallback((id: string) =>
    request<{ deleted: boolean }>(`${base}/${id}`, {
      method: 'DELETE',
    }),
  [request]);

  const addImageData = useCallback(
    async (fileUri: string) => {
      setError(null);
      try {
        const filename = fileUri.split('/').pop() || 'file';
        const type = 'image/jpeg'
        const formData = new FormData();
        formData.append('fileUpload', {
          uri: fileUri,
          name: filename,
          type
        } as any);
        return request<DataEntry>(`${base}/img`, {
          method: "POST",
          data: formData,
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } catch (err: any) {
        setError(err.message);
        throw err;
      }
    },
    [accessToken]
  );

  const addTextData = useCallback(
    async (content: string) => {
      setError(null);
      try {
        if (!content) throw new Error('Missing content');

        const payload = {
          content,
        };

        return request<DataEntry>(`${base}/text`, {
          method: 'POST',
          data: JSON.stringify(payload),
          headers: {
            'Content-Type': 'application/json'
          },
        });
      } catch (err: any) {
        setError(err.message);
        throw err;
      }
    },
    [accessToken]
  );

  const getDataDetail = useCallback(
    (id: string) => request(`${base}/detail/${id}`),
    [request]
  );

  return {
    isLoading,
    error,
    getAllData,
    getDataByUploader,
    getDataDetail,
    addData,
    updateData,
    deleteData,
    addImageData,
    addTextData
  };
};
