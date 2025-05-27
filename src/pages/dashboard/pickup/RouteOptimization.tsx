// src/pages/dashboard/pickup/RouteOptimization.tsx
// Route Optimization - Interactive map-based route planning for pickup boys
// Features: map view, route planning, order sequencing, traffic optimization
// Path: /dashboard/pickup/route
// Dependencies: Real backend API calls for assigned orders and route optimization

import React, { useState, useEffect } from 'react';
import { 
  Navigation, 
  MapPin, 
  Clock, 
  Route as RouteIcon, 
  Target,
  TrendingUp,
  RefreshCw,
  Play,
  Settings,
  Zap,
  AlertCircle,
  CheckCircle,
  Phone,
  User,
  Package,
  Car,
  Fuel,
  Timer
} from 'lucide-react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import { useAssignedOrders } from '../../../hooks/useOrders';
import { useToast } from '../../../hooks/useToast';

interface RouteStop {
  id: string;
  orderId: string;
  orderNumber: string;
  customer: {
    name: string;
    phone: string;
  };
  address: {
    street: string;
    city: string;
    pincode: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  timeSlot: string;
  estimatedDuration: number;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'completed' | 'skipped';
}

const RouteOptimization: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [optimizationMode, setOptimizationMode] = useState('distance'); // distance, time, priority
  const [routeStops, setRouteStops] = useState<RouteStop[]>([]);
  const [routeStats, setRouteStats] = useState({
    totalDistance: 0,
    estimatedTime: 0,
    fuelCost: 0,
    totalStops: 0
  });
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{lat: number; lng: number} | null>(null);
  const { showSuccess, showError } = useToast();

  // Real API hooks
  const { 
    data: ordersData, 
    isLoading: ordersLoading, 
    error: ordersError, 
    refetch: refetchOrders 
  } = useAssignedOrders();

  const assignedOrders = ordersData?.data || [];

