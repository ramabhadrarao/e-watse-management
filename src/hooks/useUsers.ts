// src/hooks/useUsers.ts
// Custom hooks for user management - Real backend API integration
// Used by admin pages for user CRUD operations

import { useQuery, useMutation, useQueryClient } from 'react-query';
import { userService, User, CreateUserData, UpdateUserData } from '../services/userService';

// Enhanced options interface for queries
interface QueryOptions {
  onError?: (error: any) => void;
  onSuccess?: (data: any) => void;
  enabled?: boolean;
}

// Get all users hook (Admin/Manager)
export const useUsers = (params?: { 
  role?: string; 
  page?: number; 
  limit?: number;
  search?: string;
  status?: string;
}, options?: QueryOptions) => {
  return useQuery(
    ['users', params],
    () => userService.getUsers(params),
    {
      keepPreviousData: true,
      staleTime: 30000, // 30 seconds
      onError: options?.onError,
      onSuccess: options?.onSuccess,
      enabled: options?.enabled
    }
  );
};

// Get single user hook
export const useUser = (id: string, options?: QueryOptions) => {
  return useQuery(
    ['user', id],
    () => userService.getUser(id),
    {
      enabled: !!id && (options?.enabled !== false),
      staleTime: 30000,
      onError: options?.onError,
      onSuccess: options?.onSuccess,
    }
  );
};

// Create user hook (Admin)
export const useCreateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation(userService.createUser, {
    onSuccess: () => {
      queryClient.invalidateQueries('users');
      queryClient.invalidateQueries('userStats');
    },
    onError: (error) => {
      console.error('Failed to create user:', error);
    }
  });
};

// Update user hook (Admin/Manager)
export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    ({ id, data }: { id: string; data: UpdateUserData }) =>
      userService.updateUser(id, data),
    {
      onSuccess: (_, { id }) => {
        queryClient.invalidateQueries('users');
        queryClient.invalidateQueries(['user', id]);
        queryClient.invalidateQueries('userStats');
      },
      onError: (error) => {
        console.error('Failed to update user:', error);
      }
    }
  );
};

// Delete user hook (Admin)
export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation(userService.deleteUser, {
    onSuccess: () => {
      queryClient.invalidateQueries('users');
      queryClient.invalidateQueries('userStats');
    },
    onError: (error) => {
      console.error('Failed to delete user:', error);
    }
  });
};

// Update user status hook (Admin/Manager)
export const useUpdateUserStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    ({ id, isActive }: { id: string; isActive: boolean }) =>
      userService.updateUserStatus(id, isActive),
    {
      onSuccess: (_, { id }) => {
        queryClient.invalidateQueries('users');
        queryClient.invalidateQueries(['user', id]);
        queryClient.invalidateQueries('userStats');
      },
      onError: (error) => {
        console.error('Failed to update user status:', error);
      }
    }
  );
};

// Get user statistics hook (Admin/Manager)
export const useUserStats = (options?: QueryOptions) => {
  return useQuery(
    'userStats',
    userService.getUserStats,
    {
      staleTime: 60000, // 1 minute
      onError: options?.onError,
      onSuccess: options?.onSuccess,
      enabled: options?.enabled
    }
  );
};

// Get pickup boys hook (Admin/Manager)
export const usePickupBoys = (params?: { pincode?: string }, options?: QueryOptions) => {
  return useQuery(
    ['pickupBoys', params],
    () => userService.getPickupBoys(params),
    {
      staleTime: 30000,
      onError: options?.onError,
      onSuccess: options?.onSuccess,
      enabled: options?.enabled
    }
  );
};

// Reset user password hook (Admin)
export const useResetUserPassword = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    ({ id, newPassword }: { id: string; newPassword: string }) =>
      userService.resetUserPassword(id, newPassword),
    {
      onSuccess: (_, { id }) => {
        queryClient.invalidateQueries(['user', id]);
      },
      onError: (error) => {
        console.error('Failed to reset user password:', error);
      }
    }
  );
};

// Send notification to user hook (Admin/Manager)
export const useNotifyUser = () => {
  return useMutation(
    ({ id, subject, message }: { id: string; subject: string; message: string }) =>
      userService.notifyUser(id, subject, message),
    {
      onError: (error) => {
        console.error('Failed to send notification:', error);
      }
    }
  );
};

// Bulk update users hook (Admin)
export const useBulkUpdateUsers = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    ({ userIds, updates }: { 
      userIds: string[]; 
      updates: { isActive?: boolean; role?: string } 
    }) =>
      Promise.all(
        userIds.map(id => 
          userService.updateUser(id, updates)
        )
      ),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('users');
        queryClient.invalidateQueries('userStats');
      },
    }
  );
};