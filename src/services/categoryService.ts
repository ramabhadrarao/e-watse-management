// src/services/categoryService.ts
// Category related API calls

import api from './api';

export interface Category {
  _id: string;
  name: string;
  description: string;
  icon: string;
  basePrice: number;
  unit: string;
  conditionMultipliers: {
    excellent: number;
    good: number;
    fair: number;
    poor: number;
    broken: number;
  };
  subcategories: Array<{
    name: string;
    priceModifier: number;
  }>;
  isActive: boolean;
  sortOrder: number;
}

export const categoryService = {
  // Get all categories
  getCategories: async () => {
    const response = await api.get('/api/categories');
    return response.data;
  },

  // Get category by ID
  getCategory: async (id: string) => {
    const response = await api.get(`/api/categories/${id}`);
    return response.data;
  },

  // Create category (Admin only)
  createCategory: async (data: Partial<Category>) => {
    const response = await api.post('/api/categories', data);
    return response.data;
  },

  // Update category (Admin only)
  updateCategory: async (id: string, data: Partial<Category>) => {
    const response = await api.put(`/api/categories/${id}`, data);
    return response.data;
  },

  // Delete category (Admin only)
  deleteCategory: async (id: string) => {
    const response = await api.delete(`/api/categories/${id}`);
    return response.data;
  },
};