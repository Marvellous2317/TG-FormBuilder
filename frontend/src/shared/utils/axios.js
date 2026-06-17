import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { useToastStore } from '../store/toastStore';

const baseURL = import.meta.env.PUBLIC_API_BASE_URL ?? '/api/v1';

const axiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 30000,
});

// Track whether a token refresh is in flight to avoid multiple refresh calls
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  failedQueue = [];
};

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
  async (error) => {
    const { showError } = useToastStore.getState();
    const originalRequest = error.config;

    // If no response — likely a network error
    if (!error.response) {
      showError('Network error. Please check your connection.');
      return Promise.reject(error);
    }

    // Non-401 errors
    if (error.response.status !== 401) {
      const message =
        error?.response?.data?.message ||
        error.message ||
        'Something went wrong';
      showError(message);
      return Promise.reject(error);
    }

    // If this is a refresh endpoint call that failed, don't retry
    if (
      originalRequest._retry ||
      originalRequest.url?.includes('/auth/refresh')
    ) {
      useAuthStore.getState().clearAuth();
      return Promise.reject(error);
    }

    // Prevent retrying the same request more than once
    originalRequest._retry = true;

    const refreshToken = useAuthStore.getState().refreshToken;
    if (!refreshToken) {
      useAuthStore.getState().clearAuth();
      return Promise.reject(error);
    }

    // If a refresh is already in progress, queue this request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          if (originalRequest.headers && 'set' in originalRequest.headers) {
            originalRequest.headers.set('Authorization', `Bearer ${token}`);
          } else {
            originalRequest.headers = {
              ...originalRequest.headers,
              Authorization: `Bearer ${token}`,
            };
          }
          return axiosInstance(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    isRefreshing = true;

    try {
      const { data } = await axiosInstance.post('/auth/refresh-token', {
        refreshToken,
      });

      const newAccessToken = data?.data?.token ?? data?.token;
      const newRefreshToken = data?.data?.refreshToken ?? data?.refreshToken;

      if (newAccessToken) {
        // Update the store with new tokens
        useAuthStore.getState().setAccessToken(newAccessToken, newRefreshToken);

        // Retry all queued requests with the new token
        processQueue(null, newAccessToken);

        // Retry the original request
        if (originalRequest.headers && 'set' in originalRequest.headers) {
          originalRequest.headers.set(
            'Authorization',
            `Bearer ${newAccessToken}`,
          );
        } else {
          originalRequest.headers = {
            ...originalRequest.headers,
            Authorization: `Bearer ${newAccessToken}`,
          };
        }
        return axiosInstance(originalRequest);
      } else {
        throw new Error('No access token returned from refresh');
      }
    } catch (refreshError) {
      // Refresh failed — clear auth and reject all queued requests
      processQueue(refreshError, null);
      useAuthStore.getState().clearAuth();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export default axiosInstance;
