import { useState, useCallback } from "react";
import { useAuth } from "./useAuth";
import Constants from "expo-constants";
import axios, { AxiosRequestConfig } from "axios";
import pako from "pako";

const API_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_API_URL;

export interface Segment {
  id: string;
  way_id?: number;
  tags?: Record<string, any>;
  coordinates?: [number, number][];
  status?: any;
}

export const useSegment = () => {
  const { accessToken } = useAuth();
  const base = `${API_URL}/segment`;

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
          timeout: 30000, // 30s
        });

        if (res.data?.data && typeof res.data.data === "string") {
          try {
            const b64data = res.data.data;
            const compressed = Uint8Array.from(atob(b64data), (c) =>
              c.charCodeAt(0)
            );
            const decompressed = pako.ungzip(compressed, { to: "string" });
            return JSON.parse(decompressed) as T;
          } catch {
            return res.data as T;
          }
        }

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

  const getMapSegment = useCallback(
    (
      bbox: { lon_min: number; lat_min: number; lon_max: number; lat_max: number }
    ) =>
      request<{ data: Segment[] }>(`${base}/map`, {
        method: "POST",
        data: bbox,
      }),
    [request]
  );
  return {
    isLoading,
    error,
    getMapSegment
  };
};


//test using blob -> bug chưa sửa được
// import { useState, useCallback } from "react";
// import { useAuth } from "./useAuth";
// import Constants from "expo-constants";
// import axios, { AxiosRequestConfig } from "axios";
// import pako from "pako";

// const API_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_API_URL;

// export interface Segment {
//   id: string;
//   way_id?: number;
//   tags?: Record<string, any>;
//   coordinates?: [number, number][];
//   status?: any;
// }

// export const useSegment = () => {
//   const { accessToken } = useAuth();
//   const base = `${API_URL}/segment`;

//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const request = useCallback(
//     async <T,>(url: string, options: AxiosRequestConfig = {}): Promise<T> => {
//       setIsLoading(true);
//       setError(null);

//       try {
//         const res = await axios({
//           url,
//           method: options.method || "GET",
//           data: options.data,
//           headers: {
//             "Content-Type": "application/json",
//             ...(accessToken ? { Authorization: accessToken } : {}),
//             ...(options.headers || {}),
//           },
//           responseType: "blob", // Chỉ định nhận phản hồi dạng blob
//           timeout: 20000,
//         });

//         // Xử lý blob
//         const arrayBuffer = await res.data.arrayBuffer();
//         const uint8Array = new Uint8Array(arrayBuffer);
//         const decompressed = pako.ungzip(uint8Array, { to: "string" });
//         const test = JSON.parse(decompressed) as T;
//         console.log(test);
//         return JSON.parse(decompressed) as T;
//       } catch (err: any) {
//         // Xử lý lỗi, cố gắng parse JSON từ phản hồi lỗi
//         let message = "Unknown error";
//         if (err.response?.data) {
//           try {
//             const errorData = await err.response.data.text();
//             const jsonError = JSON.parse(errorData);
//             message = jsonError.error || err.response.statusText || err.message;
//           } catch (e) {
//             message = err.response.statusText || err.message;
//           }
//         }
//         setError(message);
//         throw new Error(message);
//       } finally {
//         setIsLoading(false);
//       }
//     },
//     [accessToken]
//   );

//   const getMapSegment = useCallback(
//     (
//       bbox: { lon_min: number; lat_min: number; lon_max: number; lat_max: number }
//     ) =>
//       request<{ data: Segment[] }>(`${base}/map1`, {
//         method: "POST",
//         data: bbox,
//       }),
//     [request]
//   );

//   return {
//     isLoading,
//     error,
//     getMapSegment,
//   };
// };
