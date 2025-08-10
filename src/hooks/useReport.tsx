import { useState, useCallback } from 'react';
import { useAuth } from './useAuth';
import Constants from "expo-constants";

const API_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_API_URL;

export interface ReportEntry {
  _id?: string;
  uploaderID: string;
  textID?: string;
  imageID?: string;
  eval?: number;
  qualified?: boolean;
  createdDate?: string;
}

export const useReport = () => {
  const { accessToken } = useAuth();
  const base = `${API_URL}/report`;

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
    [accessToken]
  );

  const getAllReports = useCallback(() =>
    request<ReportEntry[]>(`${base}/`), [request]);

  const getReportById = useCallback((id: string) =>
    request<ReportEntry>(`${base}/${id}`), [request]);

  const getReportsByUploader = useCallback((uploaderId: string) =>
    request<ReportEntry[]>(`${base}/uploader/${uploaderId}`), [request]);

  const addReport = useCallback((report: ReportEntry) =>
    request<ReportEntry>(`${base}/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(report),
    }), [request]);

  const updateReport = useCallback((report: ReportEntry) => {
    if (!report._id || report._id.length !== 24) {
      throw new Error("Invalid _id format for update");
    }

    return request<ReportEntry>(`${base}/`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(report),
    });
  }, [request]);

  const deleteReport = useCallback((id: string) =>
    request<{ deleted: boolean }>(`${base}/${id}`, {
      method: 'DELETE',
    }), [request]);

  return {
    isLoading,
    error,
    getAllReports,
    getReportById,
    getReportsByUploader,
    addReport,
    updateReport,
    deleteReport
  };
};
