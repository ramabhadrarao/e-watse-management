// src/pages/dashboard/UserDashboard.tsx
// Fixed User Dashboard with admin functionality

import React, { useContext, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

import { 
  Truck, 
  Package, 
  Activity, 
  Clock, 
  RefreshCw, 
  TrendingUp,
  Users,
  DollarSign,
  Settings,
  Eye,
  Search,
  Filter,
  Download,
  CheckCircle,
  AlertCircle,
  UserCheck
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import AuthContext from '../../context/AuthContext';
import AdminDashboard from './AdminDashboard';
import PickupBoyDashboard from './pickup/PickupBoyDashboard';
import CustomerDashboard from './customer/CustomerDashboard';
import { useUserOrders, useAllOrders, useUpdateOrderStatus, useAssignPickupBoy } from '../../hooks/useOrders';
import { useToast } from '../../hooks/useToast';
import { ORDER_STATUS } from '../../config';

const UserDashboard: React.FC = () => {
  const { user } = useContext(AuthContext);
  const { showSuccess, showError } = useToast();

  // Use different hooks based on user role
  const isAdmin = user?.role === 'admin' || user?.role === 'manager';
  
  const { 
    data: userOrdersData, 
    isLoading: userOrdersLoading, 
    error: userOrdersError, 
    refetch: refetchUserOrders 
  } = useUserOrders();

  const { 
    data: allOrdersData, 
    isLoading: allOrdersLoading, 
    error: allOrdersError, 
    refetch: refetchAllOrders 
  } = useAllOrders({}, { enabled: isAdmin });

  const updateOrderStatusMutation = useUpdateOrderStatus();
  const assignPickupBoyMutation = useAssignPickupBoy();

  // Choose appropriate data based on user role
  const ordersData = isAdmin ? allOrdersData : userOrdersData;
  const ordersLoading = isAdmin ? allOrdersLoading : userOrdersLoading;
  const ordersError = isAdmin ? allOrdersError : userOrdersError;
  const refetchOrders = isAdmin ? refetchAllOrders : refetchUserOrders;

  const orders = ordersData?.data || [];

  // Mock pickup boys for assignment
  const pickupBoys = [
    { _id: 'pickup1', firstName: 'Suresh', lastName: 'Babu', phone: '9876543212' },
    { _id: 'pickup2', firstName: 'Ravi', lastName: 'Kumar', phone: '9876543213' },
    { _id: 'pickup3', firstName: 'Raj', lastName: 'Singh', phone: '9876543214' }
  ];

  // Calculate statistics
  const stats = useMemo(() => {
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(order => 
      ['pending', 'confirmed', 'assigned', 'in_transit'].includes(order.status)
    ).length;
    const completedOrders = orders.filter(order => order.status === 'completed').length;
    
    const totalItemsProcessed = orders
      .filter(order => order.status === 'completed')
      .reduce((sum, order) => {
        return sum + order.items.reduce((itemSum: number, item: any) => itemSum + item.quantity, 0);
      }, 0);

    const totalEarnings = orders
      .filter(order => order.status === 'completed')
      .reduce((sum, order) => sum + (order.pricing?.actualTotal || order.pricing?.estimatedTotal || 0), 0);

    const co2Saved = Math.round(totalItemsProcessed * 0.4);
    const energySaved = Math.round(totalItemsProcessed * 1.4);

    return {
      totalOrders,
      pendingOrders,
      completedOrders,
      totalItemsProcessed,
      totalEarnings,
      co2Saved,
      energySaved
    };
  }, [orders]);

  const handleRefresh = () => {
    refetchOrders();
    showSuccess('Data refreshed successfully');
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await updateOrderStatusMutation.mutateAsync({
        id: orderId,
        status: newStatus,
        note: `Status updated to ${newStatus} by ${user?.role}`
      });
      showSuccess('Order status updated successfully');
    } catch (error) {
      showError('Failed to update order status');
    }
  };

  const handleAssignPickupBoy = async (orderId: string, pickupBoyId: string) => {
    if (!pickupBoyId) return;
    
    try {
      await assignPickupBoyMutation.mutateAsync({
        id: orderId,
        pickupBoyId
      });
      showSuccess('Pickup boy assigned successfully');
    } catch (error) {
      showError('Failed to assign pickup boy');
    }
  };

  const getStatusColor = (status: string) => {
    const statusInfo = ORDER_STATUS.find(s => s.value === status);
    return statusInfo ? statusInfo.color : '#6b7280';
  };

  const getStatusLabel = (status: string) => {
    const statusInfo = ORDER_STATUS.find(s => s.value === status);
    return statusInfo ? statusInfo.label : status;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'processing':
      case 'picked_up': return <Package className="h-4 w-4" />;
      case 'in_transit':
      case 'assigned': return <Truck className="h-4 w-4" />;
      case 'pending':
      case 'confirmed': return <Clock className="h-4 w-4" />;
      case 'cancelled': return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const recentOrders = orders
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10);

  if (ordersLoading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome, {user?.firstName || 'User'}!
          </h1>
          <p className="text-gray-600">
            {isAdmin 
              ? 'Here\'s an overview of all e-waste recycling activity' 
              : 'Here\'s an overview of your e-waste recycling activity'
            }
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-3">
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          {!isAdmin && (
            <Link to="/dashboard/request">
              <Button variant="primary">
                <Package className="mr-2 h-5 w-5" />
                Request New Pickup
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card variant="elevated" className="p-6">
          <div className="flex items-center">
            <div className="bg-blue-100 text-blue-600 p-3 rounded-full mr-4">
              <Package className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">
                {isAdmin ? 'Total Orders' : 'Total Pickups'}
              </p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
              <p className="text-xs text-blue-600">All time</p>
            </div>
          </div>
        </Card>

        <Card variant="elevated" className="p-6">
          <div className="flex items-center">
            <div className="bg-amber-100 text-amber-600 p-3 rounded-full mr-4">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">
                {isAdmin ? 'Pending Orders' : 'Active Pickups'}
              </p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingOrders}</p>
              <p className="text-xs text-amber-600">In progress</p>
            </div>
          </div>
        </Card>

        <Card variant="elevated" className="p-6">
          <div className="flex items-center">
            <div className="bg-green-100 text-green-600 p-3 rounded-full mr-4">
              <Truck className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completedOrders}</p>
              <p className="text-xs text-green-600">Successfully processed</p>
            </div>
          </div>
        </Card>

        <Card variant="elevated" className="p-6">
          <div className="flex items-center">
            <div className="bg-purple-100 text-purple-600 p-3 rounded-full mr-4">
              <Activity className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Items Recycled</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalItemsProcessed}</p>
              <p className="text-xs text-purple-600">Total items</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Earnings Card */}
      {stats.totalEarnings > 0 && (
        <Card variant="elevated" className="p-6 mb-8 bg-gradient-to-r from-green-50 to-blue-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-green-500 p-3 rounded-full mr-4">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {isAdmin ? 'Total Revenue' : 'Total Earnings'}
                </p>
                <p className="text-3xl font-bold text-green-600">₹{stats.totalEarnings.toLocaleString()}</p>
                <p className="text-sm text-gray-500">From {stats.completedOrders} completed orders</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Average per order</p>
              <p className="text-lg font-semibold text-gray-700">
                ₹{stats.completedOrders > 0 ? Math.round(stats.totalEarnings / stats.completedOrders).toLocaleString() : 0}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Recent Orders */}
      <Card variant="elevated" className="mb-8">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900">
            {isAdmin ? 'Recent Orders' : 'Recent Pickups'}
          </h2>
          <Link 
            to={isAdmin ? "/dashboard" : "/dashboard/pickups"} 
            className="text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            View all {isAdmin ? 'orders' : 'pickups'}
          </Link>
        </div>
        
        {ordersError ? (
          <div className="p-6 text-center">
            <p className="text-red-600">Failed to load {isAdmin ? 'orders' : 'pickups'}</p>
            <Button variant="outline" size="sm" onClick={handleRefresh} className="mt-2">
              Try Again
            </Button>
          </div>
        ) : recentOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order Details
                  </th>
                  {isAdmin && (
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                  )}
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  {isAdmin && (
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Assignment
                    </th>
                  )}
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentOrders.map((order: any) => (
                  <tr key={order._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{order.orderNumber}</div>
                        <div className="text-sm text-gray-500">
                          {order.items.length} item(s) - {formatDate(order.createdAt)}
                        </div>
                      </div>
                    </td>
                    {isAdmin && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {order.customerId?.firstName} {order.customerId?.lastName}
                        </div>
                        <div className="text-sm text-gray-500">{order.customerId?.email}</div>
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(order.status)}
                        <span 
                          className="ml-2 px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full"
                          style={{ 
                            backgroundColor: `${getStatusColor(order.status)}20`,
                            color: getStatusColor(order.status)
                          }}
                        >
                          {getStatusLabel(order.status)}
                        </span>
                      </div>
                    </td>
                    {isAdmin && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        {order.assignedPickupBoy ? (
                          <div className="text-sm">
                            <div className="flex items-center text-green-700">
                              <UserCheck className="h-4 w-4 mr-1" />
                              {order.assignedPickupBoy.firstName} {order.assignedPickupBoy.lastName}
                            </div>
                          </div>
                        ) : (
                          <Select
                            options={[
                              { value: '', label: 'Assign Pickup Boy' },
                              ...pickupBoys.map(boy => ({ 
                                value: boy._id, 
                                label: `${boy.firstName} ${boy.lastName}` 
                              }))
                            ]}
                            onChange={(e) => handleAssignPickupBoy(order._id, e.target.value)}
                          />
                        )}
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ₹{(order.pricing?.actualTotal || order.pricing?.estimatedTotal || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Link to={`/dashboard/pickups/${order._id}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        {isAdmin && (
                          <Select
                            options={[
                              { value: '', label: 'Update Status' },
                              { value: 'confirmed', label: 'Confirm' },
                              { value: 'assigned', label: 'Assign' },
                              { value: 'in_transit', label: 'In Transit' },
                              { value: 'picked_up', label: 'Picked Up' },
                              { value: 'processing', label: 'Processing' },
                              { value: 'completed', label: 'Complete' },
                              { value: 'cancelled', label: 'Cancel' }
                            ]}
                            onChange={(e) => {
                              if (e.target.value) {
                                handleUpdateOrderStatus(order._id, e.target.value);
                                e.target.value = '';
                              }
                            }}
                          />
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 text-center">
            <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">
              {isAdmin ? 'No orders yet' : 'No pickup requests yet'}
            </p>
            {!isAdmin && (
              <Link to="/dashboard/request">
                <Button variant="primary" size="sm">
                  <Package className="mr-2 h-4 w-4" />
                  Request Your First Pickup
                </Button>
              </Link>
            )}
          </div>
        )}
      </Card>

      {/* Environmental Impact */}
      {!isAdmin && (
        <Card variant="elevated">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Your Environmental Impact</h2>
          </div>
          <div className="p-6">
            {stats.totalItemsProcessed > 0 ? (
              <div className="flex flex-col md:flex-row gap-8">
                <div className="flex-1 text-center p-6 bg-green-50 rounded-lg">
                  <svg className="mx-auto h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <div className="mt-3 text-xl font-bold text-gray-900">{stats.totalItemsProcessed}</div>
                  <div className="mt-1 text-sm text-gray-600">Items Recycled</div>
                </div>
                <div className="flex-1 text-center p-6 bg-blue-50 rounded-lg">
                  <svg className="mx-auto h-12 w-12 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <div className="mt-3 text-xl font-bold text-gray-900">{stats.energySaved} kWh</div>
                  <div className="mt-1 text-sm text-gray-600">Energy Saved (Est.)</div>
                </div>
                <div className="flex-1 text-center p-6 bg-purple-50 rounded-lg">
                  <svg className="mx-auto h-12 w-12 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <div className="mt-3 text-xl font-bold text-gray-900">{stats.co2Saved} kg</div>
                  <div className="mt-1 text-sm text-gray-600">CO₂ Emissions Prevented (Est.)</div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <p className="text-gray-500 mt-4">Start recycling to see your environmental impact!</p>
              </div>
            )}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                {stats.totalItemsProcessed > 0 
                  ? "Thank you for contributing to a greener planet!" 
                  : "Every small step towards recycling makes a big difference for our planet."
                }
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default UserDashboard;