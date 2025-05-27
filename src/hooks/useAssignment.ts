// src/hooks/useAssignment.ts
// Updated Assignment hooks for real backend API integration
// Custom hooks for pickup assignment management with proper error handling and real API calls

import { useQuery, useMutation, useQueryClient } from 'react-query';
import { 
  assignmentService, 
  AssignmentFilters, 
  BulkAssignmentData, 
  AutoAssignmentParams 
} from '../services/assignmentService';
import { useToast } from './useToast';

// Enhanced options interface for queries
interface QueryOptions {
  onError?: (error: any) => void;
  onSuccess?: (data: any) => void;
  enabled?: boolean;
}

// Get pending orders hook with real API integration
export const usePendingOrders = (filters?: AssignmentFilters, options?: QueryOptions) => {
  return useQuery(
    ['pendingOrders', filters],
    () => assignmentService.getPendingOrders(filters),
    {
      staleTime: 30000, // 30 seconds
      refetchInterval: 60000, // Refetch every minute for real-time updates
      retry: (failureCount, error: any) => {
        // Don't retry on 404 or 403 errors
        if (error?.response?.status === 404 || error?.response?.status === 403) {
          return false;
        }
        return failureCount < 3;
      },
      onError: (error: any) => {
        console.error('Failed to fetch pending orders:', error);
        options?.onError?.(error);
      },
      onSuccess: options?.onSuccess,
      enabled: options?.enabled
    }
  );
};

// Get pickup boy availability hook with real API integration
export const usePickupBoyAvailability = (filters?: { city?: string; pincode?: string }, options?: QueryOptions) => {
  return useQuery(
    ['pickupBoyAvailability', filters],
    () => assignmentService.getPickupBoyAvailability(filters),
    {
      staleTime: 30000, // 30 seconds
      refetchInterval: 60000, // Refetch every minute
      retry: (failureCount, error: any) => {
        // Don't retry on 404 or 403 errors
        if (error?.response?.status === 404 || error?.response?.status === 403) {
          return false;
        }
        return failureCount < 3;
      },
      onError: (error: any) => {
        console.error('Failed to fetch pickup boy availability:', error);
        options?.onError?.(error);
      },
      onSuccess: options?.onSuccess,
      enabled: options?.enabled
    }
  );
};

// Get pickup boy performance hook
export const usePickupBoyPerformance = (pickupBoyId: string, options?: QueryOptions) => {
  return useQuery(
    ['pickupBoyPerformance', pickupBoyId],
    () => assignmentService.getPickupBoyPerformance(pickupBoyId),
    {
      enabled: !!pickupBoyId && (options?.enabled !== false),
      staleTime: 300000, // 5 minutes
      retry: (failureCount, error: any) => {
        if (error?.response?.status === 404) {
          return false;
        }
        return failureCount < 2;
      },
      onError: (error: any) => {
        console.error('Failed to fetch pickup boy performance:', error);
        options?.onError?.(error);
      },
      onSuccess: options?.onSuccess,
    }
  );
};

// Assign single order hook with real API integration
export const useAssignSingleOrder = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();
  
  return useMutation(
    ({ orderId, pickupBoyId }: { orderId: string; pickupBoyId: string }) =>
      assignmentService.assignSingleOrder(orderId, pickupBoyId),
    {
      onSuccess: (data, variables) => {
        // Invalidate and refetch relevant queries
        queryClient.invalidateQueries('pendingOrders');
        queryClient.invalidateQueries('pickupBoyAvailability');
        queryClient.invalidateQueries('assignmentStatistics');
        queryClient.invalidateQueries('allOrders');
        
        console.log('Order assigned successfully:', data);
        showSuccess('Order assigned successfully');
      },
      onError: (error: any) => {
        console.error('Failed to assign order:', error);
        showError(error.response?.data?.message || 'Failed to assign order');
      }
    }
  );
};

