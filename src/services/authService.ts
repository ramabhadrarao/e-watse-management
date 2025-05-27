// src/services/authService.ts
// Authentication related API calls

import api from './api';

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    landmark?: string;
  };
  role?: string;
}

export const authService = {
  // Login user
  login: async (data: LoginData) => {
    const response = await api.post('/api/auth/login', data);
    return response.data;
  },

  // Register user
  register: async (data: RegisterData) => {
    const response = await api.post('/api/auth/register', data);
    return response.data;
  },

  // Get current user
  getMe: async () => {
    const response = await api.get('/api/auth/me');
    return response.data;
  },

  // Logout user
  logout: async () => {
    const response = await api.get('/api/auth/logout');
    return response.data;
  },

  // Update user details
  updateDetails: async (data: Partial<RegisterData>) => {
    const response = await api.put('/api/auth/updatedetails', data);
    return response.data;
  },

  // Update address
  updateAddress: async (address: RegisterData['address']) => {
    const response = await api.put('/api/auth/updateaddress', address);
    return response.data;
  },

  // Update password
  updatePassword: async (currentPassword: string, newPassword: string) => {
    const response = await api.put('/api/auth/updatepassword', {
      currentPassword,
      newPassword,
    });
    return response.data;
  },
};