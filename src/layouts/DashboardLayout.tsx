import React, { useState, useContext } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { RecycleIcon, LayoutDashboard, Truck, Package, UserCircle, Settings, LogOut, Menu, X } from 'lucide-react';
import AuthContext from '../context/AuthContext';

const DashboardLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navigationItems = [
    { name: 'Dashboard', icon: <LayoutDashboard />, href: '/dashboard' },
    { name: 'My Pickups', icon: <Truck />, href: '/dashboard/pickups' },
    { name: 'Request Pickup', icon: <Package />, href: '/dashboard/request' },
    { name: 'My Profile', icon: <UserCircle />, href: '/dashboard/profile' },
  ];

  // Add admin routes if user is admin
  if (user?.role === 'admin') {
    navigationItems.push(
      { name: 'Settings', icon: <Settings />, href: '/dashboard/settings' }
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile Sidebar Toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-20">
        <button
          className="p-2 rounded-md bg-green-500 text-white"
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
                <span className="text-green-600 font-semibold">{user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}</span>
              </div>
              <div>
                <div className="font-medium">{user?.firstName} {user?.lastName}</div>
                <div className="text-xs text-gray-500">{user?.email}</div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 overflow-y-auto">
            <ul className="space-y-2">
              {navigationItems.map((item) => (
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

      {/* Main Content */}
      <div className="lg:ml-64">
        <div className="p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;