// Bulk assign orders hook with real API integration
export const useBulkAssignOrders = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();
  
  return useMutation(
    (assignments: BulkAssignmentData) => assignmentService.bulkAssignOrders(assignments),
    {
      onSuccess: (data) => {
        // Invalidate and refetch relevant queries
        queryClient.invalidateQueries('pendingOrders');
        queryClient.invalidateQueries('pickupBoyAvailability');
        queryClient.invalidateQueries('assignmentStatistics');
        queryClient.invalidateQueries('allOrders');
        
        const { successful, failed } = data.data;
        console.log(`Bulk assignment completed: ${successful} successful, ${failed} failed`);
        
        if (successful > 0) {
          showSuccess(`${successful} orders assigned successfully`);
        }
        if (failed > 0) {
          showError(`${failed} orders failed to assign`);
        }
      },
      onError: (error: any) => {
        console.error('Failed to bulk assign orders:', error);
        showError(error.response?.data?.message || 'Failed to bulk assign orders');
      }
    }
  );
};

// Auto assign orders hook with real API integration
export const useAutoAssignOrders = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();
  
  return useMutation(
    (params: AutoAssignmentParams) => assignmentService.autoAssignOrders(params),
    {
      onSuccess: (data) => {
        // Invalidate and refetch relevant queries
        queryClient.invalidateQueries('pendingOrders');
        queryClient.invalidateQueries('pickupBoyAvailability');
        queryClient.invalidateQueries('assignmentStatistics');
        queryClient.invalidateQueries('allOrders');
        
        const assignedCount = data.data.assigned;
        console.log(`Auto-assignment completed: ${assignedCount} orders assigned`);
        showSuccess(`Auto-assigned ${assignedCount} orders successfully`);
      },
      onError: (error: any) => {
        console.error('Failed to auto-assign orders:', error);
        showError(error.response?.data?.message || 'Failed to auto-assign orders');
      }
    }
  );
};

// Send assignment notification hook
export const useSendAssignmentNotification = () => {
  const { showSuccess, showError } = useToast();
  
  return useMutation(
    ({ pickupBoyId, orderId }: { pickupBoyId: string; orderId: string }) =>
      assignmentService.sendAssignmentNotification(pickupBoyId, orderId),
    {
      onSuccess: () => {
        console.log('Assignment notification sent successfully');
        showSuccess('Assignment notification sent successfully');
      },
      onError: (error: any) => {
        console.error('Failed to send assignment notification:', error);
        showError(error.response?.data?.message || 'Failed to send assignment notification');
      }
    }
  );
};

// Get assignment statistics hook
export const useAssignmentStatistics = (timeframe?: string, options?: QueryOptions) => {
  return useQuery(
    ['assignmentStatistics', timeframe],
    () => assignmentService.getAssignmentStatistics(timeframe),
    {
      staleTime: 60000, // 1 minute
      retry: (failureCount, error: any) => {
        if (error?.response?.status === 404) {
          return false;
        }
        return failureCount < 2;
      },
      onError: (error: any) => {
        console.error('Failed to fetch assignment statistics:', error);
        options?.onError?.(error);
      },
      onSuccess: options?.onSuccess,
      enabled: options?.enabled
    }
  );
};

// Export assignments hook
export const useExportAssignments = () => {
  const { showSuccess, showError } = useToast();
  
  return useMutation(
    (filters?: {
      dateFrom?: string;
      dateTo?: string;
      city?: string;
      status?: string;
      format?: 'csv' | 'excel';
    }) => assignmentService.exportAssignments(filters),
    {
      onSuccess: (blob, variables) => {
        // Create download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `assignments-export.${variables?.format || 'csv'}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        console.log('Assignments exported successfully');
        showSuccess('Assignment data exported successfully');
      },
      onError: (error: any) => {
        console.error('Failed to export assignments:', error);
        showError('Failed to export assignment data');
      }
    }
  );
};

