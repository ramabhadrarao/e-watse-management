// src/pages/dashboard/AdminDashboard.tsx
// Complete Admin Dashboard with Real Data Integration

import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Package, 
  TrendingUp, 
  DollarSign,
  Activity,
  MapPin,
  Settings,
  Eye,
  Edit,
  Trash2,
  Plus,
  Search,
  Filter,
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  Truck,
  UserCheck,
  MessageCircle,
  Bell
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import AuthContext from '../../context/AuthContext';
import { useToast } from '../../hooks/useToast';

// Import API hooks
import { useAllOrders, useUpdateOrderStatus, useAssignPickupBoy } from '../../hooks/useOrders';
import { useCategories } from '../../hooks/useCategories';
import { usePincodes } from '../../hooks/usePincodes';

const AdminDashboard: React.FC = () => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [assigningOrder, setAssigningOrder] = useState<string | null>(null);
  const { showSuccess, showError } = useToast();

  // API Hooks with proper error handling
  const { 
    data: ordersData, 
    isLoading: ordersLoading, 
    refetch: refetchOrders, 
    error: ordersError 
  } = useAllOrders({
    onError: () => showError('Failed to load orders')
  });
  
  const { data: categoriesData, isLoading: categoriesLoading } = useCategories();
  const { data: pincodesData, isLoading: pincodesLoading } = usePincodes();
  
  const updateOrderStatusMutation = useUpdateOrderStatus();
  const assignPickupBoyMutation = useAssignPickupBoy();

  // Mock pickup boys data - replace with actual API call
  const pickupBoys = [
    { _id: 'pickup1', firstName: 'Suresh', lastName: 'Babu', phone: '9876543212' },
    { _id: 'pickup2', firstName: 'Ravi', lastName: 'Kumar', phone: '9876543213' },
    { _id: 'pickup3', firstName: 'Raj', lastName: 'Singh', phone: '9876543214' }
  ];

  // Check if user has admin/manager access
  if (!user || !['admin', 'manager'].includes(user.role)) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
        <p className="text-gray-600">You don't have permission to access this page.</p>
      </div>
    );
  }

  // Auto-refresh orders every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refetchOrders();
    }, 30000);
    return () => clearInterval(interval);
  }, [refetchOrders]);

  // Calculate dashboard statistics
  const calculateStats = () => {
    const orders = ordersData?.data || [];
    const categories = categoriesData?.data || [];
    
    const totalOrders = orders.length;
    const activeOrders = orders.filter(order => 
      !['completed', 'cancelled'].includes(order.status)
    ).length;
    const pendingOrders = orders.filter(order => 
      ['pending', 'confirmed'].includes(order.status)
    ).length;
    
    const totalRevenue = orders
      .filter(order => order.status === 'completed')
      .reduce((sum, order) => sum + (order.pricing?.finalAmount || order.pricing?.estimatedTotal || 0), 0);
    
    const totalItems = orders
      .filter(order => order.status === 'completed')
      .reduce((sum, order) => {
        return sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0);
      }, 0);

    return {
      totalOrders,
      activeOrders,
      pendingOrders,
      totalRevenue,
      totalItems,
      totalCategories: categories.length
    };
  };

  const stats = calculateStats();

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refetchOrders();
      showSuccess('Data refreshed successfully');
    } catch (error) {
      showError('Failed to refresh data');
    } finally {
      setRefreshing(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await updateOrderStatusMutation.mutateAsync({
        id: orderId,
        status: newStatus,
        note: `Status updated to ${newStatus} by ${user.role}`
      });
      showSuccess('Order status updated successfully');
    } catch (error) {
      showError('Failed to update order status');
    }
  };

  const handleAssignPickupBoy = async (orderId: string, pickupBoyId: string) => {
    if (!pickupBoyId) return;
    
    setAssigningOrder(orderId);
    try {
      await assignPickupBoyMutation.mutateAsync({
        id: orderId,
        pickupBoyId
      });
      showSuccess('Pickup boy assigned successfully');
    } catch (error) {
      showError('Failed to assign pickup boy');
    } finally {
      setAssigningOrder(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'processing':
      case 'in_transit':
      case 'picked_up': return 'bg-blue-100 text-blue-800';
      case 'pending':
      case 'confirmed': return 'bg-amber-100 text-amber-800';
      case 'assigned': return 'bg-purple-100 text-purple-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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

  const filteredOrders = ordersData?.data?.filter(order => {
    const matchesSearch = searchTerm === '' || 
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerId?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerId?.lastName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }) || [];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Dashboard Overview</h2>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card variant="elevated" className="p-6">
          <div className="flex items-center">
            <div className="bg-blue-500 p-3 rounded-lg text-white mr-4">
              <Package className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
              <p className="text-sm text-blue-600">All time</p>
            </div>
          </div>
        </Card>

        <Card variant="elevated" className="p-6">
          <div className="flex items-center">
            <div className="bg-amber-500 p-3 rounded-lg text-white mr-4">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Orders</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingOrders}</p>
              <p className="text-sm text-amber-600">Need attention</p>
            </div>
          </div>
        </Card>

        <Card variant="elevated" className="p-6">
          <div className="flex items-center">
            <div className="bg-green-500 p-3 rounded-lg text-white mr-4">
              <DollarSign className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">₹{stats.totalRevenue.toLocaleString()}</p>
              <p className="text-sm text-green-600">Completed orders</p>
            </div>
          </div>
        </Card>

        <Card variant="elevated" className="p-6">
          <div className="flex items-center">
            <div className="bg-purple-500 p-3 rounded-lg text-white mr-4">
              <Activity className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Items Processed</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalItems}</p>
              <p className="text-sm text-purple-600">Total items</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Orders Table */}
      <Card variant="elevated">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
          <Button variant="outline" size="sm" onClick={() => setActiveTab('orders')}>
            View All Orders
          </Button>
        </div>
        
        {ordersLoading ? (
          <div className="p-8">
            <LoadingSpinner />
          </div>
        ) : ordersError ? (
          <div className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <p className="text-red-600 mb-4">Failed to load orders</p>
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              Retry
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {ordersData?.data?.slice(0, 5).map((order) => (
                  <tr key={order._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{order.orderNumber}</div>
                        <div className="text-sm text-gray-500">
                          {order.items.length} item(s) - {formatDate(order.createdAt)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.customerId?.firstName} {order.customerId?.lastName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(order.status)}
                        <span className={`ml-2 px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                          {order.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{order.pricing?.estimatedTotal?.toLocaleString() || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link to={`/dashboard/pickups/${order._id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {(!ordersData?.data || ordersData.data.length === 0) && (
              <div className="p-6 text-center">
                <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No orders found</p>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );

  const renderOrders = () => (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Order Management</h2>
        <div className="mt-4 md:mt-0 flex space-x-3">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <Card variant="elevated" className="p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <Input
              placeholder="Search by order number or customer name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<Search className="h-4 w-4" />}
            />
          </div>
          <Select
            options={[
              { value: 'all', label: 'All Status' },
              { value: 'pending', label: 'Pending' },
              { value: 'confirmed', label: 'Confirmed' },
              { value: 'assigned', label: 'Assigned' },
              { value: 'in_transit', label: 'In Transit' },
              { value: 'picked_up', label: 'Picked Up' },
              { value: 'processing', label: 'Processing' },
              { value: 'completed', label: 'Completed' },
              { value: 'cancelled', label: 'Cancelled' }
            ]}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          />
        </div>

        {ordersLoading ? (
          <LoadingSpinner />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pickup Assignment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{order.orderNumber}</div>
                        <div className="text-sm text-gray-500">
                          {order.items.length} item(s) - {formatDate(order.createdAt)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {order.customerId?.firstName} {order.customerId?.lastName}
                        </div>
                        <div className="text-sm text-gray-500">{order.customerId?.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(order.status)}
                        <span className={`ml-2 px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                          {order.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {order.assignedPickupBoy ? (
                        <div className="text-sm">
                          <div className="flex items-center text-green-700">
                            <UserCheck className="h-4 w-4 mr-1" />
                            {order.assignedPickupBoy.firstName} {order.assignedPickupBoy.lastName}
                          </div>
                          <div className="text-gray-500">{order.assignedPickupBoy.phone}</div>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <Select
                            options={[
                              { value: '', label: 'Assign Pickup Boy' },
                              ...pickupBoys.map(boy => ({ 
                                value: boy._id, 
                                label: `${boy.firstName} ${boy.lastName}` 
                              }))
                            ]}
                            onChange={(e) => handleAssignPickupBoy(order._id, e.target.value)}
                            disabled={assigningOrder === order._id}
                          />
                          {assigningOrder === order._id && (
                            <div className="animate-spin h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent"></div>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{order.pricing?.estimatedTotal?.toLocaleString() || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Link to={`/dashboard/pickups/${order._id}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
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
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredOrders.length === 0 && !ordersLoading && (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No orders found matching your criteria.</p>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );

  const renderSupport = () => (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Support Management</h2>
        <Button variant="primary">
          <MessageCircle className="h-4 w-4 mr-2" />
          View All Tickets
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card variant="elevated" className="p-6">
          <div className="flex items-center">
            <div className="bg-amber-500 p-3 rounded-lg text-white mr-4">
              <MessageCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Open Tickets</p>
              <p className="text-2xl font-bold text-gray-900">0</p>
              <p className="text-sm text-amber-600">Need response</p>
            </div>
          </div>
        </Card>

        <Card variant="elevated" className="p-6">
          <div className="flex items-center">
            <div className="bg-blue-500 p-3 rounded-lg text-white mr-4">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-gray-900">0</p>
              <p className="text-sm text-blue-600">Being handled</p>
            </div>
          </div>
        </Card>

        <Card variant="elevated" className="p-6">
          <div className="flex items-center">
            <div className="bg-green-500 p-3 rounded-lg text-white mr-4">
              <CheckCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Resolved</p>
              <p className="text-2xl font-bold text-gray-900">0</p>
              <p className="text-sm text-green-600">This month</p>
            </div>
          </div>
        </Card>
      </div>

      <Card variant="elevated" className="p-6">
        <div className="text-center py-8">
          <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">Support ticket management</p>
          <p className="text-sm text-gray-400 mb-6">
            View and manage customer support tickets, respond to inquiries, and track resolution status.
          </p>
          <div className="flex justify-center space-x-3">
            <Button variant="outline">
              <MessageCircle className="h-4 w-4 mr-2" />
              View Support Tickets
            </Button>
            <Button variant="primary">
              <Settings className="h-4 w-4 mr-2" />
              Support Settings
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'orders', label: 'Orders' },
    { id: 'support', label: 'Support' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview': return renderOverview();
      case 'orders': return renderOrders();
      case 'support': return renderSupport();
      default: return renderOverview();
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          {user.role === 'admin' ? 'Admin' : 'Manager'} Dashboard
        </h1>
        <p className="text-gray-600">Real-time management of your e-waste platform</p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                py-2 px-1 border-b-2 font-medium text-sm transition-colors
                ${activeTab === tab.id
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {renderTabContent()}
    </div>
  );
};

export default AdminDashboard;