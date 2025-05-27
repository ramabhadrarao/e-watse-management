// src/services/api.ts
// Main API service configuration and base setup

import axios from 'axios';
import { API_URL } from '../config';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Don't add Authorization header since we're using cookies
api.interceptors.request.use(
  (config) => {
    // Remove any Authorization header to rely on cookies
    delete config.headers.Authorization;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Don't redirect on 401 automatically, let components handle it
    if (error.response?.status === 401) {
      console.log('Unauthorized request - user not logged in');
    }
    return Promise.reject(error);
  }
);

export default api;