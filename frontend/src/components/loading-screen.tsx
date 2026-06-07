'use client';

import { motion } from 'framer-motion';
import { Logo } from '@/components/logo';

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background">
      <div className="relative flex flex-col items-center">
        {/* Animated logo reveal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <Logo size="xl" className="drop-shadow-[0_0_40px_oklch(0.94_0.010_82/0.1)]" />
        </motion.div>

        {/* Shimmer line */}
        <motion.div
          className="h-px w-32 bg-gradient-to-r from-transparent via-[oklch(0.94_0.010_82/0.4)] to-transparent mt-8"
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 128, opacity: 1 }}
          transition={{ delay: 0.5, duration: 1, ease: "easeInOut" }}
        />

        {/* Loading text */}
        <motion.p
          className="mt-6 text-[10px] tracking-[0.3em] uppercase text-muted-foreground font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0.5, 1] }}
          transition={{ delay: 1, duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          Initializing Excellence
        </motion.p>
      </div>
    </div>
  );
}
