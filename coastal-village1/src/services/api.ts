import axios from 'axios';
import { NavigateFunction } from 'react-router-dom';

let navigate: NavigateFunction | null = null;

export const setNavigate = (nav: NavigateFunction) => {
  navigate = nav;
};

export const isValidReturnUrl = (url: string | null): boolean => {
  if (!url) return false;
  
  if (url.startsWith('//') || url.startsWith('http') || url.startsWith('javascript:') || url.startsWith('data:')) {
    return false;
  }
  
  if (/[<>"'\\]/.test(url)) {
    return false;
  }
  
  return true;
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://7continent-dagestan.ru/',
  headers: {
    'Content-Type': 'application/json',
  },
});

const refreshApi = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://7continent-dagestan.ru/',
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue: { resolve: (value: any) => void; reject: (error: any) => void }[] = [];

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

api.interceptors.request.use(
  (config) => {
    const storageType = sessionStorage.getItem('refreshToken') ? 'session' : 'local';
    
    let accessToken = '';
    if (storageType === 'session') {
        accessToken = sessionStorage.getItem('token') || '';
    } else {
        accessToken = localStorage.getItem('token') || '';
    }

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      
      const currentPath = window.location.pathname;
      const authPaths = ['/login', '/register', '/forgot-password'];
      if (authPaths.includes(currentPath)) {
        return Promise.reject(error);
      }

      const returnUrl = currentPath + window.location.search;
      if (!sessionStorage.getItem('returnUrl') && isValidReturnUrl(returnUrl)) {
        sessionStorage.setItem('returnUrl', returnUrl);
      }

      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      isRefreshing = true;

      try {
        const refreshToken = sessionStorage.getItem('refreshToken') || localStorage.getItem('refreshToken');
        
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const { data } = await refreshApi.post(
          '/api/auth/token/refresh/', 
          { refresh: refreshToken },
        );

        const newAccessToken = data.access;

        if (sessionStorage.getItem('refreshToken')) {
           sessionStorage.setItem('token', newAccessToken);
        } else {
           localStorage.setItem('token', newAccessToken);
        }

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        processQueue(null, newAccessToken);

        return api(originalRequest);

      } catch (refreshError) {
        processQueue(refreshError, null);

        sessionStorage.removeItem('token');
        sessionStorage.removeItem('refreshToken');
        sessionStorage.removeItem('currentUser');
        
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('currentUser');

        if (navigate) {
          navigate('/login');
        } else {
          window.location.href = '/login';
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;