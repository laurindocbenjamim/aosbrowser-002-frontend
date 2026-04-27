import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, Zap, Globe, Share2, Database, Lock, Loader2 } from 'lucide-react';
import { useState } from 'react';

interface PreviewSceneProps {
  layoutId: string;
  onNavigate?: (page: string) => void;
  mini?: boolean;
}

export default function PreviewScene({ layoutId, onNavigate, mini = false }: PreviewSceneProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [loadingTarget, setLoadingTarget] = useState<string | null>(null);

  const handleNavigate = (page: string) => {
    setLoadingTarget(page);
    setTimeout(() => {
      onNavigate?.(page);
    }, 800);
  };

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
                  className="absolute w-32 h-32 bg-white blur-[2px] shadow-[0_0_120px_60px_rgba(255,255,255,0.15)] z-0 opacity-20"
                  style={{ transform: 'translateZ(-1200px)' }}
                />

                {/* Tunnel Ribs / Light Elements */}
                {[...Array(15)].map((_, i) => {
                  const zPos = i * 160 - 1200;
                  return (
                    <div key={`ribs-${i}`} className="absolute inset-0" style={{ transform: `translateZ(${zPos}px)`, transformStyle: 'preserve-3d' }}>
                      {/* Left Wall Rib (V-shape) */}
                      <div className="absolute top-1/2 left-0 -translate-y-1/2" style={{ transformStyle: 'preserve-3d' }}>
                        <div 
                          className="absolute w-1 h-40 bg-gradient-to-b from-transparent via-white/10 to-transparent blur-[2px]"
                          style={{ 
                            transform: 'translateX(-800px) rotateY(90deg) skewY(25deg) translateY(-20px)',
                          }}
                        />
                        <div 
                          className="absolute w-1 h-40 bg-gradient-to-b from-transparent via-white/10 to-transparent blur-[2px]"
                          style={{ 
                            transform: 'translateX(-800px) rotateY(90deg) skewY(-25deg) translateY(20px)',
                          }}
                        />
                      </div>
                      
                      {/* Right Wall Rib (V-shape) */}
                      <div className="absolute top-1/2 right-0 -translate-y-1/2" style={{ transformStyle: 'preserve-3d' }}>
                        <div 
                          className="absolute w-1 h-40 bg-gradient-to-b from-transparent via-white/10 to-transparent blur-[2px]"
                          style={{ 
                            transform: 'translateX(800px) rotateY(-90deg) skewY(-25deg) translateY(-20px)',
                          }}
                        />
                        <div 
                          className="absolute w-1 h-40 bg-gradient-to-b from-transparent via-white/10 to-transparent blur-[2px]"
                          style={{ 
                            transform: 'translateX(800px) rotateY(-90deg) skewY(25deg) translateY(20px)',
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
                
                {/* Left Wall */}
                <div 
                  className="absolute w-[1600px] h-full bg-[#080808] border-r border-white/5"
                  style={{ 
                    transform: 'rotateY(90deg) translateZ(-800px)',
                    backgroundImage: 'linear-gradient(to right, #000, transparent)',
                    maskImage: 'linear-gradient(to bottom, transparent, black, transparent)'
                  }}
                >
                  <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
                </div>

                {/* Right Wall */}
                <div 
                  className="absolute w-[1600px] h-full bg-[#080808] border-l border-white/5"
                  style={{ 
                    transform: 'rotateY(-90deg) translateZ(-800px)',
                    backgroundImage: 'linear-gradient(to left, #000, transparent)',
                    maskImage: 'linear-gradient(to bottom, transparent, black, transparent)'
                  }}
                >
                  <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
                </div>

                {/* Floor */}
                <div 
                  className="absolute w-[2000px] h-[2000px] bg-[#020202]"
                  style={{ 
                    transform: 'rotateX(90deg) translateZ(280px)',
                    backgroundImage: `
                      radial-gradient(ellipse at center, rgba(64, 100, 255, 0.25) 0%, rgba(64, 100, 255, 0) 70%),
                      radial-gradient(ellipse at center, rgba(147, 51, 234, 0.15) 0%, rgba(0, 0, 0, 0) 90%),
                      linear-gradient(to right, transparent, rgba(64, 100, 255, 0.05) 50%, transparent)
                    `,
                  }}
                >
                  <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: 'repeating-linear-gradient(transparent, transparent 40px, rgba(255,255,255,1) 41px)', maskImage: 'linear-gradient(to right, transparent, black 25%, black 75%, transparent)' }} />
                  
                  {/* Diffused shadow for the central object */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <motion.div 
                       animate={{ 
                         scale: [1, 1.4, 1],
                         opacity: [0.3, 0.5, 0.3]
                       }}
                       transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                       className="w-96 h-96 bg-blue-500/40 blur-[100px] rounded-full"
                    />
                    <motion.div 
                       animate={{ 
                         scale: [0.8, 1.2, 0.8],
                         opacity: [0.4, 0.6, 0.4]
                       }}
                       transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                       className="w-48 h-48 bg-purple-500/50 blur-[60px] rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                    />
                  </div>
                </div>

                {/* Ceiling */}
                <div 
                  className="absolute w-full h-[1600px] bg-black"
                  style={{ 
                    transform: 'rotateX(-90deg) translateZ(800px)',
                    boxShadow: 'inset 0 0 200px #000'
                  }}
                />
              </div>
            </div>

            {/* Global atmospheric fog/glow */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black opacity-40" />
            <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black opacity-40" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,black_100%)] opacity-60" />
          </div>

          {/* Grid Overlay (Subtle) */}
          <div className="absolute inset-0 z-1 pointer-events-none opacity-20" 
            style={{ 
              backgroundImage: 'radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px)', 
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
          className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none scale-[0.7] sm:scale-100 -translate-y-8 sm:translate-y-[-10%]"
        >
          <div 
            className="w-80 h-80 rounded-full pointer-events-auto cursor-pointer"
            onMouseEnter={() => setIsHovered(true)}
          />
        </div>
      )}

      <motion.div 
        animate={{ y: [0, -15, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className={`absolute inset-0 flex items-center justify-center pointer-events-none ${mini ? 'scale-[0.2]' : 'scale-[0.7] sm:scale-100 -translate-y-8 sm:translate-y-[-10%]'}`}
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
               <div className="absolute inset-0 border border-cyan-400/50 bg-gradient-to-br from-cyan-100/30 via-white/40 to-blue-200/30 backdrop-blur-md flex items-center justify-center overflow-hidden" style={{ transform: 'translateZ(-32px) rotateY(180deg)' }}>
                  {/* Prismatic Refraction Effect */}
                  <motion.div 
                    animate={{ 
                      x: ['-200%', '200%'],
                      rotate: [0, 20]
                    }}
                    transition={{ 
                      duration: 3, 
                      repeat: Infinity, 
                      ease: "linear"
                    }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/20 via-white/60 via-pink-400/20 to-transparent skew-x-25 w-[300%]"
                  />
                  
                  {/* Crystalline facets overlay */}
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.2)_0%,transparent_70%)]" />
                  <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'linear-gradient(30deg, transparent 45%, #fff 50%, transparent 55%), linear-gradient(-30deg, transparent 45%, #fff 50%, transparent 55%)', backgroundSize: '10px 10px' }} />

                  {/* Sparkles */}
                  {[...Array(8)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-1 h-1 bg-white rounded-full"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ 
                        scale: [0, 1.2, 0],
                        opacity: [0, 1, 0],
                        x: [Math.random() * 64 - 32, Math.random() * 64 - 32],
                        y: [Math.random() * 64 - 32, Math.random() * 64 - 32],
                        boxShadow: ['0 0 0px white', '0 0 8px white', '0 0 0px white']
                      }}
                      transition={{ 
                        duration: 2, 
                        repeat: Infinity, 
                        delay: Math.random() * 3,
                        ease: "easeInOut"
                      }}
                    />
                  ))}
                  
                  <span className="text-[11px] font-mono font-black text-white uppercase tracking-widest relative z-10 drop-shadow-[0_0_10px_rgba(255,255,255,1)]">
                    <span className="bg-clip-text text-transparent bg-gradient-to-b from-white via-cyan-100 to-blue-200">
                      Agents
                    </span>
                  </span>
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
      </motion.div>

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
                  disabled={loadingTarget !== null}
                  onClick={() => handleNavigate('automation')}
                  className="flex-1 max-w-[200px] h-14 border border-white/10 bg-[#0A0A0A] hover:bg-white/5 transition-all flex items-center justify-center gap-3 group/btn pointer-events-auto disabled:opacity-50"
                >
                  {loadingTarget === 'automation' ? (
                    <Loader2 className="w-4 h-4 text-theme-accent animate-spin" />
                  ) : (
                    <Zap className="w-4 h-4 text-theme-accent group-hover/btn:scale-110 transition-transform" />
                  )}
                  <span className="text-[10px] font-display font-bold text-white uppercase tracking-[0.3em]">
                    {loadingTarget === 'automation' ? 'Loading...' : 'Automation'}
                  </span>
                </motion.button>
                
                <motion.button
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  disabled={loadingTarget !== null}
                  onClick={() => handleNavigate('pentesting')}
                  className="flex-1 max-w-[200px] h-14 border border-theme-accent/30 bg-[#0A0A0A] hover:bg-theme-accent/5 transition-all flex items-center justify-center gap-3 group/btn pointer-events-auto disabled:opacity-50"
                >
                  {loadingTarget === 'pentesting' ? (
                    <Loader2 className="w-4 h-4 text-orange-500 animate-spin" />
                  ) : (
                    <ShieldAlert className="w-4 h-4 text-orange-500 group-hover/btn:scale-110 transition-transform" />
                  )}
                  <span className="text-[10px] font-display font-bold text-white uppercase tracking-[0.3em]">
                    {loadingTarget === 'pentesting' ? 'Initializing...' : 'Pentesting AI'}
                  </span>
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer Details */}
          <div className="absolute bottom-4 sm:bottom-8 left-6 sm:left-8 max-w-[calc(100%-3rem)] sm:max-w-sm z-20">
            <p className="text-[8px] sm:text-[10px] font-sans text-slate-500 leading-relaxed uppercase tracking-widest text-balance">
              Advanced heuristics engine detecting anomalies in real-time across decentralized architectures.
            </p>
          </div>

          <div className="absolute bottom-4 sm:bottom-8 right-6 sm:right-8 flex flex-col sm:flex-row items-end sm:items-center gap-2 sm:gap-12 z-20 font-mono">
            <div className="flex items-center gap-2 hidden sm:flex">
              <span className="text-[8px] text-slate-600 uppercase tracking-[0.2em]">Secops Framework</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[7px] sm:text-[8px] text-slate-600 uppercase tracking-[0.2em]">Tunnel:</span>
              <span className="text-[7px] sm:text-[8px] text-green-500 uppercase font-bold tracking-[0.2em]">On</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[7px] sm:text-[8px] text-slate-600 uppercase tracking-[0.2em]">Node:</span>
              <span className="text-[7px] sm:text-[8px] text-blue-500 uppercase font-bold tracking-[0.2em]">Oxfds</span>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
}
