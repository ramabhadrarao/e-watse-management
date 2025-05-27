import React, { forwardRef } from 'react';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ label, error, fullWidth = true, className = '', ...props }, ref) => {
    const textareaClasses = `
      bg-white border rounded-md px-4 py-2 outline-none transition-colors
      ${error ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-green-500'}
      ${fullWidth ? 'w-full' : ''}
      ${className}
    `;

    return (
      <div className={`mb-4 ${fullWidth ? 'w-full' : ''}`}>
        {label && (
          <label className="block text-gray-700 text-sm font-medium mb-1">
            {label}
          </label>
        )}
        <textarea ref={ref} className={textareaClasses} {...props} />
        {error && <p className="mt-1 text-red-500 text-xs">{error}</p>}
      </div>
    );
  }
);

TextArea.displayName = 'TextArea';

export default TextArea;