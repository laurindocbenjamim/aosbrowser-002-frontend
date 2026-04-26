import { Routes, Route, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import PreviewScene from './components/PreviewScene';
import { Menu, X, Globe, Terminal, Shield, Zap, Home, ChevronUp, ChevronDown, Maximize2, Minimize2, ArrowLeft, Send } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import validator from 'validator';

// Standardized Sanitization & Validation
const sanitizeInput = (val: string) => {
  return validator.escape(validator.trim(val));
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
});

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Automation', path: '/automation', icon: Zap },
    { name: 'Pentesting AI', path: '/pentesting', icon: Shield },
  ];

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-black/80 backdrop-blur-md border-b border-white/5 py-4' : 'bg-transparent py-6'}`}>
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-4 group">
          <div className="w-8 h-8 border border-white flex items-center justify-center p-1 transition-transform group-hover:scale-110">
            <div className="w-full h-full bg-white" />
          </div>
          <h1 className="text-xl font-display font-bold uppercase tracking-widest text-white">Axon Core</h1>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link 
              key={link.path} 
              to={link.path}
              className="text-[10px] font-mono uppercase tracking-[0.3em] text-slate-400 hover:text-white transition-colors"
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden text-white" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Nav Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            className="fixed inset-0 bg-black z-[60] flex flex-col items-center justify-center gap-8 md:hidden"
          >
            {navLinks.map((link) => (
              <Link 
                key={link.path} 
                to={link.path}
                onClick={() => setIsOpen(false)}
                className="text-2xl font-display font-bold uppercase tracking-widest text-white hover:text-theme-accent transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

function Console({ title, logs, isExpanded, onToggleExpand, isFullPage = false }: { title: string; logs: string[]; isExpanded: boolean; onToggleExpand: () => void; isFullPage?: boolean }) {
  return (
    <motion.div 
      initial={false}
      animate={{ 
        height: isExpanded ? (isFullPage ? '100vh' : '500px') : '48px',
        position: isExpanded && isFullPage ? 'fixed' : 'relative',
        inset: isExpanded && isFullPage ? 0 : 'auto',
        zIndex: isExpanded && isFullPage ? 100 : 10
      }}
      className={`bg-black/90 border-t border-white/10 font-mono overflow-hidden flex flex-col transition-all duration-300 ${isExpanded && isFullPage ? 'w-full' : ''}`}
    >
      <div className="h-12 flex justify-between items-center px-6 border-b border-white/5 cursor-pointer shrink-0" onClick={onToggleExpand}>
        <div className="flex items-center gap-2">
          <Terminal className="w-3 h-3 text-slate-500" />
          <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">{title}</span>
        </div>
        <div className="flex items-center gap-4">
           {isFullPage ? (
             isExpanded ? <Minimize2 className="w-3 h-3 text-slate-400" /> : <Maximize2 className="w-3 h-3 text-slate-400" />
           ) : (
             isExpanded ? <ChevronDown className="w-3 h-3 text-slate-400" /> : <ChevronUp className="w-3 h-3 text-slate-400" />
           )}
        </div>
      </div>
      <div className="flex-1 p-6 overflow-y-auto space-y-2">
        {logs.map((log, i) => (
          <div key={i} className="text-xs break-all">
            <span className="text-green-500 opacity-80 mr-2">[{new Date().toLocaleTimeString()}]</span>
            <span className="text-slate-300">{log}</span>
          </div>
        ))}
        {logs.length === 0 && <span className="text-xs text-slate-600 italic">Waiting for process signals...</span>}
      </div>
    </motion.div>
  );
}

function OffensiveAgentPage() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState<string[]>(['[SYSTEM] Waiting for initialization...']);
  const [isConsoleExpanded, setIsConsoleExpanded] = useState(false);
  const [formData, setFormData] = useState({ target: '', instruction: '', iterations: 15 });
  const [isLoading, setIsLoading] = useState(false);

  const handleLaunch = async () => {
    // Validation
    if (!validator.isURL(formData.target)) {
      setLogs(prev => [...prev, '[ERROR] Invalid Target URL format.']);
      return;
    }
    if (validator.isEmpty(formData.instruction)) {
      setLogs(prev => [...prev, '[ERROR] Instruction cannot be empty.']);
      return;
    }

    setIsLoading(true);
    setLogs(prev => [...prev, `[INIT] Engagement protocol sent to ${sanitizeInput(formData.target)}`]);

    try {
      const response = await api.post('/offensive/engagement', {
        target: sanitizeInput(formData.target),
        instruction: sanitizeInput(formData.instruction),
        iterations: formData.iterations
      });
      setLogs(prev => [...prev, `[SUCCESS] Received response: ${JSON.stringify(response.data)}`]);
    } catch (err: any) {
      setLogs(prev => [...prev, `[FAILURE] Node failure or offline service: ${err.message}`]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-24 pb-12 flex flex-col">
      <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col glass-card border-white/5 rounded-xl overflow-hidden tech-border relative">
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/5 rounded transition-colors">
              <ArrowLeft className="w-4 h-4 text-slate-400" />
            </button>
            <div className="flex items-center gap-4">
              <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
              <h1 className="text-2xl font-display font-bold tracking-tight">Offensive Agent v2.0</h1>
            </div>
          </div>
          <div className="flex items-center gap-6">
             <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-xs font-mono uppercase tracking-widest hover:bg-white/10 transition-colors flex items-center gap-2">
               <Terminal className="w-3 h-3" /> Audit History
             </button>
             <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Session: {isLoading ? 'Active' : 'Standby'}</span>
          </div>
        </div>

        <div className="flex-1 flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-white/5">
          {/* Sidebar */}
          <aside className="w-full md:w-80 p-6 flex flex-col gap-6 overflow-y-auto">
            <div className="space-y-2">
              <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Target URL</label>
              <input 
                type="text" 
                value={formData.target}
                onChange={(e) => setFormData({...formData, target: e.target.value})}
                placeholder="https://target-domain.com"
                className="w-full bg-black/40 border border-white/10 rounded px-4 py-2 text-sm focus:border-red-600/50 outline-none transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Attack Vector</label>
              <textarea 
                value={formData.instruction}
                onChange={(e) => setFormData({...formData, instruction: e.target.value})}
                className="w-full h-32 bg-black/40 border border-white/10 rounded px-4 py-2 text-sm focus:border-red-600/50 outline-none transition-colors resize-none"
                placeholder="Describe attack parameters..."
              />
            </div>

            <button 
              onClick={handleLaunch}
              disabled={isLoading}
              className="w-full py-3 bg-red-600 text-white font-display font-bold text-xs uppercase tracking-[0.2em] hover:bg-red-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Send className="w-3 h-3" />
              {isLoading ? 'Executing...' : 'Deploy Agent'}
            </button>
          </aside>

          {/* Main Area */}
          <main className="flex-1 flex flex-col relative">
            <div className="flex-1 p-8 flex items-center justify-center">
              <div className="max-w-xl w-full glass-card p-10 rounded-2xl border-white/5 bg-white/[0.02] text-center">
                <Shield className="w-12 h-12 text-red-600 mx-auto mb-6 opacity-80" />
                <h2 className="text-3xl font-display font-bold text-red-600 mb-4 uppercase tracking-widest">Ready for Engagement</h2>
                <p className="text-slate-400 text-xs leading-relaxed text-balance uppercase tracking-wider">
                  Configure the target and parameters in the sidebar. The agent will use its internal knowledge base of exploitation techniques.
                </p>
              </div>
            </div>

            <Console 
              title="Security Operations Center Log" 
              logs={logs} 
              isExpanded={isConsoleExpanded} 
              onToggleExpand={() => setIsConsoleExpanded(!isConsoleExpanded)}
            />
          </main>
        </div>
      </div>
    </div>
  );
}

function AgenticOSPage() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState<string[]>(['[SYSTEM] Core online... awaiting task.']);
  const [isConsoleExpanded, setIsConsoleExpanded] = useState(false);
  const [formData, setFormData] = useState({ target: '', instruction: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleRun = async () => {
    if (!validator.isURL(formData.target)) {
      setLogs(prev => [...prev, '[ERR] Invalid URI scheme.']);
      return;
    }
    setIsLoading(true);
    setLogs(prev => [...prev, `[CMD] Orchestrating node sequence for: ${sanitizeInput(formData.target)}`]);
    
    try {
      const resp = await api.post('/automation/task', {
        target: sanitizeInput(formData.target),
        指令: sanitizeInput(formData.instruction)
      });
      setLogs(prev => [...prev, `[OK] Task cycle completed. Result: ${resp.status}`]);
    } catch (err: any) {
      setLogs(prev => [...prev, `[TIMEOUT] Gateway offline: ${err.message}`]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-24 pb-12 flex flex-col">
      <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col glass-card border-white/5 rounded-xl overflow-hidden tech-border relative">
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/5 rounded transition-colors">
              <ArrowLeft className="w-4 h-4 text-slate-400" />
            </button>
            <div className="flex items-center gap-4">
              <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
              <h1 className="text-xl font-display font-bold">Agentic OS</h1>
            </div>
          </div>
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Secure Connection: {isLoading ? 'Active' : 'Idle'}</span>
        </div>

        <div className="flex-1 flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-white/5 font-sans">
          {/* Sidebar */}
          <aside className="w-full md:w-80 p-6 flex flex-col gap-6 overflow-y-auto">
            <div className="space-y-2">
              <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Target URL</label>
              <input 
                type="text" 
                value={formData.target}
                onChange={(e) => setFormData({...formData, target: e.target.value})}
                className="w-full bg-[#0a0a0a] border border-white/10 rounded px-4 py-2 text-sm focus:border-green-500/50 outline-none transition-colors"
                placeholder="https://app.instance.internal"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Agent Instruction</label>
              <textarea 
                value={formData.instruction}
                onChange={(e) => setFormData({...formData, instruction: e.target.value})}
                className="w-full h-32 bg-[#0a0a0a] border border-white/10 rounded px-4 py-2 text-sm focus:border-green-500/50 outline-none transition-colors resize-none"
                placeholder="Enter automation steps..."
              />
            </div>

            <button 
              onClick={handleRun}
              disabled={isLoading}
              className="w-full py-3 bg-green-600 text-black font-display font-bold text-xs uppercase tracking-[0.2em] hover:bg-green-500 transition-all disabled:opacity-50"
            >
              {isLoading ? 'Processing...' : 'Deploy Automation'}
            </button>
          </aside>

          {/* Main Area */}
          <main className="flex-1 flex flex-col relative justify-between">
            <div className="p-8">
              <div className="space-y-4">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">System Interface</span>
                <div className="bg-white/[0.02] border border-white/5 p-8 rounded-xl max-w-2xl backdrop-blur-sm">
                  <p className="text-sm text-slate-300 leading-relaxed font-sans opacity-80">
                    Neural process manager online. Define orchestration parameters in the control unit to initiate autonomous workflow execution.
                  </p>
                </div>
              </div>
            </div>

            <Console 
              title="Agent Execution Logs" 
              logs={logs} 
              isExpanded={isConsoleExpanded} 
              onToggleExpand={() => setIsConsoleExpanded(!isConsoleExpanded)}
            />
          </main>
        </div>
      </div>
    </div>
  );
}

function LandingPage() {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen w-screen bg-black flex flex-col items-center justify-center p-4 pt-24">
      <div className="w-full max-w-6xl aspect-video lg:aspect-[21/9]">
        <PreviewScene 
          layoutId="elegant-dark" 
          onNavigate={(page) => navigate(`/${page}`)} 
        />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <div className="bg-black">
      <Navbar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/automation" element={<AgenticOSPage />} />
        <Route path="/pentesting" element={<OffensiveAgentPage />} />
      </Routes>
    </div>
  );
}
