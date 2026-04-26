import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Terminal, Shield, Zap, Loader2, Square, Download } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { api, getWsUrl } from '../lib/api';
import { AgentSchema } from '../lib/schemas';
import { Console } from '../components/common/Console';
import { ProgressHeader } from '../components/common/ProgressHeader';

export default function OffensiveAgentPage() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState<string[]>(['[SYSTEM] Waiting for initialization...']);
  const [isConsoleExpanded, setIsConsoleExpanded] = useState(false);
  const [formData, setFormData] = useState({ target: '', instruction: '', iterations: 15 });
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [report, setReport] = useState<string | null>(null);
  const [techniques, setTechniques] = useState<string[]>(['SQL Injection', 'XSS', 'CSRF', 'SSRF', 'Auth Bypass', 'Dir Traversal', 'IDOR']);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    return () => { socketRef.current?.close(); };
  }, []);

  useEffect(() => {
    if (isLoading) setIsConsoleExpanded(true);
  }, [isLoading]);

  const handleLaunch = async () => {
    setLogs(prev => [...prev, '[SYSTEM] Commencing validation...']);
    const result = AgentSchema.safeParse(formData);
    
    if (!result.success) {
      const errorMsg = result.error.issues[0].message;
      setLogs(prev => [...prev, `[VALIDATION_ERROR] ${errorMsg}`]);
      setIsConsoleExpanded(true);
      return;
    }

    setIsLoading(true);
    setProgress(10);
    setLogs(prev => [...prev, `[INIT] Engagement protocol sent to ${formData.target}`]);

    try {
      let sid = sessionId;
      if (!sid) {
        setLogs(prev => [...prev, '[SYSTEM] Generating secure session token...']);
        const sResp = await api.post('/pentesting/session');
        sid = sResp.data.session_id;
        setSessionId(sid);
      }

      // Connect WebSocket
      if (socketRef.current) socketRef.current.close();
      const ws = new WebSocket(getWsUrl(`/pentesting/ws/${sid}`));
      socketRef.current = ws;

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'log') {
          setLogs(prev => [...prev, data.message]);
        } else if (data.type === 'status') {
          setLogs(prev => [...prev, `[STATUS] ${data.message}`]);
        } else if (data.type === 'step') {
          setLogs(prev => [...prev, `[STEP ${data.iteration}] ${data.thought}`]);
        } else if (data.type === 'progress') {
          setProgress(data.value);
        } else if (data.type === 'complete') {
          setLogs(prev => [...prev, '[SUCCESS] Engagement completed.']);
          setReport(data.data.report);
          setProgress(100);
        }
      };

      const payload: any = {
        url: formData.target,
        instruction: formData.instruction,
        max_iterations: formData.iterations,
        session_id: sid,
      };

      if (techniques.length > 0) {
        payload.context = `Techniques: ${techniques.join(', ')}`;
      }

      const response = await api.post('/pentesting/audit', payload);
      setLogs(prev => [...prev, `[OK] Audit Initialized. Status: ${response.data.status}`]);
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
      await api.post(`/pentesting/stop?session_id=${sessionId}`);
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
                placeholder="https://frontend-saas-tests.onrender.com"
                className="w-full bg-black/40 border border-white/10 rounded px-4 py-2 text-sm focus:border-red-600/50 outline-none transition-colors font-mono"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest shadow-red-500">Attack Instruction</label>
              <textarea 
                value={formData.instruction}
                onChange={(e) => setFormData({...formData, instruction: e.target.value})}
                className="w-full h-32 bg-black/40 border border-white/10 rounded px-4 py-2 text-sm focus:border-red-600/50 outline-none transition-colors resize-none font-sans"
                placeholder="Act as a Senior Penetration Tester. Conduct a comprehensive security assessment of the authentication flow (landing page, registration, and login)"
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
