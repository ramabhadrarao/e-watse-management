// src/services/pincodeService.ts
// Pincode related API calls

import api from './api';

export interface Pincode {
  _id: string;
  pincode: string;
  city: string;
  state: string;
  area: string;
  isServiceable: boolean;
  pickupCharges: number;
  minimumOrderValue: number;
  estimatedPickupTime: string;
  assignedPickupBoys: string[];
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export const pincodeService = {
  // Check pincode serviceability
  checkPincode: async (pincode: string) => {
    const response = await api.get(`/api/pincodes/check/${pincode}`);
    return response.data;
  },

  // Get all pincodes (Admin/Manager)
  getPincodes: async (params?: { 
    page?: number; 
    limit?: number; 
    city?: string; 
    state?: string; 
    serviceable?: boolean; 
  }) => {
    const response = await api.get('/api/pincodes', { params });
    return response.data;
  },

  // Create pincode (Admin)
  createPincode: async (data: Partial<Pincode>) => {
    const response = await api.post('/api/pincodes', data);
    return response.data;
  },

  // Update pincode (Admin)
  updatePincode: async (id: string, data: Partial<Pincode>) => {
    const response = await api.put(`/api/pincodes/${id}`, data);
    return response.data;
  },

  // Delete pincode (Admin)
  deletePincode: async (id: string) => {
    const response = await api.delete(`/api/pincodes/${id}`);
    return response.data;
  },

  // Assign pickup boy to pincode (Admin/Manager)
  assignPickupBoy: async (id: string, pickupBoyId: string) => {
    const response = await api.put(`/api/pincodes/${id}/assign`, { pickupBoyId });
    return response.data;
  },

  // Remove pickup boy from pincode (Admin/Manager)
  removePickupBoy: async (id: string, pickupBoyId: string) => {
    const response = await api.delete(`/api/pincodes/${id}/assign/${pickupBoyId}`);
    return response.data;
  },
};