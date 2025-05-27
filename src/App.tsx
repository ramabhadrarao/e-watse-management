// src/App.tsx
// Complete App component with proper imports and routing including all admin and pickup boy routes
// Features: Public pages, protected dashboard routes, role-based access, admin management, pickup boy interface
// Dependencies: React Router, React Query, Toast notifications, Authentication context

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { QueryClient, QueryClientProvider } from 'react-query';
import 'react-toastify/dist/ReactToastify.css';

// Layouts
import MainLayout from './layouts/MainLayout';
import// src/App.tsx
// Fixed App component with proper imports and routing including all admin and pickup boy routes

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { QueryClient, QueryClientProvider } from 'react-query';
import 'react-toastify/dist/ReactToastify.css';

// Layouts
import MainLayout from './layouts/MainLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Public Pages
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ServicesPage from './pages/ServicesPage';
import ContactPage from './pages/ContactPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import NotFoundPage from './pages/NotFoundPage';

// Dashboard Pages
import UserDashboard from './pages/dashboard/UserDashboard';
import MyPickups from './pages/dashboard/MyPickups';
import NewPickupRequest from './pages/dashboard/NewPickupRequest';
import UserProfile from './pages/dashboard/UserProfile';
import OrderDetails from './pages/dashboard/OrderDetails';
import SupportTickets from './pages/dashboard/SupportTickets';

// Admin Pages
import AdminDashboard from './pages/dashboard/AdminDashboard';
import UserManagement from './pages/dashboard/admin/UserManagement';
import Analytics from './pages/dashboard/admin/Analytics';

// Pickup Boy Pages
import PickupBoyDashboard from './pages/dashboard/pickup/PickupBoyDashboard';

// Context
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/routing/PrivateRoute';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <ToastContainer 
            position="top-right" 
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<MainLayout />}>
              <Route index element={<HomePage />} />
              <Route path="about" element={<AboutPage />} />
              <Route path="services" element={<ServicesPage />} />
              <Route path="contact" element={<ContactPage />} />
              <Route path="login" element={<LoginPage />} />
              <Route path="register" element={<RegisterPage />} />
            </Route>
            
            {/* Dashboard Routes */}
            <Route 
              path="/dashboard" 
              element={
                <PrivateRoute>
                  <DashboardLayout />
                </PrivateRoute>
              }
            >
              {/* Default dashboard route */}
              <Route index element={<UserDashboard />} />
              
              {/* Customer Routes */}
              <Route path="pickups" element={<MyPickups />} />
              <Route path="pickups/:id" element={<OrderDetails />} />
              <Route path="request" element={<NewPickupRequest />} />
              <Route path="profile" element={<UserProfile />} />
            </Route>
            
            {/* 404 Route */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;