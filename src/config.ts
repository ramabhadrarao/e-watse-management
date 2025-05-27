// API URL Configuration
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Color Scheme
export const COLORS = {
  primary: {
    DEFAULT: '#22c55e',
    light: '#86efac',
    dark: '#16a34a',
  },
  secondary: {
    DEFAULT: '#3b82f6',
    light: '#93c5fd',
    dark: '#1d4ed8',
  },
  success: {
    DEFAULT: '#10b981',
    light: '#a7f3d0',
    dark: '#059669',
  },
  warning: {
    DEFAULT: '#f59e0b',
    light: '#fcd34d',
    dark: '#d97706',
  },
  error: {
    DEFAULT: '#ef4444',
    light: '#fca5a5',
    dark: '#dc2626',
  },
  neutral: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  }
};

// Pickup Status Options
export const ORDER_STATUS = [
  { value: 'pending', label: 'Pending', color: '#f59e0b' },
  { value: 'confirmed', label: 'Confirmed', color: '#3b82f6' },
  { value: 'assigned', label: 'Assigned', color: '#8b5cf6' },
  { value: 'in_transit', label: 'In Transit', color: '#a78bfa' },
  { value: 'picked_up', label: 'Picked Up', color: '#10b981' },
  { value: 'processing', label: 'Processing', color: '#6366f1' },
  { value: 'completed', label: 'Completed', color: '#22c55e' },
  { value: 'cancelled', label: 'Cancelled', color: '#ef4444' },
];

// Device Conditions
export const DEVICE_CONDITIONS = [
  { value: 'excellent', label: 'Excellent (Working)', multiplier: 1.0 },
  { value: 'good', label: 'Good (Minor issues)', multiplier: 0.8 },
  { value: 'fair', label: 'Fair (Major issues)', multiplier: 0.6 },
  { value: 'poor', label: 'Poor (Not working)', multiplier: 0.4 },
  { value: 'broken', label: 'Broken/Damaged', multiplier: 0.2 },
];

// Time Slots
export const TIME_SLOTS = [
  { value: 'morning', label: 'Morning (9 AM - 12 PM)' },
  { value: 'afternoon', label: 'Afternoon (12 PM - 4 PM)' },
  { value: 'evening', label: 'Evening (4 PM - 7 PM)' },
];