// src/pages/dashboard/SupportTickets.tsx
// Updated Support Tickets Management Page with real API integration
// Features: ticket listing, creation, filtering, search, role-based access
// Path: /dashboard/support
// Dependencies: Real backend API calls via useSupport hooks

import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Plus, 
  MessageCircle, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Search, 
  Filter,
  RefreshCw,
  Eye,
  Edit,
  Archive,
  Flag,
  User,
  Calendar,
  Download,
  Settings,
  Star,
  Package,
  Phone,
  Mail,
  Tag,
  UserPlus
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
  useUserSupportTickets, 
  useAllSupportTickets, 
  useSupportStats,
  useCreateSupportTicket,
  useUpdateTicketStatus,
  useAssignSupportTicket,
  useExportSupportTickets,
  useBulkUpdateTickets
} from '../../hooks/useSupport';
import { useUsers } from '../../hooks/useUsers';

const SupportTickets: React.FC = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTickets, setSelectedTickets] = useState<string[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { showSuccess, showError } = useToast();

  const isAdmin = user?.role === 'admin' || user?.role === 'manager';

  // New ticket form state
  const [newTicket, setNewTicket] = useState({
    subject: '',
    description: '',
    category: 'general_inquiry',
    priority: 'medium',
    orderId: ''
  });

  // API Hooks with proper error handling
  const { 
    data: userTicketsData, 
    isLoading: userTicketsLoading, 
    error: userTicketsError,
    refetch: refetchUserTickets,
    isError: isUserTicketsError 
  } = useUserSupportTickets({
    status: statusFilter !== 'all' ? statusFilter : undefined,
    page: currentPage,
    limit: 10
  }, { 
    enabled: !isAdmin,
    onError: (error) => {
      console.error('User tickets error:', error);
      showError('Failed to load your support tickets');
    }
  });

  const { 
    data: allTicketsData, 
    isLoading: allTicketsLoading, 
    error: allTicketsError,
    refetch: refetchAllTickets,
    isError: isAllTicketsError 
  } = useAllSupportTickets({
    status: statusFilter !== 'all' ? statusFilter : undefined,
    priority: priorityFilter !== 'all' ? priorityFilter : undefined,
    category: categoryFilter !== 'all' ? categoryFilter : undefined,
    page: currentPage,
    limit: 10
  }, { 
    enabled: isAdmin,
    onError: (error) => {
      console.error('All tickets error:', error);
      showError('Failed to load support tickets');
    }
  });

  const { 
    data: statsData, 
    isLoading: statsLoading,
    error: statsError 
  } = useSupportStats('month', { 
    enabled: isAdmin,
    onError: (error) => {
      console.error('Support stats error:', error);
    }
  });

  // Get team members for assignment (Admin only)
  const { 
    data: usersData 
  } = useUsers({ role: 'admin,manager' }, { enabled: isAdmin });

  // Mutations
  const createTicketMutation = useCreateSupportTicket();
  const updateTicketStatusMutation = useUpdateTicketStatus();
  const assignTicketMutation = useAssignSupportTicket();
  const exportTicketsMutation = useExportSupportTickets();
  const bulkUpdateMutation = useBulkUpdateTickets();

  // Choose appropriate data based on user role
  const ticketsData = isAdmin ? allTicketsData : userTicketsData;
  const ticketsLoading = isAdmin ? allTicketsLoading : userTicketsLoading;
  const ticketsError = isAdmin ? allTicketsError : userTicketsError;
  const isTicketsError = isAdmin ? isAllTicketsError : isUserTicketsError;
  const refetchTickets = isAdmin ? refetchAllTickets : refetchUserTickets;

  const tickets = ticketsData?.data || [];
  const totalTickets = ticketsData?.total || 0;
  const supportStats = statsData?.data || {
    openTickets: 0,
    resolvedTickets: 0,
    averageResolutionTime: 0,
    totalTickets: 0,
    customerSatisfactionRating: 0
  };
  const teamMembers = usersData?.data || [];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved':
      case 'closed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'open':
        return <AlertCircle className="h-4 w-4 text-amber-500" />;
      case 'waiting_customer':
        return <MessageCircle className="h-4 w-4 text-purple-500" />;
      default:
        return <MessageCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved':
      case 'closed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'open':
        return 'bg-amber-100 text-amber-800';
      case 'waiting_customer':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleRefresh = () => {
    refetchTickets();
    showSuccess('Support tickets refreshed');
  };

  const handleCreateTicket = async () => {
    if (!newTicket.subject || !newTicket.description) {
      showError('Please fill in subject and description');
      return;
    }

    try {
      await createTicketMutation.mutateAsync({
        subject: newTicket.subject,
        description: newTicket.description,
        category: newTicket.category,
        priority: newTicket.priority,
        orderId: newTicket.orderId || undefined
      });
      
      setShowCreateModal(false);
      setNewTicket({
        subject: '',
        description: '',
        category: 'general_inquiry',
        priority: 'medium',
        orderId: ''
      });
      showSuccess('Support ticket created successfully');
    } catch (error: any) {
      showError(error.response?.data?.message || 'Failed to create support ticket');
    }
  };

  const handleStatusUpdate = async (ticketId: string, newStatus: string) => {
    try {
      await updateTicketStatusMutation.mutateAsync({
        id: ticketId,
        status: newStatus
      });
      showSuccess('Ticket status updated successfully');
    } catch (error: any) {
      console.error('Status update error:', error);
      showError(error.response?.data?.message || 'Failed to update ticket status');
    }
  };

  const handleAssignTicket = async (ticketId: string, assignedTo: string) => {
    try {
      await assignTicketMutation.mutateAsync({
        id: ticketId,
        assignedTo
      });
      showSuccess('Ticket assigned successfully');
    } catch (error: any) {
      console.error('Assignment error:', error);
      showError(error.response?.data?.message || 'Failed to assign ticket');
    }
  };

  const handleExport = async () => {
    try {
      await exportTicketsMutation.mutateAsync({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        priority: priorityFilter !== 'all' ? priorityFilter : undefined,
        category: categoryFilter !== 'all' ? categoryFilter : undefined,
        format: 'csv'
      });
      showSuccess('Support tickets exported successfully');
    } catch (error: any) {
      showError('Failed to export support tickets');
    }
  };

  const handleSelectTicket = (ticketId: string) => {
    setSelectedTickets(prev => 
      prev.includes(ticketId) 
        ? prev.filter(id => id !== ticketId)
        : [...prev, ticketId]
    );
  };

  const handleSelectAllTickets = () => {
    if (selectedTickets.length === tickets.length) {
      setSelectedTickets([]);
    } else {
      setSelectedTickets(tickets.map(ticket => ticket._id));
    }
  };

  const handleBulkUpdate = async (updates: { status?: string; assignedTo?: string; priority?: string }) => {
    if (selectedTickets.length === 0) {
      showError('Please select tickets to update');
      return;
    }

    try {
      await bulkUpdateMutation.mutateAsync({
        ticketIds: selectedTickets,
        updates
      });
      setSelectedTickets([]);
      showSuccess(`${selectedTickets.length} tickets updated successfully`);
    } catch (error: any) {
      showError('Failed to update tickets');
    }
  };

  // Show loading spinner while loading
  if (ticketsLoading || (isAdmin && statsLoading)) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            {isAdmin ? 'Support Management' : 'Support Tickets'}
          </h1>
          <p className="text-gray-600">Loading support tickets...</p>
        </div>
        <LoadingSpinner fullScreen />
      </div>
    );
  }

  // Show error state
  if (isTicketsError) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            {isAdmin ? 'Support Management' : 'Support Tickets'}
          </h1>
        </div>
        <div className="text-center py-12">
          <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Failed to Load Support Tickets</h2>
          <p className="text-gray-600 mb-4">
            {ticketsError?.response?.data?.message || 'Unable to connect to the support system.'}
          </p>
          <div className="space-y-2">
            <p className="text-sm text-gray-500">
              Please check your connection and try again.
            </p>
            <Button variant="primary" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isAdmin ? 'Support Management' : 'Support Tickets'}
          </h1>
          <p className="text-gray-600">
            {isAdmin ? 'Manage customer support tickets and inquiries' : 'Get help with your orders and account'}
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-3">
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          {isAdmin && (
            <>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleExport}
                loading={exportTicketsMutation.isLoading}
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </>
          )}
          <Button variant="primary" onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            {isAdmin ? 'Create Ticket' : 'New Ticket'}
          </Button>
        </div>
      </div>

      {/* Statistics Cards - Admin Only */}
      {isAdmin && !statsError && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card variant="elevated" className="p-6">
            <div className="flex items-center">
              <div className="bg-amber-100 text-amber-600 p-3 rounded-full mr-4">
                <MessageCircle className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Open Tickets</p>
                <p className="text-2xl font-bold text-gray-900">{supportStats.openTickets || 0}</p>
                <p className="text-xs text-amber-600">Need attention</p>
              </div>
            </div>
          </Card>

          <Card variant="elevated" className="p-6">
            <div className="flex items-center">
              <div className="bg-green-100 text-green-600 p-3 rounded-full mr-4">
                <CheckCircle className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Resolved</p>
                <p className="text-2xl font-bold text-gray-900">{supportStats.resolvedTickets || 0}</p>
                <p className="text-xs text-green-600">This month</p>
              </div>
            </div>
          </Card>

          <Card variant="elevated" className="p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 text-blue-600 p-3 rounded-full mr-4">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Resolution</p>
                <p className="text-2xl font-bold text-gray-900">{supportStats.averageResolutionTime || 0}h</p>
                <p className="text-xs text-blue-600">Response time</p>
              </div>
            </div>
          </Card>

          <Card variant="elevated" className="p-6">
            <div className="flex items-center">
              <div className="bg-purple-100 text-purple-600 p-3 rounded-full mr-4">
                <Star className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Satisfaction</p>
                <p className="text-2xl font-bold text-gray-900">{supportStats.customerSatisfactionRating || 0}/5</p>
                <p className="text-xs text-purple-600">Customer rating</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Filters and Search */}
      <Card variant="elevated" className="p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Input
            placeholder="Search tickets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<Search className="h-4 w-4" />}
          />
          <Select
            options={[
              { value: 'all', label: 'All Status' },
              { value: 'open', label: 'Open' },
              { value: 'in_progress', label: 'In Progress' },
              { value: 'waiting_customer', label: 'Waiting for Response' },
              { value: 'resolved', label: 'Resolved' },
              { value: 'closed', label: 'Closed' }
            ]}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            icon={<Filter className="h-4 w-4" />}
          />
          {isAdmin && (
            <>
              <Select
                options={[
                  { value: 'all', label: 'All Priority' },
                  { value: 'urgent', label: 'Urgent' },
                  { value: 'high', label: 'High' },
                  { value: 'medium', label: 'Medium' },
                  { value: 'low', label: 'Low' }
                ]}
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
              />
              <Select
                options={[
                  { value: 'all', label: 'All Categories' },
                  { value: 'order_issue', label: 'Order Issue' },
                  { value: 'payment_issue', label: 'Payment Issue' },
                  { value: 'pickup_issue', label: 'Pickup Issue' },
                  { value: 'account_issue', label: 'Account Issue' },
                  { value: 'general_inquiry', label: 'General Inquiry' },
                  { value: 'complaint', label: 'Complaint' },
                  { value: 'feedback', label: 'Feedback' }
                ]}
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              />
            </>
          )}
          <div className="flex items-center text-sm text-gray-600">
            Showing {tickets.length} of {totalTickets} tickets
          </div>
        </div>

        {/* Bulk Actions for Admin */}
        {isAdmin && selectedTickets.length > 0 && (
          <div className="mt-4 flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
            <span className="text-sm text-blue-700">{selectedTickets.length} tickets selected</span>
            <Select
              options={[
                { value: '', label: 'Bulk Status Update' },
                { value: 'in_progress', label: 'Mark as In Progress' },
                { value: 'resolved', label: 'Mark as Resolved' },
                { value: 'closed', label: 'Mark as Closed' }
              ]}
              onChange={(e) => {
                if (e.target.value) {
                  handleBulkUpdate({ status: e.target.value });
                  e.target.value = '';
                }
              }}
            />
            <Select
              options={[
                { value: '', label: 'Bulk Assignment' },
                ...teamMembers.map(member => ({ 
                  value: member._id, 
                  label: `${member.firstName} ${member.lastName}` 
                }))
              ]}
              onChange={(e) => {
                if (e.target.value) {
                  handleBulkUpdate({ assignedTo: e.target.value });
                  e.target.value = '';
                }
              }}
            />
          </div>
        )}
      </Card>

      {/* Tickets List */}
      <div className="space-y-4">
        {tickets.length === 0 ? (
          <Card variant="elevated" className="text-center py-12">
            <MessageCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {isAdmin ? 'No support tickets found' : 'No support tickets'}
            </h3>
            <p className="text-gray-600 mb-6">
              {statusFilter === 'all' 
                ? (isAdmin ? "No support tickets match your criteria." : "You haven't created any support tickets yet.")
                : `No tickets with the selected filters found.`
              }
            </p>
            <Button variant="primary" onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              {isAdmin ? 'Create First Ticket' : 'Create Your First Ticket'}
            </Button>
          </Card>
        ) : (
          tickets.map((ticket) => (
            <Card key={ticket._id} variant="elevated" className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  {isAdmin && (
                    <input
                      type="checkbox"
                      checked={selectedTickets.includes(ticket._id)}
                      onChange={() => handleSelectTicket(ticket._id)}
                      className="mt-1 rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                  )}
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      {getStatusIcon(ticket.status)}
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-semibold text-gray-900 hover:text-green-600 cursor-pointer">
                          <Link to={`/dashboard/support/${ticket._id}`}>
                            {ticket.subject}
                          </Link>
                        </h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(ticket.status)}`}>
                          {ticket.status.replace('_', ' ').toUpperCase()}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(ticket.priority)}`}>
                          {ticket.priority.toUpperCase()}
                        </span>
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                          {getCategoryLabel(ticket.category)}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {ticket.description}
                    </p>
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <MessageCircle className="h-4 w-4 mr-1" />
                        <span>#{ticket.ticketNumber}</span>
                      </div>
                      
                      {isAdmin && ticket.customerId && (
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-1" />
                          <span>{ticket.customerId.firstName} {ticket.customerId.lastName}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>Created {formatDate(ticket.createdAt)}</span>
                      </div>
                      
                      {ticket.lastActivityAt && (
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          <span>Last activity {formatDate(ticket.lastActivityAt)}</span>
                        </div>
                      )}
                      
                      {ticket.orderId && (
                        <div className="flex items-center">
                          <Package className="h-4 w-4 mr-1" />
                          <Link 
                            to={`/dashboard/pickups/${ticket.orderId._id}`}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            Order #{ticket.orderId.orderNumber}
                          </Link>
                        </div>
                      )}
                      
                      {ticket.assignedTo && (
                        <div className="flex items-center">
                          <UserPlus className="h-4 w-4 mr-1" />
                          <span>Assigned to {ticket.assignedTo.firstName} {ticket.assignedTo.lastName}</span>
                        </div>
                      )}
                    </div>
                    
                    {ticket.tags && ticket.tags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {ticket.tags.map((tag, index) => (
                          <span 
                            key={index}
                            className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded flex items-center"
                          >
                            <Tag className="h-3 w-3 mr-1" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="ml-6 flex flex-col space-y-2">
                  <Link to={`/dashboard/support/${ticket._id}`}>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </Link>
                  
                  {isAdmin && (
                    <>
                      <Select
                        options={[
                          { value: '', label: 'Update Status' },
                          { value: 'in_progress', label: 'In Progress' },
                          { value: 'waiting_customer', label: 'Waiting Customer' },
                          { value: 'resolved', label: 'Resolved' },
                          { value: 'closed', label: 'Closed' }
                        ]}
                        onChange={(e) => {
                          if (e.target.value) {
                            handleStatusUpdate(ticket._id, e.target.value);
                            e.target.value = '';
                          }
                        }}
                        disabled={updateTicketStatusMutation.isLoading}
                      />
                      
                      {!ticket.assignedTo && (
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
                              handleAssignTicket(ticket._id, e.target.value);
                              e.target.value = '';
                            }
                          }}
                          disabled={assignTicketMutation.isLoading}
                        />
                      )}
                    </>
                  )}
                  
                  {ticket.messages && ticket.messages.length > 0 && (
                    <div className="text-xs text-gray-500 text-center">
                      {ticket.messages.length} message{ticket.messages.length !== 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Customer rating display */}
              {ticket.customerRating && (
                <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-green-800">Customer Rating:</span>
                      <div className="ml-2 flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${
                              star <= ticket.customerRating.rating
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                        <span className="ml-1 text-sm text-green-700">({ticket.customerRating.rating}/5)</span>
                      </div>
                    </div>
                    <span className="text-xs text-green-600">
                      {formatDate(ticket.customerRating.ratedAt)}
                    </span>
                  </div>
                  {ticket.customerRating.feedback && (
                    <p className="mt-2 text-sm text-green-700 italic">
                      "{ticket.customerRating.feedback}"
                    </p>
                  )}
                </div>
              )}
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalTickets > 10 && (
        <div className="mt-8 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, totalTickets)} of {totalTickets} results
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              Previous
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              disabled={currentPage * 10 >= totalTickets}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Create Ticket Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create Support Ticket</h3>
            
            <div className="space-y-4">
              <Input
                label="Subject"
                placeholder="Brief description of your issue"
                value={newTicket.subject}
                onChange={(e) => setNewTicket(prev => ({ ...prev, subject: e.target.value }))}
              />
              
              <TextArea
                label="Description"
                placeholder="Detailed description of your issue..."
                rows={4}
                value={newTicket.description}
                onChange={(e) => setNewTicket(prev => ({ ...prev, description: e.target.value }))}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Category"
                  options={[
                    { value: 'general_inquiry', label: 'General Inquiry' },
                    { value: 'order_issue', label: 'Order Issue' },
                    { value: 'payment_issue', label: 'Payment Issue' },
                    { value: 'pickup_issue', label: 'Pickup Issue' },
                    { value: 'account_issue', label: 'Account Issue' },
                    { value: 'complaint', label: 'Complaint' },
                    { value: 'feedback', label: 'Feedback' }
                  ]}
                  value={newTicket.category}
                  onChange={(e) => setNewTicket(prev => ({ ...prev, category: e.target.value }))}
                />
                
                <Select
                  label="Priority"
                  options={[
                    { value: 'low', label: 'Low' },
                    { value: 'medium', label: 'Medium' },
                    { value: 'high', label: 'High' },
                    { value: 'urgent', label: 'Urgent' }
                  ]}
                  value={newTicket.priority}
                  onChange={(e) => setNewTicket(prev => ({ ...prev, priority: e.target.value }))}
                />
              </div>
              
              <Input
                label="Related Order ID (Optional)"
                placeholder="Enter order number if this relates to an order"
                value={newTicket.orderId}
                onChange={(e) => setNewTicket(prev => ({ ...prev, orderId: e.target.value }))}
              />
            </div>

            <div className="flex space-x-3 mt-6">
              <Button
                variant="outline"
                fullWidth
                onClick={() => {
                  setShowCreateModal(false);
                  setNewTicket({
                    subject: '',
                    description: '',
                    category: 'general_inquiry',
                    priority: 'medium',
                    orderId: ''
                  });
                }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                fullWidth
                onClick={handleCreateTicket}
                loading={createTicketMutation.isLoading}
              >
                Create Ticket
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupportTickets;