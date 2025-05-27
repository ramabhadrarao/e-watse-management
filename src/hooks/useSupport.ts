// src/hooks/useSupport.ts
// Updated Support hooks - All connected to real backend API endpoints
// Removed all mock data and implemented proper error handling

import { useQuery, useMutation, useQueryClient } from 'react-query';
import { supportService, SupportTicket, CreateTicketData, AddMessageData } from '../services/supportService';

// Enhanced options interface for queries
interface QueryOptions {
  onError?: (error: any) => void;
  onSuccess?: (data: any) => void;
  enabled?: boolean;
}

// Get user support tickets hook (Customer)
export const useUserSupportTickets = (params?: { 
  status?: string; 
  page?: number; 
  limit?: number; 
}, options?: QueryOptions) => {
  return useQuery(
    ['userSupportTickets', params],
    () => supportService.getUserSupportTickets(params),
    {
      keepPreviousData: true,
      staleTime: 30000, // 30 seconds
      refetchInterval: 60000, // Refetch every minute for message updates
      onError: options?.onError,
      onSuccess: options?.onSuccess,
      enabled: options?.enabled,
      retry: (failureCount, error: any) => {
        // Don't retry if it's a 404 or 403 error
        if (error?.response?.status === 404 || error?.response?.status === 403) {
          return false;
        }
        return failureCount < 3;
      }
    }
  );
};

// Get all support tickets hook (Admin/Manager)
export const useAllSupportTickets = (params?: { 
  status?: string; 
  priority?: string; 
  category?: string;
  page?: number; 
  limit?: number; 
}, options?: QueryOptions) => {
  return useQuery(
    ['allSupportTickets', params],
    () => supportService.getAllSupportTickets(params),
    {
      keepPreviousData: true,
      staleTime: 10000, // 10 seconds for admin data
      refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
      onError: options?.onError,
      onSuccess: options?.onSuccess,
      enabled: options?.enabled,
      retry: (failureCount, error: any) => {
        // Don't retry if it's a 404 or 403 error
        if (error?.response?.status === 404 || error?.response?.status === 403) {
          return false;
        }
        return failureCount < 3;
      }
    }
  );
};

// Get single support ticket hook
export const useSupportTicket = (id: string, options?: QueryOptions) => {
  return useQuery(
    ['supportTicket', id],
    () => supportService.getSupportTicket(id),
    {
      enabled: !!id && (options?.enabled !== false),
      staleTime: 30000,
      refetchInterval: 15000, // Refetch every 15 seconds for message updates
      onError: options?.onError,
      onSuccess: options?.onSuccess,
      retry: (failureCount, error: any) => {
        // Don't retry if it's a 404 error
        if (error?.response?.status === 404) {
          return false;
        }
        return failureCount < 3;
      }
    }
  );
};

// Create support ticket hook
export const useCreateSupportTicket = () => {
  const queryClient = useQueryClient();
  
  return useMutation(supportService.createSupportTicket, {
    onSuccess: (data) => {
      queryClient.invalidateQueries('userSupportTickets');
      queryClient.invalidateQueries('allSupportTickets');
      queryClient.invalidateQueries('supportStats');
      console.log('Support ticket created successfully:', data);
    },
    onError: (error: any) => {
      console.error('Failed to create support ticket:', error);
      console.error('Error details:', error.response?.data);
    }
  });
};

// Add message to ticket hook
export const useAddTicketMessage = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    ({ id, data }: { id: string; data: AddMessageData }) =>
      supportService.addTicketMessage(id, data),
    {
      onSuccess: (_, { id }) => {
        queryClient.invalidateQueries(['supportTicket', id]);
        queryClient.invalidateQueries('userSupportTickets');
        queryClient.invalidateQueries('allSupportTickets');
      },
      onError: (error: any) => {
        console.error('Failed to add ticket message:', error);
        console.error('Error details:', error.response?.data);
      }
    }
  );
};

// Update ticket status hook (Admin/Manager)
export const useUpdateTicketStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    ({ id, status, resolutionNote }: { 
      id: string; 
      status: string; 
      resolutionNote?: string;
    }) =>
      supportService.updateTicketStatus(id, status, resolutionNote),
    {
      onSuccess: (_, { id }) => {
        queryClient.invalidateQueries(['supportTicket', id]);
        queryClient.invalidateQueries('userSupportTickets');
        queryClient.invalidateQueries('allSupportTickets');
        queryClient.invalidateQueries('supportStats');
      },
      onError: (error: any) => {
        console.error('Failed to update ticket status:', error);
        console.error('Error details:', error.response?.data);
      }
    }
  );
};

