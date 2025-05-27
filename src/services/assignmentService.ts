// src/services/assignmentService.ts
// Assignment Service - Real backend API integration for pickup assignment management
// Based on server/assignment_api_routes.md endpoints

import api from './api';

export interface PendingOrder {
  _id: string;
  orderNumber: string;
  status: string;
  customerId: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  pickupDetails: {
    address: {
      street: string;
      city: string;
      pincode: string;
    };
    preferredDate: string;
    timeSlot: string;
  };
  pricing: {
    estimatedTotal: number;
  };
  items: Array<{
    categoryId: { name: string };
    quantity: number;
  }>;
  createdAt: string;
}

export interface PickupBoyAvailability {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: {
    city: string;
    pincode: string;
  };
  workload: {
    activeOrders: number;
    todayOrders: number;
    weekCompletedOrders: number;
    maxCapacity: number;
    availabilityStatus: 'available' | 'busy' | 'overloaded';
    canTakeNewOrder: boolean;
  };
  performance: {
    weeklyCompletions: number;
    efficiency: 'high' | 'medium' | 'low';
  };
}

export interface PickupBoyPerformance {
  pickupBoy: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  performance: {
    totalAssigned: number;
    totalCompleted: number;
    completionRate: string;
    monthlyCompleted: number;
    weeklyCompleted: number;
    activeOrders: number;
    averageRating: number;
    status: string;
  };
}

export interface AssignmentFilters {
  city?: string;
  timeSlot?: string;
  date?: string;
  pincode?: string;
}

export interface BulkAssignmentData {
  assignments: Array<{
    orderId: string;
    pickupBoyId: string;
  }>;
}

export interface AutoAssignmentParams {
  city?: string;
  pincode?: string;
  maxAssignments?: number;
}

