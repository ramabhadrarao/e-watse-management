import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'bordered' | 'elevated' | 'glass';
  padding?: 'none' | 'small' | 'medium' | 'large';
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  variant = 'default',
  padding = 'medium',
}) => {
  const variantStyles = {
    default: 'bg-white',
    bordered: 'bg-white border border-gray-200',
    elevated: 'bg-white shadow-lg',
    glass: 'bg-white/10 backdrop-blur-lg border border-white/20'
  };
  
  const paddingStyles = {
    none: 'p-0',
    small: 'p-3',
    medium: 'p-5',
    large: 'p-8'
  };

  return (
    <div className={`
      rounded-lg ${variantStyles[variant]} ${paddingStyles[padding]} ${className}
    `}>
      {children}
    </div>
  );
};

export default Card;