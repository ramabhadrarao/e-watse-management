// src/services/orderService.ts
// Enhanced order service with additional admin functionality

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
  customerId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  items: (OrderItem & {
    categoryId: {
      _id: string;
      name: string;
      icon: string;
    };
  })[];
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
  createdAt: string;
  updatedAt: string;
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
  getAllOrders: async (params?: { 
    status?: string; 
    page?: number; 
    limit?: number;
    search?: string;
  }) => {
    const response = await api.get('/api/orders/all', { params });
    return response.data;
  },

  // Update order status (Admin/Manager/PickupBoy)
  updateOrderStatus: async (
    id: string, 
    status: string, 
    note?: string, 
    actualTotal?: number
  ) => {
    const response = await api.put(`/api/orders/${id}/status`, { 
      status, 
      note,
      actualTotal 
    });
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

  // Generate order receipt
  generateOrderReceipt: async (id: string) => {
    const response = await api.get(`/api/orders/${id}/receipt`, {
      responseType: 'blob', // Important for PDF download
    });
    return response.data;
  },

  // Get order statistics (Admin/Manager)
  getOrderStatistics: async (timeframe?: string) => {
    const response = await api.get('/api/orders/statistics', {
      params: { timeframe }
    });
    return response.data;
  },

  // Search orders (Admin/Manager)
  searchOrders: async (query: string, filters?: {
    status?: string;
    dateFrom?: string;
    dateTo?: string;
    customerId?: string;
    pickupBoyId?: string;
  }) => {
    const response = await api.get('/api/orders/search', {
      params: { q: query, ...filters }
    });
    return response.data;
  },

  // Export orders (Admin/Manager)
  exportOrders: async (filters?: {
    status?: string;
    dateFrom?: string;
    dateTo?: string;
    format?: 'csv' | 'excel';
  }) => {
    const response = await api.get('/api/orders/export', {
      params: filters,
      responseType: 'blob'
    });
    return response.data;
  },

  // Bulk update orders (Admin)
  bulkUpdateOrders: async (orderIds: string[], updates: {
    status?: string;
    pickupBoyId?: string;
    note?: string;
  }) => {
    const response = await api.put('/api/orders/bulk-update', {
      orderIds,
      updates
    });
    return response.data;
  },

  // Get orders summary (Admin/Manager)
  getOrdersSummary: async (period?: 'today' | 'week' | 'month' | 'year') => {
    const response = await api.get('/api/orders/summary', {
      params: { period }
    });
    return response.data;
  },

  // Get pickup boy performance (Admin/Manager)
  getPickupBoyPerformance: async (pickupBoyId?: string, period?: string) => {
    const response = await api.get('/api/orders/pickup-boy-performance', {
      params: { pickupBoyId, period }
    });
    return response.data;
  },

  // Get customer order history (Admin/Manager)
  getCustomerOrderHistory: async (customerId: string) => {
    const response = await api.get(`/api/orders/customer/${customerId}`);
    return response.data;
  },

  // Update order items (Admin/Manager)
  updateOrderItems: async (id: string, items: OrderItem[]) => {
    const response = await api.put(`/api/orders/${id}/items`, { items });
    return response.data;
  },

  // Add order note (Admin/Manager/PickupBoy)
  addOrderNote: async (id: string, note: string, isInternal: boolean = false) => {
    const response = await api.post(`/api/orders/${id}/notes`, { 
      note, 
      isInternal 
    });
    return response.data;
  },

  // Get order timeline (All authenticated users)
  getOrderTimeline: async (id: string) => {
    const response = await api.get(`/api/orders/${id}/timeline`);
    return response.data;
  },

  // Rate completed order (Customer)
  rateOrder: async (id: string, rating: number, feedback?: string) => {
    const response = await api.put(`/api/orders/${id}/rate`, {
      rating,
      feedback
    });
    return response.data;
  }
};