export const assignmentService = {
  // Get orders pending assignment
  getPendingOrders: async (filters?: AssignmentFilters): Promise<{ success: boolean; count: number; data: PendingOrder[] }> => {
    try {
      console.log('Fetching pending orders with filters:', filters);
      const response = await api.get('/api/orders/pending-assignment', { params: filters });
      console.log('Pending orders fetched:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Get pending orders error:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  },

  // Get pickup boys with availability
  getPickupBoyAvailability: async (filters?: { city?: string; pincode?: string }): Promise<{ 
    success: boolean; 
    count: number; 
    data: PickupBoyAvailability[];
    summary: {
      available: number;
      busy: number;
      overloaded: number;
      canTakeOrders: number;
    };
  }> => {
    try {
      console.log('Fetching pickup boy availability with filters:', filters);
      const response = await api.get('/api/users/pickup-boys/availability', { params: filters });
      console.log('Pickup boy availability fetched:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Get pickup boy availability error:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  },

  // Get pickup boy performance details
  getPickupBoyPerformance: async (pickupBoyId: string): Promise<{ success: boolean; data: PickupBoyPerformance }> => {
    try {
      console.log(`Fetching performance for pickup boy ${pickupBoyId}`);
      const response = await api.get(`/api/users/pickup-boys/${pickupBoyId}/performance`);
      console.log('Pickup boy performance fetched:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Get pickup boy performance error:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  },

  // Assign single order to pickup boy
  assignSingleOrder: async (orderId: string, pickupBoyId: string): Promise<{ success: boolean; data: any }> => {
    try {
      console.log(`Assigning order ${orderId} to pickup boy ${pickupBoyId}`);
      const response = await api.put(`/api/orders/${orderId}/assign`, { pickupBoyId });
      console.log('Order assigned successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Assign single order error:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  },

  // Bulk assign multiple orders
  bulkAssignOrders: async (assignments: BulkAssignmentData): Promise<{ 
    success: boolean; 
    data: {
      successful: number;
      failed: number;
      results: Array<{
        orderId: string;
        status: 'success' | 'failed';
        assignedTo?: string;
      }>;
      errors: Array<{
        orderId: string;
        error: string;
      }>;
    };
  }> => {
    try {
      console.log('Bulk assigning orders:', assignments);
      const response = await api.post('/api/orders/bulk-assign', assignments);
      console.log('Bulk assignment completed:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Bulk assign orders error:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  },

  // Auto-assign orders based on smart algorithm
  autoAssignOrders: async (params: AutoAssignmentParams): Promise<{ 
    success: boolean; 
    message: string;
    data: {
      assigned: number;
      assignments: Array<{
        orderId: string;
        orderNumber: string;
        pickupBoyId: string;
        pickupBoyName: string;
      }>;
    };
  }> => {
    try {
      console.log('Auto-assigning orders with params:', params);
      const response = await api.post('/api/orders/auto-assign', params);
      console.log('Auto-assignment completed:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Auto assign orders error:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  },

  // Send assignment notification to pickup boy
  sendAssignmentNotification: async (pickupBoyId: string, orderId: string): Promise<{ success: boolean; message: string }> => {
    try {
      console.log(`Sending assignment notification to pickup boy ${pickupBoyId} for order ${orderId}`);
      const response = await api.post(`/api/users/${pickupBoyId}/notify-assignment`, { orderId });
      console.log('Assignment notification sent:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Send assignment notification error:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  },

  // Get assignment statistics for dashboard
  getAssignmentStatistics: async (timeframe?: string): Promise<{ 
    success: boolean; 
    data: {
      pendingAssignments: number;
      todayAssigned: number;
      autoAssignedToday: number;
      averageAssignmentTime: string;
      totalRevenue: number;
      completionRate: number;
    };
  }> => {
    try {
      console.log('Fetching assignment statistics...');
      const response = await api.get('/api/orders/statistics', { params: { timeframe } });
      console.log('Assignment statistics fetched:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Get assignment statistics error:', error);
      console.error('Error response:', error.response?.data);
      
      // Return mock data if API not available yet
      return {
        success: true,
        data: {
          pendingAssignments: 0,
          todayAssigned: 0,
          autoAssignedToday: 0,
          averageAssignmentTime: '0 min',
          totalRevenue: 0,
          completionRate: 0
        }
      };
    }
  },

  // Get assignment analytics
  getAssignmentAnalytics: async (period?: string): Promise<{ 
    success: boolean; 
    data: {
      totalAssignments: number;
      successfulAssignments: number;
      averageResponseTime: number;
      pickupBoyUtilization: number;
      cityWiseDistribution: Array<{
        city: string;
        assignments: number;
        percentage: number;
      }>;
      timeSlotDistribution: Array<{
        timeSlot: string;
        assignments: number;
        percentage: number;
      }>;
    };
  }> => {
    try {
      console.log('Fetching assignment analytics...');
      const response = await api.get('/api/assignments/analytics', { params: { period } });
      console.log('Assignment analytics fetched:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Get assignment analytics error:', error);
      console.error('Error response:', error.response?.data);
      
      // Return mock data if API not available yet
      return {
        success: true,
        data: {
          totalAssignments: 0,
          successfulAssignments: 0,
          averageResponseTime: 0,
          pickupBoyUtilization: 0,
          cityWiseDistribution: [],
          timeSlotDistribution: []
        }
      };
    }
  },

  // Search and filter assignments
  searchAssignments: async (query: string, filters?: {
    status?: string;
    city?: string;
    pickupBoyId?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<{ success: boolean; data: any[] }> => {
    try {
      console.log('Searching assignments with query:', query);
      const response = await api.get('/api/assignments/search', {
        params: { q: query, ...filters }
      });
      console.log('Assignment search results:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Search assignments error:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  },

  // Export assignment data
  exportAssignments: async (filters?: {
    dateFrom?: string;
    dateTo?: string;
    city?: string;
    status?: string;
    format?: 'csv' | 'excel';
  }): Promise<Blob> => {
    try {
      console.log('Exporting assignments with filters:', filters);
      const response = await api.get('/api/assignments/export', {
        params: filters,
        responseType: 'blob'
      });
      console.log('Assignments exported successfully');
      return response.data;
    } catch (error: any) {
      console.error('Export assignments error:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  },

  // Get real-time assignment updates (WebSocket or polling)
  subscribeToAssignmentUpdates: (callback: (update: any) => void) => {
    // Implementation for real-time updates
    // This could be WebSocket connection or polling
    console.log('Subscribing to assignment updates...');
    
    // For now, return a cleanup function
    return () => {
      console.log('Unsubscribing from assignment updates...');
    };
  },

  // Get pickup boy workload details
  getPickupBoyWorkload: async (pickupBoyId: string): Promise<{ 
    success: boolean; 
    data: {
      currentOrders: Array<{
        orderId: string;
        orderNumber: string;
        status: string;
        estimatedCompletionTime: string;
      }>;
      todaySchedule: Array<{
        orderId: string;
        timeSlot: string;
        location: string;
        estimatedDuration: number;
      }>;
      weeklyStats: {
        completed: number;
        pending: number;
        cancelled: number;
      };
    };
  }> => {
    try {
      console.log(`Fetching workload for pickup boy ${pickupBoyId}`);
      const response = await api.get(`/api/users/pickup-boys/${pickupBoyId}/workload`);
      console.log('Pickup boy workload fetched:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Get pickup boy workload error:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  },

  // Update assignment priority
  updateAssignmentPriority: async (orderId: string, priority: 'low' | 'medium' | 'high' | 'urgent'): Promise<{ success: boolean }> => {
    try {
      console.log(`Updating assignment priority for order ${orderId} to ${priority}`);
      const response = await api.put(`/api/orders/${orderId}/priority`, { priority });
      console.log('Assignment priority updated:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Update assignment priority error:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  },

  // Reassign order to different pickup boy
  reassignOrder: async (orderId: string, newPickupBoyId: string, reason?: string): Promise<{ success: boolean; data: any }> => {
    try {
      console.log(`Reassigning order ${orderId} to pickup boy ${newPickupBoyId}`);
      const response = await api.put(`/api/orders/${orderId}/reassign`, { 
        newPickupBoyId, 
        reason 
      });
      console.log('Order reassigned successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Reassign order error:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  }
};