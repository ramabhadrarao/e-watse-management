// src/pages/dashboard/pickup/PickupBoyDashboard.tsx
// Fixed Pickup Boy Dashboard - Main dashboard for pickup executives with proper assigned orders display
// Features: assigned pickups, daily stats, route overview, performance metrics
// Path: /dashboard (pickup_boy role)
// Dependencies: Real backend API calls via useAssignedOrders hook

import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { 
  Truck, 
  Package, 
  MapPin, 
  Clock, 
  CheckCircle,
  Navigation,
  Phone,
  Star,
  TrendingUp,
  Calendar,
  RefreshCw,
  Eye,
  Route,
  AlertCircle,
  User,
  Activity,
  Copy,
  Play
} from 'lucide-react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import AuthContext from '../../../context/AuthContext';
import { useAssignedOrders, useVerifyPickupPin, useUpdateOrderStatus } from '../../../hooks/useOrders';
import { useToast } from '../../../hooks/useToast';

const PickupBoyDashboard: React.FC = () => {
  const { user } = useContext(AuthContext);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [refreshing, setRefreshing] = useState(false);
  const { showSuccess, showError } = useToast();

  // API Hooks with better error handling
  const { 
    data: ordersData, 
    isLoading, 
    error, 
    refetch,
    isError 
  } = useAssignedOrders();

  const verifyPinMutation = useVerifyPickupPin();
  const updateOrderStatusMutation = useUpdateOrderStatus();

  // Handle data with fallbacks
  const orders = ordersData?.data || [];

  console.log('Orders data:', ordersData); // Debug log
  console.log('Orders array:', orders); // Debug log

  // Calculate statistics with null safety
  const todayOrders = orders.filter(order => {
    try {
      const orderDate = new Date(order.pickupDetails?.preferredDate || order.createdAt).toDateString();
      const today = new Date().toDateString();
      return orderDate === today;
    } catch (error) {
      console.warn('Error parsing order date:', error);
      return false;
    }
  });

  const completedToday = todayOrders.filter(order => 
    ['picked_up', 'completed'].includes(order.status)
  ).length;
  
  const pendingToday = todayOrders.filter(order => 
    ['assigned', 'in_transit'].includes(order.status)
  ).length;

  const totalItemsToday = todayOrders.reduce((sum, order) => {
    return sum + (order.items || []).reduce((itemSum: number, item: any) => 
      itemSum + (item.quantity || 0), 0
    );
  }, 0);

  const totalValueToday = todayOrders.reduce((sum, order) => 
    sum + (order.pricing?.estimatedTotal || 0), 0
  );

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const getTimeSlotLabel = (timeSlot: string) => {
    const slots = {
      morning: 'Morning (9 AM - 12 PM)',
      afternoon: 'Afternoon (12 PM - 4 PM)',
      evening: 'Evening (4 PM - 7 PM)'
    };
    return slots[timeSlot as keyof typeof slots] || timeSlot;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'assigned': return 'bg-blue-100 text-blue-800';
      case 'in_transit': return 'bg-purple-100 text-purple-800';
      case 'picked_up': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
      showSuccess('Data refreshed');
    } catch (error) {
      showError('Failed to refresh data');
    } finally {
      setRefreshing(false);
    }
  };

  const handleStartPickup = async (orderId: string) => {
    try {
      await updateOrderStatusMutation.mutateAsync({
        id: orderId,
        status: 'in_transit',
        note: 'Pickup started by driver'
      });
      showSuccess('Pickup started - status updated to in transit');
    } catch (error: any) {
      showError(error.response?.data?.message || 'Failed to start pickup');
    }
  };

  const handleCompletePickup = async (orderId: string) => {
    try {
      await updateOrderStatusMutation.mutateAsync({
        id: orderId,
        status: 'picked_up',
        note: 'Items picked up successfully'
      });
      showSuccess('Pickup completed successfully');
    } catch (error: any) {
      showError(error.response?.data?.message || 'Failed to complete pickup');
    }
  };

  const handleCallCustomer = (phoneNumber: string) => {
    if (phoneNumber) {
      window.open(`tel:${phoneNumber}`);
    } else {
      showError('Customer phone number not available');
    }
  };

  const copyPinToClipboard = (pin: string) => {
    navigator.clipboard.writeText(pin);
    showSuccess('PIN copied to clipboard');
  };

  // Loading state
  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  // Error state with better handling
  if (isError) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Failed to Load Assignments</h2>
        <p className="text-gray-600 mb-4">
          {error?.response?.data?.message || 'Unable to fetch your assigned pickups.'}
        </p>
        <div className="space-y-2">
          <p className="text-sm text-gray-500">
            This could be because:
          </p>
          <ul className="text-sm text-gray-500 list-disc list-inside space-y-1">
            <li>You don't have any assigned orders yet</li>
            <li>The server is temporarily unavailable</li>
            <li>Your account needs to be activated for pickup duties</li>
          </ul>
        </div>
        <Button variant="primary" onClick={handleRefresh} className="mt-4">
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {user?.firstName}!
          </h1>
          <p className="text-gray-600">Here's your pickup schedule for today</p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-3">
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Link to="/dashboard/route">
            <Button variant="primary">
              <Navigation className="h-4 w-4 mr-2" />
              View Route
            </Button>
          </Link>
        </div>
      </div>

      {/* Today's Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center">
            <div className="bg-blue-500 p-3 rounded-full mr-4">
              <Package className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-blue-800">Today's Pickups</p>
              <p className="text-2xl font-bold text-blue-900">{todayOrders.length}</p>
              <p className="text-xs text-blue-600">Total assigned</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <div className="flex items-center">
            <div className="bg-green-500 p-3 rounded-full mr-4">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-green-800">Completed</p>
              <p className="text-2xl font-bold text-green-900">{completedToday}</p>
              <p className="text-xs text-green-600">Picked up today</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200">
          <div className="flex items-center">
            <div className="bg-amber-500 p-3 rounded-full mr-4">
              <Clock className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-amber-800">Pending</p>
              <p className="text-2xl font-bold text-amber-900">{pendingToday}</p>
              <p className="text-xs text-amber-600">Yet to pick up</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
          <div className="flex items-center">
            <div className="bg-purple-500 p-3 rounded-full mr-4">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-purple-800">Total Value</p>
              <p className="text-2xl font-bold text-purple-900">₹{totalValueToday.toLocaleString()}</p>
              <p className="text-xs text-purple-600">Today's collections</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="p-6 bg-gradient-to-r from-gray-50 to-blue-50 border border-blue-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Link to="/dashboard/assigned">
            <Button variant="outline" fullWidth className="justify-center">
              <Package className="h-4 w-4 mr-2" />
              View All Assignments
            </Button>
          </Link>
          <Link to="/dashboard/route">
            <Button variant="outline" fullWidth className="justify-center">
              <Route className="h-4 w-4 mr-2" />
              Optimize Route
            </Button>
          </Link>
          <Link to="/dashboard/history">
            <Button variant="outline" fullWidth className="justify-center">
              <Activity className="h-4 w-4 mr-2" />
              View History
            </Button>
          </Link>
          <Link to="/dashboard/profile">
            <Button variant="outline" fullWidth className="justify-center">
              <User className="h-4 w-4 mr-2" />
              Update Profile
            </Button>
          </Link>
        </div>
      </Card>

      {/* Today's Scheduled Pickups */}
      <Card>
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Today's Scheduled Pickups</h2>
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600">{formatDate(new Date().toISOString())}</span>
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {orders.length === 0 ? (
            <div className="p-8 text-center">
              <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No assigned pickups</h3>
              <p className="text-gray-500 mb-4">
                You don't have any assigned pickups at the moment.
              </p>
              <div className="space-y-2 text-sm text-gray-500">
                <p>Possible reasons:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>No orders have been assigned to you yet</li>
                  <li>All your pickups for today are completed</li>
                  <li>Check with your manager for new assignments</li>
                </ul>
              </div>
              <Button variant="outline" onClick={handleRefresh} className="mt-4">
                <RefreshCw className="h-4 w-4 mr-2" />
                Check for New Assignments
              </Button>
            </div>
          ) : (
            orders.map((order: any) => (
              <div key={order._id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-medium text-gray-900">
                        Order #{order.orderNumber}
                      </h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                        {order.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <div className="flex items-start space-x-2 mb-2">
                          <MapPin className="h-4 w-4 text-gray-400 mt-1" />
                          <div className="text-sm">
                            <p className="font-medium text-gray-700">Pickup Address:</p>
                            <p className="text-gray-600">
                              {order.pickupDetails?.address?.street || 'Address not available'}<br />
                              {order.pickupDetails?.address?.city} - {order.pickupDetails?.address?.pincode}
                            </p>
                            {order.pickupDetails?.address?.landmark && (
                              <p className="text-xs text-gray-500">
                                Landmark: {order.pickupDetails.address.landmark}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-start space-x-2 mb-2">
                          <User className="h-4 w-4 text-gray-400 mt-1" />
                          <div className="text-sm">
                            <p className="font-medium text-gray-700">Customer:</p>
                            <p className="text-gray-600">
                              {order.customerId?.firstName} {order.customerId?.lastName}
                            </p>
                            <p className="text-gray-600">{order.pickupDetails?.contactNumber || order.customerId?.phone}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-6 text-sm text-gray-600 mb-3">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>{getTimeSlotLabel(order.pickupDetails?.timeSlot || 'Not specified')}</span>
                      </div>
                      <div className="flex items-center">
                        <Package className="h-4 w-4 mr-1" />
                        <span>{order.items?.length || 0} item(s)</span>
                      </div>
                      <div className="flex items-center">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        <span>₹{(order.pricing?.estimatedTotal || 0).toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Items Preview */}
                    {order.items && order.items.length > 0 && (
                      <div className="mb-3">
                        <p className="text-sm font-medium text-gray-700 mb-1">Items:</p>
                        <div className="flex flex-wrap gap-1">
                          {order.items.slice(0, 3).map((item: any, index: number) => (
                            <span 
                              key={index}
                              className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                            >
                              {item.quantity}x {item.categoryId?.name || 'Item'} ({item.condition})
                            </span>
                          ))}
                          {order.items.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                              +{order.items.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* PIN Display for verification */}
                    {order.pinVerification && !order.pinVerification.isVerified && (
                      <div className="mb-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-amber-900 mb-1">Pickup PIN:</p>
                            <p className="text-lg font-bold text-amber-700 font-mono">
                              {order.pinVerification.pin}
                            </p>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => copyPinToClipboard(order.pinVerification.pin)}
                          >
                            <Copy className="h-4 w-4 mr-1" />
                            Copy
                          </Button>
                        </div>
                        <p className="text-xs text-amber-600 mt-2">
                          Customer will provide this PIN for verification
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="ml-6 flex flex-col space-y-2">
                    <Link to={`/dashboard/orders/${order._id}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </Link>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleCallCustomer(order.pickupDetails?.contactNumber || order.customerId?.phone)}
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      Call Customer
                    </Button>

                    {order.status === 'assigned' && (
                      <Button 
                        variant="primary" 
                        size="sm"
                        onClick={() => handleStartPickup(order._id)}
                        loading={updateOrderStatusMutation.isLoading}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Start Pickup
                      </Button>
                    )}

                    {order.status === 'in_transit' && (
                      <Button 
                        variant="success" 
                        size="sm"
                        onClick={() => handleCompletePickup(order._id)}
                        loading={updateOrderStatusMutation.isLoading}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Complete Pickup
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Performance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">This Week's Performance</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Pickups Completed:</span>
              <span className="font-semibold">{completedToday}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Customer Rating:</span>
              <div className="flex items-center">
                <Star className="h-4 w-4 text-yellow-400 mr-1" />
                <span className="font-semibold">4.8</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">On-time Rate:</span>
              <span className="font-semibold">95%</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Items Collected:</span>
              <span className="font-semibold">{totalItemsToday}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Distance Traveled:</span>
              <span className="font-semibold">0 km</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Time on Route:</span>
              <span className="font-semibold">0h 0m</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Debug Information (remove in production) */}
      {process.env.NODE_ENV === 'development' && (
        <Card className="p-4 bg-gray-50">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Debug Info:</h4>
          <div className="text-xs text-gray-600 space-y-1">
            <p>Orders data: {JSON.stringify(ordersData, null, 2)}</p>
            <p>Orders count: {orders.length}</p>
            <p>Loading: {isLoading.toString()}</p>
            <p>Error: {error ? JSON.stringify(error.message) : 'None'}</p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default PickupBoyDashboard;