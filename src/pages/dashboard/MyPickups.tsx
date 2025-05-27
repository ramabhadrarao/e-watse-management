// src/pages/dashboard/MyPickups.tsx
// My Pickups Dashboard Page - Displays user's pickup orders with filtering and status tracking
// Features: real-time API data, status filtering, order details, pickup tracking, order actions

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Truck, Clock, CheckCircle, XCircle, Eye, Calendar, MapPin, Phone, Copy, RefreshCw } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { ORDER_STATUS } from '../../config';
import { useUserOrders, useCancelOrder } from '../../hooks/useOrders';
import { useToast } from '../../hooks/useToast';

const MyPickups: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  
  const { showSuccess, showError } = useToast();
  
  // API Hooks
  const { data: ordersData, isLoading, error, refetch } = useUserOrders();
  const cancelOrderMutation = useCancelOrder();

  const orders = ordersData?.data || [];

  const getStatusInfo = (status: string) => {
    const statusConfig = ORDER_STATUS.find(s => s.value === status);
    return statusConfig || { label: status, color: '#6b7280' };
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'in_transit':
        return <Truck className="h-5 w-5 text-blue-500" />;
      case 'pending':
      case 'confirmed':
        return <Clock className="h-5 w-5 text-amber-500" />;
      default:
        return <Package className="h-5 w-5 text-gray-500" />;
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showSuccess('PIN copied to clipboard');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTimeSlotLabel = (timeSlot: string) => {
    const slots = {
      morning: 'Morning (9 AM - 12 PM)',
      afternoon: 'Afternoon (12 PM - 4 PM)',
      evening: 'Evening (4 PM - 7 PM)'
    };
    return slots[timeSlot as keyof typeof slots] || timeSlot;
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) {
      return;
    }

    try {
      await cancelOrderMutation.mutateAsync({ 
        id: orderId, 
        reason: 'Cancelled by customer' 
      });
      showSuccess('Order cancelled successfully');
    } catch (error: any) {
      showError(error.response?.data?.message || 'Failed to cancel order');
    }
  };

  const handleRefresh = () => {
    refetch();
    showSuccess('Orders refreshed');
  };

  const filteredOrders = orders.filter(order => 
    statusFilter === 'all' || order.status === statusFilter
  );

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }
  });

  const statusOptions = [
    { value: 'all', label: 'All Orders' },
    ...ORDER_STATUS.map(status => ({ value: status.value, label: status.label }))
  ];

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' }
  ];

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <XCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Failed to Load Orders</h2>
        <p className="text-gray-600 mb-6">Unable to fetch your pickup orders. Please try again.</p>
        <Button variant="primary" onClick={handleRefresh}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Pickups</h1>
          <p className="text-gray-600">Track and manage your e-waste pickup orders</p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-3">
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Link to="/dashboard/request">
            <Button variant="primary">
              <Package className="mr-2 h-5 w-5" />
              Request New Pickup
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <Card variant="elevated" className="p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select
            label="Filter by Status"
            options={statusOptions}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          />
          <Select
            label="Sort by"
            options={sortOptions}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          />
          <div className="flex items-end">
            <div className="text-sm text-gray-600">
              Showing {sortedOrders.length} of {orders.length} orders
            </div>
          </div>
        </div>
      </Card>

      {/* Orders List */}
      <div className="space-y-6">
        {sortedOrders.map((order) => (
          <Card key={order._id} variant="elevated" className="overflow-hidden">
            <div className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                <div className="flex-1">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(order.status)}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Order #{order.orderNumber}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Ordered on {formatDate(order.createdAt)}
                        </p>
                      </div>
                    </div>
                    <span 
                      className="px-3 py-1 text-xs font-medium rounded-full"
                      style={{ 
                        backgroundColor: `${getStatusInfo(order.status).color}20`,
                        color: getStatusInfo(order.status).color 
                      }}
                    >
                      {getStatusInfo(order.status).label}
                    </span>
                  </div>

                  {/* Items */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Items ({order.items.length}):</h4>
                    <div className="flex flex-wrap gap-2">
                      {order.items.map((item, index) => (
                        <span 
                          key={index}
                          className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                        >
                          {item.quantity}x {item.categoryId?.name || 'Unknown'} ({item.condition})
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Pickup Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-start space-x-2">
                      <MapPin className="h-4 w-4 text-gray-400 mt-1" />
                      <div className="text-sm">
                        <p className="font-medium text-gray-700">Pickup Address:</p>
                        <p className="text-gray-600">
                          {order.pickupDetails.address.street}, {order.pickupDetails.address.city} - {order.pickupDetails.address.pincode}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-2">
                      <Calendar className="h-4 w-4 text-gray-400 mt-1" />
                      <div className="text-sm">
                        <p className="font-medium text-gray-700">Pickup Schedule:</p>
                        <p className="text-gray-600">
                          {formatDate(order.pickupDetails.preferredDate)} - {getTimeSlotLabel(order.pickupDetails.timeSlot)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-sm">
                      <span className="text-gray-600">Estimated Amount: </span>
                      <span className="font-semibold text-gray-900">₹{order.pricing.estimatedTotal.toLocaleString()}</span>
                    </div>
                    {order.pricing.actualTotal > 0 && (
                      <div className="text-sm">
                        <span className="text-gray-600">Final Amount: </span>
                        <span className="font-semibold text-green-600">₹{order.pricing.actualTotal.toLocaleString()}</span>
                      </div>
                    )}
                  </div>

                  {/* Pickup Boy Info */}
                  {order.assignedPickupBoy && (
                    <div className="bg-blue-50 rounded-lg p-3 mb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Truck className="h-4 w-4 text-blue-600" />
                          <div className="text-sm">
                            <p className="font-medium text-blue-900">Pickup Boy Assigned:</p>
                            <p className="text-blue-700">
                              {order.assignedPickupBoy.firstName} {order.assignedPickupBoy.lastName}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4 text-blue-600" />
                          <span className="text-sm text-blue-700">{order.assignedPickupBoy.phone}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* PIN Display */}
                  {(order.status === 'assigned' || order.status === 'in_transit') && 
                   order.pinVerification && !order.pinVerification.isVerified && (
                    <div className="bg-amber-50 rounded-lg p-3 mb-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-amber-900">Pickup PIN:</p>
                          <p className="text-lg font-bold text-amber-700 font-mono">{order.pinVerification.pin}</p>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => copyToClipboard(order.pinVerification.pin)}
                        >
                          <Copy className="h-4 w-4 mr-1" />
                          Copy
                        </Button>
                      </div>
                      <p className="text-xs text-amber-600 mt-1">
                        Share this PIN with the pickup boy for verification
                      </p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="mt-4 lg:mt-0 lg:ml-6 flex flex-col space-y-2">
                  <Link to={`/dashboard/pickups/${order._id}`}>
                    <Button variant="outline" size="sm" fullWidth>
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </Button>
                  </Link>
                  {(order.status === 'pending' || order.status === 'confirmed') && (
                    <Button 
                      variant="danger" 
                      size="sm" 
                      fullWidth
                      onClick={() => handleCancelOrder(order._id)}
                      loading={cancelOrderMutation.isLoading}
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Cancel Order
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}

        {sortedOrders.length === 0 && (
          <Card variant="elevated" className="text-center py-12">
            <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No pickups found</h3>
            <p className="text-gray-600 mb-6">
              {statusFilter === 'all' 
                ? "You haven't requested any pickups yet." 
                : `No pickups with status "${getStatusInfo(statusFilter).label}" found.`
              }
            </p>
            <Link to="/dashboard/request">
              <Button variant="primary">
                <Package className="mr-2 h-5 w-5" />
                Request Your First Pickup
              </Button>
            </Link>
          </Card>
        )}
      </div>
    </div>
  );
};

export default MyPickups;