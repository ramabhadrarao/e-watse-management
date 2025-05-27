// src/pages/dashboard/SupportTicketDetails.tsx
// Updated Support Ticket Details - Complete ticket conversation and management with REAL API integration
// Features: ticket conversation, file attachments, status management, customer rating, internal notes
// Path: /dashboard/support/:id
// Dependencies: Real backend API calls via supportService hooks

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
  X,
  FileText,
  Upload,
  Trash2,
  MessageSquare,
  Shield,
  Activity,
  Copy
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
  useRateSupportTicket,
  useUpdateTicketPriority,
  useCloseTicket,
  useReopenTicket,
  useTicketTimeline,
  useUploadTicketAttachment,
  useDeleteTicketAttachment,
  useAddInternalNote
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
  const [internalNote, setInternalNote] = useState('');
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showInternalNoteModal, setShowInternalNoteModal] = useState(false);
  const [expandedMessageId, setExpandedMessageId] = useState<string | null>(null);
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

  const { 
    data: timelineData,
    refetch: refetchTimeline 
  } = useTicketTimeline(id!, { enabled: isAdmin });

  // Mutations
  const addMessageMutation = useAddTicketMessage();
  const updateStatusMutation = useUpdateTicketStatus();
  const assignTicketMutation = useAssignSupportTicket();
  const rateTicketMutation = useRateSupportTicket();
  const updatePriorityMutation = useUpdateTicketPriority();
  const closeTicketMutation = useCloseTicket();
  const reopenTicketMutation = useReopenTicket();
  const uploadAttachmentMutation = useUploadTicketAttachment();
  const deleteAttachmentMutation = useDeleteTicketAttachment();
  const addInternalNoteMutation = useAddInternalNote();

  const ticket = ticketData?.data;
  const teamMembers = usersData?.data || [];
  const timeline = timelineData?.data || [];

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

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'created': return <MessageCircle className="h-4 w-4" />;
      case 'status_updated': return <Activity className="h-4 w-4" />;
      case 'assigned': return <UserPlus className="h-4 w-4" />;
      case 'message_added': return <MessageSquare className="h-4 w-4" />;
      case 'priority_updated': return <Flag className="h-4 w-4" />;
      case 'rated': return <Star className="h-4 w-4" />;
      case 'closed': return <CheckCircle className="h-4 w-4" />;
      case 'reopened': return <RefreshCw className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() && attachments.length === 0) {
      showError('Please enter a message or attach a file');
      return;
    }

    try {
      // Upload attachments first if any
      let uploadedAttachments: string[] = [];
      for (const file of attachments) {
        const uploadResult = await uploadAttachmentMutation.mutateAsync({
          id: ticket._id,
          file
        });
        uploadedAttachments.push(uploadResult.data.filename);
      }

      await addMessageMutation.mutateAsync({
        id: ticket._id,
        data: {
          message: newMessage,
          isInternal,
          attachments: uploadedAttachments
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

  const handlePriorityUpdate = async (newPriority: string) => {
    try {
      await updatePriorityMutation.mutateAsync({
        id: ticket._id,
        priority: newPriority as 'low' | 'medium' | 'high' | 'urgent'
      });
      showSuccess('Ticket priority updated successfully');
    } catch (error: any) {
      showError(error.response?.data?.message || 'Failed to update priority');
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

  const handleCloseTicket = async () => {
    if (!window.confirm('Are you sure you want to close this ticket?')) {
      return;
    }

    try {
      await closeTicketMutation.mutateAsync({
        id: ticket._id,
        resolutionNote: 'Ticket closed by admin'
      });
      showSuccess('Ticket closed successfully');
    } catch (error: any) {
      showError(error.response?.data?.message || 'Failed to close ticket');
    }
  };

  const handleReopenTicket = async () => {
    try {
      await reopenTicketMutation.mutateAsync({
        id: ticket._id,
        reason: 'Ticket reopened for further assistance'
      });
      showSuccess('Ticket reopened successfully');
    } catch (error: any) {
      showError(error.response?.data?.message || 'Failed to reopen ticket');
    }
  };

  const handleFileAttachment = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length + attachments.length > 5) {
      showError('Maximum 5 files allowed');
      return;
    }
    
    // Check file size (max 10MB per file)
    const maxSize = 10 * 1024 * 1024; // 10MB
    const oversizedFiles = files.filter(file => file.size > maxSize);
    if (oversizedFiles.length > 0) {
      showError('File size must be less than 10MB');
      return;
    }

    setAttachments(prev => [...prev, ...files]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleRefresh = () => {
    refetchTicket();
    if (isAdmin) {
      refetchTimeline();
    }
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

  const handleAddInternalNote = async () => {
    if (!internalNote.trim()) {
      showError('Please enter a note');
      return;
    }

    try {
      await addInternalNoteMutation.mutateAsync({
        id: ticket._id,
        note: internalNote
      });
      setInternalNote('');
      setShowInternalNoteModal(false);
      showSuccess('Internal note added successfully');
    } catch (error: any) {
      showError(error.response?.data?.message || 'Failed to add internal note');
    }
  };

  const copyTicketId = () => {
    navigator.clipboard.writeText(ticket._id);
    showSuccess('Ticket ID copied to clipboard');
  };

  const copyTicketNumber = () => {
    navigator.clipboard.writeText(ticket.ticketNumber);
    showSuccess('Ticket number copied to clipboard');
  };

  const toggleMessageExpansion = (messageId: string) => {
    setExpandedMessageId(expandedMessageId === messageId ? null : messageId);
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
    <div className="max-w-7xl mx-auto">
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
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold text-gray-900">
                Ticket #{ticket.ticketNumber}
              </h1>
              <Button variant="ghost" size="sm" onClick={copyTicketNumber}>
                <Copy className="h-3 w-3" />
              </Button>
            </div>
            <p className="text-gray-600">{ticket.subject}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          {isAdmin && (
            <>
              <Button variant="outline" size="sm" onClick={() => setShowInternalNoteModal(true)}>
                <Shield className="h-4 w-4 mr-2" />
                Add Note
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </>
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
                {filteredMessages.map((message: any) => {
                  const isOwnMessage = message.senderId._id === user?._id;
                  const isExpanded = expandedMessageId === message._id;
                  const messageLength = message.message.length;
                  const shouldTruncate = messageLength > 200;

                  return (
                    <div key={message._id} className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs lg:max-w-md ${
                        isOwnMessage 
                          ? 'bg-green-500 text-white' 
                          : message.isInternal 
                            ? 'bg-yellow-50 border border-yellow-300' 
                            : 'bg-gray-100'
                      } rounded-lg p-4`}>
                        <div className="flex items-center space-x-2 mb-2">
                          <User className="h-4 w-4" />
                          <span className="text-sm font-medium">
                            {message.senderId.firstName} {message.senderId.lastName}
                          </span>
                          <span className="text-xs px-2 py-1 rounded bg-opacity-50 bg-gray-200">
                            {message.senderId.role}
                          </span>
                          {message.isInternal && isAdmin && (
                            <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded">
                              <Shield className="h-3 w-3 inline mr-1" />
                              Internal
                            </span>
                          )}
                        </div>
                        
                        <div className="text-sm mb-2">
                          {shouldTruncate && !isExpanded ? (
                            <>
                              {message.message.substring(0, 200)}...
                              <button 
                                onClick={() => toggleMessageExpansion(message._id)}
                                className="ml-2 text-blue-600 hover:text-blue-800 underline"
                              >
                                Show more
                              </button>
                            </>
                          ) : (
                            <>
                              {message.message}
                              {shouldTruncate && isExpanded && (
                                <button 
                                  onClick={() => toggleMessageExpansion(message._id)}
                                  className="ml-2 text-blue-600 hover:text-blue-800 underline"
                                >
                                  Show less
                                </button>
                              )}
                            </>
                          )}
                        </div>
                        
                        {message.attachments && message.attachments.length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs font-medium mb-1">Attachments:</p>
                            {message.attachments.map((attachment: string, index: number) => (
                              <div key={index} className="flex items-center text-xs">
                                <Paperclip className="h-3 w-3 mr-1" />
                                <span className="truncate">{attachment}</span>
                                <Button variant="ghost" size="sm" className="ml-2">
                                  <Download className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        <div className="text-xs opacity-75 mt-2 flex items-center justify-between">
                          <span>{formatDate(message.timestamp)}</span>
                          {isOwnMessage && (
                            <CheckCircle className="h-3 w-3" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
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
                          <span className="text-xs text-gray-500 ml-1">
                            ({(file.size / 1024 / 1024).toFixed(1)}MB)
                          </span>
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
                        accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.txt"
                        className="hidden"
                      />
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={attachments.length >= 5}
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
                <label className="text-sm font-medium text-gray-600">Ticket ID</label>
                <div className="flex items-center space-x-2">
                  <p className="text-sm text-gray-900 font-mono">{ticket._id}</p>
                  <Button variant="ghost" size="sm" onClick={copyTicketId}>
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Category</label>
                <p className="text-sm text-gray-900">{getCategoryLabel(ticket.category)}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">Priority</label>
                <div className="mt-1">
                  {isAdmin ? (
                    <Select
                      options={[
                        { value: 'low', label: 'Low' },
                        { value: 'medium', label: 'Medium' },
                        { value: 'high', label: 'High' },
                        { value: 'urgent', label: 'Urgent' }
                      ]}
                      value={ticket.priority}
                      onChange={(e) => handlePriorityUpdate(e.target.value)}
                      disabled={updatePriorityMutation.isLoading}
                    />
                  ) : (
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(ticket.priority)}`}>
                      {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                    </span>
                  )}
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
                      disabled={updateStatusMutation.isLoading}
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
                        className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded flex items-center"
                      >
                        <Tag className="h-3 w-3 mr-1" />
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
              
              {ticket.customerId.phone && (
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="h-4 w-4 mr-2" />
                  {ticket.customerId.phone}
                </div>
              )}
              
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

          {/* Admin Actions */}
          {isAdmin && (
            <Card variant="elevated">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Admin Actions</h2>
              </div>
              <div className="p-6 space-y-3">
                {ticket.status !== 'closed' ? (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    fullWidth
                    onClick={handleCloseTicket}
                    loading={closeTicketMutation.isLoading}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Close Ticket
                  </Button>
                ) : (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    fullWidth
                    onClick={handleReopenTicket}
                    loading={reopenTicketMutation.isLoading}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Reopen Ticket
                  </Button>
                )}
                <Button variant="outline" size="sm" fullWidth>
                  <Flag className="h-4 w-4 mr-2" />
                  Escalate
                </Button>
                <Button variant="outline" size="sm" fullWidth>
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicate
                </Button>
                <Button variant="outline" size="sm" fullWidth>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
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

          {/* Timeline (Admin only) */}
          {isAdmin && timeline.length > 0 && (
            <Card variant="elevated">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Timeline</h2>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  {timeline.slice(0, 5).map((event: any, index: number) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                        {getActionIcon(event.action)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">{event.action.replace('_', ' ')}</p>
                        <p className="text-xs text-gray-500">
                          {event.actor.firstName} {event.actor.lastName} - {formatDate(event.timestamp)}
                        </p>
                        {event.note && (
                          <p className="text-xs text-gray-600 mt-1">{event.note}</p>
                        )}
                      </div>
                    </div>
                  ))}
                  {timeline.length > 5 && (
                    <Button variant="outline" size="sm" fullWidth>
                      View Full Timeline
                    </Button>
                  )}
                </div>
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

      {/* Internal Note Modal */}
      {showInternalNoteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Internal Note</h3>
            
            <TextArea
              label="Internal Note"
              placeholder="Add a note for team members..."
              value={internalNote}
              onChange={(e) => setInternalNote(e.target.value)}
              rows={4}
            />

            <div className="flex space-x-3 mt-6">
              <Button
                variant="outline"
                fullWidth
                onClick={() => {
                  setShowInternalNoteModal(false);
                  setInternalNote('');
                }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                fullWidth
                onClick={handleAddInternalNote}
                loading={addInternalNoteMutation.isLoading}
              >
                Add Note
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupportTicketDetails;