import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
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
        const res = await axios.get(`${API_URL}/api/auth/me`, {
          withCredentials: true,
        });

        setIsAuthenticated(true);
        setUser(res.data.data);
        setLoading(false);
      } catch (err) {
        setIsAuthenticated(false);
        setUser(null);
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // Login user
  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const res = await axios.post(
        `${API_URL}/api/auth/login`,
        { email, password },
        { withCredentials: true }
      );

      setIsAuthenticated(true);
      setUser(res.data.data);
      setError(null);
      setLoading(false);
    } catch (err: any) {
      setIsAuthenticated(false);
      setUser(null);
      setError(err.response?.data?.message || 'Login failed');
      setLoading(false);
    }
  };

  // Register user
  const register = async (userData: any) => {
    try {
      setLoading(true);
      const res = await axios.post(
        `${API_URL}/api/auth/register`,
        userData,
        { withCredentials: true }
      );

      setIsAuthenticated(true);
      setUser(res.data.data);
      setError(null);
      setLoading(false);
    } catch (err: any) {
      setIsAuthenticated(false);
      setUser(null);
      setError(err.response?.data?.message || 'Registration failed');
      setLoading(false);
    }
  };

  // Logout user
  const logout = async () => {
    try {
      await axios.get(`${API_URL}/api/auth/logout`, {
        withCredentials: true,
      });

      setIsAuthenticated(false);
      setUser(null);
    } catch (err) {
      console.error('Logout error:', err);
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