import React, { useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Terminal, Download, Minimize2, Maximize2, ChevronDown, ChevronUp } from 'lucide-react';

interface ConsoleProps {
  title: string;
  logs: string[];
  isExpanded: boolean;
  onToggleExpand: () => void;
  isFullPage?: boolean;
  onDownload?: () => void;
}

export function Console({ title, logs, isExpanded, onToggleExpand, isFullPage = false, onDownload }: ConsoleProps) {
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isExpanded) {
      logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, isExpanded]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onToggleExpand();
    }
  };

  return (
    <motion.div 
      initial={false}
      animate={{ 
        height: isExpanded ? (isFullPage ? '100vh' : '500px') : '48px',
        position: isExpanded && isFullPage ? 'fixed' : 'relative',
        inset: isExpanded && isFullPage ? 0 : 'auto',
        zIndex: isExpanded && isFullPage ? 100 : 10
      }}
      className={`bg-black/95 border-t border-white/10 font-mono overflow-hidden flex flex-col transition-all duration-300 ${isExpanded && isFullPage ? 'w-full' : ''} tech-border`}
    >
      <div 
        className="h-12 flex justify-between items-center px-6 border-b border-white/5 cursor-pointer shrink-0 bg-[#0a0a0a]" 
        onClick={onToggleExpand}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
        aria-expanded={isExpanded}
        aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${title}`}
      >
        <div className="flex items-center gap-2">
          <Terminal className="w-3 h-3 text-slate-500" />
          <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">{title}</span>
        </div>
        <div className="flex items-center gap-4">
           {onDownload && (
             <button 
               onClick={(e) => { e.stopPropagation(); onDownload(); }}
               className="p-1.5 hover:bg-white/5 rounded transition-colors"
               title="Download History"
               aria-label="Download log history"
             >
               <Download className="w-3 h-3 text-slate-400" />
             </button>
           )}
           <div className="p-1">
             {isFullPage ? (
               isExpanded ? <Minimize2 className="w-3 h-3 text-slate-400" /> : <Maximize2 className="w-3 h-3 text-slate-400" />
             ) : (
               isExpanded ? <ChevronDown className="w-3 h-3 text-slate-400" /> : <ChevronUp className="w-3 h-3 text-slate-400" />
             )}
           </div>
        </div>
      </div>
      <div className="flex-1 p-6 overflow-y-auto space-y-2 bg-black/40">
        {logs.map((log, i) => (
          <div key={i} className="text-xs break-all border-l-2 border-white/5 pl-3 py-1">
            <span className="text-green-500 opacity-60 mr-2 tabular-nums">[{new Date().toLocaleTimeString()}]</span>
            <span className={
              log.includes('[System]') ? 'text-blue-400' :
              log.includes('[Agent]') ? 'text-blue-300' :
              log.includes('[Status]') ? 'text-amber-400' :
              log.includes('[Step') ? 'text-purple-400' :
              log.includes('[Actions') ? 'text-blue-200' :
              log.includes('EXPLOITING TECHNIQUE') || log.includes('ATTACK TECHNIQUE') ? 'text-red-500 font-black border-y border-red-500/20 py-1 my-1 block bg-red-500/5' :
              log.includes('TECHNIQUE COMPLETED') || log.includes('EXPLOIT SUCCESSFUL') ? 'text-green-500 font-black border-y border-green-500/20 py-1 my-1 block bg-green-500/5' :
              ((log.includes('[ERROR]') || log.includes('[FAILURE]') || /found|exploit|critical|vulnerable|injection|breach/i.test(log)) && 
               !/no vuln|no risk|success|scanning|checking/i.test(log.toLowerCase())) 
              ? 'text-red-400 font-bold' 
              : (log.includes('[SUCCESS]') || log.includes('[OK]') || log.includes('COMPLETED')) 
                ? 'text-green-400' 
                : 'text-slate-300'
            }>
              {log}
            </span>
          </div>
        ))}
        {logs.length === 0 && <span className="text-xs text-slate-600 italic">Waiting for process signals...</span>}
        <div ref={logEndRef} />
      </div>
    </motion.div>
  );
}
