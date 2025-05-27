// src/hooks/useSupport.ts
// Custom hooks for support ticket management - Real backend API integration
// Used by admin and customer pages for support functionality

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
      onError: options?.onError,
      onSuccess: options?.onSuccess,
      enabled: options?.enabled
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
      enabled: options?.enabled
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
    }
  );
};

// Create support ticket hook
export const useCreateSupportTicket = () => {
  const queryClient = useQueryClient();
  
  return useMutation(supportService.createSupportTicket, {
    onSuccess: () => {
      queryClient.invalidateQueries('userSupportTickets');
      queryClient.invalidateQueries('allSupportTickets');
      queryClient.invalidateQueries('supportStats');
    },
    onError: (error) => {
      console.error('Failed to create support ticket:', error);
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
      onError: (error) => {
        console.error('Failed to add ticket message:', error);
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
      onError: (error) => {
        console.error('Failed to update ticket status:', error);
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
      onError: (error) => {
        console.error('Failed to assign support ticket:', error);
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
      onError: (error) => {
        console.error('Failed to rate support ticket:', error);
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
      enabled: options?.enabled
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
    }
  );
};