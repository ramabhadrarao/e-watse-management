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