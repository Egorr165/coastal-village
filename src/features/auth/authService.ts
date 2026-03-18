import type { User, AuthResponse } from './types';

interface StoredUser extends User {
  password: string;
}

const USERS_KEY = 'users';
const CURRENT_USER_KEY = 'currentUser';
const TOKEN_KEY = 'token';

function encodeBase64(str: string): string {
  return btoa(unescape(encodeURIComponent(str)));
}

const getStoredUsers = (): StoredUser[] => {
  const users = localStorage.getItem(USERS_KEY);
  return users ? JSON.parse(users) : [];
};

const saveUsers = (users: StoredUser[]): void => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

const generateToken = (email: string): string => {
  return encodeBase64(`${email}${Date.now()}`);
};

export const register = (name: string, email: string, phone: string, password: string): AuthResponse => {
  const users = getStoredUsers();
  
  const userExists = users.some(u => u.email === email || u.phone === phone);
  if (userExists) {
    throw new Error('User with this email or phone already exists');
  }

  const newUser: StoredUser = {
    id: crypto.randomUUID(),
    name,
    email,
    phone,
    password: encodeBase64(password),
  };

  const token = generateToken(email);
  
  users.push(newUser);
  saveUsers(users);

  const { password: _, ...userWithoutPassword } = newUser;
  const userToStore = { ...userWithoutPassword, password };
  
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userToStore));
  localStorage.setItem(TOKEN_KEY, token);

  return {
    user: userToStore,
    token,
  };
};

export const login = (identifier: string, password: string): AuthResponse => {
  const users = getStoredUsers();
  
  const user = users.find(u => u.email === identifier || u.phone === identifier);
  if (!user) {
    throw new Error('User not found');
  }

  if (user.password !== encodeBase64(password)) {
    throw new Error('Invalid password');
  }

  const token = generateToken(user.email);
  
  const { password: _, ...userWithoutPassword } = user;
  const userToStore = { ...userWithoutPassword, password };

  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userToStore));
  localStorage.setItem(TOKEN_KEY, token);

  return {
    user: userToStore,
    token,
  };
};

export const logout = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(CURRENT_USER_KEY);
};

export const getCurrentUser = (): User | null => {
  const userJson = localStorage.getItem(CURRENT_USER_KEY);
  if (!userJson) return null;
  
  try {
    return JSON.parse(userJson) as User;
  } catch {
    return null;
  }
};

export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem(TOKEN_KEY);
};

export const updateUser = (updatedData: Partial<User>): User => {
  const currentUser = getCurrentUser();
  if (!currentUser) throw new Error('No user logged in');

  const users = getStoredUsers();
  const userIndex = users.findIndex(u => u.id === currentUser.id);
  
  if (userIndex === -1) throw new Error('User not found in storage');

  const updatedUser = { ...users[userIndex], ...updatedData };
  
  if (updatedData.password) {
    (updatedUser as any).password = encodeBase64(updatedData.password);
  }

  users[userIndex] = updatedUser as any;
  saveUsers(users);

  const { password: _, ...userWithoutPassword } = updatedUser as any;
  const userToStore = { ...userWithoutPassword, password: updatedData.password || (currentUser as any).password };
  
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userToStore));
  
  return userToStore;
};
