// src/layouts/DashboardLayout.tsx
// Enhanced Dashboard Layout with complete role-based navigation

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
  Shield,
  Navigation,
  Route,
  Activity,
  Calendar,
  Target,
  ClipboardList,
  FileText,
  Bell
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

  // Enhanced navigation items based on user role
  const getNavigationItems = () => {
    const baseItems = [
      { name: 'Dashboard', icon: <LayoutDashboard />, href: '/dashboard' }
    ];

    switch (user?.role) {
      case 'admin':
        return [
          ...baseItems,
          { name: 'Admin Panel', icon: <Shield />, href: '/dashboard/admin' },
          { name: 'User Management', icon: <Users />, href: '/dashboard/users' },
          { name: 'Assignment Center', icon: <Target />, href: '/dashboard/assignments' },
          { name: 'Support Management', icon: <MessageCircle />, href: '/dashboard/support' },
          { name: 'Analytics & Reports', icon: <BarChart3 />, href: '/dashboard/analytics' },
          { name: 'System Settings', icon: <Settings />, href: '/dashboard/settings' },
        ];
      
      case 'manager':
        return [
          ...baseItems,
          { name: 'Order Management', icon: <Package />, href: '/dashboard/admin' },
          { name: 'Assignment Center', icon: <Target />, href: '/dashboard/assignments' },
          { name: 'Support Tickets', icon: <MessageCircle />, href: '/dashboard/support' },
          { name: 'Analytics', icon: <BarChart3 />, href: '/dashboard/analytics' },
          { name: 'User Management', icon: <Users />, href: '/dashboard/users' },
          { name: 'Service Areas', icon: <MapPin />, href: '/dashboard/areas' },
        ];
      
      case 'pickup_boy':
        return [
          ...baseItems,
          { name: 'My Assignments', icon: <ClipboardList />, href: '/dashboard/assigned' },
          { name: 'Route Planner', icon: <Route />, href: '/dashboard/route' },
          { name: 'Navigation', icon: <Navigation />, href: '/dashboard/navigation' },
          { name: 'Pickup History', icon: <Activity />, href: '/dashboard/history' },
          { name: 'Daily Schedule', icon: <Calendar />, href: '/dashboard/schedule' },
          { name: 'Performance', icon: <BarChart3 />, href: '/dashboard/performance' },
        ];
      
      default: // customer
        return [
          ...baseItems,
          { name: 'My Pickups', icon: <Truck />, href: '/dashboard/pickups' },
          { name: 'Schedule Pickup', icon: <Package />, href: '/dashboard/request' },
          { name: 'Order History', icon: <Activity />, href: '/dashboard/history' },
          { name: 'Support Center', icon: <MessageCircle />, href: '/dashboard/support' },
          { name: 'Track Orders', icon: <MapPin />, href: '/dashboard/tracking' },
        ];
    }
  };

  const navigationItems = getNavigationItems();

  // Add common items for all users
  const commonItems = [
    { name: 'My Profile', icon: <UserCircle />, href: '/dashboard/profile' },
    { name: 'Notifications', icon: <Bell />, href: '/dashboard/notifications' }
  ];

  const allNavigationItems = [
    ...navigationItems,
    ...commonItems
  ];

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'admin': return 'System Administrator';
      case 'manager': return 'Operations Manager';
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

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-700';
      case 'manager': return 'bg-blue-100 text-blue-700';
      case 'pickup_boy': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Sidebar Toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-30">
        <button
          className="p-2 rounded-md bg-green-500 text-white shadow-lg hover:bg-green-600 transition-colors"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-20
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-gray-200">
            <Link to="/dashboard" className="flex items-center space-x-3">
              <div className="relative">
                <RecycleIcon className="h-10 w-10 text-green-500" />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>
              <div>
                <div className="text-xl font-bold text-green-600">E-Waste</div>
                <div className="text-xs text-green-500">Management Platform</div>
              </div>
            </Link>
          </div>

          {/* User Info */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                </div>
                <div className="absolute -bottom-1 -right-1">
                  {getRoleIcon(user?.role || 'customer')}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-900 truncate">
                  {user?.firstName} {user?.lastName}
                </div>
                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${getRoleBadgeColor(user?.role || 'customer')}`}>
                  {getRoleDisplayName(user?.role || 'customer')}
                </div>
                <div className="text-xs text-gray-500 mt-1 truncate">{user?.email}</div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-1">
              {allNavigationItems.map((item) => {
                const isActive = location.pathname === item.href || 
                  (item.href !== '/dashboard' && location.pathname.startsWith(item.href));
                
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`
                      flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                      ${isActive
                        ? 'bg-green-50 text-green-700 border-l-4 border-green-500 shadow-sm' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-green-600 hover:translate-x-1'
                      }
                    `}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <span className={`
                      ${isActive ? 'text-green-600' : 'text-gray-400 group-hover:text-green-500'}
                      transition-colors duration-200
                    `}>
                      {item.icon}
                    </span>
                    <span className="flex-1">{item.name}</span>
                    {isActive && (
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    )}
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* User Status & Quick Actions */}
          <div className="p-4 border-t border-gray-200">
            <div className="space-y-3">
              {/* Status indicator for pickup boys */}
              {user?.role === 'pickup_boy' && (
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-green-700">On Duty</span>
                  </div>
                  <button className="text-xs text-green-600 hover:text-green-800">
                    Change Status
                  </button>
                </div>
              )}

              {/* Quick Stats */}
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">
                    {user?.role === 'pickup_boy' ? 'Today\'s Pickups' : 
                     user?.role === 'customer' ? 'Active Orders' : 
                     'System Status'}
                  </span>
                  <span className="font-semibold text-gray-900">
                    {user?.role === 'pickup_boy' ? '0' : 
                     user?.role === 'customer' ? '0' : 
                     'Normal'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Logout */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 p-3 w-full rounded-xl text-gray-700 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
            >
              <LogOut className="text-gray-400" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-10"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="lg:ml-64 min-h-screen">
        <div className="p-6 pt-20 lg:pt-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;