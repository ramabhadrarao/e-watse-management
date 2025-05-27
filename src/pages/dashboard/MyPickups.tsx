// src/pages/dashboard/MyPickups.tsx
// My Pickups Dashboard Page - Displays user's pickup orders with filtering and status tracking
// Features: status filtering, order details, pickup tracking, order actions

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Truck, Clock, CheckCircle, XCircle, Eye, Calendar, MapPin, Phone, Copy } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import { ORDER_STATUS } from '../../config';

const MyPickups: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // Mock data - replace with actual API call
  const pickups = [
    {
      id: 'EW000123',
      orderNumber: 'EW000123',
      date: '2023-06-15',
      status: 'completed',
      items: [
        { categoryName: 'Mobile Phones', quantity: 2, condition: 'good' },
        { categoryName: 'Laptops', quantity: 1, condition: 'fair' }
      ],
      pickupAddress: {
        street: '123 Main Street',
        city: 'Mumbai',
        pincode: '400001'
      },
      estimatedAmount: 1200,
      finalAmount: 1150,
      pickupDate: '2023-06-16',
      timeSlot: 'morning',
      pin: '123456',
      assignedPickupBoy: {
        name: 'Raj Kumar',
        phone: '+91-98765-43210'
      }
    },
    {
      id: 'EW000145',
      orderNumber: 'EW000145',
      date: '2023-06-18',
      status: 'in_transit',
      items: [
        { categoryName: 'Desktop Computers', quantity: 1, condition: 'excellent' },
        { categoryName: 'Printers', quantity: 1, condition: 'good' }
      ],
      pickupAddress: {
        street: '456 Park Avenue',
        city: 'Mumbai',
        pincode: '400002'
      },
      estimatedAmount: 2500,
      finalAmount: null,
      pickupDate: '2023-06-20',
      timeSlot: 'afternoon',
      pin: '789012',
      assignedPickupBoy: {
        name: 'Amit Sharma',
        phone: '+91-98765-43211'
      }
    },
    {
      id: 'EW000167',
      orderNumber: 'EW000167',
      date: '2023-06-20',
      status: 'confirmed',
      items: [
        { categoryName: 'Mobile Phones', quantity: 3, condition: 'poor' },
        { categoryName: 'Batteries', quantity: 5, condition: 'broken' }
      ],
      pickupAddress: {
        street: '789 Garden Road',
        city: 'Mumbai',
        pincode: '400003'
      },
      estimatedAmount: 800,
      finalAmount: null,
      pickupDate: '2023-06-22',
      timeSlot: 'evening',
      pin: '345678'
    }
  ];

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
    // You can add a toast notification here
  };

  const filteredPickups = pickups.filter(pickup => 
    statusFilter === 'all' || pickup.status === statusFilter
  );

  const sortedPickups = [...filteredPickups].sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    } else {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
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

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Pickups</h1>
          <p className="text-gray-600">Track and manage your e-waste pickup orders</p>
        </div>
        <div className="mt-4 md:mt-0">
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
              Showing {sortedPickups.length} of {pickups.length} orders
            </div>
          </div>
        </div>
      </Card>

      {/* Pickups List */}
      <div className="space-y-6">
        {sortedPickups.map((pickup) => (
          <Card key={pickup.id} variant="elevated" className="overflow-hidden">
            <div className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                <div className="flex-1">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(pickup.status)}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Order #{pickup.orderNumber}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Ordered on {new Date(pickup.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span 
                      className="px-3 py-1 text-xs font-medium rounded-full"
                      style={{ 
                        backgroundColor: `${getStatusInfo(pickup.status).color}20`,
                        color: getStatusInfo(pickup.status).color 
                      }}
                    >
                      {getStatusInfo(pickup.status).label}
                    </span>
                  </div>

                  {/* Items */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Items:</h4>
                    <div className="flex flex-wrap gap-2">
                      {pickup.items.map((item, index) => (
                        <span 
                          key={index}
                          className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                        >
                          {item.quantity}x {item.categoryName} ({item.condition})
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
                          {pickup.pickupAddress.street}, {pickup.pickupAddress.city} - {pickup.pickupAddress.pincode}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-2">
                      <Calendar className="h-4 w-4 text-gray-400 mt-1" />
                      <div className="text-sm">
                        <p className="font-medium text-gray-700">Pickup Schedule:</p>
                        <p className="text-gray-600">
                          {new Date(pickup.pickupDate).toLocaleDateString()} - {pickup.timeSlot}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-sm">
                      <span className="text-gray-600">Estimated Amount: </span>
                      <span className="font-semibold text-gray-900">₹{pickup.estimatedAmount}</span>
                    </div>
                    {pickup.finalAmount && (
                      <div className="text-sm">
                        <span className="text-gray-600">Final Amount: </span>
                        <span className="font-semibold text-green-600">₹{pickup.finalAmount}</span>
                      </div>
                    )}
                  </div>

                  {/* Pickup Boy Info */}
                  {pickup.assignedPickupBoy && (
                    <div className="bg-blue-50 rounded-lg p-3 mb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Truck className="h-4 w-4 text-blue-600" />
                          <div className="text-sm">
                            <p className="font-medium text-blue-900">Pickup Boy Assigned:</p>
                            <p className="text-blue-700">{pickup.assignedPickupBoy.name}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4 text-blue-600" />
                          <span className="text-sm text-blue-700">{pickup.assignedPickupBoy.phone}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* PIN Display */}
                  {pickup.status === 'assigned' || pickup.status === 'in_transit' ? (
                    <div className="bg-amber-50 rounded-lg p-3 mb-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-amber-900">Pickup PIN:</p>
                          <p className="text-lg font-bold text-amber-700 font-mono">{pickup.pin}</p>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => copyToClipboard(pickup.pin)}
                        >
                          <Copy className="h-4 w-4 mr-1" />
                          Copy
                        </Button>
                      </div>
                      <p className="text-xs text-amber-600 mt-1">
                        Share this PIN with the pickup boy for verification
                      </p>
                    </div>
                  ) : null}
                </div>

                {/* Actions */}
                <div className="mt-4 lg:mt-0 lg:ml-6 flex flex-col space-y-2">
                  <Link to={`/dashboard/pickups/${pickup.id}`}>
                    <Button variant="outline" size="sm" fullWidth>
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </Button>
                  </Link>
                  {pickup.status === 'pending' || pickup.status === 'confirmed' ? (
                    <Button variant="danger" size="sm" fullWidth>
                      <XCircle className="mr-2 h-4 w-4" />
                      Cancel Order
                    </Button>
                  ) : null}
                </div>
              </div>
            </div>
          </Card>
        ))}

        {sortedPickups.length === 0 && (
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