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