// Assign support ticket hook (Admin/Manager)
export const useAssignSupportTicket = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    ({ id, assignedTo }: { id: string; assignedTo: string }) =>
      supportService.assignSupportTicket(id, assignedTo),
    {
      onSuccess: (_, { id }) => {
        queryClient.invalidateQueries(['supportTicket', id]);
        queryClient.invalidateQueries('allSupportTickets');
      },
      onError: (error: any) => {
        console.error('Failed to assign support ticket:', error);
        console.error('Error details:', error.response?.data);
      }
    }
  );
};

// Rate support ticket hook (Customer)
export const useRateSupportTicket = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    ({ id, rating, feedback }: { 
      id: string; 
      rating: number; 
      feedback?: string;
    }) =>
      supportService.rateSupportTicket(id, rating, feedback),
    {
      onSuccess: (_, { id }) => {
        queryClient.invalidateQueries(['supportTicket', id]);
        queryClient.invalidateQueries('userSupportTickets');
      },
      onError: (error: any) => {
        console.error('Failed to rate support ticket:', error);
        console.error('Error details:', error.response?.data);
      }
    }
  );
};

// Get support statistics hook (Admin/Manager)
export const useSupportStats = (timeframe?: string, options?: QueryOptions) => {
  return useQuery(
    ['supportStats', timeframe],
    () => supportService.getSupportStats(timeframe),
    {
      staleTime: 60000, // 1 minute
      onError: options?.onError,
      onSuccess: options?.onSuccess,
      enabled: options?.enabled,
      retry: (failureCount, error: any) => {
        // Don't retry if it's a 403 error (permission denied)
        if (error?.response?.status === 403) {
          return false;
        }
        return failureCount < 2;
      }
    }
  );
};

// Search support tickets hook (Admin/Manager)
export const useSearchSupportTickets = (query: string, filters?: {
  status?: string;
  priority?: string;
  category?: string;
  dateFrom?: string;
  dateTo?: string;
}, options?: QueryOptions) => {
  return useQuery(
    ['searchSupportTickets', query, filters],
    () => supportService.searchSupportTickets(query, filters),
    {
      enabled: !!query && query.length >= 2,
      staleTime: 30000,
      onError: options?.onError,
      onSuccess: options?.onSuccess,
    }
  );
};

// Bulk update tickets hook (Admin)
export const useBulkUpdateTickets = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    ({ ticketIds, updates }: { 
      ticketIds: string[]; 
      updates: { status?: string; assignedTo?: string; priority?: string }
    }) =>
      supportService.bulkUpdateTickets(ticketIds, updates),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('allSupportTickets');
        queryClient.invalidateQueries('supportStats');
      },
      onError: (error: any) => {
        console.error('Failed to bulk update tickets:', error);
        console.error('Error details:', error.response?.data);
      }
    }
  );
};

// Get ticket metrics hook (Admin/Manager)
export const useTicketMetrics = (period?: string, options?: QueryOptions) => {
  return useQuery(
    ['ticketMetrics', period],
    () => supportService.getTicketMetrics(period),
    {
      staleTime: 300000, // 5 minutes
      onError: options?.onError,
      onSuccess: options?.onSuccess,
      enabled: options?.enabled,
    }
  );
};

// Close ticket hook (Admin/Manager)
export const useCloseTicket = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    ({ id, resolutionNote }: { id: string; resolutionNote?: string }) =>
      supportService.closeTicket(id, resolutionNote),
    {
      onSuccess: (_, { id }) => {
        queryClient.invalidateQueries(['supportTicket', id]);
        queryClient.invalidateQueries('allSupportTickets');
        queryClient.invalidateQueries('supportStats');
      },
      onError: (error: any) => {
        console.error('Failed to close ticket:', error);
        console.error('Error details:', error.response?.data);
      }
    }
  );
};

// Reopen ticket hook (Admin/Manager)
export const useReopenTicket = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    ({ id, reason }: { id: string; reason?: string }) =>
      supportService.reopenTicket(id, reason),
    {
      onSuccess: (_, { id }) => {
        queryClient.invalidateQueries(['supportTicket', id]);
        queryClient.invalidateQueries('allSupportTickets');
        queryClient.invalidateQueries('supportStats');
      },
      onError: (error: any) => {
        console.error('Failed to reopen ticket:', error);
        console.error('Error details:', error.response?.data);
      }
    }
  );
};

