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
  dataID?: string; //use for test, remove later
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

  const getDataByUploaderId = useCallback(() =>
    request<DataEntry>(`${base}/dataByUploader`),
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

  // const addImageData = useCallback(
  //   async (data?: DataEntry) => {
  //     setIsLoading(true);
  //     setError(null);
  //     try {
  //       // const payload = {
  //       //   segmentID: data.segmentID ,
  //       //   dataID: data.dataID,
  //       //   type: data.type,
  //       //   uploadTime: data.uploadTime,
  //       //   InfoID: data.InfoID,
  //       //   location: data.location,
  //       //   processed: data.processed,
  //       // };

  //       const payload = {
  //         segmentID: '64d9f1a37c8a4f2e8f0c3b1b'  ,
  //         uploaderID: '64d9f1a37c8a4f2e8f0c3b1c',
  //         type: 'image',
  //         uploadTime: "2025/07/12",
  //         InfoID: "64d9f1a37c8a4f2e8f0c3b1c",
  //         location: "hehe",
  //         processed: false,
  //         processed_time: null,
  //         TrainValTest: null
  //       };
  
  //       return request<DataEntry>(`${base}/`, {
  //         method: 'POST',
  //         headers: { 'Content-Type': 'application/json' },
  //         body: JSON.stringify(payload),
  //       });
  //     } catch (err: any) {
  //       setError(err.message);
  //       throw err;
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   },
  //   [accessToken],
  // );
  

  const addImageData = useCallback(
    async (fileUri: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const filename = fileUri.split('/').pop() || 'file';
        const type = 'image/jpeg'
        const formData = new FormData();
        formData.append('fileUpload', {
          uri: fileUri,
          name: filename,
          type,
        } as any);
        return request<DataEntry>(`${base}/img`, {
          method: "POST",
          body: formData,
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } catch (err: any) {
        setError(err.message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [accessToken]
  );

const addTextData = useCallback(
  async (content: string) => {
    setIsLoading(true);
    setError(null);
    try {
      if (!content) throw new Error('Missing content');

      const payload = {
        content,
      };

      return request<DataEntry>(`${base}/text`, {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: {
          'Content-Type': 'application/json'
        },
      });
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  },
  [accessToken]
);

  

  return {
    isLoading,
    error,
    getAllData,
    getDataByUploaderId,
    addData,
    updateData,
    deleteData,
    addImageData,
    addTextData
  };
};
