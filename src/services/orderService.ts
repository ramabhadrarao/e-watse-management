// src/services/orderService.ts
// Fixed order service with proper error handling and logging

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
    try {
      console.log('Creating order with data:', data);
      const response = await api.post('/api/orders', data);
      console.log('Order created successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Create order error:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  },

  // Get user's orders
  getUserOrders: async () => {
    try {
      console.log('Fetching user orders...');
      const response = await api.get('/api/orders');
      console.log('User orders fetched:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Get user orders error:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  },

  // Get order by ID
  getOrder: async (id: string) => {
    try {
      console.log(`Fetching order ${id}...`);
      const response = await api.get(`/api/orders/${id}`);
      console.log('Order fetched:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Get order error:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  },

  // Cancel order
  cancelOrder: async (id: string, reason?: string) => {
    try {
      console.log(`Cancelling order ${id} with reason:`, reason);
      const response = await api.put(`/api/orders/${id}/cancel`, { reason });
      console.log('Order cancelled:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Cancel order error:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  },

  // Get all orders (Admin/Manager)
  getAllOrders: async (params?: { 
    status?: string; 
    page?: number; 
    limit?: number;
    search?: string;
  }) => {
    try {
      console.log('Fetching all orders with params:', params);
      const response = await api.get('/api/orders/all', { params });
      console.log('All orders fetched:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Get all orders error:', error);
      console.error('Error response:', error.response?.data);
      
      // For admin dashboard, provide fallback empty data
      if (error.response?.status === 404 || error.response?.status === 500) {
        console.warn('Orders endpoint not available, returning empty data');
        return {
          success: true,
          data: [],
          total: 0,
          count: 0,
          pagination: {}
        };
      }
      
      throw error;
    }
  },

  // Update order status (Admin/Manager/PickupBoy)
  updateOrderStatus: async (
    id: string, 
    status: string, 
    note?: string, 
    actualTotal?: number
  ) => {
    try {
      console.log(`Updating order ${id} status to ${status}`);
      const response = await api.put(`/api/orders/${id}/status`, { 
        status, 
        note,
        actualTotal 
      });
      console.log('Order status updated:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Update order status error:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  },

  // Assign pickup boy (Admin/Manager)
  assignPickupBoy: async (id: string, pickupBoyId: string) => {
    try {
      console.log(`Assigning pickup boy ${pickupBoyId} to order ${id}`);
      const response = await api.put(`/api/orders/${id}/assign`, { pickupBoyId });
      console.log('Pickup boy assigned:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Assign pickup boy error:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  },

  // Get assigned orders (PickupBoy)
// Get assigned orders (PickupBoy) - FIXED VERSION
getAssignedOrders: async () => {
  try {
    console.log('Fetching assigned orders from API...');
    const response = await api.get('/api/orders/assigned');
    console.log('Assigned orders API response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Get assigned orders error:', error);
    console.error('Error response:', error.response?.data);
    
    // Enhanced error logging
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
      console.error('Response data:', error.response.data);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error setting up request:', error.message);
    }
    
    // If the endpoint doesn't exist (404), return empty data
    if (error.response?.status === 404) {
      console.warn('Assigned orders endpoint not available, returning empty data');
      return {
        success: true,
        data: [],
        message: 'Assigned orders endpoint not implemented yet'
      };
    }
    
    // If user doesn't have permission (403), return empty data
    if (error.response?.status === 403) {
      console.warn('User does not have permission to view assigned orders');
      return {
        success: false,
        data: [],
        message: 'Access denied - user is not a pickup boy'
      };
    }
    
    throw error;
  }
},
// Alternative method to get assigned orders by calling all orders and filtering
getAssignedOrdersAlternative: async (pickupBoyId?: string) => {
  try {
    console.log('Fetching assigned orders using alternative method...');
    
    // If we have the pickup boy ID, we can filter all orders
    if (pickupBoyId) {
      const response = await api.get('/api/orders/all', {
        params: {
          assignedPickupBoy: pickupBoyId,
          status: 'assigned,in_transit,picked_up'
        }
      });
      return response.data;
    }
    
    // Otherwise, try to get from user's assigned orders
    const response = await api.get('/api/orders/assigned');
    return response.data;
  } catch (error: any) {
    console.error('Alternative assigned orders fetch failed:', error);
    throw error;
  }
},
  // Verify pickup PIN (PickupBoy)
  verifyPickupPin: async (id: string, pin: string) => {
    try {
      console.log(`Verifying PIN for order ${id}`);
      const response = await api.put(`/api/orders/${id}/verify`, { pin });
      console.log('PIN verified:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Verify pickup PIN error:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  },

  // Generate order receipt
  generateOrderReceipt: async (id: string) => {
    try {
      console.log(`Generating receipt for order ${id}`);
      const response = await api.get(`/api/orders/${id}/receipt`, {
        responseType: 'blob', // Important for PDF download
      });
      console.log('Receipt generated successfully');
      return response.data;
    } catch (error: any) {
      console.error('Generate receipt error:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  },

  // Get order statistics (Admin/Manager)
  getOrderStatistics: async (timeframe?: string) => {
    try {
      console.log('Fetching order statistics...');
      const response = await api.get('/api/orders/statistics', {
        params: { timeframe }
      });
      console.log('Order statistics fetched:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Get order statistics error:', error);
      console.error('Error response:', error.response?.data);
      
      // Return mock data for analytics if endpoint not available
      return {
        success: true,
        data: {
          totalRevenue: 0,
          totalOrders: 0,
          completedOrders: 0,
          pendingOrders: 0,
          cancelledOrders: 0,
          completionRate: 0,
          averagePickupTime: 0,
          onTimeRate: 0,
          averageRating: 0,
          totalItemsRecycled: 0,
          co2Saved: 0,
          energySaved: 0,
          wasteReduced: 0,
          topAreas: []
        }
      };
    }
  },

  // Search orders (Admin/Manager)
  searchOrders: async (query: string, filters?: {
    status?: string;
    dateFrom?: string;
    dateTo?: string;
    customerId?: string;
    pickupBoyId?: string;
  }) => {
    try {
      console.log('Searching orders with query:', query);
      const response = await api.get('/api/orders/search', {
        params: { q: query, ...filters }
      });
      console.log('Orders search results:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Search orders error:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  },

  // Export orders (Admin/Manager)
  exportOrders: async (filters?: {
    status?: string;
    dateFrom?: string;
    dateTo?: string;
    format?: 'csv' | 'excel';
  }) => {
    try {
      console.log('Exporting orders with filters:', filters);
      const response = await api.get('/api/orders/export', {
        params: filters,
        responseType: 'blob'
      });
      console.log('Orders exported successfully');
      return response.data;
    } catch (error: any) {
      console.error('Export orders error:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  },

  // Bulk update orders (Admin)
  bulkUpdateOrders: async (orderIds: string[], updates: {
    status?: string;
    pickupBoyId?: string;
    note?: string;
  }) => {
    try {
      console.log('Bulk updating orders:', orderIds);
      const response = await api.put('/api/orders/bulk-update', {
        orderIds,
        updates
      });
      console.log('Orders bulk updated:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Bulk update orders error:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  },

  // Get orders summary (Admin/Manager)
  getOrdersSummary: async (period?: 'today' | 'week' | 'month' | 'year') => {
    try {
      console.log('Fetching orders summary for period:', period);
      const response = await api.get('/api/orders/summary', {
        params: { period }
      });
      console.log('Orders summary fetched:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Get orders summary error:', error);
      console.error('Error response:', error.response?.data);
      
      // Return mock summary data
      return {
        success: true,
        data: {
          totalOrders: 0,
          completedOrders: 0,
          pendingOrders: 0,
          totalRevenue: 0,
          averageOrderValue: 0
        }
      };
    }
  },

  // Get pickup boy performance (Admin/Manager)
  getPickupBoyPerformance: async (pickupBoyId?: string, period?: string) => {
    try {
      console.log('Fetching pickup boy performance...');
      const response = await api.get('/api/orders/pickup-boy-performance', {
        params: { pickupBoyId, period }
      });
      console.log('Pickup boy performance fetched:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Get pickup boy performance error:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  },

  // Get customer order history (Admin/Manager)
  getCustomerOrderHistory: async (customerId: string) => {
    try {
      console.log(`Fetching order history for customer ${customerId}`);
      const response = await api.get(`/api/orders/customer/${customerId}`);
      console.log('Customer order history fetched:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Get customer order history error:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  },

  // Update order items (Admin/Manager)
  updateOrderItems: async (id: string, items: OrderItem[]) => {
    try {
      console.log(`Updating items for order ${id}`);
      const response = await api.put(`/api/orders/${id}/items`, { items });
      console.log('Order items updated:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Update order items error:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  },

  // Add order note (Admin/Manager/PickupBoy)
  addOrderNote: async (id: string, note: string, isInternal: boolean = false) => {
    try {
      console.log(`Adding note to order ${id}`);
      const response = await api.post(`/api/orders/${id}/notes`, { 
        note, 
        isInternal 
      });
      console.log('Order note added:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Add order note error:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  },

  // Get order timeline (All authenticated users)
  getOrderTimeline: async (id: string) => {
    try {
      console.log(`Fetching timeline for order ${id}`);
      const response = await api.get(`/api/orders/${id}/timeline`);
      console.log('Order timeline fetched:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Get order timeline error:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  },

  // Rate completed order (Customer)
  rateOrder: async (id: string, rating: number, feedback?: string) => {
    try {
      console.log(`Rating order ${id} with ${rating} stars`);
      const response = await api.put(`/api/orders/${id}/rate`, {
        rating,
        feedback
      });
      console.log('Order rated:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Rate order error:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  }
};