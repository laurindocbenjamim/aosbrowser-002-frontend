import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Zap, Loader2, Square, Download } from 'lucide-react';
import { api, getWsUrl } from '../lib/api';
import { AutomationSchema } from '../lib/schemas';
import { Console } from '../components/common/Console';
import { ProgressHeader } from '../components/common/ProgressHeader';

export default function AgenticOSPage() {
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
  const socketRef = useRef<WebSocket | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => { socketRef.current?.close(); };
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isLoading) setIsConsoleExpanded(true);
  }, [isLoading]);

  const handleRun = async () => {
    setLogs(prev => [...prev, '[SYSTEM] Validating instructions...']);
    const result = AutomationSchema.safeParse(formData);
    
    if (!result.success) {
      const errorMsg = result.error.issues[0].message;
      setLogs(prev => [...prev, `[VALIDATION_ERR] ${errorMsg}`]);
      setMessages(prev => [...prev, { sender: 'system', text: `Validation Error: ${errorMsg}` }]);
      setIsConsoleExpanded(true);
      return;
    }
    
    setMessages(prev => [...prev, { 
      sender: 'user', 
      text: `Deploying agent to ${formData.target}` 
    }]);
    
    setIsLoading(true);
    setProgress(5);
    setLogs(prev => [...prev, `[CMD] Orchestrating node sequence for: ${formData.target}`]);
    
    try {
      // Step 1: Get Session
      let sid = sessionId;
      if (!sid) {
        setLogs(prev => [...prev, '[SYSTEM] Initializing node session...']);
        const sessionResp = await api.post('/automation/session');
        sid = sessionResp.data.session_id;
        setSessionId(sid);
      }

      // Step 2: Connect WebSocket
      if (socketRef.current) socketRef.current.close();
      const ws = new WebSocket(getWsUrl(`/automation/ws/${sid}`));
      socketRef.current = ws;

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.progress !== undefined) setProgress(data.progress);
        
        if (data.type === 'status') {
          setLogs(prev => [...prev, `[AGENT] ${data.message}`]);
          if (data.final) {
            setMessages(prev => [...prev, { sender: 'system', text: data.message }]);
          }
        } else if (data.type === 'step') {
          setMessages(prev => [...prev, { 
            sender: 'system', 
            text: `Iteration ${data.iteration}: ${data.thought}` 
          }]);
          if (data.actions && data.actions.length > 0) {
            setLogs(prev => [...prev, `[ACTIONS] ${JSON.stringify(data.actions)}`]);
          }
        }
      };

      // Step 3: Run Task
      const payload: any = {
        url: formData.target,
        instruction: formData.instruction,
        auto_decision: formData.autoDecision,
        session_id: sid,
        max_iterations: 15
      };

      if (formData.context) {
        payload.context = formData.context;
      }

      const resp = await api.post('/automation/run-task', payload);
      setLogs(prev => [...prev, `[OK] Task queued. Status: ${resp.data.status}`]);
      setProgress(10);
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
      await api.post(`/automation/stop-task?session_id=${sessionId}`);
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
                    <div className={`max-w-[85%] px-5 py-4 rounded-2xl text-sm leading-relaxed transition-colors duration-300 ${
                      msg.sender === 'user' 
                        ? 'bg-green-600/10 border border-green-600/20 text-green-100 rounded-tr-none shadow-[0_0_20px_rgba(34,197,94,0.05)]' 
                        : (/error|failure|timeout|failed|vuln|vulnerability|exploit|found|risk|critical|breach/i.test(msg.text) && !/no vuln|no risk|success/i.test(msg.text))
                          ? 'bg-red-600/10 border border-red-600/30 text-red-200 rounded-tl-none shadow-[0_0_20px_rgba(239,68,68,0.05)]'
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
