// src/hooks/useOrders.ts
// Custom hook for managing orders

import { useQuery, useMutation, useQueryClient } from 'react-query';
import { orderService, Order, CreateOrderData } from '../services/orderService';

export const useUserOrders = () => {
  return useQuery<{ success: boolean; data: Order[] }>('userOrders', orderService.getUserOrders);
};

export const useOrder = (id: string) => {
  return useQuery<{ success: boolean; data: Order }>(
    ['order', id],
    () => orderService.getOrder(id),
    {
      enabled: !!id,
    }
  );
};

export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation(orderService.createOrder, {
    onSuccess: () => {
      queryClient.invalidateQueries('userOrders');
    },
  });
};

export const useCancelOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    ({ id, reason }: { id: string; reason?: string }) =>
      orderService.cancelOrder(id, reason),
    {
      onSuccess: (_, { id }) => {
        queryClient.invalidateQueries('userOrders');
        queryClient.invalidateQueries(['order', id]);
      },
    }
  );
};

export const useAllOrders = (params?: { status?: string; page?: number; limit?: number }) => {
  return useQuery(
    ['allOrders', params],
    () => orderService.getAllOrders(params),
    {
      keepPreviousData: true,
    }
  );
};

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    ({ id, status, note }: { id: string; status: string; note?: string }) =>
      orderService.updateOrderStatus(id, status, note),
    {
      onSuccess: (_, { id }) => {
        queryClient.invalidateQueries('allOrders');
        queryClient.invalidateQueries('assignedOrders');
        queryClient.invalidateQueries(['order', id]);
      },
    }
  );
};

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
    }
  );
};

export const useAssignedOrders = () => {
  return useQuery('assignedOrders', orderService.getAssignedOrders);
};

export const useVerifyPickupPin = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    ({ id, pin }: { id: string; pin: string }) =>
      orderService.verifyPickupPin(id, pin),
    {
      onSuccess: (_, { id }) => {
        queryClient.invalidateQueries('assignedOrders');
        queryClient.invalidateQueries(['order', id]);
      },
    }
  );
};