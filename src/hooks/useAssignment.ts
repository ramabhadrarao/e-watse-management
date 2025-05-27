// src/hooks/useAssignment.ts
// Assignment hooks for real backend API integration
// Custom hooks for pickup assignment management with proper error handling

import { useQuery, useMutation, useQueryClient } from 'react-query';
import { 
  assignmentService, 
  AssignmentFilters, 
  BulkAssignmentData, 
  AutoAssignmentParams 
} from '../services/assignmentService';

// Enhanced options interface for queries
interface QueryOptions {
  onError?: (error: any) => void;
  onSuccess?: (data: any) => void;
  enabled?: boolean;
}

// Get pending orders hook
export const usePendingOrders = (filters?: AssignmentFilters, options?: QueryOptions) => {
  return useQuery(
    ['pendingOrders', filters],
    () => assignmentService.getPendingOrders(filters),
    {
      staleTime: 30000, // 30 seconds
      refetchInterval: 60000, // Refetch every minute for real-time updates
      onError: options?.onError,
      onSuccess: options?.onSuccess,
      enabled: options?.enabled
    }
  );
};

// Get pickup boy availability hook
export const usePickupBoyAvailability = (filters?: { city?: string; pincode?: string }, options?: QueryOptions) => {
  return useQuery(
    ['pickupBoyAvailability', filters],
    () => assignmentService.getPickupBoyAvailability(filters),
    {
      staleTime: 30000, // 30 seconds
      refetchInterval: 60000, // Refetch every minute
      onError: options?.onError,
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
      onError: options?.onError,
      onSuccess: options?.onSuccess,
    }
  );
};

// Assign single order hook
export const useAssignSingleOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    ({ orderId, pickupBoyId }: { orderId: string; pickupBoyId: string }) =>
      assignmentService.assignSingleOrder(orderId, pickupBoyId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('pendingOrders');
        queryClient.invalidateQueries('pickupBoyAvailability');
        queryClient.invalidateQueries('assignmentStatistics');
        queryClient.invalidateQueries('allOrders');
      },
      onError: (error) => {
        console.error('Failed to assign order:', error);
      }
    }
  );
};

// Bulk assign orders hook
export const useBulkAssignOrders = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    (assignments: BulkAssignmentData) => assignmentService.bulkAssignOrders(assignments),
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries('pendingOrders');
        queryClient.invalidateQueries('pickupBoyAvailability');
        queryClient.invalidateQueries('assignmentStatistics');
        queryClient.invalidateQueries('allOrders');
        console.log(`Bulk assignment completed: ${data.data.successful} successful, ${data.data.failed} failed`);
      },
      onError: (error) => {
        console.error('Failed to bulk assign orders:', error);
      }
    }
  );
};

// Auto assign orders hook
export const useAutoAssignOrders = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    (params: AutoAssignmentParams) => assignmentService.autoAssignOrders(params),
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries('pendingOrders');
        queryClient.invalidateQueries('pickupBoyAvailability');
        queryClient.invalidateQueries('assignmentStatistics');
        queryClient.invalidateQueries('allOrders');
        console.log(`Auto-assignment completed: ${data.data.assigned} orders assigned`);
      },
      onError: (error) => {
        console.error('Failed to auto-assign orders:', error);
      }
    }
  );
};

// Send assignment notification hook
export const useSendAssignmentNotification = () => {
  return useMutation(
    ({ pickupBoyId, orderId }: { pickupBoyId: string; orderId: string }) =>
      assignmentService.sendAssignmentNotification(pickupBoyId, orderId),
    {
      onError: (error) => {
        console.error('Failed to send assignment notification:', error);
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
      onError: options?.onError,
      onSuccess: options?.onSuccess,
      enabled: options?.enabled
    }
  );
};

// Get assignment analytics hook
export const useAssignmentAnalytics = (period?: string, options?: QueryOptions) => {
  return useQuery(
    ['assignmentAnalytics', period],
    () => assignmentService.getAssignmentAnalytics(period),
    {
      staleTime: 300000, // 5 minutes
      onError: options?.onError,
      onSuccess: options?.onSuccess,
      enabled: options?.enabled
    }
  );
};

// Search assignments hook
export const useSearchAssignments = (query: string, filters?: {
  status?: string;
  city?: string;
  pickupBoyId?: string;
  dateFrom?: string;
  dateTo?: string;
}, options?: QueryOptions) => {
  return useQuery(
    ['searchAssignments', query, filters],
    () => assignmentService.searchAssignments(query, filters),
    {
      enabled: !!query && query.length >= 2,
      staleTime: 30000,
      onError: options?.onError,
      onSuccess: options?.onSuccess,
    }
  );
};

// Export assignments hook
export const useExportAssignments = () => {
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
      },
      onError: (error) => {
        console.error('Failed to export assignments:', error);
      }
    }
  );
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
      onError: options?.onError,
      onSuccess: options?.onSuccess,
    }
  );
};

// Update assignment priority hook
export const useUpdateAssignmentPriority = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    ({ orderId, priority }: { orderId: string; priority: 'low' | 'medium' | 'high' | 'urgent' }) =>
      assignmentService.updateAssignmentPriority(orderId, priority),
    {
      onSuccess: (_, { orderId }) => {
        queryClient.invalidateQueries('pendingOrders');
        queryClient.invalidateQueries(['order', orderId]);
      },
      onError: (error) => {
        console.error('Failed to update assignment priority:', error);
      }
    }
  );
};

// Reassign order hook
export const useReassignOrder = () => {
  const queryClient = useQueryClient();
  
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
      },
      onError: (error) => {
        console.error('Failed to reassign order:', error);
      }
    }
  );
};

// Real-time assignment updates hook
export const useAssignmentUpdates = (callback: (update: any) => void) => {
  const queryClient = useQueryClient();
  
  React.useEffect(() => {
    const unsubscribe = assignmentService.subscribeToAssignmentUpdates((update) => {
      // Handle real-time updates
      callback(update);
      
      // Invalidate relevant queries
      queryClient.invalidateQueries('pendingOrders');
      queryClient.invalidateQueries('pickupBoyAvailability');
      queryClient.invalidateQueries('assignmentStatistics');
    });
    
    return unsubscribe;
  }, [callback, queryClient]);
};

// Combined assignment dashboard data hook
export const useAssignmentDashboardData = (filters?: {
  city?: string;
  timeSlot?: string;
  date?: string;
}) => {
  const pendingOrdersQuery = usePendingOrders(filters);
  const availabilityQuery = usePickupBoyAvailability(filters ? { city: filters.city } : undefined);
  const statisticsQuery = useAssignmentStatistics();
  
  return {
    pendingOrders: pendingOrdersQuery.data?.data || [],
    pickupBoys: availabilityQuery.data?.data || [],
    availabilitySummary: availabilityQuery.data?.summary,
    statistics: statisticsQuery.data?.data,
    isLoading: pendingOrdersQuery.isLoading || availabilityQuery.isLoading || statisticsQuery.isLoading,
    error: pendingOrdersQuery.error || availabilityQuery.error || statisticsQuery.error,
    refetch: () => {
      pendingOrdersQuery.refetch();
      availabilityQuery.refetch();
      statisticsQuery.refetch();
    }
  };
};