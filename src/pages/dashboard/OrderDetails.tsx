// src/pages/dashboard/OrderDetails.tsx
// Order Details Page - Detailed view of a specific pickup order
// Features: order timeline, item details, pickup information, status tracking

import React, { useState, useEffect } from 'react';
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
  AlertCircle
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { ORDER_STATUS } from '../../config';

const OrderDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Mock data - replace with actual API call
  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        const mockOrder = {
          id: id,
          orderNumber: `EW${id?.padStart(6, '0')}`,
          status: 'in_transit',
          createdAt: '2023-06-15T10:30:00Z',
          items: [
            {
              id: '1',
              categoryName: 'Mobile Phones',
              subcategory: 'Smartphones',
              brand: 'Apple',
              model: 'iPhone 12',
              condition: 'good',
              quantity: 1,
              estimatedPrice: 8000,
              finalPrice: 7500,
              description: '64GB, minor scratches on back'
            },
            {
              id: '2',
              categoryName: 'Laptops',
              subcategory: 'Business Laptops',
              brand: 'Dell',
              model: 'Latitude 7420',
              condition: 'excellent',
              quantity: 1,
              estimatedPrice: 15000,
              finalPrice: 14000,
              description: 'i5 processor, 8GB RAM, 256GB SSD'
            }
          ],
          pickupDetails: {
            address: {
              street: '123 Main Street, Apartment 4B',
              city: 'Mumbai',
              state: 'Maharashtra',
              pincode: '400001',
              landmark: 'Near City Mall'
            },
            preferredDate: '2023-06-16',
            timeSlot: 'morning',
            contactNumber: '+91-98765-43210',
            specialInstructions: 'Please call before arriving. Building has security.'
          },
          pricing: {
            estimatedTotal: 23000,
            actualTotal: 21500,
            pickupCharges: 0,
            finalAmount: 21500
          },
          assignedPickupBoy: {
            id: 'pb1',
            firstName: 'Raj',
            lastName: 'Kumar',
            phone: '+91-98765-43211',
            avatar: null
          },
          pinVerification: {
            pin: '123456',
            isVerified: false
          },
          timeline: [
            {
              status: 'pending',
              timestamp: '2023-06-15T10:30:00Z',
              note: 'Order created',
              updatedBy: 'customer'
            },
            {
              status: 'confirmed',
              timestamp: '2023-06-15T11:15:00Z',
              note: 'Order confirmed and scheduled for pickup',
              updatedBy: 'admin'
            },
            {
              status: 'assigned',
              timestamp: '2023-06-15T14:30:00Z',
              note: 'Assigned to Raj Kumar',
              updatedBy: 'manager'
            },
            {
              status: 'in_transit',
              timestamp: '2023-06-16T09:15:00Z',
              note: 'Pickup boy is on the way',
              updatedBy: 'pickup_boy'
            }
          ]
        };
        setOrder(mockOrder);
        setLoading(false);
      }, 1000);
    };

    if (id) {
      fetchOrder();
    }
  }, [id]);

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
    // Add toast notification here
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

  const handleCancelOrder = () => {
    // Add confirmation dialog and API call
    console.log('Cancelling order:', id);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Order Not Found</h2>
        <p className="text-gray-600 mb-6">The requested order could not be found.</p>
        <Link to="/dashboard/pickups">
          <Button variant="primary">Back to Orders</Button>
        </Link>
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
            <Button variant="danger" size="sm" onClick={handleCancelOrder}>
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
                {order.items.map((item: any) => (
                  <div key={item.id} className="border rounded-lg p-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <div className="flex-1">
                        <div className="flex items-start space-x-3">
                          <Package className="h-5 w-5 text-gray-400 mt-1" />
                          <div>
                            <h3 className="font-medium text-gray-900">
                              {item.brand} {item.model}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {item.categoryName} - {item.subcategory}
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
                        <div className="text-lg font-semibold text-gray-900">₹{item.estimatedPrice}</div>
                        {item.finalPrice && (
                          <>
                            <div className="text-sm text-gray-500 mt-1">Final</div>
                            <div className="text-lg font-semibold text-green-600">₹{item.finalPrice}</div>
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
                  {order.timeline.map((event: any, eventIdx: number) => (
                    <li key={eventIdx}>
                      <div className="relative pb-8">
                        {eventIdx !== order.timeline.length - 1 ? (
                          <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" />
                        ) : null}
                        <div className="relative flex space-x-3">
                          <div>
                            <span className={`
                              h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white
                              ${eventIdx === 0 ? 'bg-green-500' : 'bg-gray-400'}
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
                  ))}
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
                  <span className="font-medium">₹{order.pricing.estimatedTotal}</span>
                </div>
                {order.pricing.actualTotal && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Actual Total:</span>
                    <span className="font-medium text-green-600">₹{order.pricing.actualTotal}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Pickup Charges:</span>
                  <span className="font-medium text-green-600">
                    {order.pricing.pickupCharges === 0 ? 'FREE' : `₹${order.pricing.pickupCharges}`}
                  </span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-900">Final Amount:</span>
                    <span className="font-bold text-green-600">
                      ₹{order.pricing.finalAmount || order.pricing.estimatedTotal}
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
          {(order.status === 'assigned' || order.status === 'in_transit') && !order.pinVerification.isVerified && (
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