// src/pages/dashboard/admin/AssignmentDashboard.tsx
// Assignment Dashboard - Complete pickup assignment management system with REAL API integration
// Features: pending orders, pickup boy availability, manual/auto assignment, performance tracking
// Path: /dashboard/admin/assignments
// Dependencies: Real backend API calls via assignment service

import React, { useState, useContext } from 'react';
import { 
  Truck, 
  Package, 
  MapPin, 
  Clock, 
  UserCheck,
  TrendingUp,
  Zap,
  RefreshCw,
  Search,
  Filter,
  Download,
  Settings,
  AlertCircle,
  CheckCircle,
  Play,
  Users,
  Activity,
  Target,
  Award,
  Navigation,
  Phone
} from 'lucide-react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import AuthContext from '../../../context/AuthContext';
import { useToast } from '../../../hooks/useToast';

// Import real API hooks
import {
  useAssignmentDashboardData,
  useAssignSingleOrder,
  useBulkAssignOrders,
  useAutoAssignOrders,
  useSendAssignmentNotification,
  useExportAssignments
} from '../../../hooks/useAssignment';

const AssignmentDashboard: React.FC = () => {
  const { user } = useContext(AuthContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [cityFilter, setCityFilter] = useState('all');
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [selectedPickupBoy, setSelectedPickupBoy] = useState<string>('');
  const [autoAssignSettings, setAutoAssignSettings] = useState({
    maxAssignments: 10,
    city: 'all',
    enabled: false
  });
  const { showSuccess, showError } = useToast();

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

  // Real API hooks
  const {
    pendingOrders,
    pickupBoys,
    availabilitySummary,
    statistics,
    isLoading,
    error,
    refetch
  } = useAssignmentDashboardData({
    city: cityFilter !== 'all' ? cityFilter : undefined,
    date: new Date().toISOString().split('T')[0]
  });

  const assignSingleOrderMutation = useAssignSingleOrder();
  const bulkAssignMutation = useBulkAssignOrders();
  const autoAssignMutation = useAutoAssignOrders();
  const sendNotificationMutation = useSendAssignmentNotification();
  const exportAssignmentsMutation = useExportAssignments();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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

  const getAvailabilityColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'busy': return 'bg-amber-100 text-amber-800';
      case 'overloaded': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAvailabilityIcon = (status: string) => {
    switch (status) {
      case 'available': return <CheckCircle className="h-4 w-4" />;
      case 'busy': return <Clock className="h-4 w-4" />;
      case 'overloaded': return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const handleOrderSelect = (orderId: string) => {
    setSelectedOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const handleSelectAllOrders = () => {
    if (selectedOrders.length === filteredOrders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(filteredOrders.map(order => order._id));
    }
  };

  const handleManualAssign = async (orderId: string, pickupBoyId: string) => {
    try {
      await assignSingleOrderMutation.mutateAsync({ orderId, pickupBoyId });
      showSuccess('Order assigned successfully');
    } catch (error: any) {
      showError(error.response?.data?.message || 'Failed to assign order');
    }
  };

  const handleBulkAssign = async () => {
    if (selectedOrders.length === 0 || !selectedPickupBoy) {
      showError('Please select orders and pickup boy');
      return;
    }

    try {
      const assignments = {
        assignments: selectedOrders.map(orderId => ({
          orderId,
          pickupBoyId: selectedPickupBoy
        }))
      };

      const result = await bulkAssignMutation.mutateAsync(assignments);
      showSuccess(`${result.data.successful} orders assigned successfully`);
      
      if (result.data.failed > 0) {
        showError(`${result.data.failed} orders failed to assign`);
      }

      setSelectedOrders([]);
      setSelectedPickupBoy('');
    } catch (error: any) {
      showError(error.response?.data?.message || 'Failed to bulk assign orders');
    }
  };

  const handleAutoAssign = async () => {
    if (!autoAssignSettings.enabled) {
      showError('Please enable auto-assignment first');
      return;
    }

    try {
      const params = {
        maxAssignments: autoAssignSettings.maxOrders,
        city: autoAssignSettings.city !== 'all' ? autoAssignSettings.city : undefined
      };

      const result = await autoAssignMutation.mutateAsync(params);
      showSuccess(`Auto-assigned ${result.data.assigned} orders successfully`);
    } catch (error: any) {
      showError(error.response?.data?.message || 'Failed to auto-assign orders');
    }
  };

  const handleExport = async () => {
    try {
      await exportAssignmentsMutation.mutateAsync({
        city: cityFilter !== 'all' ? cityFilter : undefined,
        format: 'csv'
      });
      showSuccess('Assignment data exported successfully');
    } catch (error: any) {
      showError('Failed to export assignment data');
    }
  };

  const handleRefresh = () => {
    refetch();
    showSuccess('Data refreshed');
  };

  const filteredOrders = pendingOrders.filter(order => {
    const matchesSearch = searchTerm === '' || 
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerId.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerId.lastName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCity = cityFilter === 'all' || order.pickupDetails.address.city === cityFilter;
    
    return matchesSearch && matchesCity;
  });

  const availablePickupBoys = pickupBoys.filter(boy => boy.workload.canTakeNewOrder);

  // Loading state
  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  // Error state
  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Failed to Load Assignment Data</h2>
        <p className="text-gray-600 mb-6">
          {error?.response?.data?.message || 'Unable to connect to the assignment system.'}
        </p>
        <div className="space-y-2">
          <p className="text-sm text-gray-500">
            Please ensure the assignment service is running and try again.
          </p>
          <Button variant="primary" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Assignment Dashboard</h1>
          <p className="text-gray-600">Manage pickup assignments and optimize routes</p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh} 
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleExport}
            loading={exportAssignmentsMutation.isLoading}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card variant="elevated" className="p-6">
          <div className="flex items-center">
            <div className="bg-amber-100 text-amber-600 p-3 rounded-full mr-4">
              <Package className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Assignments</p>
              <p className="text-2xl font-bold text-gray-900">{pendingOrders.length}</p>
              <p className="text-xs text-amber-600">Need assignment</p>
            </div>
          </div>
        </Card>

        <Card variant="elevated" className="p-6">
          <div className="flex items-center">
            <div className="bg-blue-100 text-blue-600 p-3 rounded-full mr-4">
              <UserCheck className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Today Assigned</p>
              <p className="text-2xl font-bold text-gray-900">{statistics?.todayAssigned || 0}</p>
              <p className="text-xs text-blue-600">Manual + Auto</p>
            </div>
          </div>
        </Card>

        <Card variant="elevated" className="p-6">
          <div className="flex items-center">
            <div className="bg-green-100 text-green-600 p-3 rounded-full mr-4">
              <Zap className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Auto-Assigned</p>
              <p className="text-2xl font-bold text-gray-900">{statistics?.autoAssignedToday || 0}</p>
              <p className="text-xs text-green-600">Smart assignment</p>
            </div>
          </div>
        </Card>

        <Card variant="elevated" className="p-6">
          <div className="flex items-center">
            <div className="bg-purple-100 text-purple-600 p-3 rounded-full mr-4">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Assignment Time</p>
              <p className="text-2xl font-bold text-gray-900">{statistics?.averageAssignmentTime || '0 min'}</p>
              <p className="text-xs text-purple-600">Processing time</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Auto Assignment Panel */}
      <Card variant="elevated" className="p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Zap className="h-6 w-6 text-green-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Auto Assignment</h2>
          </div>
          <div className="flex items-center space-x-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={autoAssignSettings.enabled}
                onChange={(e) => setAutoAssignSettings(prev => ({ ...prev, enabled: e.target.checked }))}
                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <span className="ml-2 text-sm text-gray-600">Enable Auto Assignment</span>
            </label>
            <Button 
              variant="primary" 
              onClick={handleAutoAssign}
              disabled={!autoAssignSettings.enabled}
              loading={autoAssignMutation.isLoading}
            >
              <Play className="h-4 w-4 mr-2" />
              Run Auto Assignment
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select
            label="City Filter"
            options={[
              { value: 'all', label: 'All Cities' },
              { value: 'Rajahmundry', label: 'Rajahmundry' },
              { value: 'Kakinada', label: 'Kakinada' }
            ]}
            value={autoAssignSettings.city}
            onChange={(e) => setAutoAssignSettings(prev => ({ ...prev, city: e.target.value }))}
          />
          <Input
            label="Max Assignments"
            type="number"
            min="1"
            max="50"
            value={autoAssignSettings.maxOrders.toString()}
            onChange={(e) => setAutoAssignSettings(prev => ({ ...prev, maxOrders: parseInt(e.target.value) }))}
          />
          <div className="flex items-end">
            <div className="text-sm text-gray-600">
              {availablePickupBoys.length} pickup boys available for assignment
              {availabilitySummary && (
                <div className="text-xs text-gray-500 mt-1">
                  Available: {availabilitySummary.available}, Busy: {availabilitySummary.busy}
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Orders */}
        <div className="lg:col-span-2">
          <Card variant="elevated">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  Pending Orders ({filteredOrders.length})
                </h2>
                {selectedOrders.length > 0 && (
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-gray-600">{selectedOrders.length} selected</span>
                    <Select
                      options={[
                        { value: '', label: 'Assign to...' },
                        ...availablePickupBoys.map(boy => ({ 
                          value: boy._id, 
                          label: `${boy.firstName} ${boy.lastName}` 
                        }))
                      ]}
                      value={selectedPickupBoy}
                      onChange={(e) => setSelectedPickupBoy(e.target.value)}
                    />
                    <Button 
                      variant="primary" 
                      size="sm" 
                      onClick={handleBulkAssign}
                      loading={bulkAssignMutation.isLoading}
                    >
                      Assign Selected
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Input
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  icon={<Search className="h-4 w-4" />}
                />
                <Select
                  options={[
                    { value: 'all', label: 'All Cities' },
                    { value: 'Rajahmundry', label: 'Rajahmundry' },
                    { value: 'Kakinada', label: 'Kakinada' }
                  ]}
                  value={cityFilter}
                  onChange={(e) => setCityFilter(e.target.value)}
                  icon={<Filter className="h-4 w-4" />}
                />
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedOrders.length === filteredOrders.length && filteredOrders.length > 0}
                    onChange={handleSelectAllOrders}
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <span className="ml-2 text-sm text-gray-600">Select All</span>
                </div>
              </div>

              <div className="space-y-4">
                {filteredOrders.map((order) => (
                  <div key={order._id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <input
                          type="checkbox"
                          checked={selectedOrders.includes(order._id)}
                          onChange={() => handleOrderSelect(order._id)}
                          className="mt-1 rounded border-gray-300 text-green-600 focus:ring-green-500"
                        />
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="font-medium text-gray-900">{order.orderNumber}</h3>
                            <span className="px-2 py-1 text-xs font-medium bg-amber-100 text-amber-800 rounded-full">
                              Pending Assignment
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                            <div className="flex items-start space-x-2">
                              <MapPin className="h-4 w-4 text-gray-400 mt-1" />
                              <div className="text-sm">
                                <p className="font-medium text-gray-700">
                                  {order.customerId.firstName} {order.customerId.lastName}
                                </p>
                                <p className="text-gray-600">
                                  {order.pickupDetails.address.street}<br />
                                  {order.pickupDetails.address.city} - {order.pickupDetails.address.pincode}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-start space-x-2">
                              <Clock className="h-4 w-4 text-gray-400 mt-1" />
                              <div className="text-sm">
                                <p className="font-medium text-gray-700">Preferred Schedule:</p>
                                <p className="text-gray-600">
                                  {formatDate(order.pickupDetails.preferredDate)}<br />
                                  {getTimeSlotLabel(order.pickupDetails.timeSlot)}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <div className="flex items-center">
                              <Package className="h-4 w-4 mr-1" />
                              <span>{order.items.length} item(s)</span>
                            </div>
                            <div className="flex items-center">
                              <TrendingUp className="h-4 w-4 mr-1" />
                              <span>₹{order.pricing.estimatedTotal.toLocaleString()}</span>
                            </div>
                            <div className="text-xs text-gray-500">
                              Created: {formatDate(order.createdAt)}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="ml-4 flex flex-col space-y-2">
                        <Select
                          options={[
                            { value: '', label: 'Assign to...' },
                            ...availablePickupBoys.map(boy => ({ 
                              value: boy._id, 
                              label: `${boy.firstName} ${boy.lastName}` 
                            }))
                          ]}
                          onChange={(e) => {
                            if (e.target.value) {
                              handleManualAssign(order._id, e.target.value);
                              e.target.value = '';
                            }
                          }}
                          disabled={assignSingleOrderMutation.isLoading}
                        />
                        <Button variant="outline" size="sm">
                          <Phone className="h-4 w-4 mr-2" />
                          Call Customer
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}

                {filteredOrders.length === 0 && (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No pending orders found</p>
                    <p className="text-sm text-gray-400 mt-2">
                      {pendingOrders.length === 0 
                        ? "All orders have been assigned"
                        : "Try adjusting your search or filters"
                      }
                    </p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Pickup Boys Panel */}
        <div>
          <Card variant="elevated">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Available Pickup Boys ({availablePickupBoys.length})
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {pickupBoys.map((boy) => (
                  <div key={boy._id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {boy.firstName} {boy.lastName}
                        </h3>
                        <p className="text-sm text-gray-600">{boy.phone}</p>
                        <p className="text-xs text-gray-500">
                          {boy.address.city} - {boy.address.pincode}
                        </p>
                      </div>
                      <div className="flex items-center">
                        {getAvailabilityIcon(boy.workload.availabilityStatus)}
                        <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getAvailabilityColor(boy.workload.availabilityStatus)}`}>
                          {boy.workload.availabilityStatus.charAt(0).toUpperCase() + boy.workload.availabilityStatus.slice(1)}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Active Orders:</span>
                        <span className="font-medium">{boy.workload.activeOrders}/{boy.workload.maxCapacity}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${(boy.workload.activeOrders / boy.workload.maxCapacity) * 100}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Today's Pickups:</span>
                        <span className="font-medium">{boy.workload.todayOrders}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Weekly Completions:</span>
                        <span className="font-medium">{boy.performance.weeklyCompletions}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <div className="flex items-center">
                          <Award className="h-4 w-4 text-yellow-500 mr-1" />
                          <span className="text-gray-600">Efficiency:</span>
                        </div>
                        <span className={`font-medium ${
                          boy.performance.efficiency === 'high' ? 'text-green-600' :
                          boy.performance.efficiency === 'medium' ? 'text-amber-600' : 'text-red-600'
                        }`}>
                          {boy.performance.efficiency.charAt(0).toUpperCase() + boy.performance.efficiency.slice(1)}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 flex space-x-2">
                      <Button variant="outline" size="sm" fullWidth>
                        <Navigation className="h-4 w-4 mr-2" />
                        View Route
                      </Button>
                      <Button variant="outline" size="sm" fullWidth>
                        <Activity className="h-4 w-4 mr-2" />
                        Performance
                      </Button>
                    </div>
                  </div>
                ))}

                {pickupBoys.length === 0 && (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No pickup boys available</p>
                    <p className="text-sm text-gray-400 mt-2">
                      Please check the pickup boy management system
                    </p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AssignmentDashboard;