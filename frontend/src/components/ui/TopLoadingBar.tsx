import { motion } from 'framer-motion';

export function TopLoadingBar({ isLoading }: { isLoading: boolean }) {
  if (!isLoading) return null;
  
  return (
    <motion.div
      initial={{ width: '0%' }}
      animate={{ width: '100%' }}
      transition={{ duration: 1, ease: 'easeInOut' }}
      className="fixed top-0 left-0 h-1 bg-gradient-to-r from-pastel-mint via-pastel-sky to-pastel-lavender z-50"
    />
  );
}
