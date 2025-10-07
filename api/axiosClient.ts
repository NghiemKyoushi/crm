import { API_TYPE_CONST } from "@/constants/api-type";
import i18n from "@/locales/i18n";
import axios from "axios";
import Cookies from "js-cookie";
import { CacheManager } from "@/utils/cache-manager";
import { useQueryClient } from "@tanstack/react-query";

// API Response interface
interface ApiResponse<T = any> {
  success: boolean;
  timestamp: string;
  code: number;
  message: string;
  message_key?: string;
  data: T;
  errors: any;
  // Added for i18n support
  messageKey?: string;
  localizedMessage?: string;
}

// Helper function to get device info for headers
const getDeviceInfo = () => {
  if (typeof window === 'undefined') {
    // Server-side defaults
    return {
      platform: '1', // Web platform
      deviceId: 'server-' + Date.now(),
      deviceName: 'ServerSide',
      osVersion: 'Unknown',
      os: 'Server',
      ip: '127.0.0.1',
      location: 'HN'
    };
  }

  // Client-side device detection
  const userAgent = navigator.userAgent;
  const platform = /iPhone|iPad|iPod/.test(userAgent) ? '2' :
                   /Android/.test(userAgent) ? '3' : '1'; // 1=Web, 2=iOS, 3=Android

  return {
    platform,
    deviceId: localStorage.getItem('deviceId') || 'web-' + Date.now(),
    deviceName: navigator.platform || 'WebBrowser',
    osVersion: /Windows NT ([0-9\.]+)/.exec(userAgent)?.[1] ||
               /Mac OS X ([0-9_]+)/.exec(userAgent)?.[1]?.replace(/_/g, '.') ||
               /Android ([0-9\.]+)/.exec(userAgent)?.[1] || 'Unknown',
    os: /Windows/.test(userAgent) ? 'Windows' :
        /Mac/.test(userAgent) ? 'macOS' :
        /Linux/.test(userAgent) ? 'Linux' :
        /Android/.test(userAgent) ? 'Android' :
        /iPhone|iPad|iPod/.test(userAgent) ? 'iOS' : 'Unknown',
    ip: '127.0.0.1', // Will be set by backend
    location: localStorage.getItem('userLocation') || 'HN'
  };
};

// Get current language for Accept-Language header
const getCurrentLanguage = (): string => {
  if (typeof window === 'undefined') return 'vi';

  // Get from i18n current language
  const currentLang = i18n.language || 'vi';
  return currentLang === 'en' ? 'en' : 'vi';
};

// Initialize device info
const deviceInfo = getDeviceInfo();

// Store deviceId for future use
if (typeof window !== 'undefined' && !localStorage.getItem('deviceId')) {
  localStorage.setItem('deviceId', deviceInfo.deviceId);
}

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_ROOT_STATIC_URL,
  withCredentials: true,
});

let isRefreshing = false;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let failedQueue: any[] = [];

// Common function to translate message_key using i18n
const translateMessageKey = (messageKey: string, fallbackMessage?: string): string => {
  try {
    // Check if i18n translation exists
    const translated = i18n.t(messageKey);
    // If translation key not found, i18n returns the key itself
    if (translated === messageKey) {
      return fallbackMessage || messageKey;
    }
    return translated;
  } catch (error) {
    console.warn('i18n translation error for key:', messageKey, error);
    return fallbackMessage || messageKey;
  }
};

// Helper function to get message from response (with i18n support)
export const getResponseMessage = (response: any): string => {
  if (response?.data?.localizedMessage) {
    return response.data.localizedMessage;
  }
  if (response?.data?.message_key) {
    return translateMessageKey(response.data.message_key, response.data.message);
  }
  if (response?.data?.message) {
    return response.data.message;
  }
  return 'Operation completed';
};

// Helper function to get message key for debugging/logging
export const getResponseMessageKey = (response: any): string | null => {
  return response?.data?.message_key || response?.data?.messageKey || null;
};

// Utility functions for external use
export const setUserLocation = (location: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('userLocation', location);
  }
};

export const setDeviceId = (deviceId: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('deviceId', deviceId);
  }
};

export const getDeviceId = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('deviceId');
  }
  return null;
};

// Debug function to log current headers
export const getCurrentHeaders = () => {
  const deviceInfo = getDeviceInfo();
  const language = getCurrentLanguage();

  return {
    'Accept-Language': language,
    'Content-Type': 'application/json',
    'X-Platform': deviceInfo.platform,
    'X-Device-Id': deviceInfo.deviceId,
    'X-Device-Name': deviceInfo.deviceName,
    'X-Os-Version': deviceInfo.osVersion,
    'X-Os': deviceInfo.os,
    'X-Ip': deviceInfo.ip,
    'X-Location': deviceInfo.location,
  };
};

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
  // Set dynamic headers
  const currentDeviceInfo = getDeviceInfo();
  const currentLanguage = getCurrentLanguage();

  // Set authentication token
  const token = Cookies.get("accessToken");
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }

  // Set dynamic headers with real device info
  config.headers["Accept-Language"] = currentLanguage;
  config.headers["Content-Type"] = "application/json";
  config.headers["Access-Control-Allow-Origin"] = "*";
  config.headers["Access-Control-Allow-Methods"] = "DELETE, POST, GET, OPTIONS";
  config.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Requested-With";
  config.headers["X-Platform"] = currentDeviceInfo.platform;
  config.headers["X-Device-Id"] = currentDeviceInfo.deviceId;
  config.headers["X-Device-Name"] = currentDeviceInfo.deviceName;
  config.headers["X-Os-Version"] = currentDeviceInfo.osVersion;
  config.headers["X-Os"] = currentDeviceInfo.os;
  config.headers["X-Ip"] = currentDeviceInfo.ip;
  config.headers["X-Location"] = currentDeviceInfo.location;

  return config;
});

api.interceptors.response.use(
  (res) => {
    // Handle message_key from API response
    // API Response format: { success, timestamp, code, message, message_key, data, errors }
    if (res?.data?.message_key && typeof res.data.message_key === "string") {
      // Store message_key for debugging
      res.data.messageKey = res.data.message_key;
      // Use common translation function
      res.data.localizedMessage = translateMessageKey(res.data.message_key, res.data.message);
    }
    return res;
  },
  async err => {
    // Handle message_key from error response
    if (err.response?.data?.message_key && typeof err.response.data.message_key === "string") {
      // Store message_key for debugging
      err.response.data.messageKey = err.response.data.message_key;
      // Use common translation function
      err.response.data.localizedMessage = translateMessageKey(err.response.data.message_key, err.response.data.message);
    }
    const originalRequest = err.config;
    const logout = () => {
      // Use CacheManager for more thorough cleanup
      CacheManager.clearAuthData();
      localStorage.clear();
      window.location.href = "/login";
      Cookies.remove("token", { path: "/" }); 
      Cookies.remove("accessToken", { path: "" }); 
      Cookies.remove("refreshToken", { path: "" });
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

      // const refreshToken = localStorage.getItem("refreshToken");
      const refreshToken = Cookies.get("refreshToken");      
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
        // Cookies.set("token", token, { expires: 1 });
        Cookies.set("token", token, {
          expires: 1,
          path: "/",
          sameSite: "lax",
          secure: true,
        });
        // localStorage.setItem("accessToken", token);
        Cookies.set("accessToken", token, {
          expires: 1,
          path: "/",
          sameSite: "lax",
          secure: true,
        });
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
