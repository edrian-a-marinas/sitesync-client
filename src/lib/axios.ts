import axios from "axios";
import { getToken, clearToken } from "@/app/lib/token";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api/v1`
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) clearToken();
    return Promise.reject(error);
  }
);

export default api;