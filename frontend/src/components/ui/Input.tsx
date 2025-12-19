import { motion } from 'framer-motion';
import { forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, type = 'text', className = '', ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    const inputType = isPassword && showPassword ? 'text' : type;

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {label}
          </label>
        )}
        
        <div className="relative group">
          {/* Icon */}
          {icon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-pastel-mint transition-colors duration-300">
              {icon}
            </div>
          )}

          {/* Input */}
          <motion.input
            ref={ref}
            type={inputType}
            whileFocus={{ scale: 1.01 }}
            className={`
              w-full px-4 py-3.5 ${icon ? 'pl-12' : ''} ${isPassword ? 'pr-12' : ''}
              bg-white/80 backdrop-blur-sm rounded-2xl text-gray-800 placeholder-gray-400
              border-2 border-gray-200/50
              focus:outline-none focus:border-pastel-mint focus:bg-white
              hover:border-gray-300/70 hover:bg-white/90
              transition-all duration-500 shadow-sm hover:shadow-md
              ${error ? 'border-red-300 bg-red-50/30' : ''}
              ${className}
            `}
            {...(props as any)}
          />

          {/* Password toggle */}
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors p-1 rounded-lg hover:bg-gray-100/50"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          )}
        </div>

        {/* Error message */}
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 text-sm text-red-600 font-medium"
          >
            {error}
          </motion.p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
