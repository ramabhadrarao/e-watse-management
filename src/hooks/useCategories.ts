// src/hooks/useCategories.ts
// Custom hook for managing categories

import { useQuery, useMutation, useQueryClient } from 'react-query';
import { categoryService, Category } from '../services/categoryService';

export const useCategories = () => {
  return useQuery<{ success: boolean; data: Category[] }>('categories', categoryService.getCategories, {
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCategory = (id: string) => {
  return useQuery<{ success: boolean; data: Category }>(
    ['category', id],
    () => categoryService.getCategory(id),
    {
      enabled: !!id,
    }
  );
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation(categoryService.createCategory, {
    onSuccess: () => {
      queryClient.invalidateQueries('categories');
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    ({ id, data }: { id: string; data: Partial<Category> }) =>
      categoryService.updateCategory(id, data),
    {
      onSuccess: (_, { id }) => {
        queryClient.invalidateQueries('categories');
        queryClient.invalidateQueries(['category', id]);
      },
    }
  );
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation(categoryService.deleteCategory, {
    onSuccess: () => {
      queryClient.invalidateQueries('categories');
    },
  });
};

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

// src/hooks/useAuth.ts
// Custom hook for authentication with API integration

import { useMutation, useQueryClient } from 'react-query';
import { authService, LoginData, RegisterData } from '../services/authService';

export const useLogin = () => {
  return useMutation(authService.login);
};

export const useRegister = () => {
  return useMutation(authService.register);
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation(authService.updateDetails, {
    onSuccess: () => {
      queryClient.invalidateQueries('currentUser');
    },
  });
};

export const useUpdateAddress = () => {
  const queryClient = useQueryClient();
  
  return useMutation(authService.updateAddress, {
    onSuccess: () => {
      queryClient.invalidateQueries('currentUser');
    },
  });
};

export const useUpdatePassword = () => {
  return useMutation(
    ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) =>
      authService.updatePassword(currentPassword, newPassword)
  );
};

// src/hooks/useLocalStorage.ts
// Custom hook for localStorage management

import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue] as const;
}

// src/hooks/useDebounce.ts
// Custom hook for debouncing values

import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// src/hooks/useToast.ts
// Custom hook for toast notifications

import { toast, ToastOptions } from 'react-toastify';

interface UseToastReturn {
  showSuccess: (message: string, options?: ToastOptions) => void;
  showError: (message: string, options?: ToastOptions) => void;
  showInfo: (message: string, options?: ToastOptions) => void;
  showWarning: (message: string, options?: ToastOptions) => void;
}

export const useToast = (): UseToastReturn => {
  const showSuccess = (message: string, options?: ToastOptions) => {
    toast.success(message, options);
  };

  const showError = (message: string, options?: ToastOptions) => {
    toast.error(message, options);
  };

  const showInfo = (message: string, options?: ToastOptions) => {
    toast.info(message, options);
  };

  const showWarning = (message: string, options?: ToastOptions) => {
    toast.warning(message, options);
  };

  return {
    showSuccess,
    showError,
    showInfo,
    showWarning,
  };
};