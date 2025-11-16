import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface PageTransitionProps {
  children: ReactNode;
  location: string;
}

export function PageTransition({ children, location }: PageTransitionProps) {
  return (
    <motion.div
      key={location}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{
        duration: 0.15,
        ease: "easeInOut",
      }}
    >
      {children}
    </motion.div>
  );
}
