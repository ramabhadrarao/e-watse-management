// src/hooks/useOrders.ts
// Enhanced order hooks with admin functionality and proper error handling

import { useQuery, useMutation, useQueryClient } from 'react-query';
import { orderService, Order, CreateOrderData } from '../services/orderService';

// Enhanced options interface for queries
interface QueryOptions {
  onError?: (error: any) => void;
  onSuccess?: (data: any) => void;
  enabled?: boolean;
}

// User Orders Hook
export const useUserOrders = (options?: QueryOptions) => {
  return useQuery<{ success: boolean; data: Order[] }>(
    'userOrders', 
    orderService.getUserOrders,
    {
      staleTime: 30000, // 30 seconds
      refetchInterval: 60000, // Refetch every minute
      onError: options?.onError,
      onSuccess: options?.onSuccess,
      enabled: options?.enabled
    }
  );
};

// Single Order Hook
export const useOrder = (id: string, options?: QueryOptions) => {
  return useQuery<{ success: boolean; data: Order }>(
    ['order', id],
    () => orderService.getOrder(id),
    {
      enabled: !!id && (options?.enabled !== false),
      staleTime: 30000,
      onError: options?.onError,
      onSuccess: options?.onSuccess,
    }
  );
};

// Create Order Hook
export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation(orderService.createOrder, {
    onSuccess: (data) => {
      queryClient.invalidateQueries('userOrders');
      queryClient.invalidateQueries('allOrders');
      console.log('Order created successfully:', data);
    },
    onError: (error) => {
      console.error('Failed to create order:', error);
    }
  });
};

// Cancel Order Hook
export const useCancelOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    ({ id, reason }: { id: string; reason?: string }) =>
      orderService.cancelOrder(id, reason),
    {
      onSuccess: (_, { id }) => {
        queryClient.invalidateQueries('userOrders');
        queryClient.invalidateQueries('allOrders');
        queryClient.invalidateQueries(['order', id]);
      },
    }
  );
};

// All Orders Hook (Admin/Manager)
export const useAllOrders = (params?: { 
  status?: string; 
  page?: number; 
  limit?: number;
  search?: string;
}, options?: QueryOptions) => {
  return useQuery(
    ['allOrders', params],
    () => orderService.getAllOrders(params),
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

// Update Order Status Hook
export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    ({ id, status, note, actualTotal }: { 
      id: string; 
      status: string; 
      note?: string;
      actualTotal?: number;
    }) =>
      orderService.updateOrderStatus(id, status, note, actualTotal),
    {
      onSuccess: (_, { id }) => {
        queryClient.invalidateQueries('allOrders');
        queryClient.invalidateQueries('assignedOrders');
        queryClient.invalidateQueries('userOrders');
        queryClient.invalidateQueries(['order', id]);
      },
      onError: (error) => {
        console.error('Failed to update order status:', error);
      }
    }
  );
};

// Assign Pickup Boy Hook
export const useAssignPickupBoy = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    ({ id, pickupBoyId }: { id: string; pickupBoyId: string }) =>
      orderService.assignPickupBoy(id, pickupBoyId),
    {
      onSuccess: (_, { id }) => {
        queryClient.invalidateQueries('allOrders');
        queryClient.invalidateQueries(['order', id]);
      },
      onError: (error) => {
        console.error('Failed to assign pickup boy:', error);
      }
    }
  );
};
// Alternative version that checks if user is pickup boy before making the call
export const useAssignedOrdersWithRoleCheck = () => {
  const { user } = useContext(AuthContext);
  const isPickupBoy = user?.role === 'pickup_boy';
  
  return useQuery(
    'assignedOrders',
    async () => {
      if (!isPickupBoy) {
        console.log('User is not a pickup boy, skipping assigned orders fetch');
        return { success: true, data: [] };
      }
      
      console.log('Fetching assigned orders for pickup boy...');
      const response = await orderService.getAssignedOrders();
      console.log('Assigned orders fetched:', response);
      return response;
    },
    {
      enabled: isPickupBoy, // Only run query if user is pickup boy
      refetchInterval: isPickupBoy ? 30000 : false,
      retry: (failureCount, error: any) => {
        if (error?.response?.status === 404 || error?.response?.status === 403) {
          return false;
        }
        return failureCount < 2;
      },
      onError: (error: any) => {
        console.error('Failed to fetch assigned orders:', error);
      }
    }
  );
};
// Assigned Orders Hook (Pickup Boy)
export const useAssignedOrders = () => {
  return useQuery(
    'assignedOrders', 
    async () => {
      try {
        console.log('Fetching assigned orders for pickup boy...');
        const response = await orderService.getAssignedOrders();
        console.log('Assigned orders response:', response);
        return response;
      } catch (error: any) {
        console.error('Failed to fetch assigned orders:', error);
        console.error('Error details:', error.response?.data);
        
        // If it's a 404 or the endpoint doesn't exist, return empty data instead of throwing
        if (error.response?.status === 404) {
          console.warn('Assigned orders endpoint not found, returning empty data');
          return {
            success: true,
            data: [],
            message: 'No assigned orders endpoint available'
          };
        }
        
        throw error;
      }
    },
    {
      refetchInterval: 30000, // Refetch every 30 seconds for pickup boys
      retry: (failureCount, error: any) => {
        // Don't retry on 404 or 403 errors
        if (error?.response?.status === 404 || error?.response?.status === 403) {
          return false;
        }
        return failureCount < 2;
      },
      onError: (error: any) => {
        console.error('useAssignedOrders error:', error);
      },
      onSuccess: (data) => {
        console.log('useAssignedOrders success:', data);
      }
    }
  );
};
// Verify Pickup PIN Hook
export const useVerifyPickupPin = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    ({ id, pin }: { id: string; pin: string }) =>
      orderService.verifyPickupPin(id, pin),
    {
      onSuccess: (_, { id }) => {
        queryClient.invalidateQueries('assignedOrders');
        queryClient.invalidateQueries(['order', id]);
        queryClient.invalidateQueries('allOrders');
      },
    }
  );
};

// Order Statistics Hook (Admin/Manager)
export const useOrderStatistics = (timeframe?: string) => {
  return useQuery(
    ['orderStatistics', timeframe],
    () => orderService.getOrderStatistics?.(timeframe),
    {
      staleTime: 60000, // 1 minute
      enabled: !!orderService.getOrderStatistics, // Only if the service method exists
    }
  );
};

// Recent Orders Hook
export const useRecentOrders = (limit: number = 5) => {
  return useQuery(
    ['recentOrders', limit],
    () => orderService.getAllOrders({ limit, page: 1 }),
    {
      staleTime: 30000,
      select: (data) => ({
        ...data,
        data: data.data?.slice(0, limit) || []
      })
    }
  );
};

// Orders by Status Hook
export const useOrdersByStatus = (status: string) => {
  return useQuery(
    ['ordersByStatus', status],
    () => orderService.getAllOrders({ status }),
    {
      enabled: !!status && status !== 'all',
      staleTime: 30000,
    }
  );
};

// Bulk Update Orders Hook (Admin)
export const useBulkUpdateOrders = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    ({ orderIds, updates }: { 
      orderIds: string[]; 
      updates: { status?: string; pickupBoyId?: string; note?: string } 
    }) =>
      Promise.all(
        orderIds.map(id => 
          orderService.updateOrderStatus(id, updates.status || '', updates.note)
        )
      ),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('allOrders');
        queryClient.invalidateQueries('userOrders');
      },
    }
  );
};