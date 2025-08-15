import { API_TYPE_CONST } from "@/constants/api-type";
import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_ROOT_STATIC_URL,
  withCredentials: true,
  headers: {
    "Accept-Language": "vn",
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "DELETE, POST, GET, OPTIONS",
    "Access-Control-Allow-Headers":
      "Content-Type, Authorization, X-Requested-With",
    "X-Platform": "1",
    "X-Device-Id": "dev-1",
    "X-Device-Name": "TestDevice",
    "X-Os-Version": "14",
    "X-Os": "Android",
    "X-Ip": "127.0.0.1",
    "X-Location": "HN",
  },
});

let isRefreshing = false;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let failedQueue: any[] = [];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem("accessToken");
  if (accessToken) {
    config.headers["Authorization"] = `Bearer ${accessToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Nếu 401 và chưa thử refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (originalRequest.url.includes("/login") || originalRequest.url.includes("/auth/generate/access-token")) {
        localStorage.clear();
        window.location.href = "/login";
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers["Authorization"] = "Bearer " + token;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        localStorage.clear();
        window.location.href = "/login";
        return Promise.reject(error);
      }

      try {
        const newAccessToken = await api.post(
            API_TYPE_CONST.GENERATE_ACCESS_TOKEN,
            {}, 
            {
              headers: {
                Authorization: `Bearer ${refreshToken}`,
              },
            }
          );  
        localStorage.setItem("accessToken", newAccessToken.data.data.token);
        processQueue(null, newAccessToken.data.data.token);
        originalRequest.headers["Authorization"] = "Bearer " + newAccessToken;
        return api(originalRequest);
      } catch (err) {
        processQueue(err, null);
        localStorage.clear();
        window.location.href = "/login";
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
