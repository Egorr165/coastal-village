import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from './types';
import * as authService from './authService';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  register: (name: string, email: string, phone: string, password: string) => Promise<void>;
  verifyEmail: (email: string, code: string) => Promise<void>;
  resetPasswordRequest: (email: string) => Promise<void>;
  resetPasswordConfirm: (email: string, code: string, new_password: string) => Promise<void>;
  logout: () => void;
  updateUser: (updatedData: Partial<User> | FormData) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => authService.getCurrentUser());

  const login = async (identifier: string, password: string) => {
    const response = await authService.login(identifier, password);
    setUser(response.user);
  };

  const register = async (name: string, email: string, phone: string, password: string) => {
    await authService.register(name, email, phone, password);
    // Note: register doesn't log the user in anymore. It sends an email.
  };

  const verifyEmail = async (email: string, code: string) => {
    const response = await authService.verifyEmail(email, code);
    setUser(response.user);
  };

  const resetPasswordRequest = async (email: string) => {
    await authService.resetPasswordRequest(email);
  };

  const resetPasswordConfirm = async (email: string, code: string, new_password: string) => {
    await authService.resetPasswordConfirm(email, code, new_password);
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const updateUser = async (updatedData: Partial<User> | FormData) => {
    const updatedUser = await authService.updateUser(updatedData);
    setUser(updatedUser);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    login,
    register,
    verifyEmail,
    resetPasswordRequest,
    resetPasswordConfirm,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
