import { Routes, Route, useNavigate, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import PreviewScene from './components/PreviewScene';
import { Menu, X, Globe, Terminal, Shield, Zap, Home, ChevronUp, ChevronDown, Maximize2, Minimize2, ArrowLeft, Send, Square, Download, Loader2 } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import validator from 'validator';
import { io, Socket } from 'socket.io-client';
import { jsPDF } from 'jspdf';
import { z } from 'zod';

// Zod Schemas for Validation
const AgentSchema = z.object({
  target: z.string().url({ message: "Invalid URL format (e.g., https://example.com)" }),
  instruction: z.string().min(10, { message: "Instruction must be at least 10 characters long" }),
  iterations: z.number().min(1).max(100).optional(),
});

const AutomationSchema = z.object({
  target: z.string().url({ message: "Invalid URL format (e.g., https://example.com)" }),
  instruction: z.string().min(10, { message: "Instruction must be at least 10 characters long" }),
  context: z.string().optional(),
  autoDecision: z.boolean().optional(),
});

// Standardized Sanitization & Validation
const sanitizeInput = (val: string) => {
  return validator.escape(validator.trim(val));
};

// @ts-ignore
const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
});

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === '/';

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
          <div className="w-10 h-10 flex items-center justify-center transition-transform group-hover:scale-110 relative">
            {!isHome ? (
              <PreviewScene layoutId="elegant-dark" mini />
            ) : (
              <div className="w-8 h-8 border border-white flex items-center justify-center p-1">
                <div className="w-full h-full bg-white" />
              </div>
            )}
          </div>
          <h1 className="text-xl font-display font-bold uppercase tracking-widest text-white">ASun Browser.</h1>
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

function Console({ title, logs, isExpanded, onToggleExpand, isFullPage = false, onDownload }: { title: string; logs: string[]; isExpanded: boolean; onToggleExpand: () => void; isFullPage?: boolean; onDownload?: () => void }) {
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
            <span className={log.includes('[ERROR]') || log.includes('[FAILURE]') ? 'text-red-400' : log.includes('[SUCCESS]') || log.includes('[OK]') ? 'text-green-400' : 'text-slate-300'}>
              {log}
            </span>
          </div>
        ))}
        {logs.length === 0 && <span className="text-xs text-slate-600 italic">Waiting for process signals...</span>}
      </div>
    </motion.div>
  );
}

