// src/services/userService.ts
// User management API service - Real backend integration
// Handles all user-related API calls for admin functionality

import api from './api';

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: 'customer' | 'admin' | 'pickup_boy' | 'manager';
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    landmark?: string;
  };
  avatar?: string;
  isEmailVerified: boolean;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  role: 'customer' | 'pickup_boy' | 'manager' | 'admin';
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    landmark?: string;
  };
}

export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  role?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    pincode?: string;
    landmark?: string;
  };
  isActive?: boolean;
}

export interface UserStats {
  totalUsers: number;
  customers: number;
  pickupBoys: number;
  managers: number;
  admins: number;
  activeUsers: number;
  inactiveUsers: number;
  newUsersThisMonth: number;
}

export const userService = {
  // Get all users (Admin/Manager)
  getUsers: async (params?: { 
    role?: string; 
    page?: number; 
    limit?: number;
    search?: string;
    status?: string;
  }) => {
    const response = await api.get('/api/users', { params });
    return response.data;
  },

  // Get single user (Admin/Manager)
  getUser: async (id: string) => {
    const response = await api.get(`/api/users/${id}`);
    return response.data;
  },

  // Create user (Admin)
  createUser: async (data: CreateUserData) => {
    const response = await api.post('/api/users', data);
    return response.data;
  },

  // Update user (Admin/Manager)
  updateUser: async (id: string, data: UpdateUserData) => {
    const response = await api.put(`/api/users/${id}`, data);
    return response.data;
  },

  // Delete user - soft delete (Admin)
  deleteUser: async (id: string) => {
    const response = await api.delete(`/api/users/${id}`);
    return response.data;
  },

  // Update user status (Admin/Manager)
  updateUserStatus: async (id: string, isActive: boolean) => {
    const response = await api.put(`/api/users/${id}/status`, { isActive });
    return response.data;
  },

  // Get user statistics (Admin/Manager)
  getUserStats: async (): Promise<{ success: boolean; data: UserStats }> => {
    const response = await api.get('/api/users/stats');
    return response.data;
  },

  // Get pickup boys for assignment (Admin/Manager)
  getPickupBoys: async (params?: { pincode?: string }) => {
    const response = await api.get('/api/users/pickup-boys', { params });
    return response.data;
  },

  // Reset user password (Admin)
  resetUserPassword: async (id: string, newPassword: string) => {
    const response = await api.put(`/api/users/${id}/reset-password`, { newPassword });
    return response.data;
  },

  // Send notification to user (Admin/Manager)
  notifyUser: async (id: string, subject: string, message: string) => {
    const response = await api.post(`/api/users/${id}/notify`, { subject, message });
    return response.data;
  },

  // Export users data (Admin)
  exportUsers: async (params?: { 
    role?: string; 
    format?: 'csv' | 'excel';
    dateFrom?: string;
    dateTo?: string;
  }) => {
    const response = await api.get('/api/users/export', {
      params,
      responseType: 'blob'
    });
    return response.data;
  },

  // Get user activity (Admin/Manager)
  getUserActivity: async (id: string, period?: string) => {
    const response = await api.get(`/api/users/${id}/activity`, {
      params: { period }
    });
    return response.data;
  },

  // Bulk actions on users (Admin)
  bulkUpdateUsers: async (userIds: string[], action: 'activate' | 'deactivate' | 'delete') => {
    const response = await api.put('/api/users/bulk-action', {
      userIds,
      action
    });
    return response.data;
  },

  // Search users (Admin/Manager)
  searchUsers: async (query: string, filters?: {
    role?: string;
    isActive?: boolean;
    dateFrom?: string;
    dateTo?: string;
  }) => {
    const response = await api.get('/api/users/search', {
      params: { q: query, ...filters }
    });
    return response.data;
  },

  // Get user orders summary (Admin/Manager)
  getUserOrdersSummary: async (id: string) => {
    const response = await api.get(`/api/users/${id}/orders-summary`);
    return response.data;
  },

  // Update user role (Admin)
  updateUserRole: async (id: string, role: string) => {
    const response = await api.put(`/api/users/${id}/role`, { role });
    return response.data;
  },

  // Get users by location (Admin/Manager)
  getUsersByLocation: async (pincode?: string, city?: string, state?: string) => {
    const response = await api.get('/api/users/by-location', {
      params: { pincode, city, state }
    });
    return response.data;
  }
};