import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export default function Card({ children, className = '', hover = true, onClick }: CardProps) {
  return (
    <motion.div
      whileHover={hover ? { y: -6, scale: 1.01 } : {}}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      onClick={onClick}
      className={`
        elevated-card rounded-3xl p-6 
        ${hover ? 'cursor-pointer hover:shadow-2xl hover:border-pastel-mint/40' : ''}
        transition-all duration-500
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
}
