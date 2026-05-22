import { User, AuthResponse } from './types';
import api from '../../services/api';
import axios from 'axios';

const CURRENT_USER_KEY = 'currentUser';
const ACCESS_TOKEN_KEY = 'token';
const REFRESH_TOKEN_KEY = 'refreshToken';

const getErrorMessage = (error: unknown, defaultMessage: string): string => {
  if (axios.isAxiosError(error) && error.response?.data) {
    const data = error.response.data;
    
    if (typeof data === 'string' && data.trim().startsWith('<')) {
        return 'Внутренняя ошибка сервера (500). Попробуйте позже.';
    }

    if (data.message) return data.message;
    if (data.non_field_errors) return data.non_field_errors[0];
    if (typeof data === 'object') {
        const firstError = Object.values(data)[0];
        if (Array.isArray(firstError)) return firstError[0] as string;
        if (typeof firstError === 'string') return firstError;
    }
  }
  return error instanceof Error ? error.message : defaultMessage;
};

const saveAuthData = (user: User, access: string, refresh: string) => {
  const storage = user.is_staff ? sessionStorage : localStorage;
  
  storage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  if (access) storage.setItem(ACCESS_TOKEN_KEY, access);
  if (refresh) storage.setItem(REFRESH_TOKEN_KEY, refresh);
};

export const register = async (name: string, email: string, phone: string, password: string): Promise<any> => {
  try {
    const response = await api.post('/api/auth/register/', {
      name,
      email,
      phone,
      password,
    });
    return response.data;
  } catch (err) {
    throw new Error(getErrorMessage(err, 'Ошибка при регистрации'));
  }
};

export const verifyEmail = async (email: string, code: string): Promise<AuthResponse> => {
  try {
    const response = await api.post<AuthResponse>('/api/auth/verify-email/', { email, code });
    const { user, token: access, refresh } = response.data as any;
    
    if (user && access) {
        saveAuthData(user, access, refresh || '');
    }
    
    return response.data;
  } catch (err) {
    throw new Error(getErrorMessage(err, 'Ошибка при проверке кода'));
  }
};

export const resetPasswordRequest = async (email: string): Promise<any> => {
  try {
    const response = await api.post('/api/auth/password-reset/request/', { email });
    return response.data;
  } catch (err) {
    throw new Error(getErrorMessage(err, 'Ошибка при запросе сброса пароля'));
  }
};

export const resetPasswordConfirm = async (email: string, code: string, new_password: string): Promise<any> => {
  try {
    const response = await api.post('/api/auth/password-reset/confirm/', { email, code, new_password });
    return response.data;
  } catch (err) {
    throw new Error(getErrorMessage(err, 'Ошибка при изменении пароля'));
  }
};


export const login = async (identifier: string, password: string): Promise<AuthResponse> => {
  try {
    const response = await api.post<AuthResponse>('/api/auth/login/', {
      identifier,
      password,
    });

    const { user, token: access, refresh } = response.data as any;
    
    if (user && access) {
        saveAuthData(user, access, refresh || '');
    }

    return response.data;
  } catch (err) {
    throw new Error(getErrorMessage(err, 'Ошибка при входе'));
  }
};

export const logout = (): void => {
  sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  sessionStorage.removeItem(REFRESH_TOKEN_KEY);
  sessionStorage.removeItem(CURRENT_USER_KEY);
  
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(CURRENT_USER_KEY);
};

export const getCurrentUser = (): User | null => {
  const userJson = sessionStorage.getItem(CURRENT_USER_KEY) || localStorage.getItem(CURRENT_USER_KEY);
  if (!userJson) return null;
  
  try {
    return JSON.parse(userJson) as User;
  } catch {
    return null;
  }
};

export const isAuthenticated = (): boolean => {
  return !!(sessionStorage.getItem(ACCESS_TOKEN_KEY) || localStorage.getItem(ACCESS_TOKEN_KEY));
};

export const updateUser = async (updatedData: Partial<User> | FormData): Promise<User> => {
  try {
    const isFormData = updatedData instanceof FormData;
    const response = await api.patch<User>('/api/auth/profile/', updatedData, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : undefined
    });
    const updatedUser = response.data;
    
    const storage = updatedUser.is_staff ? sessionStorage : localStorage;
    storage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));
    
    return updatedUser;
  } catch (err) {
    throw new Error(getErrorMessage(err, 'Ошибка при обновлении профиля'));
  }
};


export const isValidReturnUrl = (url: string | null): boolean => {
  if (!url) return false;
  
  if (url.startsWith('//') || 
      url.startsWith('http://') || 
      url.startsWith('https://') || 
      url.startsWith('javascript:') || 
      url.startsWith('data:')) {
    return false;
  }
  
  if (/[<>"'\\]/.test(url)) {
    return false;
  }
  
  return true;
};