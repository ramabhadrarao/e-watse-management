// src/pages/dashboard/customer/CustomerDashboard.tsx
// Customer Dashboard - Main dashboard for customers with recent orders and quick actions
// Features: Order statistics, recent orders, quick actions, support shortcuts
// Path: /dashboard (customer role)
// Dependencies: Real backend API calls via useUserOrders hook

import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Package, 
  Clock, 
  CheckCircle, 
  TrendingUp,
  MapPin,
  Calendar,
  Phone,
  Mail,
  Star,
  AlertCircle
} from 'lucide-react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import AuthContext from '../../../context/AuthContext';
import { useUserOrders } from '../../../hooks/useOrders';

const CustomerDashboard: React.FC = () => {
  const { user } = useContext(AuthContext);
  const { data: ordersData, isLoading, error } = useUserOrders({ limit: 5 });

  const orders = ordersData?.data || [];
  const orderStats = ordersData?.stats || {};

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'picked_up':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in_transit':
      case 'assigned':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'processing':
        return <Package className="h-4 w-4 text-purple-500" />;
      case 'cancelled':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Package className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'picked_up':
        return 'bg-green-100 text-green-800';
      case 'in_transit':
      case 'assigned':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-purple-100 text-purple-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'pending':
      case 'confirmed':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Unable to Load Dashboard</h2>
        <p className="text-gray-600 mb-6">There was an error loading your dashboard data.</p>
        <Button variant="primary" onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.firstName}!
        </h1>
        <p className="text-gray-600">Here's what's happening with your e-waste pickups</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card variant="elevated" className="p-6">
          <div className="flex items-center">
            <div className="bg-blue-100 text-blue-600 p-3 rounded-full mr-4">
              <Package className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{orderStats.totalOrders || 0}</p>
              <p className="text-xs text-blue-600">All time</p>
            </div>
          </div>
        </Card>

        <Card variant="elevated" className="p-6">
          <div className="flex items-center">
            <div className="bg-purple-100 text-purple-600 p-3 rounded-full mr-4">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{orderStats.pendingOrders || 0}</p>
              <p className="text-xs text-purple-600">Awaiting pickup</p>
            </div>
          </div>
        </Card>

        <Card variant="elevated" className="p-6">
          <div className="flex items-center">
            <div className="bg-green-100 text-green-600 p-3 rounded-full mr-4">
              <CheckCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{orderStats.completedOrders || 0}</p>
              <p className="text-xs text-green-600">Successfully picked up</p>
            </div>
          </div>
        </Card>

        <Card variant="elevated" className="p-6">
          <div className="flex items-center">
            <div className="bg-amber-100 text-amber-600 p-3 rounded-full mr-4">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Earned</p>
              <p className="text-2xl font-bold text-gray-900">₹{(orderStats.totalEarned || 0).toLocaleString()}</p>
              <p className="text-xs text-amber-600">From e-waste sales</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2">
          <Card variant="elevated">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
              <Link to="/dashboard/pickups">
                <Button variant="outline" size="sm">View All</Button>
              </Link>
            </div>
            <div className="divide-y divide-gray-200">
              {orders.length === 0 ? (
                <div className="p-8 text-center">
                  <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
                  <p className="text-gray-500 mb-6">
                    Start by scheduling your first e-waste pickup. It's quick, easy, and helps the environment!
                  </p>
                  <Link to="/dashboard/request">
                    <Button variant="primary" size="lg">
                      <Plus className="h-5 w-5 mr-2" />
                      Schedule Your First Pickup
                    </Button>
                  </Link>
                </div>
              ) : (
                orders.map((order: any) => (
                  <div key={order._id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          {getStatusIcon(order.status)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <Link 
                            to={`/dashboard/pickups/${order._id}`}
                            className="block hover:text-green-600"
                          >
                            <p className="font-medium text-gray-900 truncate">
                              Order #{order.orderNumber}
                            </p>
                            <p className="text-sm text-gray-600">
                              {order.items.length} item{order.items.length !== 1 ? 's' : ''} • {order.pickupDetails.address.city}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Scheduled: {formatDate(order.pickupDetails.preferredDate)}
                            </p>
                          </Link>
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                          {order.status.replace('_', ' ').toUpperCase()}
                        </span>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            ₹{(order.pricing?.estimatedTotal || 0).toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDate(order.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card variant="elevated">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
            </div>
            <div className="p-6 space-y-3">
              <Link to="/dashboard/request">
                <Button variant="primary" fullWidth size="lg">
                  <Plus className="h-5 w-5 mr-2" />
                  Schedule New Pickup
                </Button>
              </Link>
              <Link to="/dashboard/pickups">
                <Button variant="outline" fullWidth>
                  <Package className="h-4 w-4 mr-2" />
                  View All Orders
                </Button>
              </Link>
              <Link to="/dashboard/support">
                <Button variant="outline" fullWidth>
                  <Mail className="h-4 w-4 mr-2" />
                  Support Tickets
                </Button>
              </Link>
              <Link to="/dashboard/profile">
                <Button variant="outline" fullWidth>
                  <Star className="h-4 w-4 mr-2" />
                  Update Profile
                </Button>
              </Link>
            </div>
          </Card>

          {/* Environmental Impact */}
          {orderStats.completedOrders > 0 && (
            <Card variant="elevated">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Your Environmental Impact</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 mb-1">
                      {orderStats.itemsRecycled || 0}
                    </div>
                    <p className="text-sm text-green-700">Items Recycled</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-lg font-bold text-blue-600 mb-1">
                        {orderStats.co2Saved || 0} kg
                      </div>
                      <p className="text-xs text-blue-700">CO₂ Reduced</p>
                    </div>
                    
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <div className="text-lg font-bold text-purple-600 mb-1">
                        {orderStats.energySaved || 0} kWh
                      </div>
                      <p className="text-xs text-purple-700">Energy Saved</p>
                    </div>
                  </div>
                  
                  <p className="text-xs text-gray-600 text-center">
                    Keep up the great work protecting our planet! 🌍
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Support */}
          <Card variant="elevated">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Need Help?</h2>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-4">
                Have questions about your pickup or our services? We're here to help!
              </p>
              <div className="space-y-3">
                <Button variant="outline" size="sm" fullWidth>
                  <Phone className="h-4 w-4 mr-2" />
                  Call Support
                </Button>
                <Link to="/dashboard/support">
                  <Button variant="outline" size="sm" fullWidth>
                    <Mail className="h-4 w-4 mr-2" />
                    Create Support Ticket
                  </Button>
                </Link>
              </div>
              
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-900 mb-1">Support Hours</p>
                <p className="text-xs text-gray-600">
                  Monday - Saturday: 9:00 AM - 7:00 PM<br />
                  Sunday: 10:00 AM - 5:00 PM
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;