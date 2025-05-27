import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, RecycleIcon, User, LogOut } from 'lucide-react';
import AuthContext from '../../context/AuthContext';
import Button from '../ui/Button';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const toggleMenu = () => setIsOpen(!isOpen);
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-md fixed w-full z-20 top-0 left-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <RecycleIcon className="h-8 w-8 text-green-500" />
              <div className="ml-2">
                <div className="text-lg font-bold text-green-600">E-Waste</div>
                <div className="text-xs text-green-500">Management Platform</div>
              </div>
            </Link>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link to="/" className="border-transparent text-gray-500 hover:border-green-500 hover:text-green-500 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                Home
              </Link>
              <Link to="/services" className="border-transparent text-gray-500 hover:border-green-500 hover:text-green-500 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                Services
              </Link>
              <Link to="/about" className="border-transparent text-gray-500 hover:border-green-500 hover:text-green-500 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                About
              </Link>
              <Link to="/contact" className="border-transparent text-gray-500 hover:border-green-500 hover:text-green-500 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                Contact
              </Link>
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <Link to="/dashboard">
                  <Button variant="primary\" size="sm">
                    Dashboard
                  </Button>
                </Link>
                <div className="relative">
                  <button 
                    className="flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500" 
                    id="user-menu-button"
                    onClick={handleLogout}
                  >
                    <div className="flex items-center space-x-2 bg-gray-100 p-2 rounded-full">
                      <User className="h-5 w-5 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">{user?.firstName}</span>
                      <LogOut className="h-4 w-4 text-gray-500" />
                    </div>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login">
                  <Button variant="outline" size="sm">
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm">
                    Register
                  </Button>
                </Link>
              </div>
            )}
          </div>
          <div className="flex items-center sm:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-green-500"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`sm:hidden ${isOpen ? 'block' : 'hidden'}`}>
        <div className="pt-2 pb-3 space-y-1">
          <Link to="/" className="border-transparent text-gray-500 hover:bg-gray-50 hover:border-green-500 hover:text-green-500 block pl-3 pr-4 py-2 border-l-4 text-base font-medium">
            Home
          </Link>
          <Link to="/services" className="border-transparent text-gray-500 hover:bg-gray-50 hover:border-green-500 hover:text-green-500 block pl-3 pr-4 py-2 border-l-4 text-base font-medium">
            Services
          </Link>
          <Link to="/about" className="border-transparent text-gray-500 hover:bg-gray-50 hover:border-green-500 hover:text-green-500 block pl-3 pr-4 py-2 border-l-4 text-base font-medium">
            About
          </Link>
          <Link to="/contact" className="border-transparent text-gray-500 hover:bg-gray-50 hover:border-green-500 hover:text-green-500 block pl-3 pr-4 py-2 border-l-4 text-base font-medium">
            Contact
          </Link>
        </div>
        <div className="pt-4 pb-3 border-t border-gray-200">
          {isAuthenticated ? (
            <div className="space-y-1">
              <Link to="/dashboard\" className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-500 hover:bg-gray-50 hover:border-green-500 hover:text-green-500">
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="w-full text-left block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-500 hover:bg-gray-50 hover:border-green-500 hover:text-green-500"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center px-4 space-x-2">
              <Link to="/login" className="flex-1">
                <Button variant="outline" size="sm" fullWidth>
                  Login
                </Button>
              </Link>
              <Link to="/register" className="flex-1">
                <Button variant="primary" size="sm" fullWidth>
                  Register
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;