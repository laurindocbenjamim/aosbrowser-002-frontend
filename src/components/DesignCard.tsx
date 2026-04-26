import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { ChevronRight, Cpu, ShieldAlert } from 'lucide-react';

interface DesignCardProps {
  id: string;
  title: string;
  description: string;
  isSelected: boolean;
  onSelect: () => void;
}

export default function DesignCard({ id, title, description, isSelected, onSelect }: DesignCardProps) {
  return (
    <motion.button
      onClick={onSelect}
      className={`w-full text-left p-6 rounded-xl transition-all duration-300 relative group overflow-hidden ${
        isSelected 
          ? 'bg-theme-accent/10 border-2 border-theme-accent shadow-[0_0_20px_var(--color-theme-accent)]/10' 
          : 'bg-theme-card border border-theme-border hover:border-theme-accent/30'
      }`}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-center justify-between relative z-10">
        <div>
          <h3 className={`text-lg font-display font-semibold transition-colors ${
            isSelected ? 'text-theme-accent' : 'text-theme-text'
          }`}>
            {title}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">{description}</p>
        </div>
        <motion.div
          animate={{ x: isSelected ? 0 : -10, opacity: isSelected ? 1 : 0 }}
        >
          <ChevronRight className="w-5 h-5 text-theme-accent" />
        </motion.div>
      </div>

      {/* Decorative background accent */}
      {isSelected && (
        <motion.div
          layoutId="card-bg-glow"
          className="absolute inset-0 bg-gradient-to-r from-theme-accent/5 to-transparent pointer-none"
        />
      )}
    </motion.button>
  );
}
