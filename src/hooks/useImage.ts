import { useState, useCallback } from "react";
import { useAuth } from "./useAuth";
import Constants from "expo-constants";
import axios, { AxiosRequestConfig } from "axios";

const API_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_API_URL;

export interface ImageEntry {
  _id?: string;
  dataID: string;
  source: string;
  length: number;
  contentType: string;
  encoding: string;
  imageBlob?: Blob | null; // thêm để enrich
}

export const useImage = () => {
  const { accessToken } = useAuth();
  const base = `${API_URL}/image`;

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const request = useCallback(
    async <T,>(url: string, options: AxiosRequestConfig = {}): Promise<T> => {
      setIsLoading(true);
      setError(null);

      try {
        const res = await axios({
          url,
          method: options.method || "GET",
          data: options.data,
          headers: {
            ...(accessToken ? { Authorization: accessToken } : {}),
            ...(options.headers || {}),
          },
          timeout: 30000,
        });

        return res.data as T;
      } catch (err: any) {
        const message =
          err.response?.data?.error ||
          err.response?.statusText ||
          err.message ||
          "Unknown error";
        setError(message);
        throw new Error(message);
      } finally {
        setIsLoading(false);
      }
    },
    [accessToken]
  );

  const getAllImages = useCallback(() => request<ImageEntry[]>(`${base}/`), [request]);

  const getImageById = useCallback(
    (id: string) => request<ImageEntry>(`${base}/${id}`),
    [request]
  );

  const getImagesByUploaderId = useCallback(async () => {
    const metadataList = await request<ImageEntry[]>(`${base}/uploader`);

    const enriched = await Promise.all(
      metadataList.map(async (entry) => {
        try {
          const res = await axios.get(`${base}/rawFile/${entry.source}`, {
            headers: accessToken ? { Authorization: accessToken } : {},
            responseType: "blob",
            timeout: 10000,
          });

          return {
            ...entry,
            imageBlob: res.data as Blob,
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
  }, [accessToken, request]);

  const addImage = useCallback(
    async (image: ImageEntry | FormData) => {
      const isFormData = image instanceof FormData;
      return request<ImageEntry>(`${base}/`, {
        method: "POST",
        data: isFormData ? image : image,
        headers: isFormData ? {} : { "Content-Type": "application/json" },
      });
    },
    [request]
  );

  const updateImage = useCallback(
    async (image: ImageEntry | FormData) => {
      const isFormData = image instanceof FormData;
      return request<ImageEntry>(`${base}/`, {
        method: "PUT",
        data: isFormData ? image : image,
        headers: isFormData ? {} : { "Content-Type": "application/json" },
      });
    },
    [request]
  );

  const deleteImage = useCallback(
    (id: string) =>
      request<{ deleted: boolean }>(`${base}/${id}`, {
        method: "DELETE",
      }),
    [request]
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
