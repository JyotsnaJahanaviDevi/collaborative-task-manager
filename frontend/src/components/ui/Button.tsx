import { motion } from 'framer-motion';
import { forwardRef } from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', isLoading, children, className = '', ...props }, ref) => {
    
    const baseStyles = 'relative font-semibold rounded-2xl transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden transform-gpu';
    
    const variants = {
      primary: 'bg-gradient-to-br from-pastel-mint via-pastel-sky to-pastel-lavender hover:shadow-2xl text-gray-800 shadow-lg hover:scale-[1.03] border border-white/60',
      secondary: 'bg-white/90 hover:bg-white text-gray-700 shadow-md hover:shadow-xl border border-gray-200/50',
      ghost: 'hover:bg-white/40 text-gray-700 border border-gray-300/30 hover:border-gray-400/50',
      danger: 'bg-gradient-to-br from-pastel-rose via-red-300 to-pink-300 hover:shadow-2xl text-gray-800 shadow-lg hover:scale-[1.03] border border-white/60',
      outline: 'border-2 border-pastel-mint hover:bg-pastel-mint/20 text-gray-700 hover:border-pastel-sky',
    };
    
    const sizes = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-6 py-3 text-base',
      lg: 'px-8 py-4 text-lg',
    };

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        disabled={isLoading}
        {...(props as any)}
      >
        {/* Shimmer effect */}
        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
        
        {/* Content */}
        <span className="relative flex items-center justify-center gap-2">
          {isLoading && (
            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
          {children}
        </span>
      </motion.button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
