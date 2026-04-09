// src/api/client.ts
import axios from 'axios';
import { getSessionId } from '@/utils/session';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL as string,
  timeout: 10_000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  config.headers['x-session-id'] = getSessionId();
  return config;
});

api.interceptors.response.use(
  (res) => res.data.data,
  (err: unknown) => {
    if (axios.isAxiosError(err)) {
      return Promise.reject(err.response?.data?.error ?? 'Something went wrong');
    }
    return Promise.reject('Something went wrong');
  },
);

export default api;
