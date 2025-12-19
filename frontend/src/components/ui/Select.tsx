import { ChevronDown } from 'lucide-react';
import { forwardRef } from 'react';
import type { SelectHTMLAttributes } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, className = '', children, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            className={`
              w-full px-4 py-3 pr-10 rounded-xl
              bg-white border-2 border-gray-200
              text-gray-800 font-medium
              appearance-none cursor-pointer
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
              hover:border-gray-300 hover:shadow-md
              transition-all duration-200
              shadow-sm
              ${error ? 'border-red-400 focus:ring-red-500' : ''}
              ${className}
            `}
            {...props}
          >
            {children}
          </select>
          <ChevronDown 
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" 
            size={20} 
          />
        </div>
        {error && (
          <p className="mt-2 text-sm text-red-600 font-medium">{error}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;
