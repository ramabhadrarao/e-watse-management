import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
  icon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, fullWidth = true, icon, className = '', ...props }, ref) => {
    const inputClasses = `
      bg-white border rounded-md px-4 py-2 outline-none transition-colors
      ${error ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-green-500'}
      ${fullWidth ? 'w-full' : ''}
      ${icon ? 'pl-10' : ''}
      ${className}
    `;

    return (
      <div className={`mb-4 ${fullWidth ? 'w-full' : ''}`}>
        {label && (
          <label className="block text-gray-700 text-sm font-medium mb-1">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
              {icon}
            </div>
          )}
          <input ref={ref} className={inputClasses} {...props} />
        </div>
        {error && <p className="mt-1 text-red-500 text-xs">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;