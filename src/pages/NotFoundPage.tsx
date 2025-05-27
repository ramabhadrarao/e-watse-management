import React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import Button from '../components/ui/Button';

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-green-500">404</h1>
        <h2 className="text-3xl font-bold text-gray-900 mt-4">Page Not Found</h2>
        <p className="text-gray-600 mt-2 mb-8">
          Sorry, we couldn't find the page you're looking for.
        </p>
        <Link to="/">
          <Button variant="primary">
            <Home className="mr-2 h-5 w-5" />
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;