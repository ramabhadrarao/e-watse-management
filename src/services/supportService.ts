// src/services/supportService.ts
// Updated Support Service - Real backend API integration based on complete_api_routes.md
// All mock data removed, connected to actual backend endpoints

import api from './api';

export interface SupportTicket {
  _id: string;
  ticketNumber: string;
  customerId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
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
    _id: string;
    senderId: {
      _id: string;
      firstName: string;
      lastName: string;
      role: string;
    };
    message: string;
    timestamp: string;
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
    resolvedAt: string;
  };
  customerRating?: {
    rating: number;
    feedback: string;
    ratedAt: string;
  };
  tags: string[];
  lastActivityAt: string;
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
  // Create support ticket - POST /api/support
  createSupportTicket: async (data: CreateTicketData): Promise<{ success: boolean; data: SupportTicket }> => {
    try {
      console.log('Creating support ticket:', data);
      const response = await api.post('/api/support', data);
      console.log('Support ticket created successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Create support ticket error:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  },

  // Get user support tickets - GET /api/support
  getUserSupportTickets: async (params?: { 
    status?: string; 
    page?: number; 
    limit?: number; 
  }): Promise<{ 
    success: boolean; 
    data: SupportTicket[];
    count: number;
    total: number;
    pagination?: any;
  }> => {
    try {
      console.log('Fetching user support tickets with params:', params);
      const response = await api.get('/api/support', { params });
      console.log('User support tickets fetched:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Get user support tickets error:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  },

  // Get all support tickets - GET /api/support/all (Admin/Manager)
  getAllSupportTickets: async (params?: { 
    status?: string; 
    priority?: string; 
    category?: string;
    page?: number; 
    limit?: number; 
  }): Promise<{ 
    success: boolean; 
    data: SupportTicket[];
    count: number;
    total: number;
    pagination?: any;
  }> => {
    try {
      console.log('Fetching all support tickets with params:', params);
      const response = await api.get('/api/support/all', { params });
      console.log('All support tickets fetched:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Get all support tickets error:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  },

  // Get single support ticket - GET /api/support/:id
  getSupportTicket: async (id: string): Promise<{ success: boolean; data: SupportTicket }> => {
    try {
      console.log(`Fetching support ticket ${id}`);
      const response = await api.get(`/api/support/${id}`);
      console.log('Support ticket fetched:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Get support ticket error:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  },

  // Add message to ticket - POST /api/support/:id/messages
  addTicketMessage: async (id: string, data: AddMessageData): Promise<{ success: boolean; data: any }> => {
    try {
      console.log(`Adding message to ticket ${id}:`, data);
      const response = await api.post(`/api/support/${id}/messages`, data);
      console.log('Message added to ticket:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Add ticket message error:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  },

  // Update ticket status - PUT /api/support/:id/status (Admin/Manager)
  updateTicketStatus: async (id: string, status: string, resolutionNote?: string): Promise<{ success: boolean; data: SupportTicket }> => {
    try {
      console.log(`Updating ticket ${id} status to ${status}`);
      const response = await api.put(`/api/support/${id}/status`, { 
        status, 
        resolutionNote 
      });
      console.log('Ticket status updated:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Update ticket status error:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  },

  // Assign support ticket - PUT /api/support/:id/assign (Admin/Manager)
  assignSupportTicket: async (id: string, assignedTo: string): Promise<{ success: boolean; data: SupportTicket }> => {
    try {
      console.log(`Assigning ticket ${id} to ${assignedTo}`);
      const response = await api.put(`/api/support/${id}/assign`, { assignedTo });
      console.log('Support ticket assigned:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Assign support ticket error:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  },

  // Rate support ticket - PUT /api/support/:id/rate (Customer)
  rateSupportTicket: async (id: string, rating: number, feedback?: string): Promise<{ success: boolean; data: SupportTicket }> => {
    try {
      console.log(`Rating ticket ${id} with ${rating} stars`);
      const response = await api.put(`/api/support/${id}/rate`, { 
        rating, 
        feedback 
      });
      console.log('Support ticket rated:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Rate support ticket error:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  },

  // Get support statistics - GET /api/support/stats (Admin/Manager)
  getSupportStats: async (timeframe?: string): Promise<{ 
    success: boolean; 
    data: {
      openTickets: number;
      resolvedTickets: number;
      inProgressTickets: number;
      totalTickets: number;
      averageResolutionTime: number;
      customerSatisfactionRating: number;
      priorityBreakdown: {
        urgent: number;
        high: number;
        medium: number;
        low: number;
      };
      categoryBreakdown: {
        order_issue: number;
        payment_issue: number;
        pickup_issue: number;
        account_issue: number;
        general_inquiry: number;
        complaint: number;
        feedback: number;
      };
    };
  }> => {
    try {
      console.log('Fetching support statistics for timeframe:', timeframe);
      const response = await api.get('/api/support/stats', {
        params: { timeframe }
      });
      console.log('Support statistics fetched:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Get support stats error:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  },

  // Search support tickets - GET /api/support/search (Admin/Manager)
  searchSupportTickets: async (query: string, filters?: {
    status?: string;
    priority?: string;
    category?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<{ success: boolean; data: SupportTicket[] }> => {
    try {
      console.log('Searching support tickets with query:', query);
      const response = await api.get('/api/support/search', {
        params: { q: query, ...filters }
      });
      console.log('Support ticket search results:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Search support tickets error:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  },

  // Export support tickets - GET /api/support/export (Admin/Manager)
  exportSupportTickets: async (filters?: {
    status?: string;
    priority?: string;
    category?: string;
    dateFrom?: string;
    dateTo?: string;
    format?: 'csv' | 'excel';
  }): Promise<Blob> => {
    try {
      console.log('Exporting support tickets with filters:', filters);
      const response = await api.get('/api/support/export', {
        params: filters,
        responseType: 'blob'
      });
      console.log('Support tickets exported successfully');
      return response.data;
    } catch (error: any) {
      console.error('Export support tickets error:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  },

  // Bulk update tickets - PUT /api/support/bulk-update (Admin)
  bulkUpdateTickets: async (ticketIds: string[], updates: {
    status?: string;
    assignedTo?: string;
    priority?: string;
  }): Promise<{ 
    success: boolean; 
    data: {
      updated: number;
      failed: number;
      results: Array<{
        ticketId: string;
        status: 'success' | 'failed';
        error?: string;
      }>;
    };
  }> => {
    try {
      console.log('Bulk updating tickets:', ticketIds);
      const response = await api.put('/api/support/bulk-update', {
        ticketIds,
        updates
      });
      console.log('Tickets bulk updated:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Bulk update tickets error:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  },

  // Get ticket metrics - GET /api/support/metrics (Admin/Manager)
  getTicketMetrics: async (period?: string): Promise<{ 
    success: boolean; 
    data: {
      totalTickets: number;
      openTickets: number;
      resolvedTickets: number;
      closedTickets: number;
      averageResolutionTime: number;
      firstResponseTime: number;
      customerSatisfaction: number;
      agentPerformance: Array<{
        agentId: string;
        agentName: string;
        assignedTickets: number;
        resolvedTickets: number;
        averageResolutionTime: number;
        customerRating: number;
      }>;
    };
  }> => {
    try {
      console.log('Fetching ticket metrics for period:', period);
      const response = await api.get('/api/support/metrics', {
        params: { period }
      });
      console.log('Ticket metrics fetched:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Get ticket metrics error:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  },

  // Close ticket - PUT /api/support/:id/close (Admin/Manager)
  closeTicket: async (id: string, resolutionNote?: string): Promise<{ success: boolean; data: SupportTicket }> => {
    try {
      console.log(`Closing ticket ${id}`);
      const response = await api.put(`/api/support/${id}/close`, { resolutionNote });
      console.log('Ticket closed:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Close ticket error:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  },

  // Reopen ticket - PUT /api/support/:id/reopen (Admin/Manager)
  reopenTicket: async (id: string, reason?: string): Promise<{ success: boolean; data: SupportTicket }> => {
    try {
      console.log(`Reopening ticket ${id}`);
      const response = await api.put(`/api/support/${id}/reopen`, { reason });
      console.log('Ticket reopened:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Reopen ticket error:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  },

  // Get ticket history/timeline - GET /api/support/:id/timeline
  getTicketTimeline: async (id: string): Promise<{ 
    success: boolean; 
    data: Array<{
      action: string;
      timestamp: string;
      actor: {
        _id: string;
        firstName: string;
        lastName: string;
        role: string;
      };
      details: any;
      note?: string;
    }>;
  }> => {
    try {
      console.log(`Fetching timeline for ticket ${id}`);
      const response = await api.get(`/api/support/${id}/timeline`);
      console.log('Ticket timeline fetched:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Get ticket timeline error:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  },

  // Upload attachment - POST /api/support/:id/attachments
  uploadTicketAttachment: async (id: string, file: File): Promise<{ 
    success: boolean; 
    data: {
      attachmentId: string;
      filename: string;
      url: string;
    };
  }> => {
    try {
      console.log(`Uploading attachment to ticket ${id}`);
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await api.post(`/api/support/${id}/attachments`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Attachment uploaded:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Upload ticket attachment error:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  },

  // Delete attachment - DELETE /api/support/:id/attachments/:attachmentId
  deleteTicketAttachment: async (ticketId: string, attachmentId: string): Promise<{ success: boolean }> => {
    try {
      console.log(`Deleting attachment ${attachmentId} from ticket ${ticketId}`);
      const response = await api.delete(`/api/support/${ticketId}/attachments/${attachmentId}`);
      console.log('Attachment deleted:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Delete ticket attachment error:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  },

  // Add internal note - POST /api/support/:id/notes (Admin/Manager)
  addInternalNote: async (id: string, note: string): Promise<{ success: boolean; data: any }> => {
    try {
      console.log(`Adding internal note to ticket ${id}`);
      const response = await api.post(`/api/support/${id}/notes`, { note });
      console.log('Internal note added:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Add internal note error:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  },

  // Update ticket priority - PUT /api/support/:id/priority (Admin/Manager)
  updateTicketPriority: async (id: string, priority: 'low' | 'medium' | 'high' | 'urgent'): Promise<{ success: boolean; data: SupportTicket }> => {
    try {
      console.log(`Updating ticket ${id} priority to ${priority}`);
      const response = await api.put(`/api/support/${id}/priority`, { priority });
      console.log('Ticket priority updated:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Update ticket priority error:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  },

  // Get tickets by customer - GET /api/support/customer/:customerId (Admin/Manager)
  getTicketsByCustomer: async (customerId: string): Promise<{ success: boolean; data: SupportTicket[] }> => {
    try {
      console.log(`Fetching tickets for customer ${customerId}`);
      const response = await api.get(`/api/support/customer/${customerId}`);
      console.log('Customer tickets fetched:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Get tickets by customer error:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  }
};