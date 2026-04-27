import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('token') || localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Игнорируем ошибку 401 для самого эндпоинта логина (чтобы показать ошибку пользователю)
      if (error.config && error.config.url && error.config.url.includes('/api/auth/login')) {
        return Promise.reject(error);
      }

      // Если токен протух или невалиден, очищаем его
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('currentUser');
      localStorage.removeItem('token');
      localStorage.removeItem('currentUser');
      
      // Выкидываем пользователя на страницу логина
      if (window.location.pathname !== '/login') {
         window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
