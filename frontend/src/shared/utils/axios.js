import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { useToastStore } from '../store/toastStore';

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
    console.error('API Error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      message: error.message,
      hasResponse: !!error.response,
    });

    if (error.response?.status === 401) {
      console.log('Got here - 401 Unauthorized');

      // Clear auth data from localStorage directly
      localStorage.removeItem('auth-storage');

      try {
        const { showError } = useToastStore.getState();
        showError('Unauthenticated');
      } catch (e) {
        console.warn('Could not show toast error', e);
      }

      // Redirect to login
      window.location.href = '/login';
      return Promise.reject(error);
    }

    if (error.response?.status === 403) {
      console.log('Got here - 403 Forbidden');

      // Clear auth data from localStorage directly
      localStorage.removeItem('auth-storage');

      try {
        const { showError } = useToastStore.getState();
        showError('Forbidden');
      } catch (e) {
        console.warn('Could not show toast error', e);
      }

      // Redirect to login
      window.location.href = '/login';
      return Promise.reject(error);
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
