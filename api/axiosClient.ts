import { API_TYPE_CONST } from "@/constants/api-type";
import i18n from "@/locales/i18n";
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
  (res) => {
    if (res?.data?.message && typeof res.data.message === "string") {
      res.data.localizedMessage = i18n.t(res.data.message);
    }
    return res;
  },
  async err => {
    if (err.response?.data?.message) {
      err.response.data.localizedMessage = i18n.t(err.response.data.message);
    }
    const originalRequest = err.config;
    const logout = () => {
      localStorage.clear();
      window.location.href = "/login";
    };

    if (err.response?.status === 401 && !originalRequest._retry) {
      if (/(\/login|\/auth\/generate\/access-token)$/.test(originalRequest.url)) {
        logout();
        return Promise.reject(err);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }
      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem("refreshToken");      
      if (!refreshToken) {
        logout();
        return Promise.reject(err);
      }

      try {
        const res = await axios.post(
          API_TYPE_CONST.GENERATE_ACCESS_TOKEN,
          {},
          {
            baseURL: process.env.NEXT_PUBLIC_ROOT_STATIC_URL,
            headers: { Authorization: `Bearer ${refreshToken}` },
          }
        );

        const token = res.data.data.token;
        localStorage.setItem("accessToken", token);
        processQueue(null, token);

        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        logout();
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(err);
  }
);

export default api;