// Get ticket timeline hook
export const useTicketTimeline = (id: string, options?: QueryOptions) => {
  return useQuery(
    ['ticketTimeline', id],
    () => supportService.getTicketTimeline(id),
    {
      enabled: !!id && (options?.enabled !== false),
      staleTime: 60000, // 1 minute
      onError: options?.onError,
      onSuccess: options?.onSuccess,
    }
  );
};

// Upload ticket attachment hook
export const useUploadTicketAttachment = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    ({ id, file }: { id: string; file: File }) =>
      supportService.uploadTicketAttachment(id, file),
    {
      onSuccess: (_, { id }) => {
        queryClient.invalidateQueries(['supportTicket', id]);
      },
      onError: (error: any) => {
        console.error('Failed to upload attachment:', error);
        console.error('Error details:', error.response?.data);
      }
    }
  );
};

// Delete ticket attachment hook
export const useDeleteTicketAttachment = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    ({ ticketId, attachmentId }: { ticketId: string; attachmentId: string }) =>
      supportService.deleteTicketAttachment(ticketId, attachmentId),
    {
      onSuccess: (_, { ticketId }) => {
        queryClient.invalidateQueries(['supportTicket', ticketId]);
      },
      onError: (error: any) => {
        console.error('Failed to delete attachment:', error);
        console.error('Error details:', error.response?.data);
      }
    }
  );
};

// Add internal note hook (Admin/Manager)
export const useAddInternalNote = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    ({ id, note }: { id: string; note: string }) =>
      supportService.addInternalNote(id, note),
    {
      onSuccess: (_, { id }) => {
        queryClient.invalidateQueries(['supportTicket', id]);
      },
      onError: (error: any) => {
        console.error('Failed to add internal note:', error);
        console.error('Error details:', error.response?.data);
      }
    }
  );
};

// Update ticket priority hook (Admin/Manager)
export const useUpdateTicketPriority = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    ({ id, priority }: { id: string; priority: 'low' | 'medium' | 'high' | 'urgent' }) =>
      supportService.updateTicketPriority(id, priority),
    {
      onSuccess: (_, { id }) => {
        queryClient.invalidateQueries(['supportTicket', id]);
        queryClient.invalidateQueries('allSupportTickets');
      },
      onError: (error: any) => {
        console.error('Failed to update ticket priority:', error);
        console.error('Error details:', error.response?.data);
      }
    }
  );
};

// Get tickets by customer hook (Admin/Manager)
export const useTicketsByCustomer = (customerId: string, options?: QueryOptions) => {
  return useQuery(
    ['ticketsByCustomer', customerId],
    () => supportService.getTicketsByCustomer(customerId),
    {
      enabled: !!customerId && (options?.enabled !== false),
      staleTime: 60000, // 1 minute
      onError: options?.onError,
      onSuccess: options?.onSuccess,
    }
  );
};

// Export support tickets hook (Admin/Manager)
export const useExportSupportTickets = () => {
  return useMutation(
    (filters?: {
      status?: string;
      priority?: string;
      category?: string;
      dateFrom?: string;
      dateTo?: string;
      format?: 'csv' | 'excel';
    }) => supportService.exportSupportTickets(filters),
    {
      onSuccess: (blob, variables) => {
        // Create download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `support-tickets-export.${variables?.format || 'csv'}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      },
      onError: (error: any) => {
        console.error('Failed to export support tickets:', error);
        console.error('Error details:', error.response?.data);
      }
    }
  );
};

// Combined support dashboard data hook for admin
export const useSupportDashboardData = (timeframe?: string) => {
  const ticketsQuery = useAllSupportTickets({ page: 1, limit: 10 });
  const statsQuery = useSupportStats(timeframe);
  const metricsQuery = useTicketMetrics(timeframe);
  
  return {
    tickets: ticketsQuery.data?.data || [],
    stats: statsQuery.data?.data,
    metrics: metricsQuery.data?.data,
    isLoading: ticketsQuery.isLoading || statsQuery.isLoading || metricsQuery.isLoading,
    error: ticketsQuery.error || statsQuery.error || metricsQuery.error,
    refetch: () => {
      ticketsQuery.refetch();
      statsQuery.refetch();
      metricsQuery.refetch();
    }
  };
};