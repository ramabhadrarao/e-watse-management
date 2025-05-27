// src/layouts/DashboardLayout.tsx
// Updated Dashboard Layout with role-based navigation

import React, { useState, useContext } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  RecycleIcon, 
  LayoutDashboard, 
  Truck, 
  Package, 
  UserCircle, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Users,
  BarChart3,
  MessageCircle,
  MapPin,
  Shield
} from 'lucide-react';
import AuthContext from '../context/AuthContext';

const DashboardLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  // Navigation items based on user role
  const getNavigationItems = () => {
    const baseItems = [
      { name: 'Dashboard', icon: <LayoutDashboard />, href: '/dashboard' }
    ];

    switch (user?.role) {
      case 'admin':
        return [
          ...baseItems,
          { name: 'Orders Management', icon: <Package />, href: '/dashboard/admin' },
          { name: 'User Management', icon: <Users />, href: '/dashboard/users' },
          { name: 'Support Tickets', icon: <MessageCircle />, href: '/dashboard/support' },
          { name: 'Analytics', icon: <BarChart3 />, href: '/dashboard/analytics' },
          { name: 'Settings', icon: <Settings />, href: '/dashboard/settings' },
        ];
      
      case 'manager':
        return [
          ...baseItems,
          { name: 'Orders Management', icon: <Package />, href: '/dashboard/manage' },
          { name: 'Support Tickets', icon: <MessageCircle />, href: '/dashboard/support' },
          { name: 'Pickup Areas', icon: <MapPin />, href: '/dashboard/areas' },
          { name: 'Analytics', icon: <BarChart3 />, href: '/dashboard/analytics' },
        ];
      
      case 'pickup_boy':
        return [
          ...baseItems,
          { name: 'Assigned Pickups', icon: <Truck />, href: '/dashboard/assigned' },
          { name: 'My Route', icon: <MapPin />, href: '/dashboard/route' },
          { name: 'History', icon: <Package />, href: '/dashboard/history' },
        ];
      
      default: // customer
        return [
          ...baseItems,
          { name: 'My Pickups', icon: <Truck />, href: '/dashboard/pickups' },
          { name: 'Request Pickup', icon: <Package />, href: '/dashboard/request' },
          { name: 'Support', icon: <MessageCircle />, href: '/dashboard/support' },
        ];
    }
  };

  const navigationItems = getNavigationItems();

  // Add profile to all users
  const allNavigationItems = [
    ...navigationItems,
    { name: 'My Profile', icon: <UserCircle />, href: '/dashboard/profile' }
  ];

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrator';
      case 'manager': return 'Manager';
      case 'pickup_boy': return 'Pickup Executive';
      default: return 'Customer';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Shield className="h-4 w-4 text-red-500" />;
      case 'manager': return <Settings className="h-4 w-4 text-blue-500" />;
      case 'pickup_boy': return <Truck className="h-4 w-4 text-green-500" />;
      default: return <UserCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile Sidebar Toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-20">
        <button
          className="p-2 rounded-md bg-green-500 text-white shadow-lg"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-10
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-4 border-b border-gray-200">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <RecycleIcon className="h-8 w-8 text-green-500" />
              <div>
                <div className="text-lg font-bold text-green-600">E-Waste</div>
                <div className="text-xs text-green-500">Management Platform</div>
              </div>
            </Link>
          </div>

          {/* User Info */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-semibold">
                  {user?.firstName?.charAt(0) || 'U'}{user?.lastName?.charAt(0) || 'U'}
                </span>
              </div>
              <div className="flex-1">
                <div className="font-medium">{user?.firstName} {user?.lastName}</div>
                <div className="flex items-center space-x-1">
                  {getRoleIcon(user?.role || 'customer')}
                  <span className="text-xs text-gray-500">{getRoleDisplayName(user?.role || 'customer')}</span>
                </div>
                <div className="text-xs text-gray-500">{user?.email}</div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 overflow-y-auto">
            <ul className="space-y-2">
              {allNavigationItems.map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className={`
                      flex items-center space-x-3 p-3 rounded-md transition-colors
                      ${location.pathname === item.href 
                        ? 'bg-green-50 text-green-600' 
                        : 'text-gray-700 hover:bg-gray-50 hover:text-green-500'
                      }
                    `}
                    onClick={() => setSidebarOpen(false)} // Close mobile sidebar on navigation
                  >
                    <span className={location.pathname === item.href ? 'text-green-500' : 'text-gray-400'}>
                      {item.icon}
                    </span>
                    <span>{item.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 p-3 w-full rounded-md text-gray-700 hover:bg-gray-50 hover:text-green-500 transition-colors"
            >
              <LogOut className="text-gray-400" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-5"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="lg:ml-64">
        <div className="p-6">
          {/* Breadcrumb or page header could go here */}
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;