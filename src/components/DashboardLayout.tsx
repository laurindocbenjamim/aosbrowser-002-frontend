import { LayoutDashboard, Users, MessageSquare, Terminal, Eye, Settings, Bell, Search, User, Sun, Moon, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import React, { useState, useEffect } from 'react';

interface SidebarItemProps {
  icon: any;
  label: string;
  count?: string;
}

function SidebarItem({ icon: Icon, label, count }: SidebarItemProps) {
  return (
    <div className="flex items-center justify-between px-4 py-3 group cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
      <div className="flex items-center gap-3">
        <Icon className="w-4 h-4 text-slate-500 dark:text-slate-400 group-hover:text-theme-accent transition-colors" />
        <span className="text-xs font-mono font-medium text-slate-600 dark:text-slate-400 group-hover:text-theme-text uppercase tracking-wider">{label}</span>
      </div>
      {count && (
        <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">{count}</span>
      )}
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<'dark' | 'frosted'>('dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'frosted' : 'dark');
  };

  return (
    <div className="flex h-screen bg-theme-bg text-theme-text overflow-hidden transition-colors duration-500">
      {/* Sidebar */}
      <aside className="w-64 border-r border-theme-border flex flex-col hidden lg:flex bg-theme-bg/50 backdrop-blur-sm">
        <div className="p-8">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-theme-text flex items-center justify-center">
               <div className="w-2 h-2 bg-theme-bg" />
            </div>
            <h1 className="text-xl font-display font-bold uppercase tracking-tighter">Cipher.OS</h1>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="px-4 py-2 mt-4">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest px-4">Navigation</span>
            <div className="mt-2 space-y-1">
              <SidebarItem icon={LayoutDashboard} label="Dashboard" />
              <SidebarItem icon={Users} label="Resources" count="12" />
              <SidebarItem icon={Terminal} label="Workshops" count="03" />
              <SidebarItem icon={MessageSquare} label="Group" />
              <SidebarItem icon={Eye} label="Look" />
            </div>
          </div>

          <div className="p-8 border-t border-theme-border mt-8">
             <div className="flex flex-col gap-1">
                <span className="text-[10px] font-mono text-slate-500 uppercase">Current Load</span>
                <span className="text-3xl font-display font-bold">1,248</span>
                <div className="w-full h-1 bg-theme-text/5 mt-4 rounded-full overflow-hidden">
                   <motion.div 
                     initial={{ width: 0 }}
                     animate={{ width: '65%' }}
                     className="h-full bg-theme-accent"
                   />
                </div>
                <div className="flex items-center gap-2 mt-4 opacity-70">
                   <div className="w-2 h-2 rounded-full bg-theme-accent animate-pulse" />
                   <span className="text-[10px] font-mono uppercase">Neural Link: OK</span>
                </div>
             </div>
          </div>
        </div>

        <div className="p-4 border-t border-theme-border">
           <SidebarItem icon={Settings} label="System Config" />
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Top Nav */}
        <header className="h-16 border-b border-theme-border flex items-center justify-between px-8 z-10 bg-theme-bg/30 backdrop-blur-md">
          <div className="flex items-center gap-6">
             <div className="flex items-center gap-2 text-slate-500 hover:text-theme-text cursor-pointer transition-colors">
                <Search className="w-4 h-4" />
                <span className="text-xs font-mono uppercase">Search Systems</span>
             </div>
          </div>
          <div className="flex items-center gap-4">
             {/* Theme Switcher Button */}
             <button 
               onClick={toggleTheme}
               className="p-2 glass-card rounded-lg hover:border-theme-accent transition-all group flex items-center gap-2 px-3"
             >
               <AnimatePresence mode="wait">
                 <motion.div
                   key={theme}
                   initial={{ rotate: -90, opacity: 0 }}
                   animate={{ rotate: 0, opacity: 1 }}
                   exit={{ rotate: 90, opacity: 0 }}
                   transition={{ duration: 0.2 }}
                 >
                   {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
                 </motion.div>
               </AnimatePresence>
               <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 group-hover:text-theme-text">
                 {theme === 'dark' ? 'Light' : 'Dark'} Mode
               </span>
             </button>

             <div className="p-2 text-slate-500 hover:text-theme-text cursor-pointer relative">
                <Bell className="w-4 h-4" />
                <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-theme-accent rounded-full" />
             </div>
             
             <div className="w-8 h-8 rounded-full bg-theme-text/10 flex items-center justify-center cursor-pointer border border-theme-border overflow-hidden">
                <User className="w-4 h-4" />
             </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <div className="flex-1 overflow-y-auto relative bg-theme-bg/20">
           {children}
        </div>
      </main>
    </div>
  );
}
