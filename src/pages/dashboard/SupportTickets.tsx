// src/pages/dashboard/SupportTickets.tsx
// Support Tickets Management Page - Customer and Admin support functionality
// Features: ticket listing, creation, messaging, status updates, priority management
// Path: /dashboard/support (customer) or /dashboard/support/all (admin)
// Dependencies: Real backend API calls via useUserSupportTickets, useAllSupportTickets hooks

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
  Settings
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import AuthContext from '../../context/AuthContext';
import { 
  useUserSupportTickets, 
  useAllSupportTickets, 
  useSupportStats,
  useUpdateTicketStatus,
  useAssignSupportTicket 
} from '../../hooks/useSupport';
import { useToast } from '../../hooks/useToast';

const SupportTickets: React.FC = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const { showSuccess, showError } = useToast();

  const isAdmin = user?.role === 'admin' || user?.role === 'manager';

  // API Hooks - Use different hooks based on user role
  const { 
    data: userTicketsData, 
    isLoading: userTicketsLoading, 
    error: userTicketsError,
    refetch: refetchUserTickets 
  } = useUserSupportTickets({
    status: statusFilter !== 'all' ? statusFilter : undefined,
    page: currentPage,
    limit: 10
  }, { enabled: !isAdmin });

  const { 
    data: allTicketsData, 
    isLoading: allTicketsLoading, 
    error: allTicketsError,
    refetch: refetchAllTickets 
  } = useAllSupportTickets({
    status: statusFilter !== 'all' ? statusFilter : undefined,
    priority: priorityFilter !== 'all' ? priorityFilter : undefined,
    page: currentPage,
    limit: 10
  }, { enabled: isAdmin });

  const { 
    data: statsData, 
    isLoading: statsLoading 
  } = useSupportStats('month', { enabled: isAdmin });

  const updateTicketStatusMutation = useUpdateTicketStatus();
  const assignTicketMutation = useAssignSupportTicket();

  // Choose appropriate data based on user role
  const ticketsData = isAdmin ? allTicketsData : userTicketsData;
  const ticketsLoading = isAdmin ? allTicketsLoading : userTicketsLoading;
  const ticketsError = isAdmin ? allTicketsError : userTicketsError;
  const refetchTickets = isAdmin ? refetchAllTickets : refetchUserTickets;

  const tickets = ticketsData?.data || [];
  const totalTickets = ticketsData?.total || 0;
  const supportStats = statsData?.data || {};

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

  const handleStatusUpdate = async (ticketId: string, newStatus: string) => {
    try {
      await updateTicketStatusMutation.mutateAsync({
        id: ticketId,
        status: newStatus
      });
      showSuccess('Ticket status updated successfully');
    } catch (error: any) {
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
      showError(error.response?.data?.message || 'Failed to assign ticket');
    }
  };

  const handleCreateTicket = () => {
    navigate('/dashboard/support/new');
  };

  if (ticketsLoading || (isAdmin && statsLoading)) {
    return <LoadingSpinner fullScreen />;
  }

  if (ticketsError) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Failed to Load Support Tickets</h2>
        <p className="text-gray-600 mb-6">Unable to fetch support tickets. Please try again.</p>
        <Button variant="primary" onClick={handleRefresh}>
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
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </>
          )}
          <Button variant="primary" onClick={handleCreateTicket}>
            <Plus className="h-4 w-4 mr-2" />
            {isAdmin ? 'Create Ticket' : 'New Ticket'}
          </Button>
        </div>
      </div>

      {/* Statistics Cards - Admin Only */}
      {isAdmin && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card variant="elevated" className="p-6">
            <div className="flex items-center">
              <div className="bg-amber-100 text-amber-600 p-3 rounded-full mr-4">
                <MessageCircle className="h-6 w-6" />
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
              <div className="bg-purple-100 text-purple-600 p-3 rounded-full mr-4">
                <Flag className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Resolution</p>
                <p className="text-2xl font-bold text-gray-900">{supportStats.averageResolutionTime || 0}h</p>
                <p className="text-xs text-purple-600">Response time</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Filters and Search */}
      <Card variant="elevated" className="p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
          )}
          <div className="flex items-center text-sm text-gray-600">
            Showing {tickets.length} of {totalTickets} tickets
          </div>
        </div>
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
                : `No tickets with status "${statusFilter}" found.`
              }
            </p>
            <Button variant="primary" onClick={handleCreateTicket}>
              <Plus className="h-4 w-4 mr-2" />
              {isAdmin ? 'Create First Ticket' : 'Create Your First Ticket'}
            </Button>
          </Card>
        ) : (
          tickets.map((ticket: any) => (
            <Card key={ticket._id} variant="elevated" className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
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
                    
                    {isAdmin && (
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-1" />
                        <span>{ticket.customerId?.firstName} {ticket.customerId?.lastName}</span>
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
                        <User className="h-4 w-4 mr-1" />
                        <span>Assigned to {ticket.assignedTo.firstName} {ticket.assignedTo.lastName}</span>
                      </div>
                    )}
                  </div>
                  
                  {ticket.tags && ticket.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {ticket.tags.map((tag: string, index: number) => (
                        <span 
                          key={index}
                          className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
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
                      />
                      
                      {!ticket.assignedTo && (
                        <Button variant="outline" size="sm">
                          <User className="h-4 w-4 mr-2" />
                          Assign
                        </Button>
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
                          <svg
                            key={star}
                            className={`h-4 w-4 ${
                              star <= ticket.customerRating.rating
                                ? 'text-yellow-400'
                                : 'text-gray-300'
                            }`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
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
    </div>
  );
};

export default SupportTickets;