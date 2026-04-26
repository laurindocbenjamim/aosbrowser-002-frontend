import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, Zap, Globe, Share2, Database, Lock } from 'lucide-react';
import { useState } from 'react';

interface PreviewSceneProps {
  layoutId: string;
  onNavigate?: (page: string) => void;
  mini?: boolean;
}

export default function PreviewScene({ layoutId, onNavigate, mini = false }: PreviewSceneProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div 
      layoutId={layoutId}
      className={`relative overflow-hidden group ${mini ? 'w-full h-full' : 'w-full h-full bg-[#050505] rounded-xl border border-white/5 shadow-2xl'}`}
    >
      {mini && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
          <div className="w-[1px] h-[1px] bg-white rounded-full shadow-[0_0_12px_3px_white,0_0_25px_6px_rgba(255,255,255,0.3)] animate-pulse" />
          <div className="absolute w-[24px] h-[0.5px] bg-gradient-to-r from-transparent via-white/40 to-transparent blur-[0.5px]" />
          <div className="absolute w-[0.5px] h-[24px] bg-gradient-to-b from-transparent via-white/40 to-transparent blur-[0.5px]" />
        </div>
      )}

      {!mini && (
        <>
          {/* 3D Tunnel Background */}
          <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden bg-black">
            <div className="absolute inset-0" style={{ perspective: '1000px' }}>
              <div className="absolute inset-0 flex items-center justify-center" style={{ transformStyle: 'preserve-3d' }}>
                
                {/* The Light at the End */}
                <div 
                  className="absolute w-24 h-24 bg-amber-100 blur-[1px] shadow-[0_0_100px_40px_rgba(251,191,36,0.3)] z-0"
                  style={{ transform: 'translateZ(-800px)' }}
                />
                
                {/* Left Wall */}
                <div 
                  className="absolute w-[1000px] h-full bg-[#080808] border-r border-white/5"
                  style={{ 
                    transform: 'rotateY(90deg) translateZ(-500px)',
                    backgroundImage: 'linear-gradient(to right, #000, transparent)',
                    maskImage: 'linear-gradient(to bottom, transparent, black, transparent)'
                  }}
                >
                  <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
                </div>

                {/* Right Wall */}
                <div 
                  className="absolute w-[1000px] h-full bg-[#080808] border-l border-white/5"
                  style={{ 
                    transform: 'rotateY(-90deg) translateZ(-500px)',
                    backgroundImage: 'linear-gradient(to left, #000, transparent)',
                    maskImage: 'linear-gradient(to bottom, transparent, black, transparent)'
                  }}
                >
                  <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
                </div>

                {/* Floor */}
                <div 
                  className="absolute w-full h-[1200px] bg-[#030303]"
                  style={{ 
                    transform: 'rotateX(90deg) translateZ(500px)',
                    backgroundImage: 'radial-gradient(ellipse at center, rgba(251,191,36,0.06) 0%, rgba(10,10,10,0) 80%)',
                    boxShadow: 'inset 0 0 150px #000'
                  }}
                >
                  <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'repeating-linear-gradient(transparent, transparent 40px, rgba(255,255,255,1) 41px)', maskImage: 'linear-gradient(to right, transparent, black 25%, black 75%, transparent)' }} />
                </div>

                {/* Ceiling */}
                <div 
                  className="absolute w-full h-[1000px] bg-black"
                  style={{ 
                    transform: 'rotateX(-90deg) translateZ(500px)',
                    boxShadow: 'inset 0 0 200px #000'
                  }}
                />
              </div>
            </div>

            {/* Global atmospheric fog/glow */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black opacity-60" />
            <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black opacity-60" />
          </div>

          {/* Grid Overlay (Subtle) */}
          <div className="absolute inset-0 z-1 pointer-events-none opacity-20" 
            style={{ 
              backgroundImage: 'radial-gradient(rgba(251,191,36,0.15) 1px, transparent 1px)', 
              backgroundSize: '40px 40px',
            }} 
          />

          {/* Header Info */}
          <div className="absolute top-8 left-8 flex items-start gap-4 z-20">
        
            <div className="flex flex-col">
              <h1 className="text-lg font-display font-bold text-white leading-none tracking-widest uppercase">Agentic AI</h1>
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
        </>
      )}

      {/* Main Visual: Orbiting Rings */}
      {!mini && (
        <div 
          className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none"
        >
          <div 
            className="w-80 h-80 rounded-full pointer-events-auto cursor-pointer"
            onMouseEnter={() => setIsHovered(true)}
          />
        </div>
      )}

      <div 
        className={`absolute inset-0 flex items-center justify-center pointer-events-none ${mini ? 'scale-[0.2]' : ''}`}
      >
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
               className="w-16 h-16 relative"
               style={{ transformStyle: 'preserve-3d' }}
            >
               {/* Front: AI */}
               <div className="absolute inset-0 border border-white/20 bg-white/5 backdrop-blur-sm flex items-center justify-center" style={{ transform: 'translateZ(32px)' }}>
                  <span className="text-[10px] font-mono font-bold text-white uppercase tracking-widest">AI</span>
               </div>
               {/* Back: Agents */}
               <div className="absolute inset-0 border border-white/40 bg-gradient-to-br from-white/20 via-white/40 to-white/10 backdrop-blur-md flex items-center justify-center overflow-hidden" style={{ transform: 'translateZ(-32px) rotateY(180deg)' }}>
                  <motion.div 
                    animate={{ 
                      x: ['-100%', '200%'],
                      opacity: [0, 1, 0]
                    }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity, 
                      ease: "easeInOut",
                      repeatDelay: 1
                    }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/80 to-transparent skew-x-12"
                  />
                  {/* Sparkles */}
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-0.5 h-0.5 bg-white rounded-full shadow-[0_0_4px_white]"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ 
                        scale: [0, 1.5, 0],
                        opacity: [0, 1, 0],
                        x: [Math.random() * 60 - 30, Math.random() * 60 - 30],
                        y: [Math.random() * 60 - 30, Math.random() * 60 - 30]
                      }}
                      transition={{ 
                        duration: 1.5, 
                        repeat: Infinity, 
                        delay: Math.random() * 2,
                        ease: "easeOut"
                      }}
                    />
                  ))}
                  <span className="text-[11px] font-mono font-black text-white uppercase tracking-widest relative z-10 drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]">Agents</span>
               </div>
               {/* Right: Data */}
               <div className="absolute inset-0 border border-white/20 bg-white/5 backdrop-blur-sm flex items-center justify-center" style={{ transform: 'translateX(32px) rotateY(90deg)' }}>
                  <span className="text-[10px] font-mono font-bold text-white uppercase tracking-widest">Data</span>
               </div>
               {/* Left: Ship */}
               <div className="absolute inset-0 border border-white/20 bg-white/5 backdrop-blur-sm flex items-center justify-center" style={{ transform: 'translateX(-32px) rotateY(-90deg)' }}>
                  <span className="text-[10px] font-mono font-bold text-white uppercase tracking-widest">Ship</span>
               </div>
               {/* Top: AI */}
               <div className="absolute inset-0 border border-white/20 bg-white/5 backdrop-blur-sm flex items-center justify-center" style={{ transform: 'translateY(-32px) rotateX(90deg)' }}>
                  <span className="text-[10px] font-mono font-bold text-white uppercase tracking-widest">AI</span>
               </div>
               {/* Bottom: Ship */}
               <div className="absolute inset-0 border border-white/20 bg-white/5 backdrop-blur-sm flex items-center justify-center" style={{ transform: 'translateY(32px) rotateX(-90deg)' }}>
                  <span className="text-[10px] font-mono font-bold text-white uppercase tracking-widest">Ship</span>
               </div>
            </motion.div>
        </div>
      </div>

      {!mini && (
        <>
          {/* Hover State Buttons */}
          <AnimatePresence>
            {isHovered && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onMouseLeave={() => setIsHovered(false)}
                className="absolute inset-0 z-40 bg-black/60 backdrop-blur-[2px] flex items-center justify-center gap-8 px-12 pointer-events-auto"
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
        </>
      )}
    </motion.div>
  );
}
