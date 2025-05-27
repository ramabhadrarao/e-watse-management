import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  loading = false,
  onClick,
  fullWidth = false,
}) => {
  const baseStyles = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variantStyles = {
    primary: 'bg-green-500 text-white hover:bg-green-600 focus:ring-green-500',
    secondary: 'bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-500',
    success: 'bg-emerald-500 text-white hover:bg-emerald-600 focus:ring-emerald-500',
    warning: 'bg-amber-500 text-white hover:bg-amber-600 focus:ring-amber-500',
    danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500',
    outline: 'border border-gray-300 bg-transparent text-gray-700 hover:bg-gray-50 focus:ring-gray-500',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:ring-gray-500',
  };
  
  const sizeStyles = {
    sm: 'text-xs px-3 py-2',
    md: 'text-sm px-4 py-2',
    lg: 'text-base px-6 py-3',
  };
  
  const disabledStyles = disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : '';
  const widthStyles = fullWidth ? 'w-full' : '';

  return (
    <button
      type={type}
      className={`
        ${baseStyles} 
        ${variantStyles[variant]} 
        ${sizeStyles[size]} 
        ${disabledStyles} 
        ${widthStyles}
        ${className}
      `}
      disabled={disabled || loading}
      onClick={onClick}
    >
      {loading && (
        <svg className="w-4 h-4 mr-2 animate-spin\" xmlns="http://www.w3.org/2000/svg\" fill="none\" viewBox="0 0 24 24">
          <circle className="opacity-25\" cx="12\" cy="12\" r="10\" stroke="currentColor\" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children}
    </button>
  );
};

export default Button;