import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, Zap, Globe, Share2, Database, Lock } from 'lucide-react';
import { useState } from 'react';

interface PreviewSceneProps {
  layoutId: string;
  onNavigate?: (page: string) => void;
}

export default function PreviewScene({ layoutId, onNavigate }: PreviewSceneProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="w-full h-full bg-[#050505] rounded-xl border border-white/5 relative overflow-hidden group shadow-2xl"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Tunnel Background */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#080808] to-black opacity-80" />
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[50%] bg-black" 
          style={{ clipPath: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)' }}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[2px] h-[2px] bg-white shadow-[0_0_40px_10px_white] opacity-30" />
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 z-1" 
        style={{ 
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)', 
          backgroundSize: '32px 32px',
          perspective: '1000px'
        }} 
      />

      {/* Header Info */}
      <div className="absolute top-8 left-8 flex items-start gap-4 z-20">
        <div className="w-10 h-10 border border-white flex items-center justify-center p-2">
          <div className="w-full h-full bg-white" />
        </div>
        <div className="flex flex-col">
          <h1 className="text-lg font-display font-bold text-white leading-none tracking-widest uppercase">Axon Core</h1>
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mt-1">Neural Network OS V4.0.2</span>
        </div>
      </div>

      <div className="absolute top-8 right-8 text-right z-20 font-mono">
        <div className="flex items-center gap-2 justify-end mb-1">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[9px] text-slate-300 uppercase tracking-widest leading-none">Status: Syncing Nodes</span>
        </div>
        <span className="text-[9px] text-slate-500 uppercase tracking-widest leading-none">Uptime: 1,428:12:04</span>
      </div>

      {/* Main Visual: Orbiting Rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="relative w-80 h-80 flex items-center justify-center">
            {/* Outer Ring */}
            <motion.div 
               animate={{ rotate: 360 }}
               transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
               className="absolute w-64 h-64 border border-blue-500/20 rounded-full"
               style={{ transformStyle: 'preserve-3d', rotateX: '65deg', rotateY: '15deg' }}
            />
            {/* Middle Ring */}
            <motion.div 
               animate={{ rotate: -360 }}
               transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
               className="absolute w-56 h-56 border border-blue-400/30 rounded-full"
               style={{ transformStyle: 'preserve-3d', rotateX: '-45deg', rotateY: '35deg' }}
            />
            {/* Inner Ring */}
            <motion.div 
               animate={{ rotate: 720 }}
               transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
               className="absolute w-72 h-72 border border-blue-600/10 rounded-full"
               style={{ transformStyle: 'preserve-3d', rotateX: '20deg', rotateY: '75deg' }}
            />
            
            {/* Central Cube / Core */}
            <motion.div 
               animate={{ 
                 rotateX: [0, 90, 180, 270, 360],
                 rotateY: [0, 90, 180, 270, 360]
               }}
               transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
               className="w-12 h-12 relative"
               style={{ transformStyle: 'preserve-3d' }}
            >
               <div className="absolute inset-0 border border-white/20 bg-white/5 backdrop-blur-sm" style={{ transform: 'translateZ(24px)' }} />
               <div className="absolute inset-0 border border-white/20 bg-white/5 backdrop-blur-sm" style={{ transform: 'translateZ(-24px) rotateY(180deg)' }} />
               <div className="absolute inset-0 border border-white/20 bg-white/5 backdrop-blur-sm" style={{ transform: 'translateX(24px) rotateY(90deg)' }} />
               <div className="absolute inset-0 border border-white/20 bg-white/5 backdrop-blur-sm" style={{ transform: 'translateX(-24px) rotateY(-90deg)' }} />
               <div className="absolute inset-0 border border-white/20 bg-white/5 backdrop-blur-sm" style={{ transform: 'translateY(24px) rotateX(90deg)' }} />
               <div className="absolute inset-0 border border-white/20 bg-white/5 backdrop-blur-sm" style={{ transform: 'translateY(-24px) rotateX(-90deg)' }} />
            </motion.div>
        </div>
      </div>

      {/* Hover State Buttons */}
      <AnimatePresence>
        {isHovered && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-40 bg-black/60 backdrop-blur-[2px] flex items-center justify-center gap-8 px-12"
          >
            <motion.button
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              onClick={() => onNavigate?.('automation')}
              className="flex-1 max-w-[200px] h-14 border border-white/10 bg-[#0A0A0A] hover:bg-white/5 transition-all flex items-center justify-center gap-3 group/btn pointer-events-auto"
            >
              <Zap className="w-4 h-4 text-theme-accent group-hover/btn:scale-110 transition-transform" />
              <span className="text-[10px] font-display font-bold text-white uppercase tracking-[0.3em]">Automation</span>
            </motion.button>
            
            <motion.button
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              onClick={() => onNavigate?.('pentesting')}
              className="flex-1 max-w-[200px] h-14 border border-theme-accent/30 bg-[#0A0A0A] hover:bg-theme-accent/5 transition-all flex items-center justify-center gap-3 group/btn pointer-events-auto"
            >
              <ShieldAlert className="w-4 h-4 text-orange-500 group-hover/btn:scale-110 transition-transform" />
              <span className="text-[10px] font-display font-bold text-white uppercase tracking-[0.3em]">Pentesting AI</span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer Details */}
      <div className="absolute bottom-8 left-8 max-w-sm z-20">
        <p className="text-[10px] font-sans text-slate-500 leading-relaxed uppercase tracking-widest text-balance">
          Advanced heuristics engine detecting anomalies in real-time across decentralized architectures.
        </p>
      </div>

      <div className="absolute bottom-8 right-8 flex items-center gap-12 z-20 font-mono">
        <div className="flex items-center gap-2">
          <span className="text-[8px] text-slate-600 uppercase tracking-[0.2em]">Secops Framework</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[8px] text-slate-600 uppercase tracking-[0.2em]">Encrypted Tunnel:</span>
          <span className="text-[8px] text-green-500 uppercase font-bold tracking-[0.2em]">On</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[8px] text-slate-600 uppercase tracking-[0.2em]">Auth Node:</span>
          <span className="text-[8px] text-blue-500 uppercase font-bold tracking-[0.2em]">Oxfds</span>
        </div>
      </div>
    </div>
  );
}
