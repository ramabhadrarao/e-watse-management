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