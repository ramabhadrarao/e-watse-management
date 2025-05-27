// src/pages/dashboard/SupportTickets.tsx
// Support tickets dashboard for customers

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, MessageCircle, Clock, CheckCircle, XCircle, AlertCircle, Search, Filter } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { useToast } from '../../hooks/useToast';

// Mock hook - you would implement this with react-query
const useSupportTickets = () => {
  // This would be your actual API hook
  return {
    data: { data: [], total: 0 },
    isLoading: false,
    error: null,
    refetch: () => {}
  };
};

const SupportTickets: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const { showSuccess } = useToast();

  const { data: ticketsData, isLoading, error, refetch } = useSupportTickets();
  const tickets = ticketsData?.data || [];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved':
      case 'closed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'in_progress':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'open':
        return <AlertCircle className="h-5 w-5 text-amber-500" />;
      default:
        return <MessageCircle className="h-5 w-5 text-gray-500" />;
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

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Support Tickets</h1>
          <p className="text-gray-600">Get help with your orders and account</p>
        </div>
        <Link to="/dashboard/support/new">
          <Button variant="primary">
            <Plus className="mr-2 h-5 w-5" />
            Create Ticket
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card variant="elevated" className="p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          <div className="flex items-center text-sm text-gray-600">
            Showing {tickets.length} tickets
          </div>
        </div>
      </Card>

      {/* Tickets List */}
      <div className="space-y-4">
        {tickets.length === 0 ? (
          <Card variant="elevated" className="text-center py-12">
            <MessageCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No support tickets</h3>
            <p className="text-gray-600 mb-6">You haven't created any support tickets yet.</p>
            <Link to="/dashboard/support/new">
              <Button variant="primary">
                <Plus className="mr-2 h-5 w-5" />
                Create Your First Ticket
              </Button>
            </Link>
          </Card>
        ) : (
          tickets.map((ticket: any) => (
            <Card key={ticket._id} variant="elevated" className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    {getStatusIcon(ticket.status)}
                    <h3 className="text-lg font-semibold text-gray-900">
                      {ticket.subject}
                    </h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(ticket.status)}`}>
                      {ticket.status.replace('_', ' ').toUpperCase()}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(ticket.priority)}`}>
                      {ticket.priority.toUpperCase()}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 mb-3 line-clamp-2">
                    {ticket.description}
                  </p>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>Ticket #{ticket.ticketNumber}</span>
                    <span>•</span>
                    <span>Created {formatDate(ticket.createdAt)}</span>
                    {ticket.lastActivityAt && (
                      <>
                        <span>•</span>
                        <span>Last activity {formatDate(ticket.lastActivityAt)}</span>
                      </>
                    )}
                    {ticket.orderId && (
                      <>
                        <span>•</span>
                        <span>Order #{ticket.orderId.orderNumber}</span>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="ml-6 flex flex-col space-y-2">
                  <Link to={`/dashboard/support/${ticket._id}`}>
                    <Button variant="outline" size="sm">
                      <MessageCircle className="mr-2 h-4 w-4" />
                      View Details
                    </Button>
                  </Link>
                  {ticket.messages && ticket.messages.length > 0 && (
                    <div className="text-xs text-gray-500 text-center">
                      {ticket.messages.length} message{ticket.messages.length !== 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default SupportTickets;