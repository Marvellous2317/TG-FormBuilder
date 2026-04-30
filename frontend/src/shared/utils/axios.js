import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const baseURL =
  import.meta.env.VITE_API_BASE_URL ??
  'https://tgpackagingappprd.azurewebsites.net/api/v1/';

const axiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 30000,
});

axiosInstance.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;

  if (token) {
    if (config.headers && 'set' in config.headers) {
      config.headers.set('Authorization', `Bearer ${token}`);
    } else {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }
  }

  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 401 ||
      error.response?.status === 403
    ) {
      useAuthStore.getState().clearAuth();
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
