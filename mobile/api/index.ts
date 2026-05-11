import axios from "axios";
import {
  getAccessToken,
  getRefreshToken,
  saveTokens,
  clearTokens,
} from "../utils/token";

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
});

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

// Add subscriber
const subscribeTokenRefresh = (cb: (token: string) => void) => {
  refreshSubscribers.push(cb);
};

// Notify all subscribers
const onRefreshed = (token: string) => {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
};

// REQUEST INTERCEPTOR
api.interceptors.request.use(async (config) => {
  const token = await getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// RESPONSE INTERCEPTOR
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;

    if (err.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(err);
    }

    originalRequest._retry = true;

    if (isRefreshing) {
      return new Promise((resolve) => {
        subscribeTokenRefresh((token: string) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          resolve(api(originalRequest));
        });
      });
    }

    isRefreshing = true;

    try {
      const refresh = await getRefreshToken();

      if (!refresh) {
        throw new Error("No refresh token");
      }

      const res = await axios.post(
        `${process.env.EXPO_PUBLIC_API_URL}/api/auth/refresh/`,
        { refresh },
      );

      const newAccess = res.data.access;

      await saveTokens(newAccess, refresh);

      onRefreshed(newAccess);

      // Retry original request
      originalRequest.headers.Authorization = `Bearer ${newAccess}`;
      return api(originalRequest);
    } catch (error) {
      await clearTokens();

      return Promise.reject(error);
    } finally {
      isRefreshing = false;
    }
  },
);

export default api;
