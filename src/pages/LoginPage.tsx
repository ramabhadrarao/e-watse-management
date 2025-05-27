import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { LogIn, Mail, Lock, RecycleIcon } from 'lucide-react';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import AuthContext from '../context/AuthContext';

// Form validation schema
const schema = yup.object({
  email: yup.string().email('Please enter a valid email').required('Email is required'),
  password: yup.string().required('Password is required').min(6, 'Password must be at least 6 characters'),
});

type FormValues = {
  email: string;
  password: string;
};

const LoginPage: React.FC = () => {
  const { login, error, isAuthenticated, clearError } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    // Clear any previous errors
    clearError();
    
    // Redirect if already authenticated
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate, clearError]);

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    await login(data.email, data.password);
    setIsSubmitting(false);
  };

  return (
    <div className="flex min-h-screen flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <RecycleIcon className="h-12 w-12 text-green-500" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{' '}
          <Link to="/register" className="font-medium text-green-600 hover:text-green-500">
            create a new account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card variant="elevated" className="px-4 py-8 sm:px-10">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <Input
              label="Email Address"
              type="email"
              id="email"
              autoComplete="email"
              icon={<Mail className="h-5 w-5" />}
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              icon={<Lock className="h-5 w-5" />}
              error={errors.password?.message}
              {...register('password')}
            />

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <Link to="#" className="font-medium text-green-600 hover:text-green-500">
                  Forgot your password?
                </Link>
              </div>
            </div>

            <div>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={isSubmitting}
                fullWidth
              >
                <LogIn className="mr-2 h-5 w-5" />
                Sign in
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;