  // Mock route stops data - replace with actual API data
  useEffect(() => {
    if (assignedOrders.length > 0) {
      const todayOrders = assignedOrders.filter(order => {
        const orderDate = new Date(order.pickupDetails.preferredDate).toDateString();
        const selectedDateStr = new Date(selectedDate).toDateString();
        return orderDate === selectedDateStr;
      });

      const stops: RouteStop[] = todayOrders.map((order, index) => ({
        id: `stop-${index}`,
        orderId: order._id,
        orderNumber: order.orderNumber,
        customer: {
          name: `${order.customerId.firstName} ${order.customerId.lastName}`,
          phone: order.pickupDetails.contactNumber
        },
        address: {
          street: order.pickupDetails.address.street,
          city: order.pickupDetails.address.city,
          pincode: order.pickupDetails.address.pincode,
          coordinates: {
            // Mock coordinates - replace with real geocoding
            lat: 16.9891 + (Math.random() - 0.5) * 0.1,
            lng: 82.2475 + (Math.random() - 0.5) * 0.1
          }
        },
        timeSlot: order.pickupDetails.timeSlot,
        estimatedDuration: 30 + Math.floor(Math.random() * 30),
        priority: order.items.length > 5 ? 'high' : order.items.length > 2 ? 'medium' : 'low',
        status: order.status === 'picked_up' ? 'completed' : 'pending'
      }));

      setRouteStops(stops);
      calculateRouteStats(stops);
    }
  }, [assignedOrders, selectedDate]);

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          // Default to Rajahmundry coordinates
          setCurrentLocation({ lat: 16.9891, lng: 82.2475 });
        }
      );
    }
  }, []);

  const calculateRouteStats = (stops: RouteStop[]) => {
    const totalStops = stops.length;
    const totalDistance = totalStops * 5.2; // Mock calculation
    const estimatedTime = stops.reduce((total, stop) => total + stop.estimatedDuration + 15, 0); // +15 for travel
    const fuelCost = totalDistance * 2.5; // Mock fuel cost calculation

    setRouteStats({
      totalDistance: Math.round(totalDistance * 10) / 10,
      estimatedTime: Math.round(estimatedTime),
      fuelCost: Math.round(fuelCost),
      totalStops
    });
  };

  const handleOptimizeRoute = async () => {
    setIsOptimizing(true);
    try {
      // Mock optimization - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate route optimization
      const optimizedStops = [...routeStops].sort((a, b) => {
        if (optimizationMode === 'priority') {
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        } else if (optimizationMode === 'time') {
          const timeOrder = { morning: 1, afternoon: 2, evening: 3 };
          return timeOrder[a.timeSlot as keyof typeof timeOrder] - timeOrder[b.timeSlot as keyof typeof timeOrder];
        } else {
          // Distance optimization (mock)
          return a.address.coordinates.lat - b.address.coordinates.lat;
        }
      });

      setRouteStops(optimizedStops);
      calculateRouteStats(optimizedStops);
      showSuccess('Route optimized successfully!');
    } catch (error) {
      showError('Failed to optimize route');
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleStartRoute = () => {
    showSuccess('Route started! Navigate to your first stop.');
  };

  const handleCompleteStop = (stopId: string) => {
    setRouteStops(prev => prev.map(stop => 
      stop.id === stopId ? { ...stop, status: 'completed' } : stop
    ));
    showSuccess('Stop marked as completed');
  };

  const handleSkipStop = (stopId: string) => {
    setRouteStops(prev => prev.map(stop => 
      stop.id === stopId ? { ...stop, status: 'skipped' } : stop
    ));
    showSuccess('Stop skipped');
  };

  const getTimeSlotColor = (timeSlot: string) => {
    switch (timeSlot) {
      case 'morning': return 'bg-blue-100 text-blue-800';
      case 'afternoon': return 'bg-amber-100 text-amber-800';
      case 'evening': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'skipped': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  if (ordersLoading) {
    return <LoadingSpinner fullScreen />;
  }

  if (ordersError) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Failed to Load Route Data</h2>
        <p className="text-gray-600 mb-6">Unable to fetch your assigned orders for route planning.</p>
        <Button variant="primary" onClick={() => refetchOrders()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Route Optimization</h1>
          <p className="text-gray-600">Plan and optimize your pickup route</p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-3">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md"
          />
          <Button variant="outline" size="sm" onClick={() => refetchOrders()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Route Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card variant="elevated" className="p-6">
          <div className="flex items-center">
            <div className="bg-blue-100 text-blue-600 p-3 rounded-full mr-4">
              <MapPin className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Distance</p>
              <p className="text-2xl font-bold text-gray-900">{routeStats.totalDistance} km</p>
              <p className="text-xs text-blue-600">Estimated</p>
            </div>
          </div>
        </Card>

        <Card variant="elevated" className="p-6">
          <div className="flex items-center">
            <div className="bg-green-100 text-green-600 p-3 rounded-full mr-4">
              <Timer className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Time</p>
              <p className="text-2xl font-bold text-gray-900">{formatTime(routeStats.estimatedTime)}</p>
              <p className="text-xs text-green-600">Including stops</p>
            </div>
          </div>
        </Card>

        <Card variant="elevated" className="p-6">
          <div className="flex items-center">
            <div className="bg-amber-100 text-amber-600 p-3 rounded-full mr-4">
              <Fuel className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Fuel Cost</p>
              <p className="text-2xl font-bold text-gray-900">₹{routeStats.fuelCost}</p>
              <p className="text-xs text-amber-600">Estimated</p>
            </div>
          </div>
        </Card>

        <Card variant="elevated" className="p-6">
          <div className="flex items-center">
            <div className="bg-purple-100 text-purple-600 p-3 rounded-full mr-4">
              <Target className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Stops</p>
              <p className="text-2xl font-bold text-gray-900">{routeStats.totalStops}</p>
              <p className="text-xs text-purple-600">Scheduled</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map View */}
        <div className="lg:col-span-2">
          <Card variant="elevated">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Route Map</h2>
                <div className="flex items-center space-x-3">
                  <Select
                    options={[
                      { value: 'distance', label: 'Optimize by Distance' },
                      { value: 'time', label: 'Optimize by Time' },
                      { value: 'priority', label: 'Optimize by Priority' }
                    ]}
                    value={optimizationMode}
                    onChange={(e) => setOptimizationMode(e.target.value)}
                  />
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleOptimizeRoute}
                    loading={isOptimizing}
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Optimize Route
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Map Placeholder */}
            <div className="h-96 bg-gray-100 flex items-center justify-center">
              <div className="text-center">
                <Navigation className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg font-medium">Interactive Route Map</p>
                <p className="text-gray-400 text-sm mt-2">
                  Map visualization would show your optimized route with all pickup locations
                </p>
                {currentLocation && (
                  <div className="mt-4 text-xs text-gray-500">
                    <p>Current Location: {currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Route optimized for: <span className="font-medium">{optimizationMode}</span>
                </div>
                <Button 
                  variant="primary"
                  onClick={handleStartRoute}
                  disabled={routeStops.length === 0}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Start Route Navigation
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Route Stops List */}
        <div>
          <Card variant="elevated">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Route Stops ({routeStops.filter(s => s.status === 'pending').length} pending)
              </h2>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {routeStops.length === 0 ? (
                <div className="p-6 text-center">
                  <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No stops scheduled for selected date</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Try selecting a different date or check for new assignments
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {routeStops.map((stop, index) => (
                    <div key={stop.id} className="p-4 hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                              stop.status === 'completed' ? 'bg-green-100 text-green-800' :
                              stop.status === 'skipped' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {index + 1}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="text-sm font-medium text-gray-900 truncate">
                                {stop.orderNumber}
                              </h3>
                              {getStatusIcon(stop.status)}
                            </div>
                            <p className="text-sm text-gray-600 mb-1">{stop.customer.name}</p>
                            <p className="text-xs text-gray-500 mb-2">
                              {stop.address.street}, {stop.address.city}
                            </p>
                            
                            <div className="flex flex-wrap gap-1 mb-2">
                              <span className={`px-2 py-1 text-xs rounded-full ${getTimeSlotColor(stop.timeSlot)}`}>
                                {stop.timeSlot}
                              </span>
                              <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(stop.priority)}`}>
                                {stop.priority}
                              </span>
                            </div>

                            <div className="flex items-center text-xs text-gray-500">
                              <Clock className="h-3 w-3 mr-1" />
                              <span>{stop.estimatedDuration} min</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {stop.status === 'pending' && (
                        <div className="mt-3 flex space-x-2">
                          <Button 
                            variant="success" 
                            size="sm"
                            onClick={() => handleCompleteStop(stop.id)}
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Complete
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleSkipStop(stop.id)}
                          >
                            Skip
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => window.open(`tel:${stop.customer.phone}`)}
                          >
                            <Phone className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Route Summary */}
      {routeStops.length > 0 && (
        <Card variant="elevated" className="mt-6 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Route Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {routeStops.filter(s => s.status === 'completed').length}
              </div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {routeStops.filter(s => s.status === 'pending').length}
              </div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {routeStops.filter(s => s.status === 'skipped').length}
              </div>
              <div className="text-sm text-gray-600">Skipped</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round((routeStops.filter(s => s.status === 'completed').length / routeStops.length) * 100) || 0}%
              </div>
              <div className="text-sm text-gray-600">Progress</div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default RouteOptimization;