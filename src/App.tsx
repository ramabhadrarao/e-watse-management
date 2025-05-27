// src/App.tsx
// Enhanced App component with complete role-based routing including pickup boy routes

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
import SupportTicketDetails from './pages/dashboard/SupportTicketDetails';

// Admin Pages
import AdminDashboard from './pages/dashboard/AdminDashboard';
import UserManagement from './pages/dashboard/admin/UserManagement';
import Analytics from './pages/dashboard/admin/Analytics';
import AssignmentDashboard from './pages/dashboard/admin/AssignmentDashboard';

// Pickup Boy Pages
import PickupBoyDashboard from './pages/dashboard/pickup/PickupBoyDashboard';
import RouteOptimization from './pages/dashboard/pickup/RouteOptimization';

// Customer Pages
import CustomerDashboard from './pages/dashboard/customer/CustomerDashboard';

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
              {/* Role-based default dashboard route */}
              <Route index element={<UserDashboard />} />
              
              {/* Customer Routes */}
              <Route 
                path="pickups" 
                element={
                  <PrivateRoute requiredRole="customer">
                    <MyPickups />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="pickups/:id" 
                element={
                  <PrivateRoute requiredRole="customer">
                    <OrderDetails />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="request" 
                element={
                  <PrivateRoute requiredRole="customer">
                    <NewPickupRequest />
                  </PrivateRoute>
                } 
              />
              
              {/* Admin Routes */}
              <Route 
                path="admin" 
                element={
                  <PrivateRoute requiredRole="admin,manager">
                    <AdminDashboard />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="users" 
                element={
                  <PrivateRoute requiredRole="admin,manager">
                    <UserManagement />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="analytics" 
                element={
                  <PrivateRoute requiredRole="admin,manager">
                    <Analytics />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="assignments" 
                element={
                  <PrivateRoute requiredRole="admin,manager">
                    <AssignmentDashboard />
                  </PrivateRoute>
                } 
              />
              
              {/* Pickup Boy Routes */}
              <Route 
                path="assigned" 
                element={
                  <PrivateRoute requiredRole="pickup_boy">
                    <PickupBoyDashboard />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="route" 
                element={
                  <PrivateRoute requiredRole="pickup_boy">
                    <RouteOptimization />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="history" 
                element={
                  <PrivateRoute requiredRole="pickup_boy">
                    <MyPickups />
                  </PrivateRoute>
                } 
              />
              
              {/* Shared Routes (Multiple Roles) */}
              <Route 
                path="support" 
                element={<SupportTickets />} 
              />
              <Route 
                path="support/:id" 
                element={<SupportTicketDetails />} 
              />
              <Route 
                path="profile" 
                element={<UserProfile />} 
              />
              
              {/* Order details - accessible by multiple roles */}
              <Route 
                path="orders/:id" 
                element={<OrderDetails />} 
              />
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