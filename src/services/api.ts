// src/services/api.ts
// Main API service configuration and base setup

import axios from 'axios';
import { API_URL } from '../config';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

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

// src/services/categoryService.ts
// Category related API calls

import api from './api';

export interface Category {
  _id: string;
  name: string;
  description: string;
  icon: string;
  basePrice: number;
  unit: string;
  conditionMultipliers: {
    excellent: number;
    good: number;
    fair: number;
    poor: number;
    broken: number;
  };
  subcategories: Array<{
    name: string;
    priceModifier: number;
  }>;
  isActive: boolean;
  sortOrder: number;
}

export const categoryService = {
  // Get all categories
  getCategories: async () => {
    const response = await api.get('/api/categories');
    return response.data;
  },

  // Get category by ID
  getCategory: async (id: string) => {
    const response = await api.get(`/api/categories/${id}`);
    return response.data;
  },

  // Create category (Admin only)
  createCategory: async (data: Partial<Category>) => {
    const response = await api.post('/api/categories', data);
    return response.data;
  },

  // Update category (Admin only)
  updateCategory: async (id: string, data: Partial<Category>) => {
    const response = await api.put(`/api/categories/${id}`, data);
    return response.data;
  },

  // Delete category (Admin only)
  deleteCategory: async (id: string) => {
    const response = await api.delete(`/api/categories/${id}`);
    return response.data;
  },
};

// src/services/orderService.ts
// Order related API calls

import api from './api';

export interface OrderItem {
  categoryId: string;
  subcategory?: string;
  brand?: string;
  model?: string;
  condition: string;
  quantity: number;
  estimatedPrice?: number;
  finalPrice?: number;
  images?: string[];
  description?: string;
}

export interface PickupDetails {
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    landmark?: string;
  };
  preferredDate: string;
  timeSlot: string;
  contactNumber: string;
  specialInstructions?: string;
}

export interface CreateOrderData {
  items: OrderItem[];
  pickupDetails: PickupDetails;
  pricing?: {
    estimatedTotal: number;
    pickupCharges?: number;
  };
}

export interface Order {
  _id: string;
  orderNumber: string;
  customerId: string;
  items: OrderItem[];
  pickupDetails: PickupDetails;
  status: string;
  assignedPickupBoy?: {
    _id: string;
    firstName: string;
    lastName: string;
    phone: string;
  };
  pinVerification: {
    pin: string;
    isVerified: boolean;
    verifiedAt?: Date;
  };
  pricing: {
    estimatedTotal: number;
    actualTotal: number;
    pickupCharges: number;
    finalAmount: number;
  };
  payment: {
    method: string;
    status: string;
    transactionId?: string;
    paidAt?: Date;
  };
  timeline: Array<{
    status: string;
    timestamp: Date;
    updatedBy: string;
    note?: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export const orderService = {
  // Create new order
  createOrder: async (data: CreateOrderData) => {
    const response = await api.post('/api/orders', data);
    return response.data;
  },

  // Get user's orders
  getUserOrders: async () => {
    const response = await api.get('/api/orders');
    return response.data;
  },

  // Get order by ID
  getOrder: async (id: string) => {
    const response = await api.get(`/api/orders/${id}`);
    return response.data;
  },

  // Cancel order
  cancelOrder: async (id: string, reason?: string) => {
    const response = await api.put(`/api/orders/${id}/cancel`, { reason });
    return response.data;
  },

  // Get all orders (Admin/Manager)
  getAllOrders: async (params?: { status?: string; page?: number; limit?: number }) => {
    const response = await api.get('/api/orders/all', { params });
    return response.data;
  },

  // Update order status (Admin/Manager/PickupBoy)
  updateOrderStatus: async (id: string, status: string, note?: string) => {
    const response = await api.put(`/api/orders/${id}/status`, { status, note });
    return response.data;
  },

  // Assign pickup boy (Admin/Manager)
  assignPickupBoy: async (id: string, pickupBoyId: string) => {
    const response = await api.put(`/api/orders/${id}/assign`, { pickupBoyId });
    return response.data;
  },

  // Get assigned orders (PickupBoy)
  getAssignedOrders: async () => {
    const response = await api.get('/api/orders/assigned');
    return response.data;
  },

  // Verify pickup PIN (PickupBoy)
  verifyPickupPin: async (id: string, pin: string) => {
    const response = await api.put(`/api/orders/${id}/verify`, { pin });
    return response.data;
  },
};

// src/services/pincodeService.ts
// Pincode related API calls

import api from './api';

export interface Pincode {
  _id: string;
  pincode: string;
  city: string;
  state: string;
  area: string;
  isServiceable: boolean;
  pickupCharges: number;
  minimumOrderValue: number;
  estimatedPickupTime: string;
  assignedPickupBoys: string[];
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export const pincodeService = {
  // Check pincode serviceability
  checkPincode: async (pincode: string) => {
    const response = await api.get(`/api/pincodes/check/${pincode}`);
    return response.data;
  },

  // Get all pincodes (Admin/Manager)
  getPincodes: async (params?: { 
    page?: number; 
    limit?: number; 
    city?: string; 
    state?: string; 
    serviceable?: boolean; 
  }) => {
    const response = await api.get('/api/pincodes', { params });
    return response.data;
  },

  // Create pincode (Admin)
  createPincode: async (data: Partial<Pincode>) => {
    const response = await api.post('/api/pincodes', data);
    return response.data;
  },

  // Update pincode (Admin)
  updatePincode: async (id: string, data: Partial<Pincode>) => {
    const response = await api.put(`/api/pincodes/${id}`, data);
    return response.data;
  },

  // Delete pincode (Admin)
  deletePincode: async (id: string) => {
    const response = await api.delete(`/api/pincodes/${id}`);
    return response.data;
  },

  // Assign pickup boy to pincode (Admin/Manager)
  assignPickupBoy: async (id: string, pickupBoyId: string) => {
    const response = await api.put(`/api/pincodes/${id}/assign`, { pickupBoyId });
    return response.data;
  },

  // Remove pickup boy from pincode (Admin/Manager)
  removePickupBoy: async (id: string, pickupBoyId: string) => {
    const response = await api.delete(`/api/pincodes/${id}/assign/${pickupBoyId}`);
    return response.data;
  },
};