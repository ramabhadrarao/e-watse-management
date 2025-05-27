import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { Truck, Package, Activity, UserCircle, Clock } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import AuthContext from '../../context/AuthContext';

const UserDashboard: React.FC = () => {
  const { user } = useContext(AuthContext);

  // Mock data for dashboard
  const stats = [
    { label: 'Total Pickups', value: '8', icon: <Truck className="h-6 w-6" />, color: 'bg-blue-100 text-blue-600' },
    { label: 'Pending Pickups', value: '2', icon: <Clock className="h-6 w-6" />, color: 'bg-amber-100 text-amber-600' },
    { label: 'Completed Pickups', value: '6', icon: <Package className="h-6 w-6" />, color: 'bg-green-100 text-green-600' },
    { label: 'E-Waste Recycled', value: '45 kg', icon: <Activity className="h-6 w-6" />, color: 'bg-purple-100 text-purple-600' },
  ];

  const recentPickups = [
    { id: 'EW000123', date: '2023-05-15', status: 'completed', items: '2 Laptops, 1 Printer', amount: '₹1,200' },
    { id: 'EW000145', date: '2023-06-02', status: 'processing', items: '3 Mobile Phones', amount: '₹800' },
    { id: 'EW000167', date: '2023-06-10', status: 'pending', items: '1 Desktop, 2 Monitors', amount: 'Pending' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome, {user?.firstName}!</h1>
          <p className="text-gray-600">Here's an overview of your e-waste recycling activity</p>
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

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <Card key={index} variant="elevated" className="p-6">
            <div className="flex items-center">
              <div className={`${stat.color} p-3 rounded-full mr-4`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Recent Pickups */}
      <Card variant="elevated" className="mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Recent Pickups</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentPickups.map((pickup) => (
                <tr key={pickup.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {pickup.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(pickup.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(pickup.status)}`}>
                      {pickup.status.charAt(0).toUpperCase() + pickup.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {pickup.items}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {pickup.amount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Link to={`/dashboard/pickups/${pickup.id}`} className="text-blue-600 hover:text-blue-900">
                      View Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-gray-200">
          <Link to="/dashboard/pickups" className="text-sm font-medium text-blue-600 hover:text-blue-500">
            View all pickups
          </Link>
        </div>
      </Card>

      {/* Environmental Impact */}
      <Card variant="elevated">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Your Environmental Impact</h2>
        </div>
        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1 text-center p-6 bg-green-50 rounded-lg">
              <svg className="mx-auto h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <div className="mt-3 text-xl font-bold text-gray-900">45 kg</div>
              <div className="mt-1 text-sm text-gray-600">E-Waste Recycled</div>
            </div>
            <div className="flex-1 text-center p-6 bg-blue-50 rounded-lg">
              <svg className="mx-auto h-12 w-12 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <div className="mt-3 text-xl font-bold text-gray-900">63 kWh</div>
              <div className="mt-1 text-sm text-gray-600">Energy Saved</div>
            </div>
            <div className="flex-1 text-center p-6 bg-purple-50 rounded-lg">
              <svg className="mx-auto h-12 w-12 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <div className="mt-3 text-xl font-bold text-gray-900">18 kg</div>
              <div className="mt-1 text-sm text-gray-600">CO₂ Emissions Prevented</div>
            </div>
          </div>
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">Thank you for contributing to a greener planet!</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default UserDashboard;