import { useState, useCallback } from "react";
import { useAuth } from "./useAuth";
import Constants from "expo-constants";
import axios, { AxiosRequestConfig } from "axios";

const API_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_API_URL;

export interface ReportEntry {
  _id?: string;
  uploaderID?: string;
  dataTextID?: string;
  dataImgID?: string;
  eval?: number;
  qualified?: boolean;
  createdDate?: { $date: string };
  lat?: number;
  lon?: number;
  segmentID?: string;
}

export const useReport = () => {
  const { accessToken } = useAuth();
  const base = `${API_URL}/report`;

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
      } finally {
        setIsLoading(false);
      }
    },
    [accessToken]
  );
  
  const getAllReport = useCallback(
    () => request<ReportEntry[]>(`${base}/`),
    [request]
  );

  const getAllUnqualifiedReport = useCallback(
    () => request<ReportEntry[]>(`${base}/notQualified`),
    [request]
  );

  const getReportByID = useCallback(
    (id: string) => request<ReportEntry[]>(`${base}/${id}`),
    [request]
  );

  const getReportByUploader = useCallback(
    () => request<ReportEntry[]>(`${base}/uploader`),
    [request]
  );

  const addReport = useCallback(
    async (report: ReportEntry) => {
      setIsLoading(true);
      try {
        return await request<ReportEntry>(`${base}/`, {
          method: "POST",
          data: JSON.stringify(report),
          headers: { "Content-Type": "application/json" },
        });
      } finally {
        setIsLoading(false);
      }
    },
    [request]
  );

  const updateReport = useCallback(
    async (report: ReportEntry) => {
      if (!report._id || report._id.length !== 24) {
        throw new Error("Invalid _id format for update");
      }
      setIsLoading(true);
      try {
        return await request<ReportEntry>(`${base}/`, {
          method: "PUT",
          data: JSON.stringify(report),
          headers: { "Content-Type": "application/json" },
        });
      } finally {
        setIsLoading(false);
      }
    },
    [request]
  );

  const deleteReport = useCallback(
    (id: string) =>
      request<{ deleted: boolean }>(`${base}/${id}`, {
        method: "DELETE",
      }),
    [request]
  );

  const autoVerify = useCallback(
    (id: string) => request(`${base}/autoVerify/${id}`),
    [request]
  );

  const getReportByGps = useCallback(
    async (lat:number, lon:number) => {
      setIsLoading(true);
      const data = {
        lat: lat,
        lon: lon
      }
      try {
        return await request<any>(`${base}/gps`, {
          method: "POST",
          data: JSON.stringify(data),
          headers: { "Content-Type": "application/json" },
        });
      } finally {
        setIsLoading(false);
      }
    },
    [request]
  );

  const getStatusInfoByID = useCallback(
    (id: string) => request<ReportEntry[]>(`${API_URL}/trafficStatusInfo/${id}`),
    [request]
  );


  return {
    isLoading,
    error,
    getAllReport,
    getAllUnqualifiedReport,
    getReportByID,
    getReportByUploader,
    getReportByGps,
    getStatusInfoByID,
    addReport,
    updateReport,
    deleteReport,
    autoVerify
  };
};
