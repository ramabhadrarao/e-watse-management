import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';

// Configure axios defaults
axios.defaults.baseURL = API_URL;
axios.defaults.withCredentials = true;

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  phone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    landmark?: string;
  };
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  loading: true,
  error: null,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  clearError: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load user on initial render
  useEffect(() => {
    const loadUser = async () => {
      try {
        // Try to get current user
        const res = await axios.get('/api/auth/me');
        
        if (res.data.success) {
          setIsAuthenticated(true);
          setUser(res.data.data);
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (err: any) {
        // If error is 401, it's just not authenticated
        if (err.response?.status === 401) {
          setIsAuthenticated(false);
          setUser(null);
        } else {
          console.error('Auth check error:', err);
        }
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // Login user
  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await axios.post('/api/auth/login', { 
        email, 
        password 
      });

      if (res.data.success) {
        setIsAuthenticated(true);
        setUser(res.data.data);
        setError(null);
      } else {
        throw new Error(res.data.error || 'Login failed');
      }
    } catch (err: any) {
      setIsAuthenticated(false);
      setUser(null);
      const errorMessage = err.response?.data?.error || err.message || 'Login failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Register user
  const register = async (userData: any) => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await axios.post('/api/auth/register', userData);

      if (res.data.success) {
        setIsAuthenticated(true);
        setUser(res.data.data);
        setError(null);
      } else {
        throw new Error(res.data.error || 'Registration failed');
      }
    } catch (err: any) {
      setIsAuthenticated(false);
      setUser(null);
      const errorMessage = err.response?.data?.error || err.message || 'Registration failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = async () => {
    try {
      await axios.get('/api/auth/logout');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setIsAuthenticated(false);
      setUser(null);
      setError(null);
    }
  };

  // Clear error
  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        loading,
        error,
        login,
        register,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;