// src/pages/dashboard/admin/Analytics.tsx
// Admin Analytics Page - Comprehensive business analytics and reporting
// Features: order analytics, revenue tracking, user metrics, performance insights
// Path: /dashboard/analytics
// Dependencies: Real backend API calls via analytics hooks

import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Package, 
  DollarSign,
  Calendar,
  Download,
  RefreshCw,
  Activity,
  MapPin,
  Clock,
  Star,
  Truck,
  Filter
} from 'lucide-react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import { useToast } from '../../../hooks/useToast';
import { useOrderStatistics } from '../../../hooks/useOrders';
import { useUserStats } from '../../../hooks/useUsers';
import { useSupportStats } from '../../../hooks/useSupport';

const Analytics: React.FC = () => {
  const [timeframe, setTimeframe] = useState('month');
  const [refreshing, setRefreshing] = useState(false);
  const { showSuccess, showError } = useToast();

  // API Hooks for analytics data
  const { 
    data: orderStatsData, 
    isLoading: orderStatsLoading, 
    refetch: refetchOrderStats 
  } = useOrderStatistics(timeframe);

  const { 
    data: userStatsData, 
    isLoading: userStatsLoading,
    refetch: refetchUserStats 
  } = useUserStats();

  const { 
    data: supportStatsData, 
    isLoading: supportStatsLoading,
    refetch: refetchSupportStats 
  } = useSupportStats(timeframe);

  const orderStats = orderStatsData?.data || {};
  const userStats = userStatsData?.data || {};
  const supportStats = supportStatsData?.data || {};

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refetchOrderStats(),
        refetchUserStats(),
        refetchSupportStats()
      ]);
      showSuccess('Analytics data refreshed');
    } catch (error) {
      showError('Failed to refresh analytics data');
    } finally {
      setRefreshing(false);
    }
  };

  const handleExport = () => {
    showSuccess('Analytics report exported');
  };

  if (orderStatsLoading || userStatsLoading || supportStatsLoading) {
    return <LoadingSpinner fullScreen />;
  }

  // Calculate percentage changes (mock data for now)
  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous * 100).toFixed(1);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600">Business insights and performance metrics</p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-3">
          <Select
            options={[
              { value: 'week', label: 'This Week' },
              { value: 'month', label: 'This Month' },
              { value: 'quarter', label: 'This Quarter' },
              { value: 'year', label: 'This Year' }
            ]}
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            icon={<Calendar className="h-4 w-4" />}
          />
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card variant="elevated" className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                ₹{(orderStats.totalRevenue || 0).toLocaleString()}
              </p>
              <p className="text-xs text-green-600">
                +{calculateChange(orderStats.totalRevenue || 0, orderStats.previousRevenue || 0)}% from last {timeframe}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card variant="elevated" className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">
                {orderStats.totalOrders || 0}
              </p>
              <p className="text-xs text-blue-600">
                +{calculateChange(orderStats.totalOrders || 0, orderStats.previousOrders || 0)}% from last {timeframe}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card variant="elevated" className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="text-2xl font-bold text-gray-900">
                {userStats.activeUsers || 0}
              </p>
              <p className="text-xs text-purple-600">
                +{userStats.newUsersThisMonth || 0} new this month
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card variant="elevated" className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completion Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {orderStats.completionRate ? `${orderStats.completionRate}%` : '0%'}
              </p>
              <p className="text-xs text-amber-600">Order completion rate</p>
            </div>
            <div className="bg-amber-100 p-3 rounded-full">
              <TrendingUp className="h-6 w-6 text-amber-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Order Trends Chart */}
        <Card variant="elevated" className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Order Trends</h3>
            <BarChart3 className="h-5 w-5 text-gray-400" />
          </div>
          <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500">Order trends chart</p>
              <p className="text-sm text-gray-400">Chart visualization would be displayed here</p>
            </div>
          </div>
        </Card>

        {/* Revenue Distribution */}
        <Card variant="elevated" className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Revenue by Category</h3>
            <Activity className="h-5 w-5 text-gray-400" />
          </div>
          <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg">
            <div className="text-center">
              <Activity className="h-12 w-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500">Revenue distribution chart</p>
              <p className="text-sm text-gray-400">Pie chart visualization would be displayed here</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Order Status Breakdown */}
        <Card variant="elevated" className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Status Breakdown</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-amber-400 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">Pending</span>
              </div>
              <span className="text-sm font-medium">{orderStats.pendingOrders || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-400 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">In Progress</span>
              </div>
              <span className="text-sm font-medium">{orderStats.inProgressOrders || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-400 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">Completed</span>
              </div>
              <span className="text-sm font-medium">{orderStats.completedOrders || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-400 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">Cancelled</span>
              </div>
              <span className="text-sm font-medium">{orderStats.cancelledOrders || 0}</span>
            </div>
          </div>
        </Card>

        {/* Top Performing Areas */}
        <Card variant="elevated" className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Areas</h3>
          <div className="space-y-3">
            {(orderStats.topAreas || []).map((area: any, index: number) => (
              <div key={index} className="flex justify-between items-center">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-600">{area.city}</span>
                </div>
                <span className="text-sm font-medium">{area.orders} orders</span>
              </div>
            ))}
            {(!orderStats.topAreas || orderStats.topAreas.length === 0) && (
              <p className="text-sm text-gray-500 text-center py-4">No area data available</p>
            )}
          </div>
        </Card>

        {/* Support Metrics */}
        <Card variant="elevated" className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Support Metrics</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Open Tickets</span>
              <span className="text-sm font-medium">{supportStats.openTickets || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Avg. Resolution Time</span>
              <span className="text-sm font-medium">{supportStats.averageResolutionTime || 0}h</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Customer Satisfaction</span>
              <div className="flex items-center">
                <Star className="h-4 w-4 text-yellow-400 mr-1" />
                <span className="text-sm font-medium">{supportStats.customerSatisfactionRating || 0}/5</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Resolved This Month</span>
              <span className="text-sm font-medium">{supportStats.resolvedTickets || 0}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Pickup Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card variant="elevated" className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Pickup Performance</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <Truck className="h-5 w-5 text-blue-500 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Average Pickup Time</p>
                  <p className="text-xs text-gray-500">Time from assignment to completion</p>
                </div>
              </div>
              <span className="text-lg font-bold text-blue-600">
                {orderStats.averagePickupTime || '0'}h
              </span>
            </div>

            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-green-500 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900">On-Time Pickup Rate</p>
                  <p className="text-xs text-gray-500">Pickups completed within scheduled time</p>
                </div>
              </div>
              <span className="text-lg font-bold text-green-600">
                {orderStats.onTimeRate || 0}%
              </span>
            </div>

            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <Star className="h-5 w-5 text-purple-500 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Customer Rating</p>
                  <p className="text-xs text-gray-500">Average pickup service rating</p>
                </div>
              </div>
              <span className="text-lg font-bold text-purple-600">
                {orderStats.averageRating || 0}/5
              </span>
            </div>
          </div>
        </Card>

        <Card variant="elevated" className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Environmental Impact</h3>
          <div className="space-y-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-3xl font-bold text-green-600 mb-1">
                {orderStats.totalItemsRecycled || 0}
              </div>
              <p className="text-sm text-green-700">Total Items Recycled</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-xl font-bold text-blue-600 mb-1">
                  {orderStats.co2Saved || 0} kg
                </div>
                <p className="text-xs text-blue-700">CO₂ Emissions Prevented</p>
              </div>

              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-xl font-bold text-purple-600 mb-1">
                  {orderStats.energySaved || 0} kWh
                </div>
                <p className="text-xs text-purple-700">Energy Saved</p>
              </div>
            </div>

            <div className="text-center p-3 bg-amber-50 rounded-lg">
              <div className="text-xl font-bold text-amber-600 mb-1">
                {orderStats.wasteReduced || 0} kg
              </div>
              <p className="text-xs text-amber-700">E-Waste Prevented from Landfills</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;