function ProgressHeader({ progress, status }: { progress: number; status: string }) {
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

function OffensiveAgentPage() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState<string[]>(['[SYSTEM] Waiting for initialization...']);
  const [isConsoleExpanded, setIsConsoleExpanded] = useState(false);
  const [formData, setFormData] = useState({ target: '', instruction: '', iterations: 15 });
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [report, setReport] = useState<string | null>(null);
  const [techniques, setTechniques] = useState<string[]>(['SQL Injection', 'XSS', 'CSRF', 'SSRF', 'Auth Bypass', 'Dir Traversal', 'IDOR']);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    socketRef.current = io(API_URL);
    socketRef.current.on('agent_log', (data) => {
      setLogs(prev => [...prev, data.message]);
      if (data.progress) setProgress(data.progress);
    });
    return () => { socketRef.current?.disconnect(); };
  }, []);

  const handleLaunch = async () => {
    const result = AgentSchema.safeParse(formData);
    
    if (!result.success) {
      const errorMsg = result.error.issues[0].message;
      setLogs(prev => [...prev, `[VALIDATION_ERROR] ${errorMsg}`]);
      return;
    }

    setIsLoading(true);
    setProgress(10);
    setLogs(prev => [...prev, `[INIT] Engagement protocol sent to ${sanitizeInput(formData.target)}`]);

    try {
      const response = await api.post('/pentesting/audit', {
        url: sanitizeInput(formData.target),
        instruction: sanitizeInput(formData.instruction),
        max_iterations: formData.iterations,
        techniques: techniques
      });
      setLogs(prev => [...prev, `[SUCCESS] Audit Complete. Status: ${response.data.status}`]);
      setReport(response.data.report);
      setProgress(100);
    } catch (err: any) {
      let friendlyMessage = 'An unexpected error occurred during the engagement.';
      if (err.response) {
        switch (err.response.status) {
          case 400: friendlyMessage = 'Bad Request: Please verify terminal parameters.'; break;
          case 401: friendlyMessage = 'Unauthorized: Invalid node credentials.'; break;
          case 403: friendlyMessage = 'Forbidden: Access to this endpoint is restricted.'; break;
          case 404: friendlyMessage = 'Not Found: Target node or service unreachable.'; break;
          case 500: friendlyMessage = 'Internal Server Error: Node failure detected.'; break;
          default: friendlyMessage = `Communication Error: System code ${err.response.status}`;
        }
      } else if (err.request) {
        friendlyMessage = 'Network Error: Unable to establish connection to the gateway.';
      }
      setLogs(prev => [...prev, `[FAILURE] ${friendlyMessage}`]);
      setProgress(0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStop = async () => {
    try {
      await api.post('/pentesting/stop-audit');
      setLogs(prev => [...prev, '[SYSTEM] Abort signal sent. Terminating job...']);
      setIsLoading(false);
      setProgress(0);
    } catch (err: any) {
      setLogs(prev => [...prev, `[ERROR] Failed to stop task: ${err.message}`]);
    }
  };

  const downloadPDFReport = () => {
    if (!report) return;
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('Security Audit Report', 20, 20);
    doc.setFontSize(12);
    const splitText = doc.splitTextToSize(report, 180);
    doc.text(splitText, 20, 30);
    doc.save('offensive_audit_report.pdf');
  };

  const downloadHistory = () => {
    const element = document.createElement("a");
    const file = new Blob([logs.join('\n')], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = "engagement_history.txt";
    document.body.appendChild(element);
    element.click();
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-24 pb-12 flex flex-col">
      <div className="max-w-5xl mx-auto w-full flex-1 flex flex-col glass-card border-white/5 rounded-xl overflow-hidden tech-border relative">
        <ProgressHeader progress={progress} status={isLoading ? 'Active' : 'Standby'} />
        
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex flex-wrap items-center justify-between gap-4 bg-gradient-to-b from-white/5 to-transparent">
          <div className="flex items-center gap-6">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/5 rounded transition-colors">
              <ArrowLeft className="w-4 h-4 text-slate-400" />
            </button>
            <div className="flex items-center gap-4">
              <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse shadow-[0_0_10px_#ef4444]" />
              <h1 className="text-2xl font-display font-bold tracking-tight">Offensive Agent v2.0</h1>
            </div>
          </div>
          <div className="flex items-center gap-6">
             <button 
               onClick={downloadHistory}
               className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-xs font-mono uppercase tracking-widest hover:bg-white/10 transition-colors flex items-center gap-2"
             >
               <Terminal className="w-3 h-3" /> Audit History
             </button>
             <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest bg-black/40 px-3 py-1 rounded-full border border-white/5">Session: {isLoading ? 'Engaged' : 'Standby'}</span>
          </div>
        </div>

        <div className="flex-1 flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-white/5">
          {/* Sidebar */}
          <aside className="w-full md:w-80 p-6 flex flex-col gap-6 overflow-y-auto bg-black/20">
            <div className="space-y-2">
              <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Target URL</label>
              <input 
                type="text" 
                value={formData.target}
                onChange={(e) => setFormData({...formData, target: e.target.value})}
                placeholder="https://target-domain.com"
                className="w-full bg-black/40 border border-white/10 rounded px-4 py-2 text-sm focus:border-red-600/50 outline-none transition-colors font-mono"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest shadow-red-500">Attack Instruction</label>
              <textarea 
                value={formData.instruction}
                onChange={(e) => setFormData({...formData, instruction: e.target.value})}
                className="w-full h-32 bg-black/40 border border-white/10 rounded px-4 py-2 text-sm focus:border-red-600/50 outline-none transition-colors resize-none font-sans"
                placeholder="Describe attack parameters..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Engagement Scope</label>
              <div className="p-3 bg-red-600/5 border border-red-600/10 rounded-lg space-y-2">
                <label className="flex items-center gap-2 cursor-pointer group border-b border-white/5 pb-2 mb-2">
                  <input 
                    type="checkbox" 
                    onChange={(e) => {
                      if (e.target.checked) setTechniques(['SQL Injection', 'XSS', 'CSRF', 'SSRF', 'Auth Bypass', 'Dir Traversal', 'IDOR']);
                      else setTechniques([]);
                    }}
                    checked={techniques.length === 7}
                    className="w-3 h-3 accent-red-600" 
                  />
                  <span className="text-[10px] uppercase font-mono text-white font-bold">Select All</span>
                </label>
                {['SQL Injection', 'XSS', 'CSRF', 'SSRF', 'Auth Bypass', 'Dir Traversal', 'IDOR'].map((t) => (
                  <label key={t} className="flex items-center gap-2 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      checked={techniques.includes(t)}
                      onChange={(e) => {
                        if (e.target.checked) setTechniques([...techniques, t]);
                        else setTechniques(techniques.filter(x => x !== t));
                      }}
                      className="w-3 h-3 accent-red-600" 
                    />
                    <span className="text-[10px] uppercase font-mono text-slate-400 group-hover:text-white transition-colors">{t}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button 
                onClick={handleLaunch}
                disabled={isLoading}
                className="w-full py-3 bg-red-600 text-white font-display font-bold text-xs uppercase tracking-[0.2em] hover:bg-red-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-red-600/20"
              >
                {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
                {isLoading ? 'Engaging...' : 'Launch Engagement'}
              </button>

              {isLoading && (
                <button 
                  onClick={handleStop}
                  className="w-full py-3 border border-red-600/50 text-red-500 font-display font-bold text-xs uppercase tracking-[0.2em] hover:bg-red-600/10 transition-all flex items-center justify-center gap-2"
                >
                  <Square className="w-3 h-3 fill-current" />
                  Abort Execution
                </button>
              )}
            </div>

            {report && (
               <button 
                  onClick={downloadPDFReport}
                  className="w-full py-3 bg-white/5 border border-white/10 text-white font-display font-bold text-xs uppercase tracking-[0.2em] hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                >
                  <Download className="w-3 h-3" />
                  Export tactical report
                </button>
            )}
          </aside>

          {/* Main Area */}
          <main className="flex-1 flex flex-col relative bg-[#080808]">
            <div className="flex-1 p-8 flex items-center justify-center overflow-y-auto">
              <AnimatePresence mode="wait">
                {!report ? (
                  <motion.div 
                    key="waiting"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.1 }}
                    className="max-w-xl w-full glass-card p-10 rounded-2xl border-white/5 bg-white/[0.02] text-center"
                  >
                    <Shield className="w-12 h-12 text-red-600 mx-auto mb-6 opacity-80" />
                    <h2 className="text-3xl font-display font-bold text-red-600 mb-4 uppercase tracking-widest">Ready for Engagement</h2>
                    <p className="text-slate-400 text-[10px] leading-relaxed text-balance uppercase tracking-[0.2em] font-mono">
                      Configure the target and parameters in the sidebar. The agent will use its internal knowledge base of exploitation techniques.
                    </p>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="report"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-4xl prose prose-invert"
                  >
                    <div className="p-8 bg-white/[0.02] border border-white/5 rounded-xl font-sans">
                      <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-4">
                        <h2 className="text-2xl font-display font-bold text-red-600 uppercase tracking-widest m-0">Vulnerability Report</h2>
                        <span className="text-[10px] font-mono text-slate-500 uppercase">{new Date().toLocaleDateString()}</span>
                      </div>
                      <div className="text-slate-300 text-sm whitespace-pre-wrap font-mono leading-relaxed">
                        {report}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Console 
              title="Security Operations Center Log" 
              logs={logs} 
              isExpanded={isConsoleExpanded} 
              onToggleExpand={() => setIsConsoleExpanded(!isConsoleExpanded)}
              onDownload={downloadHistory}
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
  const [messages, setMessages] = useState<{sender: 'system' | 'user', text: string}[]>([
    { sender: 'system', text: 'Welcome to the Agent Console. Configure the task parameters in the sidebar and deploy the agent.' }
  ]);
  const [isConsoleExpanded, setIsConsoleExpanded] = useState(false);
  const [formData, setFormData] = useState({ 
    target: 'https://frontend-saas-tests.onrender.com/register', 
    instruction: '1. Execution Steps: Step 1 (Registration): Fill out the registration form with the following details: First Name: Feti, Last Name: Fetovic, Email: "fetovic@email.com", Password: "Fetovic123!", Confirm Password: "Fetovic123!" and submit. Step 2 (Login): Once you signup from the register page,you will be redirected to the login page,then log in with the credentials you just created. Step 3 (Navigation): After entering the dashboard, locate the sidebar and click on the "Users" menu. Step 4 (Action): On the users page, use the "Provision New User" button to create at least 3 new distinct users.',
    context: '',
    autoDecision: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    socketRef.current = io(API_URL);
    socketRef.current.on('agent_log', (data) => {
      setLogs(prev => [...prev, data.message]);
      if (data.progress) setProgress(data.progress);
      if (data.type === 'response' || data.type === 'result') {
        setMessages(prev => [...prev, { sender: 'system', text: data.message }]);
      }
    });
    return () => { socketRef.current?.disconnect(); };
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleRun = async () => {
    const result = AutomationSchema.safeParse(formData);
    
    if (!result.success) {
      const errorMsg = result.error.issues[0].message;
      setLogs(prev => [...prev, `[VALIDATION_ERR] ${errorMsg}`]);
      setMessages(prev => [...prev, { sender: 'system', text: `Validation Error: ${errorMsg}` }]);
      return;
    }
    
    setMessages(prev => [...prev, { 
      sender: 'user', 
      text: `Deploying agent to ${formData.target} with instructions: ${formData.instruction.substring(0, 100)}...` 
    }]);
    
    setIsLoading(true);
    setProgress(5);
    setLogs(prev => [...prev, `[CMD] Orchestrating node sequence for: ${sanitizeInput(formData.target)}`]);
    
    try {
      // Step 1: Get Session
      const sessionResp = await api.post('/automation/session', { user_id: 'guest' });
      const sid = sessionResp.data.session_id;
      setSessionId(sid);

      // Step 2: Run Task
      const resp = await api.post('/automation/run-task', {
        url: sanitizeInput(formData.target),
        instruction: sanitizeInput(formData.instruction),
        context: sanitizeInput(formData.context),
        auto_decision: formData.autoDecision,
        session_id: sid
      });
      setLogs(prev => [...prev, `[OK] Task cycle completed. Status: ${resp.data.status}`]);
      setMessages(prev => [...prev, { sender: 'system', text: `Task complete: ${resp.data.status}` }]);
      setProgress(100);
    } catch (err: any) {
      let friendlyMessage = 'Gateway offline or task interrupted.';
      if (err.response) {
        switch (err.response.status) {
          case 400: friendlyMessage = 'Workflow Error: Invalid execution parameters.'; break;
          case 403: friendlyMessage = 'Access Restricted: Node permission denied.'; break;
          case 404: friendlyMessage = 'Target Unavailable: Could not locate endpoint.'; break;
          case 503: friendlyMessage = 'Service Unavailable: Gateway overloaded.'; break;
          default: friendlyMessage = `Communication Interruption: Node Code ${err.response.status}`;
        }
      }
      setLogs(prev => [...prev, `[TIMEOUT] ${friendlyMessage}`]);
      setMessages(prev => [...prev, { sender: 'system', text: `Gateway error: ${friendlyMessage}` }]);
      setProgress(0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStop = async () => {
    try {
      await api.post('/automation/stop-task', { session_id: sessionId });
      setLogs(prev => [...prev, '[HALT] Execution command issued. Syncing...']);
      setMessages(prev => [...prev, { sender: 'system', text: 'Termination signal sent.' }]);
      setIsLoading(false);
      setProgress(0);
    } catch (err: any) {
      setLogs(prev => [...prev, `[ERR] Stop command failed: ${err.message}`]);
    }
  };

  const downloadHistory = () => {
    const element = document.createElement("a");
    const file = new Blob([logs.join('\n')], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = "agent_execution_logs.txt";
    document.body.appendChild(element);
    element.click();
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-24 pb-12 flex flex-col">
      <div className="max-w-5xl mx-auto w-full flex-1 flex flex-col glass-card border-white/5 rounded-xl overflow-hidden tech-border relative">
        <ProgressHeader progress={progress} status={isLoading ? 'Active' : 'Idle'} />
        
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-gradient-to-b from-white/5 to-transparent">
          <div className="flex items-center gap-6">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/5 rounded transition-colors">
              <ArrowLeft className="w-4 h-4 text-slate-400" />
            </button>
            <div className="flex items-center gap-4">
              <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)] animate-pulse" />
              <h1 className="text-xl font-display font-bold">Agentic OS</h1>
            </div>
          </div>
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest bg-black/40 px-3 py-1 rounded-full border border-white/5">
            Secure Connection: {isLoading ? 'Streaming' : 'Idle'}
          </span>
        </div>

        <div className="flex-1 flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-white/5">
          {/* Sidebar */}
          <aside className="w-full md:w-80 p-6 flex flex-col gap-6 overflow-y-auto bg-black/20">
            <div className="space-y-2">
              <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Target URL</label>
              <input 
                type="url" 
                value={formData.target}
                onChange={(e) => setFormData({...formData, target: e.target.value})}
                placeholder="https://example.com"
                className="w-full bg-[#0a0a0a] border border-white/10 rounded px-4 py-2.5 text-sm focus:border-green-500/50 outline-none transition-all font-mono"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Agent Instruction</label>
              <textarea 
                value={formData.instruction}
                onChange={(e) => setFormData({...formData, instruction: e.target.value})}
                className="w-full h-32 bg-[#0a0a0a] border border-white/10 rounded px-4 py-2 text-sm focus:border-green-500/50 outline-none transition-all resize-none scrollbar-hide"
                placeholder="Enter automation steps..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Context Data (Optional)</label>
              <textarea 
                value={formData.context}
                onChange={(e) => setFormData({...formData, context: e.target.value})}
                className="w-full h-24 bg-[#0a0a0a] border border-white/10 rounded px-4 py-2 text-sm focus:border-green-500/50 outline-none transition-all resize-none scrollbar-hide"
                placeholder="Provide additional details..."
              />
            </div>

            <div className="p-3 bg-white/[0.02] border border-white/10 rounded-lg flex items-center justify-between">
              <span className="text-[10px] font-mono text-slate-300 uppercase tracking-widest">Auto-Decision</span>
              <button 
                onClick={() => setFormData({...formData, autoDecision: !formData.autoDecision})}
                className={`w-10 h-5 rounded-full transition-colors relative ${formData.autoDecision ? 'bg-green-600' : 'bg-slate-700'}`}
              >
                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${formData.autoDecision ? 'left-6' : 'left-1'}`} />
              </button>
            </div>

            <button className="w-full py-3 border border-dashed border-white/10 rounded-lg text-[10px] font-mono text-slate-500 uppercase tracking-widest hover:bg-white/5 transition-colors flex items-center justify-center gap-2">
              <Download className="w-3 h-3" /> Attach Context File
            </button>

            <div className="flex flex-col gap-3">
              <button 
                onClick={handleRun}
                disabled={isLoading}
                className="w-full py-3.5 bg-green-600 text-black font-display font-bold text-xs uppercase tracking-[0.2em] hover:bg-green-500 transition-all disabled:opacity-50 shadow-lg shadow-green-500/10 flex items-center justify-center gap-2"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                {isLoading ? 'Processing...' : 'Deploy Automation'}
              </button>

              {isLoading && (
                <button 
                  onClick={handleStop}
                  className="w-full py-3.5 border border-red-600/50 text-red-500 font-display font-bold text-xs uppercase tracking-[0.2em] hover:bg-red-600/10 transition-all flex items-center justify-center gap-2"
                >
                  <Square className="w-4 h-4 fill-current" />
                  Stop Task
                </button>
              )}
            </div>
          </aside>

          {/* Main Area */}
          <main className="flex-1 flex flex-col relative bg-[#080808] overflow-hidden">
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth">
              <AnimatePresence initial={false}>
                {messages.map((msg, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-1.5 px-1">
                      {msg.sender === 'system' ? 'Node Interface' : 'Authenticated User'}
                    </span>
                    <div className={`max-w-[85%] px-5 py-4 rounded-2xl text-sm leading-relaxed ${
                      msg.sender === 'user' 
                        ? 'bg-green-600/10 border border-green-600/20 text-green-100 rounded-tr-none shadow-[0_0_20px_rgba(34,197,94,0.05)]' 
                        : 'bg-white/[0.03] border border-white/5 text-slate-300 rounded-tl-none'
                    }`}>
                      {msg.text}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={chatEndRef} />
            </div>

            <Console 
              title="Agent Execution Logs" 
              logs={logs} 
              isExpanded={isConsoleExpanded} 
              onToggleExpand={() => setIsConsoleExpanded(!isConsoleExpanded)}
              onDownload={downloadHistory}
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
