'use client';

import { motion } from 'framer-motion';

interface MockupCardProps {
  children: React.ReactNode;
  className?: string;
}

/** Outer gradient wrapper card shared by all three game mockups */
export function MockupCard({ children, className = '' }: MockupCardProps) {
  return (
    <motion.div
      className={`relative rounded-[40px] overflow-hidden flex-shrink-0 w-full max-w-[736px] ${className}`}
      style={{
        background:
          'linear-gradient(250.32deg, rgba(106,87,229,0.2) 5.32%, rgba(229,87,198,0.2) 95.16%), linear-gradient(249.02deg, rgba(106,87,229,0) 4.59%, rgba(31,38,54,1) 95.53%), #1f2636',
      }}
      whileHover={{ scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
    >
      {children}
    </motion.div>
  );
}