// Combined assignment dashboard data hook with error handling
export const useAssignmentDashboardData = (filters?: {
  city?: string;
  timeSlot?: string;
  date?: string;
}) => {
  const pendingOrdersQuery = usePendingOrders(filters);
  const availabilityQuery = usePickupBoyAvailability(filters ? { city: filters.city } : undefined);
  const statisticsQuery = useAssignmentStatistics();
  
  // Handle data with fallbacks
  const pendingOrders = pendingOrdersQuery.data?.data || [];
  const pickupBoys = availabilityQuery.data?.data || [];
  const availabilitySummary = availabilityQuery.data?.summary || {
    available: 0,
    busy: 0,
    overloaded: 0,
    canTakeOrders: 0
  };
  const statistics = statisticsQuery.data?.data || {
    pendingAssignments: 0,
    todayAssigned: 0,
    autoAssignedToday: 0,
    averageAssignmentTime: '0 min'
  };

  // Determine loading state
  const isLoading = pendingOrdersQuery.isLoading || availabilityQuery.isLoading || statisticsQuery.isLoading;
  
  // Determine error state - only if all critical queries fail
  const error = pendingOrdersQuery.error || availabilityQuery.error;

  // Refetch function
  const refetch = () => {
    pendingOrdersQuery.refetch();
    availabilityQuery.refetch();
    statisticsQuery.refetch();
  };

  return {
    pendingOrders,
    pickupBoys,
    availabilitySummary,
    statistics,
    isLoading,
    error,
    refetch
  };
};

// Get pickup boy workload hook
export const usePickupBoyWorkload = (pickupBoyId: string, options?: QueryOptions) => {
  return useQuery(
    ['pickupBoyWorkload', pickupBoyId],
    () => assignmentService.getPickupBoyWorkload(pickupBoyId),
    {
      enabled: !!pickupBoyId && (options?.enabled !== false),
      staleTime: 60000, // 1 minute
      refetchInterval: 120000, // Refetch every 2 minutes
      retry: (failureCount, error: any) => {
        if (error?.response?.status === 404) {
          return false;
        }
        return failureCount < 2;
      },
      onError: (error: any) => {
        console.error('Failed to fetch pickup boy workload:', error);
        options?.onError?.(error);
      },
      onSuccess: options?.onSuccess,
    }
  );
};

// Update assignment priority hook
export const useUpdateAssignmentPriority = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();
  
  return useMutation(
    ({ orderId, priority }: { orderId: string; priority: 'low' | 'medium' | 'high' | 'urgent' }) =>
      assignmentService.updateAssignmentPriority(orderId, priority),
    {
      onSuccess: (_, { orderId }) => {
        queryClient.invalidateQueries('pendingOrders');
        queryClient.invalidateQueries(['order', orderId]);
        
        console.log('Assignment priority updated successfully');
        showSuccess('Assignment priority updated successfully');
      },
      onError: (error: any) => {
        console.error('Failed to update assignment priority:', error);
        showError(error.response?.data?.message || 'Failed to update assignment priority');
      }
    }
  );
};

// Reassign order hook
export const useReassignOrder = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();
  
  return useMutation(
    ({ orderId, newPickupBoyId, reason }: { 
      orderId: string; 
      newPickupBoyId: string; 
      reason?: string; 
    }) =>
      assignmentService.reassignOrder(orderId, newPickupBoyId, reason),
    {
      onSuccess: (_, { orderId }) => {
        queryClient.invalidateQueries('pendingOrders');
        queryClient.invalidateQueries('pickupBoyAvailability');
        queryClient.invalidateQueries('allOrders');
        queryClient.invalidateQueries(['order', orderId]);
        
        console.log('Order reassigned successfully');
        showSuccess('Order reassigned successfully');
      },
      onError: (error: any) => {
        console.error('Failed to reassign order:', error);
        showError(error.response?.data?.message || 'Failed to reassign order');
      }
    }
  );
};