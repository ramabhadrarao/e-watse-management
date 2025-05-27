// src/hooks/usePincodes.ts
// Custom hook for managing pincodes

import { useQuery, useMutation, useQueryClient } from 'react-query';
import { pincodeService, Pincode } from '../services/pincodeService';

export const useCheckPincode = (pincode: string) => {
  return useQuery(
    ['checkPincode', pincode],
    () => pincodeService.checkPincode(pincode),
    {
      enabled: !!pincode && pincode.length === 6,
      staleTime: 30 * 60 * 1000, // 30 minutes
    }
  );
};

export const usePincodes = (params?: { 
  page?: number; 
  limit?: number; 
  city?: string; 
  state?: string; 
  serviceable?: boolean; 
}) => {
  return useQuery(
    ['pincodes', params],
    () => pincodeService.getPincodes(params),
    {
      keepPreviousData: true,
    }
  );
};

export const useCreatePincode = () => {
  const queryClient = useQueryClient();
  
  return useMutation(pincodeService.createPincode, {
    onSuccess: () => {
      queryClient.invalidateQueries('pincodes');
    },
  });
};

export const useUpdatePincode = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    ({ id, data }: { id: string; data: Partial<Pincode> }) =>
      pincodeService.updatePincode(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('pincodes');
      },
    }
  );
};

export const useDeletePincode = () => {
  const queryClient = useQueryClient();
  
  return useMutation(pincodeService.deletePincode, {
    onSuccess: () => {
      queryClient.invalidateQueries('pincodes');
    },
  });
};

export const useAssignPickupBoyToPincode = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    ({ id, pickupBoyId }: { id: string; pickupBoyId: string }) =>
      pincodeService.assignPickupBoy(id, pickupBoyId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('pincodes');
      },
    }
  );
};

export const useRemovePickupBoyFromPincode = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    ({ id, pickupBoyId }: { id: string; pickupBoyId: string }) =>
      pincodeService.removePickupBoy(id, pickupBoyId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('pincodes');
      },
    }
  );
};