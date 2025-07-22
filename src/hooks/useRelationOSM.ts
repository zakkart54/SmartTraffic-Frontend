import { useState, useCallback } from 'react';
import { useAuth } from './useAuth';
import Constants from "expo-constants";

const API_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_API_URL;

export interface RelationOSM {
  _id?: string;
  id: number | string;
  type: string;
  members: any[]; 
  tags: Record<string, string>;
  version: number;
  timestamp: string;
  changeset: number;
  uid: number;
  user: string;
}

export const useRelationOSM = () => {
  const { accessToken } = useAuth();
  const base = `${API_URL}/relationOSM`;

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

  const getAllRelationOSM = useCallback(() => request<RelationOSM[]>(`${base}/`), [request]);

  const getRelationOSMById = useCallback(
    (id: string) => request<RelationOSM>(`${base}/${id}`),
    [request],
  );

  const updateRelationOSM = useCallback(
    (data: RelationOSM) =>
      request<RelationOSM>(`${base}/`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    [request],
  );

  return {
    isLoading,
    error,
    getAllRelationOSM,
    getRelationOSMById,
    updateRelationOSM,
  };
};
