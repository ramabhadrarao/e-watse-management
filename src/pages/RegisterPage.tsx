import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { UserPlus, Mail, Lock, User, MapPin, Phone, RecycleIcon } from 'lucide-react';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import AuthContext from '../context/AuthContext';

// Form validation schema
const schema = yup.object({
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().required('Last name is required'),
  email: yup.string().email('Please enter a valid email').required('Email is required'),
  phone: yup.string()
    .required('Phone number is required')
    .matches(/^[0-9]{10}$/, 'Phone number must be 10 digits'),
  password: yup.string()
    .required('Password is required')
    .min(6, 'Password must be at least 6 characters'),
  confirmPassword: yup.string()
    .required('Please confirm your password')
    .oneOf([yup.ref('password')], 'Passwords must match'),
  pincode: yup.string()
    .required('Pincode is required')
    .matches(/^[0-9]{6}$/, 'Pincode must be 6 digits'),
  address: yup.string().required('Address is required'),
  city: yup.string().required('City is required'),
  state: yup.string().required('State is required'),
});

type FormValues = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  pincode: string;
  address: string;
  city: string;
  state: string;
  landmark?: string;
};

const RegisterPage: React.FC = () => {
  const { register: registerUser, error, isAuthenticated, clearError } = useContext(AuthContext);
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
    
    const userData = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      password: data.password,
      address: {
        street: data.address,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
        landmark: data.landmark || '',
      },
      role: 'customer',
    };
    
    await registerUser(userData);
    setIsSubmitting(false);
  };

  return (
    <div className="flex min-h-screen flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <RecycleIcon className="h-12 w-12 text-green-500" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          Create a new account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{' '}
          <Link to="/login" className="font-medium text-green-600 hover:text-green-500">
            sign in to your existing account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <Card variant="elevated" className="px-4 py-8 sm:px-10">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="First Name"
                type="text"
                id="firstName"
                icon={<User className="h-5 w-5" />}
                error={errors.firstName?.message}
                {...register('firstName')}
              />

              <Input
                label="Last Name"
                type="text"
                id="lastName"
                icon={<User className="h-5 w-5" />}
                error={errors.lastName?.message}
                {...register('lastName')}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                label="Phone Number"
                type="tel"
                id="phone"
                icon={<Phone className="h-5 w-5" />}
                error={errors.phone?.message}
                {...register('phone')}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Password"
                type="password"
                id="password"
                icon={<Lock className="h-5 w-5" />}
                error={errors.password?.message}
                {...register('password')}
              />

              <Input
                label="Confirm Password"
                type="password"
                id="confirmPassword"
                icon={<Lock className="h-5 w-5" />}
                error={errors.confirmPassword?.message}
                {...register('confirmPassword')}
              />
            </div>

            <Input
              label="Address"
              type="text"
              id="address"
              icon={<MapPin className="h-5 w-5" />}
              error={errors.address?.message}
              {...register('address')}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="City"
                type="text"
                id="city"
                error={errors.city?.message}
                {...register('city')}
              />

              <Input
                label="State"
                type="text"
                id="state"
                error={errors.state?.message}
                {...register('state')}
              />

              <Input
                label="Pincode"
                type="text"
                id="pincode"
                error={errors.pincode?.message}
                {...register('pincode')}
              />
            </div>

            <Input
              label="Landmark (Optional)"
              type="text"
              id="landmark"
              {...register('landmark')}
            />

            <div className="flex items-center">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                required
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
                I agree to the{' '}
                <Link to="#" className="font-medium text-green-600 hover:text-green-500">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="#" className="font-medium text-green-600 hover:text-green-500">
                  Privacy Policy
                </Link>
              </label>
            </div>

            <div>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={isSubmitting}
                fullWidth
              >
                <UserPlus className="mr-2 h-5 w-5" />
                Create Account
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default RegisterPage;