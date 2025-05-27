// src/pages/dashboard/SupportTicketDetails.tsx (Continued from previous)
// Support Ticket Details - Complete ticket conversation and management with REAL API integration

import React, { useState, useContext, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft,
  MessageCircle,
  User,
  Clock,
  Star,
  Send,
  Paperclip,
  Phone,
  Mail,
  Package,
  Calendar,
  Flag,
  Edit,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Settings,
  Download,
  RefreshCw,
  Tag,
  UserPlus,
  X
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import TextArea from '../../components/ui/TextArea';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import AuthContext from '../../context/AuthContext';
import { useToast } from '../../hooks/useToast';

// Import real API hooks
import {
  useSupportTicket,
  useAddTicketMessage,
  useUpdateTicketStatus,
  useAssignSupportTicket,
  useRateSupportTicket
} from '../../hooks/useSupport';
import { useUsers } from '../../hooks/useUsers';

const SupportTicketDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [newMessage, setNewMessage] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [showRatingModal, setShowRatingModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showSuccess, showError } = useToast();

  const isAdmin = user?.role === 'admin' || user?.role === 'manager';
  const isCustomer = user?.role === 'customer';

  // Real API hooks
  const { 
    data: ticketData, 
    isLoading: ticketLoading, 
    error: ticketError, 
    refetch: refetchTicket 
  } = useSupportTicket(id!, {
    onError: (error) => {
      console.error('Failed to load ticket:', error);
      showError('Failed to load support ticket');
    }
  });

  const { 
    data: usersData 
  } = useUsers({ role: 'admin,manager' }, { enabled: isAdmin });

  const addMessageMutation = useAddTicketMessage();
  const updateStatusMutation = useUpdateTicketStatus();
  const assignTicketMutation = useAssignSupportTicket();
  const rateTicketMutation = useRateSupportTicket();

  const ticket = ticketData?.data;
  const teamMembers = usersData?.data || [];

  useEffect(() => {
    scrollToBottom();
  }, [ticket?.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-amber-100 text-amber-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'waiting_customer': return 'bg-purple-100 text-purple-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryLabel = (category: string) => {
    const categories = {
      order_issue: 'Order Issue',
      payment_issue: 'Payment Issue',
      pickup_issue: 'Pickup Issue',
      account_issue: 'Account Issue',
      general_inquiry: 'General Inquiry',
      complaint: 'Complaint',
      feedback: 'Feedback'
    };
    return categories[category as keyof typeof categories] || category;
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() && attachments.length === 0) {
      showError('Please enter a message or attach a file');
      return;
    }

    try {
      await addMessageMutation.mutateAsync({
        id: ticket._id,
        data: {
          message: newMessage,
          isInternal,
          attachments: attachments.map(file => file.name)
        }
      });

      setNewMessage('');
      setAttachments([]);
      setIsInternal(false);
      showSuccess('Message sent successfully');
    } catch (error: any) {
      showError(error.response?.data?.message || 'Failed to send message');
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    try {
      await updateStatusMutation.mutateAsync({
        id: ticket._id,
        status: newStatus
      });
      showSuccess('Ticket status updated successfully');
    } catch (error: any) {
      showError(error.response?.data?.message || 'Failed to update status');
    }
  };

  const handleAssignment = async (assignedTo: string) => {
    try {
      await assignTicketMutation.mutateAsync({
        id: ticket._id,
        assignedTo
      });
      showSuccess('Ticket assigned successfully');
    } catch (error: any) {
      showError(error.response?.data?.message || 'Failed to assign ticket');
    }
  };

  const handleFileAttachment = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length + attachments.length > 5) {
      showError('Maximum 5 files allowed');
      return;
    }
    setAttachments(prev => [...prev, ...files]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleRefresh = () => {
    refetchTicket();
    showSuccess('Ticket refreshed');
  };

  const handleRateTicket = async () => {
    if (rating === 0) {
      showError('Please select a rating');
      return;
    }

    try {
      await rateTicketMutation.mutateAsync({
        id: ticket._id,
        rating,
        feedback
      });
      setShowRatingModal(false);
      setRating(0);
      setFeedback('');
      showSuccess('Thank you for your feedback!');
    } catch (error: any) {
      showError(error.response?.data?.message || 'Failed to submit rating');
    }
  };

  // Loading state
  if (ticketLoading) {
    return <LoadingSpinner fullScreen />;
  }

  // Error state
  if (ticketError || !ticket) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          {ticketError ? 'Failed to Load Ticket' : 'Ticket Not Found'}
        </h2>
        <p className="text-gray-600 mb-6">
          {ticketError ? 'Unable to fetch ticket details. Please try again.' : 'The requested ticket could not be found.'}
        </p>
        <div className="space-x-3">
          <Button variant="outline" onClick={() => navigate('/dashboard/support')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tickets
          </Button>
          {ticketError && (
            <Button variant="primary" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          )}
        </div>
      </div>
    );
  }

  const filteredMessages = isAdmin 
    ? ticket.messages 
    : ticket.messages.filter(msg => !msg.isInternal);

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/dashboard/support')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tickets
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Ticket #{ticket.ticketNumber}
            </h1>
            <p className="text-gray-600">{ticket.subject}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          {isAdmin && (
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Conversation */}
        <div className="lg:col-span-2">
          <Card variant="elevated">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Conversation</h2>
                <div className="flex items-center space-x-2">
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(ticket.status)}`}>
                    {ticket.status.replace('_', ' ').toUpperCase()}
                  </span>
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${getPriorityColor(ticket.priority)}`}>
                    {ticket.priority.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="p-6 max-h-96 overflow-y-auto">
              <div className="space-y-4">
                {filteredMessages.map((message: any) => (
                  <div key={message._id} className={`flex ${
                    message.senderId._id === user?._id ? 'justify-end' : 'justify-start'
                  }`}>
                    <div className={`max-w-xs lg:max-w-md ${
                      message.senderId._id === user?._id 
                        ? 'bg-green-500 text-white' 
                        : message.isInternal 
                          ? 'bg-yellow-100 border border-yellow-300' 
                          : 'bg-gray-100'
                    } rounded-lg p-4`}>
                      <div className="flex items-center space-x-2 mb-2">
                        <User className="h-4 w-4" />
                        <span className="text-sm font-medium">
                          {message.senderId.firstName} {message.senderId.lastName}
                        </span>
                        {message.isInternal && isAdmin && (
                          <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded">
                            Internal
                          </span>
                        )}
                      </div>
                      <p className="text-sm mb-2">{message.message}</p>
                      {message.attachments && message.attachments.length > 0 && (
                        <div className="mt-2">
                          {message.attachments.map((attachment: string, index: number) => (
                            <div key={index} className="flex items-center text-xs">
                              <Paperclip className="h-3 w-3 mr-1" />
                              <span>{attachment}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="text-xs opacity-75 mt-2">
                        {formatDate(message.timestamp)}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Message Composer */}
            {ticket.status !== 'closed' && (
              <div className="px-6 py-4 border-t border-gray-200">
                <div className="space-y-4">
                  {/* Attachments Preview */}
                  {attachments.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {attachments.map((file, index) => (
                        <div key={index} className="flex items-center bg-gray-100 rounded px-3 py-1 text-sm">
                          <Paperclip className="h-4 w-4 mr-1" />
                          <span className="truncate max-w-32">{file.name}</span>
                          <button 
                            onClick={() => removeAttachment(index)}
                            className="ml-2 text-red-500 hover:text-red-700"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <TextArea
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    rows={3}
                  />
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileAttachment}
                        multiple
                        className="hidden"
                      />
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Paperclip className="h-4 w-4 mr-2" />
                        Attach Files
                      </Button>
                      
                      {isAdmin && (
                        <label className="flex items-center text-sm">
                          <input
                            type="checkbox"
                            checked={isInternal}
                            onChange={(e) => setIsInternal(e.target.checked)}
                            className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                          />
                          <span className="ml-2">Internal note</span>
                          {isInternal && <EyeOff className="h-4 w-4 ml-1" />}
                        </label>
                      )}
                    </div>
                    
                    <Button 
                      variant="primary"
                      onClick={handleSendMessage}
                      loading={addMessageMutation.isLoading}
                      disabled={!newMessage.trim() && attachments.length === 0}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Send Message
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Ticket Information */}
          <Card variant="elevated">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Ticket Information</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Category</label>
                <p className="text-sm text-gray-900">{getCategoryLabel(ticket.category)}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">Priority</label>
                <div className="mt-1">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(ticket.priority)}`}>
                    {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Status</label>
                <div className="mt-1">
                  {isAdmin ? (
                    <Select
                      options={[
                        { value: 'open', label: 'Open' },
                        { value: 'in_progress', label: 'In Progress' },
                        { value: 'waiting_customer', label: 'Waiting for Customer' },
                        { value: 'resolved', label: 'Resolved' },
                        { value: 'closed', label: 'Closed' }
                      ]}
                      value={ticket.status}
                      onChange={(e) => handleStatusUpdate(e.target.value)}
                    />
                  ) : (
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(ticket.status)}`}>
                      {ticket.status.replace('_', ' ').toUpperCase()}
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Created</label>
                <p className="text-sm text-gray-900">{formatDate(ticket.createdAt)}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Last Activity</label>
                <p className="text-sm text-gray-900">{formatDate(ticket.lastActivityAt)}</p>
              </div>

              {ticket.tags && ticket.tags.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Tags</label>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {ticket.tags.map((tag: string, index: number) => (
                      <span 
                        key={index}
                        className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Customer Information */}
          <Card variant="elevated">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Customer Information</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">
                    {ticket.customerId.firstName} {ticket.customerId.lastName}
                  </h3>
                  <p className="text-sm text-gray-600">{ticket.customerId.email}</p>
                </div>
              </div>
              
              <div className="flex items-center text-sm text-gray-600">
                <Phone className="h-4 w-4 mr-2" />
                {ticket.customerId.phone}
              </div>
              
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" fullWidth>
                  <Phone className="h-4 w-4 mr-2" />
                  Call
                </Button>
                <Button variant="outline" size="sm" fullWidth>
                  <Mail className="h-4 w-4 mr-2" />
                  Email
                </Button>
              </div>
            </div>
          </Card>

          {/* Related Order */}
          {ticket.orderId && (
            <Card variant="elevated">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Related Order</h2>
              </div>
              <div className="p-6">
                <div className="flex items-center space-x-3">
                  <Package className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">
                      Order #{ticket.orderId.orderNumber}
                    </p>
                    <Link 
                      to={`/dashboard/pickups/${ticket.orderId._id}`}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      View Order Details
                    </Link>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Assignment (Admin only) */}
          {isAdmin && (
            <Card variant="elevated">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Assignment</h2>
              </div>
              <div className="p-6">
                {ticket.assignedTo ? (
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {ticket.assignedTo.firstName} {ticket.assignedTo.lastName}
                      </p>
                      <p className="text-sm text-gray-600">{ticket.assignedTo.email}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 mb-4">Not assigned</p>
                )}
                
                <Select
                  options={[
                    { value: '', label: 'Assign to...' },
                    ...teamMembers.map(member => ({
                      value: member._id,
                      label: `${member.firstName} ${member.lastName}`
                    }))
                  ]}
                  onChange={(e) => {
                    if (e.target.value) {
                      handleAssignment(e.target.value);
                    }
                  }}
                  disabled={assignTicketMutation.isLoading}
                />
              </div>
            </Card>
          )}

          {/* Customer Rating */}
          {isCustomer && ticket.status === 'resolved' && !ticket.customerRating && (
            <Card variant="elevated">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Rate Support</h2>
              </div>
              <div className="p-6">
                <p className="text-sm text-gray-600 mb-4">
                  How satisfied are you with the support you received?
                </p>
                <Button 
                  variant="primary" 
                  fullWidth
                  onClick={() => setShowRatingModal(true)}
                >
                  <Star className="h-4 w-4 mr-2" />
                  Rate Support
                </Button>
              </div>
            </Card>
          )}

          {/* Display Customer Rating */}
          {ticket.customerRating && (
            <Card variant="elevated">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Customer Rating</h2>
              </div>
              <div className="p-6">
                <div className="flex items-center mb-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-5 w-5 ${
                          star <= ticket.customerRating.rating
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="ml-2 text-sm font-medium">
                    {ticket.customerRating.rating}/5
                  </span>
                </div>
                {ticket.customerRating.feedback && (
                  <p className="text-sm text-gray-600 italic">
                    "{ticket.customerRating.feedback}"
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  Rated on {formatDate(ticket.customerRating.ratedAt)}
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Rating Modal */}
      {showRatingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Rate Support</h3>
            
            <div className="mb-4">
              <label className="text-sm font-medium text-gray-600">Rating</label>
              <div className="flex space-x-1 mt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className={`text-2xl ${
                      star <= rating ? 'text-yellow-400' : 'text-gray-300'
                    } hover:text-yellow-400 transition-colors`}
                  >
                    <Star className={star <= rating ? 'fill-current' : ''} />
                  </button>
                ))}
              </div>
            </div>

            <TextArea
              label="Feedback (Optional)"
              placeholder="Tell us about your experience..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={3}
            />

            <div className="flex space-x-3 mt-6">
              <Button
                variant="outline"
                fullWidth
                onClick={() => {
                  setShowRatingModal(false);
                  setRating(0);
                  setFeedback('');
                }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                fullWidth
                onClick={handleRateTicket}
                loading={rateTicketMutation.isLoading}
              >
                Submit Rating
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupportTicketDetails;