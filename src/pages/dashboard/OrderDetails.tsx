// src/pages/dashboard/OrderDetails.tsx
// Order Details Page - Detailed view of a specific pickup order
// Features: real-time order data, order timeline, item details, pickup information, status tracking

import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft,
  Package,
  MapPin,
  Calendar,
  Clock,
  Phone,
  User,
  CheckCircle,
  Truck,
  Copy,
  Download,
  XCircle,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { ORDER_STATUS } from '../../config';
import { useOrder, useCancelOrder } from '../../hooks/useOrders';
import { useToast } from '../../hooks/useToast';

const OrderDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  // API Hooks
  const { data: orderData, isLoading, error, refetch } = useOrder(id!);
  const cancelOrderMutation = useCancelOrder();

  const order = orderData?.data;

  const getStatusInfo = (status: string) => {
    const statusConfig = ORDER_STATUS.find(s => s.value === status);
    return statusConfig || { label: status, color: '#6b7280' };
  };

  const getTimeSlotLabel = (timeSlot: string) => {
    const slots = {
      morning: 'Morning (9 AM - 12 PM)',
      afternoon: 'Afternoon (12 PM - 4 PM)',
      evening: 'Evening (4 PM - 7 PM)'
    };
    return slots[timeSlot as keyof typeof slots] || timeSlot;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showSuccess('PIN copied to clipboard');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'in_transit':
      case 'assigned':
        return <Truck className="h-4 w-4 text-blue-500" />;
      case 'processing':
        return <Package className="h-4 w-4 text-purple-500" />;
      case 'picked_up':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Clock className="h-4 w-4 text-amber-500" />;
    }
  };

  const handleCancelOrder = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) {
      return;
    }

    try {
      await cancelOrderMutation.mutateAsync({
        id: order._id,
        reason: 'Cancelled by customer'
      });
      showSuccess('Order cancelled successfully');
    } catch (error: any) {
      showError(error.response?.data?.message || 'Failed to cancel order');
    }
  };

  const handleRefresh = () => {
    refetch();
    showSuccess('Order details refreshed');
  };

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  if (error || !order) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          {error ? 'Failed to Load Order' : 'Order Not Found'}
        </h2>
        <p className="text-gray-600 mb-6">
          {error ? 'Unable to fetch order details. Please try again.' : 'The requested order could not be found.'}
        </p>
        <div className="space-x-3">
          <Button variant="outline" onClick={() => navigate('/dashboard/pickups')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Button>
          {error && (
            <Button variant="primary" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/dashboard/pickups')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Order #{order.orderNumber}</h1>
            <p className="text-gray-600">
              Created on {formatDate(order.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <span 
            className="px-3 py-1 text-sm font-medium rounded-full"
            style={{ 
              backgroundColor: `${getStatusInfo(order.status).color}20`,
              color: getStatusInfo(order.status).color 
            }}
          >
            {getStatusInfo(order.status).label}
          </span>
          {(order.status === 'pending' || order.status === 'confirmed') && (
            <Button 
              variant="danger" 
              size="sm" 
              onClick={handleCancelOrder}
              loading={cancelOrderMutation.isLoading}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Cancel Order
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <Card variant="elevated">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Items ({order.items.length})</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {order.items.map((item: any, index: number) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <div className="flex-1">
                        <div className="flex items-start space-x-3">
                          <Package className="h-5 w-5 text-gray-400 mt-1" />
                          <div>
                            <h3 className="font-medium text-gray-900">
                              {item.brand && item.model ? `${item.brand} ${item.model}` : 'E-waste Item'}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {item.categoryId?.name || 'Unknown Category'}
                              {item.subcategory && ` - ${item.subcategory}`}
                            </p>
                            <div className="flex items-center space-x-4 mt-2">
                              <span className="text-sm text-gray-500">
                                Condition: <span className="font-medium capitalize">{item.condition}</span>
                              </span>
                              <span className="text-sm text-gray-500">
                                Quantity: <span className="font-medium">{item.quantity}</span>
                              </span>
                            </div>
                            {item.description && (
                              <p className="text-sm text-gray-600 mt-2">{item.description}</p>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 md:mt-0 md:ml-6 text-right">
                        <div className="text-sm text-gray-500">Estimated</div>
                        <div className="text-lg font-semibold text-gray-900">₹{item.estimatedPrice?.toLocaleString() || 0}</div>
                        {item.finalPrice && (
                          <>
                            <div className="text-sm text-gray-500 mt-1">Final</div>
                            <div className="text-lg font-semibold text-green-600">₹{item.finalPrice.toLocaleString()}</div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Pickup Details */}
          <Card variant="elevated">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Pickup Details</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <MapPin className="h-5 w-5 text-gray-400 mt-1" />
                    <div>
                      <h3 className="font-medium text-gray-900">Pickup Address</h3>
                      <p className="text-gray-600 mt-1">
                        {order.pickupDetails.address.street}<br />
                        {order.pickupDetails.address.city}, {order.pickupDetails.address.state}<br />
                        Pincode: {order.pickupDetails.address.pincode}
                      </p>
                      {order.pickupDetails.address.landmark && (
                        <p className="text-sm text-gray-500 mt-1">
                          Landmark: {order.pickupDetails.address.landmark}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <Phone className="h-5 w-5 text-gray-400 mt-1" />
                    <div>
                      <h3 className="font-medium text-gray-900">Contact Number</h3>
                      <p className="text-gray-600 mt-1">{order.pickupDetails.contactNumber}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Calendar className="h-5 w-5 text-gray-400 mt-1" />
                    <div>
                      <h3 className="font-medium text-gray-900">Scheduled Date</h3>
                      <p className="text-gray-600 mt-1">
                        {formatDate(order.pickupDetails.preferredDate)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Clock className="h-5 w-5 text-gray-400 mt-1" />
                    <div>
                      <h3 className="font-medium text-gray-900">Time Slot</h3>
                      <p className="text-gray-600 mt-1">
                        {getTimeSlotLabel(order.pickupDetails.timeSlot)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {order.pickupDetails.specialInstructions && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">Special Instructions</h3>
                  <p className="text-gray-600">{order.pickupDetails.specialInstructions}</p>
                </div>
              )}
            </div>
          </Card>

          {/* Order Timeline */}
          <Card variant="elevated">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Order Timeline</h2>
            </div>
            <div className="p-6">
              <div className="flow-root">
                <ul className="-mb-8">
                  {order.timeline?.map((event: any, eventIdx: number) => (
                    <li key={eventIdx}>
                      <div className="relative pb-8">
                        {eventIdx !== order.timeline.length - 1 ? (
                          <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" />
                        ) : null}
                        <div className="relative flex space-x-3">
                          <div>
                            <span className={`
                              h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white
                              ${eventIdx === order.timeline.length - 1 ? 'bg-green-500' : 'bg-gray-400'}
                            `}>
                              {getStatusIcon(event.status)}
                            </span>
                          </div>
                          <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                            <div>
                              <p className="text-sm text-gray-500">
                                Status changed to{' '}
                                <span className="font-medium text-gray-900 capitalize">
                                  {getStatusInfo(event.status).label}
                                </span>
                              </p>
                              {event.note && (
                                <p className="text-sm text-gray-600 mt-1">{event.note}</p>
                              )}
                            </div>
                            <div className="text-right text-sm whitespace-nowrap text-gray-500">
                              {formatDateTime(event.timestamp)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  )) || (
                    <li className="text-center py-4 text-gray-500">
                      No timeline events available
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Summary */}
          <Card variant="elevated">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Order Summary</h2>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Estimated Total:</span>
                  <span className="font-medium">₹{order.pricing?.estimatedTotal?.toLocaleString() || 0}</span>
                </div>
                {order.pricing?.actualTotal && order.pricing.actualTotal > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Actual Total:</span>
                    <span className="font-medium text-green-600">₹{order.pricing.actualTotal.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Pickup Charges:</span>
                  <span className="font-medium text-green-600">
                    {(order.pricing?.pickupCharges || 0) === 0 ? 'FREE' : `₹${order.pricing.pickupCharges}`}
                  </span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-900">Final Amount:</span>
                    <span className="font-bold text-green-600">
                      ₹{(order.pricing?.finalAmount || order.pricing?.actualTotal || order.pricing?.estimatedTotal || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Pickup Boy Info */}
          {order.assignedPickupBoy && (
            <Card variant="elevated">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Pickup Boy</h2>
              </div>
              <div className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">
                      {order.assignedPickupBoy.firstName} {order.assignedPickupBoy.lastName}
                    </h3>
                    <p className="text-sm text-gray-600">{order.assignedPickupBoy.phone}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <Button variant="outline" size="sm" fullWidth>
                    <Phone className="h-4 w-4 mr-2" />
                    Call Pickup Boy
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* PIN Display */}
          {(order.status === 'assigned' || order.status === 'in_transit') && 
           order.pinVerification && !order.pinVerification.isVerified && (
            <Card variant="elevated">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Pickup PIN</h2>
              </div>
              <div className="p-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900 font-mono mb-2">
                    {order.pinVerification.pin}
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Share this PIN with the pickup boy for verification
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    fullWidth
                    onClick={() => copyToClipboard(order.pinVerification.pin)}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy PIN
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Actions */}
          <Card variant="elevated">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Actions</h2>
            </div>
            <div className="p-6 space-y-3">
              <Button variant="outline" size="sm" fullWidth>
                <Download className="h-4 w-4 mr-2" />
                Download Receipt
              </Button>
              {order.status === 'completed' && (
                <Button variant="outline" size="sm" fullWidth>
                  Rate & Review
                </Button>
              )}
              <Button variant="outline" size="sm" fullWidth>
                Contact Support
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;