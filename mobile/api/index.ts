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

api.interceptors.request.use(async (config) => {
  const token = await getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.response?.status === 401) {
      try {
        const refresh = await getRefreshToken();
        const res = await api.post("/api/auth/refresh/", { refresh });
        await saveTokens(res.data.access, refresh!);

        err.config.headers.Authorization = `Bearer ${res.data.access}`;
        return api(err.config);
      } catch {
        await clearTokens();
      }
    }
    return Promise.reject(err);
  },
);

export default api;
