import React from 'react';
import { motion } from 'motion/react';

interface ProgressHeaderProps {
  progress: number;
  status: string;
}

export function ProgressHeader({ progress, status }: ProgressHeaderProps) {
  return (
    <div className="absolute top-0 left-0 w-full h-1 bg-white/5 z-50">
      <motion.div 
        className="h-full bg-theme-accent shadow-[0_0_10px_rgba(var(--theme-accent-rgb),0.5)]"
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.5 }}
      />
    </div>
  );
}
