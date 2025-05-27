// src/services/supportService.ts
// Support ticket API service - Real backend integration

import api from './api';

export interface SupportTicket {
  _id: string;
  ticketNumber: string;
  customerId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  orderId?: {
    _id: string;
    orderNumber: string;
  };
  subject: string;
  description: string;
  category: 'order_issue' | 'payment_issue' | 'pickup_issue' | 'account_issue' | 'general_inquiry' | 'complaint' | 'feedback';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'waiting_customer' | 'resolved' | 'closed';
  assignedTo?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  messages: Array<{
    senderId: {
      _id: string;
      firstName: string;
      lastName: string;
      role: string;
    };
    message: string;
    timestamp: Date;
    isInternal: boolean;
    attachments?: string[];
  }>;
  resolution?: {
    resolvedBy: {
      _id: string;
      firstName: string;
      lastName: string;
    };
    resolutionNote: string;
    resolvedAt: Date;
  };
  customerRating?: {
    rating: number;
    feedback: string;
    ratedAt: Date;
  };
  tags: string[];
  lastActivityAt: Date;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTicketData {
  subject: string;
  description: string;
  category: string;
  priority?: string;
  orderId?: string;
}

export interface AddMessageData {
  message: string;
  isInternal?: boolean;
  attachments?: string[];
}

export const supportService = {
  // Create support ticket
  createSupportTicket: async (data: CreateTicketData) => {
    const response = await api.post('/api/support', data);
    return response.data;
  },

  // Get user support tickets (Customer)
  getUserSupportTickets: async (params?: { 
    status?: string; 
    page?: number; 
    limit?: number; 
  }) => {
    const response = await api.get('/api/support', { params });
    return response.data;
  },

  // Get all support tickets (Admin/Manager)
  getAllSupportTickets: async (params?: { 
    status?: string; 
    priority?: string; 
    category?: string;
    page?: number; 
    limit?: number; 
  }) => {
    const response = await api.get('/api/support/all', { params });
    return response.data;
  },

  // Get single support ticket
  getSupportTicket: async (id: string) => {
    const response = await api.get(`/api/support/${id}`);
    return response.data;
  },

  // Add message to ticket
  addTicketMessage: async (id: string, data: AddMessageData) => {
    const response = await api.post(`/api/support/${id}/messages`, data);
    return response.data;
  },

  // Update ticket status (Admin/Manager)
  updateTicketStatus: async (id: string, status: string, resolutionNote?: string) => {
    const response = await api.put(`/api/support/${id}/status`, { 
      status, 
      resolutionNote 
    });
    return response.data;
  },

  // Assign support ticket (Admin/Manager)
  assignSupportTicket: async (id: string, assignedTo: string) => {
    const response = await api.put(`/api/support/${id}/assign`, { assignedTo });
    return response.data;
  },

  // Rate support ticket (Customer)
  rateSupportTicket: async (id: string, rating: number, feedback?: string) => {
    const response = await api.put(`/api/support/${id}/rate`, { 
      rating, 
      feedback 
    });
    return response.data;
  },

  // Get support statistics (Admin/Manager)
  getSupportStats: async (timeframe?: string) => {
    const response = await api.get('/api/support/stats', {
      params: { timeframe }
    });
    return response.data;
  },

  // Search support tickets (Admin/Manager)
  searchSupportTickets: async (query: string, filters?: {
    status?: string;
    priority?: string;
    category?: string;
    dateFrom?: string;
    dateTo?: string;
  }) => {
    const response = await api.get('/api/support/search', {
      params: { q: query, ...filters }
    });
    return response.data;
  },

  // Export support tickets (Admin/Manager)
  exportSupportTickets: async (filters?: {
    status?: string;
    priority?: string;
    category?: string;
    dateFrom?: string;
    dateTo?: string;
    format?: 'csv' | 'excel';
  }) => {
    const response = await api.get('/api/support/export', {
      params: filters,
      responseType: 'blob'
    });
    return response.data;
  },

  // Bulk update tickets (Admin)
  bulkUpdateTickets: async (ticketIds: string[], updates: {
    status?: string;
    assignedTo?: string;
    priority?: string;
  }) => {
    const response = await api.put('/api/support/bulk-update', {
      ticketIds,
      updates
    });
    return response.data;
  },

  // Get ticket metrics (Admin/Manager)
  getTicketMetrics: async (period?: string) => {
    const response = await api.get('/api/support/metrics', {
      params: { period }
    });
    return response.data;
  },

  // Close ticket (Admin/Manager)
  closeTicket: async (id: string, resolutionNote?: string) => {
    const response = await api.put(`/api/support/${id}/close`, { resolutionNote });
    return response.data;
  },

  // Reopen ticket (Admin/Manager)
  reopenTicket: async (id: string, reason?: string) => {
    const response = await api.put(`/api/support/${id}/reopen`, { reason });
    return response.data;
  }
};