'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

// Re-runs on every navigation, giving a smooth fade/slide page transition.
export default function Template({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.21, 0.47, 0.32, 0.98] }}
    >
      {children}
    </motion.div>
  );
}
