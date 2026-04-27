import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, Terminal, Shield, Zap, Loader2, Square, Download, 
  Copy, Check, FileText, FileJson, FileCode, History, X,
  MoreVertical, AlertTriangle, Activity, Target, ShieldAlert as ShieldAlertIcon
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Cell, PieChart, Pie
} from 'recharts';
import { jsPDF } from 'jspdf';
import { v4 as uuidv4 } from 'uuid';
import { api, getWsUrl } from '../lib/api';
import { AgentSchema } from '../lib/schemas';
import { Console } from '../components/common/Console';
import { ProgressHeader } from '../components/common/ProgressHeader';

interface DashboardMetrics {
  totalVulnerabilities: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  riskScore: number;
  scanDuration: string;
  endpointsDiscovered: number;
}

export default function OffensiveAgentPage() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState<string[]>(['[SYSTEM] Waiting for initialization...']);
  const [isConsoleExpanded, setIsConsoleExpanded] = useState(false);
  const [formData, setFormData] = useState({ 
    target: 'https://frontend-saas-tests.onrender.com', 
    instruction: 'Act as a Senior Penetration Tester. Conduct a comprehensive security assessment of the authentication flow (landing page, registration, and login)', 
    iterations: 15 
  });
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [report, setReport] = useState<string | null>(null);
  const [techniques, setTechniques] = useState<string[]>(['SQL Injection', 'XSS', 'CSRF', 'SSRF', 'Auth Bypass', 'Dir Traversal', 'IDOR']);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [userUuid, setUserUuid] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [serverStatus, setServerStatus] = useState<'online' | 'offline'>('offline');
  const [history, setHistory] = useState<any[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<any>(null);
  
  const [dashboardMetrics, setDashboardMetrics] = useState<DashboardMetrics>({
    totalVulnerabilities: 0,
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    riskScore: 0,
    scanDuration: '00:00:00',
    endpointsDiscovered: 0
  });

  const socketRef = useRef<WebSocket | null>(null);
  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    const init = async () => {
      // Persistent User UUID
      let uuid = localStorage.getItem('asun_user_uuid');
      if (!uuid) {
        uuid = uuidv4();
        localStorage.setItem('asun_user_uuid', uuid);
      }
      setUserUuid(uuid);

      // Initial server check
      await checkServerHealth();
      
      // Get initial session so we can fetch history correctly if it requires a token
      try {
        const sResp = await api.post('/pentesting/session', { user_id: uuid });
        const sid = sResp.data.session_id;
        setSessionId(sid);
        await fetchHistory(uuid, sid);
      } catch (err) {
        console.error('Failed to initialize session', err);
        // Fallback to fetch without session if session call fails
        await fetchHistory(uuid);
      }
    };

    init();

    const healthInterval = setInterval(checkServerHealth, 30000);
    return () => { 
      socketRef.current?.close(); 
      if (timerRef.current) window.clearInterval(timerRef.current);
      clearInterval(healthInterval);
    };
  }, []);

  const updateDuration = () => {
    const now = Date.now();
    const diff = now - startTimeRef.current;
    const h = Math.floor(diff / 3600000).toString().padStart(2, '0');
    const m = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0');
    const s = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
    setDashboardMetrics(prev => ({ ...prev, scanDuration: `${h}:${m}:${s}` }));
  };

  const checkServerHealth = async () => {
    try {
      // The root path returns the main UI, so it's a safe health check
      await api.get('/'); 
      setServerStatus('online');
    } catch (err: any) {
      if (err.response) {
        setServerStatus('online');
      } else {
        setServerStatus('offline');
      }
    }
  };

  const fetchHistory = async (uuid: string, sid?: string | null) => {
    try {
      const config = sid ? { headers: { Authorization: `Bearer ${sid}` } } : {};
      const resp = await api.get(`/pentesting/history?user_uuid=${uuid}`, config);
      if (Array.isArray(resp.data)) {
        setHistory(resp.data);
      }
    } catch (err) {
      console.error('Failed to fetch history', err);
    }
  };

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
    
    // Reset metrics
    setDashboardMetrics({
      totalVulnerabilities: 0,
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      riskScore: 0,
      scanDuration: '00:00:00',
      endpointsDiscovered: techniques.length + Math.floor(Math.random() * 5)
    });
    setReport(null);
    startTimeRef.current = Date.now();
    timerRef.current = window.setInterval(updateDuration, 1000);

    try {
      let sid = sessionId;
      if (!sid) {
        setLogs(prev => [...prev, '[SYSTEM] Generating secure session token...']);
        const sResp = await api.post('/pentesting/session', { user_id: userUuid });
        sid = sResp.data.session_id;
        setSessionId(sid);
      }

      if (socketRef.current) socketRef.current.close();
      const ws = new WebSocket(getWsUrl(`/pentesting/ws/${sid}`));
      socketRef.current = ws;

      const authHeaders = { Authorization: `Bearer ${sid}` };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'log') {
          setLogs(prev => [...prev, data.message]);
          // Simple regex based heuristic for metrics update
          if (/critical|vulnerability found/i.test(data.message)) {
            setDashboardMetrics(prev => ({
              ...prev,
              critical: prev.critical + 1,
              totalVulnerabilities: prev.totalVulnerabilities + 1,
              riskScore: Math.min(100, prev.riskScore + 15)
            }));
          } else if (/high|exploit success/i.test(data.message)) {
            setDashboardMetrics(prev => ({
              ...prev,
              high: prev.high + 1,
              totalVulnerabilities: prev.totalVulnerabilities + 1,
              riskScore: Math.min(100, prev.riskScore + 10)
            }));
          } else if (/medium|potential/i.test(data.message)) {
            setDashboardMetrics(prev => ({
              ...prev,
              medium: prev.medium + 1,
              totalVulnerabilities: prev.totalVulnerabilities + 1,
            }));
          }
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
          if (timerRef.current) window.clearInterval(timerRef.current);
          fetchHistory(userUuid, sid);
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

      const response = await api.post('/pentesting/audit', payload, { headers: authHeaders });
      setLogs(prev => [...prev, `[OK] Audit Initialized. Status: ${response.data.status}`]);
    } catch (err: any) {
      setLogs(prev => [...prev, `[FAILURE] Communication error: ${err.message}`]);
      setProgress(0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStop = async () => {
    try {
      await api.post('/pentesting/stop', { session_id: sessionId });
      setLogs(prev => [...prev, '[SYSTEM] Abort signal sent. Terminating job...']);
      setIsLoading(false);
      setProgress(0);
    } catch (err: any) {
      setLogs(prev => [...prev, `[ERROR] Failed to stop task: ${err.message}`]);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(userUuid);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const exportReport = (format: 'pdf' | 'txt' | 'json' | 'xml', content?: string) => {
    const reportContent = content || report;
    if (!reportContent) return;

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `audit_report_${timestamp}`;

    switch (format) {
      case 'pdf':
        const doc = new jsPDF();
        doc.setFontSize(20);
        doc.text('Security Audit Report', 20, 20);
        doc.setFontSize(12);
        const splitText = doc.splitTextToSize(reportContent, 180);
        doc.text(splitText, 20, 30);
        doc.save(`${filename}.pdf`);
        break;
      case 'txt':
        downloadFile(`${filename}.txt`, reportContent, 'text/plain');
        break;
      case 'json':
        const jsonData = JSON.stringify({
          user_uuid: userUuid,
          timestamp: new Date().toISOString(),
          report: reportContent,
          logs: logs
        }, null, 2);
        downloadFile(`${filename}.json`, jsonData, 'application/json');
        break;
      case 'xml':
        const xmlData = `<?xml version="1.0" encoding="UTF-8"?>
<audit_report>
  <user_uuid>${userUuid}</user_uuid>
  <timestamp>${new Date().toISOString()}</timestamp>
  <content>${reportContent.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</content>
</audit_report>`;
        downloadFile(`${filename}.xml`, xmlData, 'application/xml');
        break;
    }
    setIsExportMenuOpen(false);
  };

  const downloadFile = (name: string, content: string, type: string) => {
    const element = document.createElement("a");
    const file = new Blob([content], {type: type});
    element.href = URL.createObjectURL(file);
    element.download = name;
    document.body.appendChild(element);
    element.click();
  };

  const downloadHistoryLogs = () => {
    downloadFile("engagement_history.txt", logs.join('\n'), 'text/plain');
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
              <div className={`w-2 h-2 rounded-full ${serverStatus === 'online' ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 'bg-red-600 shadow-[0_0_10px_#ef4444]'} animate-pulse`} />
              <h1 className="text-2xl font-display font-bold tracking-tight">Offensive Agent v2.0</h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <button 
               onClick={() => setIsHistoryOpen(true)}
               className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-xs font-mono uppercase tracking-widest hover:bg-white/10 transition-colors flex items-center gap-2"
             >
               <History className="w-3 h-3" /> Historic
             </button>
             <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest bg-black/40 px-3 py-1 rounded-full border border-white/5">
                Session: {isLoading ? 'Engaged' : 'Standby'}
             </span>
          </div>
        </div>

        <div className="flex-1 flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-white/5">
          {/* Sidebar */}
          <aside className="w-full md:w-80 p-6 flex flex-col gap-6 overflow-y-auto bg-black/20">
            {/* User UUID Section */}
            <div className="space-y-2">
              <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">User UUID</label>
              <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded px-1 group">
                <input 
                  type="text" 
                  value={userUuid}
                  readOnly
                  className="flex-1 bg-transparent border-none py-2 px-2 text-[10px] font-mono outline-none text-slate-400"
                />
                <button 
                  onClick={copyToClipboard}
                  className="p-1.5 hover:bg-white/5 rounded transition-colors text-slate-500 hover:text-white"
                  title="Copy UUID"
                >
                  {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            </div>

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
               <div className="relative">
                 <button 
                    onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
                    className="w-full py-3 bg-white/5 border border-white/10 text-white font-display font-bold text-xs uppercase tracking-[0.2em] hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                  >
                    <Download className="w-3 h-3" />
                    Export tactical report
                  </button>
                  <ExportMenu 
                    isOpen={isExportMenuOpen} 
                    onClose={() => setIsExportMenuOpen(false)} 
                    onExport={exportReport} 
                  />
               </div>
            )}
          </aside>

          {/* Main Area */}
          <main className="flex-1 flex flex-col relative bg-[#080808] overflow-hidden">
            <div className="flex-1 p-6 sm:p-8 overflow-y-auto custom-scrollbar">
              <AnimatePresence mode="wait">
                {!report && !isLoading ? (
                  <motion.div 
                    key="waiting"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.1 }}
                    className="max-w-xl mx-auto glass-card p-10 rounded-2xl border-white/5 bg-white/[0.02] text-center"
                  >
                    <Shield className="w-12 h-12 text-red-600 mx-auto mb-6 opacity-80" />
                    <h2 className="text-3xl font-display font-bold text-red-600 mb-4 uppercase tracking-widest">Ready for Engagement</h2>
                    <p className="text-slate-400 text-[10px] leading-relaxed text-balance uppercase tracking-[0.2em] font-mono">
                      Configure the target and parameters in the sidebar. The agent will use its internal knowledge base of exploitation techniques.
                    </p>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="active-dashboard"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-5xl mx-auto space-y-8"
                  >
                    {/* Metrics Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <MetricCard 
                        label="Total Vulnerabilities" 
                        value={dashboardMetrics.totalVulnerabilities} 
                        icon={<AlertTriangle className="w-4 h-4" />}
                        color="text-red-500"
                      />
                      <MetricCard 
                        label="Risk Score" 
                        value={`${dashboardMetrics.riskScore}%`} 
                        icon={<ShieldAlertIcon className="w-4 h-4" />}
                        color={dashboardMetrics.riskScore > 70 ? "text-red-600" : dashboardMetrics.riskScore > 30 ? "text-yellow-500" : "text-green-500"}
                      />
                      <MetricCard 
                        label="Scan Duration" 
                        value={dashboardMetrics.scanDuration} 
                        icon={<Activity className="w-4 h-4" />}
                        color="text-blue-400"
                      />
                      <MetricCard 
                        label="Endpoints Discovered" 
                        value={dashboardMetrics.endpointsDiscovered} 
                        icon={<Target className="w-4 h-4" />}
                        color="text-purple-400"
                      />
                    </div>

                    {/* Charts Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="glass-card p-6 border-white/5 bg-white/[0.02] rounded-xl h-80 flex flex-col">
                        <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                          <BarChart className="w-3 h-3" /> Vulnerability Distribution
                        </h3>
                        <div className="flex-1 w-full mt-2">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={[
                              { name: 'Critical', value: dashboardMetrics.critical, color: '#ef4444' },
                              { name: 'High', value: dashboardMetrics.high, color: '#f97316' },
                              { name: 'Medium', value: dashboardMetrics.medium, color: '#facc15' },
                              { name: 'Low', value: dashboardMetrics.low, color: '#3b82f6' }
                            ]}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10" />
                              <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                              <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                              <Tooltip 
                                contentStyle={{ backgroundColor: '#0f0f0f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '10px' }}
                                cursor={{ fill: '#ffffff05' }}
                              />
                              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                {[
                                  { name: 'Critical', color: '#ef4444' },
                                  { name: 'High', color: '#f97316' },
                                  { name: 'Medium', color: '#facc15' },
                                  { name: 'Low', color: '#3b82f6' }
                                ].map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      <div className="glass-card p-6 border-white/5 bg-white/[0.02] rounded-xl h-80 flex flex-col">
                        <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                          <PieChart className="w-3 h-3" /> Risk Assessment
                        </h3>
                        <div className="flex-1 w-full relative flex items-center justify-center">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={[
                                  { name: 'Risk', value: dashboardMetrics.riskScore },
                                  { name: 'Safe', value: 100 - dashboardMetrics.riskScore }
                                ]}
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                                startAngle={180}
                                endAngle={0}
                              >
                                <Cell fill={dashboardMetrics.riskScore > 70 ? '#ef4444' : dashboardMetrics.riskScore > 30 ? '#f97316' : '#22c55e'} />
                                <Cell fill="#ffffff05" stroke="none" />
                              </Pie>
                            </PieChart>
                          </ResponsiveContainer>
                          <div className="absolute inset-0 flex flex-col items-center justify-center pt-8">
                            <span className="text-2xl font-display font-bold">{dashboardMetrics.riskScore}%</span>
                            <span className="text-[8px] font-mono uppercase text-slate-500">Threat Level</span>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          <div className="p-3 bg-white/[0.02] rounded-lg border border-white/5">
                             <div className="text-[8px] font-mono text-slate-500 uppercase mb-1">Status</div>
                             <div className={`text-[10px] font-bold ${dashboardMetrics.totalVulnerabilities > 0 ? "text-red-500" : "text-green-500"}`}>
                                {dashboardMetrics.totalVulnerabilities > 0 ? "COMPROMISED" : "SECURE"}
                             </div>
                          </div>
                          <div className="p-3 bg-white/[0.02] rounded-lg border border-white/5">
                             <div className="text-[8px] font-mono text-slate-500 uppercase mb-1">Alerts</div>
                             <div className="text-[10px] font-bold text-white">{dashboardMetrics.critical + dashboardMetrics.high} CRITICAL</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Report Section */}
                    {report && (
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-full prose prose-invert"
                      >
                        <div className="p-8 bg-white/[0.02] border border-white/5 rounded-xl font-sans relative overflow-hidden group">
                          <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => {
                                navigator.clipboard.writeText(report);
                                setCopied(true);
                                setTimeout(() => setCopied(false), 2000);
                              }}
                              className="p-2 hover:bg-white/10 rounded transition-colors text-slate-500"
                            >
                              {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                            </button>
                          </div>
                          <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-4">
                            <div className="flex items-center gap-3">
                              <ShieldAlertIcon className="w-5 h-5 text-red-600" />
                              <h2 className="text-xl font-display font-bold text-red-600 uppercase tracking-widest m-0">Tactical Vulnerability Report</h2>
                            </div>
                            <span className="text-[10px] font-mono text-slate-500 uppercase">{new Date().toLocaleDateString()}</span>
                          </div>
                          <div className={`text-sm whitespace-pre-wrap font-mono leading-loose ${
                            /high|critical|vulnerability|exploit|found|vulnerable|risk/i.test(report) && !/no risk|success/i.test(report.toLowerCase())
                            ? 'text-red-400'
                            : 'text-slate-300'
                          }`}>
                            {report}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Console 
              title="Security Operations Center Log" 
              logs={logs} 
              isExpanded={isConsoleExpanded} 
              onToggleExpand={() => setIsConsoleExpanded(!isConsoleExpanded)}
              onDownload={downloadHistoryLogs}
            />
          </main>
        </div>
      </div>

      {/* Overlays */}
      <HistoryPanel 
        isOpen={isHistoryOpen} 
        onClose={() => setIsHistoryOpen(false)} 
        history={history}
        onSelectItem={(item) => setSelectedHistoryItem(item)}
      />

      <AnimatePresence>
        {selectedHistoryItem && (
          <HistoryExportModal 
            item={selectedHistoryItem} 
            onClose={() => setSelectedHistoryItem(null)} 
            onExport={exportReport}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function MetricCard({ label, value, icon, color }: { label: string, value: string | number, icon: React.ReactNode, color: string }) {
  return (
    <div className="glass-card p-4 border-white/5 bg-white/[0.02] rounded-xl flex items-center justify-between group transition-all hover:bg-white/[0.04]">
      <div>
        <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1">{label}</div>
        <div className={`text-xl font-display font-bold ${color}`}>{value}</div>
      </div>
      <div className={`p-2 bg-white/5 rounded-lg border border-white/5 ${color} opacity-60 group-hover:opacity-100 transition-opacity`}>
        {icon}
      </div>
    </div>
  );
}

function ExportMenu({ isOpen, onClose, onExport }: { isOpen: boolean, onClose: () => void, onExport: (format: 'pdf' | 'txt' | 'json' | 'xml') => void }) {
  if (!isOpen) return null;

  return (
    <div className="absolute bottom-full left-0 w-full mb-2 bg-[#121212] border border-white/10 rounded-lg shadow-2xl z-50 overflow-hidden">
      <div className="p-2 space-y-1">
        <button onClick={() => onExport('pdf')} className="w-full flex items-center gap-3 px-3 py-2 hover:bg-white/5 rounded text-xs font-mono text-slate-300 transition-colors">
          <FileText className="w-3.5 h-3.5 text-red-500" /> PDF Tactical Report
        </button>
        <button onClick={() => onExport('txt')} className="w-full flex items-center gap-3 px-3 py-2 hover:bg-white/5 rounded text-xs font-mono text-slate-300 transition-colors">
          <Terminal className="w-3.5 h-3.5 text-slate-400" /> TXT Raw Logs
        </button>
        <button onClick={() => onExport('json')} className="w-full flex items-center gap-3 px-3 py-2 hover:bg-white/5 rounded text-xs font-mono text-slate-300 transition-colors">
          <FileJson className="w-3.5 h-3.5 text-blue-400" /> JSON Data Export
        </button>
        <button onClick={() => onExport('xml')} className="w-full flex items-center gap-3 px-3 py-2 hover:bg-white/5 rounded text-xs font-mono text-slate-300 transition-colors">
          <FileCode className="w-3.5 h-3.5 text-orange-400" /> XML Structured
        </button>
      </div>
    </div>
  );
}

function HistoryPanel({ isOpen, onClose, history, onSelectItem }: { isOpen: boolean, onClose: () => void, history: any[], onSelectItem: (item: any) => void }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-[#0a0a0a] border-l border-white/10 z-[110] shadow-2xl flex flex-col"
          >
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <History className="w-5 h-5 text-red-600" />
                <h3 className="text-xl font-display font-bold uppercase tracking-widest">Audit Historic</h3>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {history.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-4 opacity-50">
                  <Terminal className="w-12 h-12" />
                  <p className="text-xs font-mono uppercase tracking-[0.2em]">No records found</p>
                </div>
              ) : (
                history.map((item, idx) => (
                  <div 
                    key={idx}
                    onClick={() => onSelectItem(item)}
                    className="p-4 bg-white/[0.02] border border-white/5 rounded-xl hover:border-red-600/30 cursor-pointer transition-all group"
                  >
                    <div className="flex justify-between items-start mb-2">
                       <span className="text-[10px] font-mono text-red-600 uppercase tracking-widest">#{idx + 1} Audit</span>
                       <span className="text-[9px] font-mono text-slate-600">{new Date(item.timestamp).toLocaleString()}</span>
                    </div>
                    <div className="text-sm font-bold mb-1 truncate text-slate-200 group-hover:text-white">{item.url}</div>
                    <div className="text-[10px] text-slate-500 line-clamp-2 italic">"{item.instruction}"</div>
                    <div className="mt-3 flex items-center gap-2">
                       <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                       <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest">{item.result?.status || 'Complete'}</span>
                       <div className="flex-1" />
                       <MoreVertical className="w-3 h-3 text-slate-600" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function HistoryExportModal({ item, onClose, onExport }: { item: any, onClose: () => void, onExport: (format: 'pdf' | 'txt' | 'json' | 'xml', content: string) => void }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-[150] p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-md"
      />
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-xl bg-[#0d0d0d] border border-white/10 rounded-2xl shadow-2xl relative z-10 overflow-hidden"
      >
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-red-600/10 to-transparent">
          <div>
            <h4 className="text-lg font-display font-bold uppercase tracking-widest">Session Intelligence</h4>
            <p className="text-[10px] font-mono text-slate-500 mt-1 uppercase tracking-widest">{item.url}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-8">
          <div className="grid grid-cols-2 gap-4">
             <button 
              onClick={() => onExport('pdf', item.result.report)} 
              className="flex flex-col items-center gap-3 p-6 bg-white/[0.02] border border-white/5 rounded-xl hover:bg-red-600/10 hover:border-red-600/30 transition-all group"
            >
               <FileText className="w-8 h-8 text-red-500 group-hover:scale-110 transition-transform" />
               <span className="text-[10px] font-mono uppercase tracking-[0.2em]">Portable Document</span>
             </button>
             <button 
              onClick={() => onExport('txt', item.result.report)} 
              className="flex flex-col items-center gap-3 p-6 bg-white/[0.02] border border-white/5 rounded-xl hover:bg-white/5 transition-all group"
            >
               <Terminal className="w-8 h-8 text-slate-400 group-hover:scale-110 transition-transform" />
               <span className="text-[10px] font-mono uppercase tracking-[0.2em]">Plain Terminal</span>
             </button>
             <button 
              onClick={() => onExport('json', item.result.report)} 
              className="flex flex-col items-center gap-3 p-6 bg-white/[0.02] border border-white/5 rounded-xl hover:bg-blue-600/10 hover:border-blue-600/30 transition-all group"
            >
               <FileJson className="w-8 h-8 text-blue-400 group-hover:scale-110 transition-transform" />
               <span className="text-[10px] font-mono uppercase tracking-[0.2em]">Semantic JSON</span>
             </button>
             <button 
              onClick={() => onExport('xml', item.result.report)} 
              className="flex flex-col items-center gap-3 p-6 bg-white/[0.02] border border-white/5 rounded-xl hover:bg-orange-600/10 hover:border-orange-600/30 transition-all group"
            >
               <FileCode className="w-8 h-8 text-orange-400 group-hover:scale-110 transition-transform" />
               <span className="text-[10px] font-mono uppercase tracking-[0.2em]">Markup XML</span>
             </button>
          </div>

          <div className="mt-8 p-4 bg-black/40 border border-white/5 rounded-lg">
             <h5 className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-2">Tactical Summary</h5>
             <div className="text-xs text-slate-400 line-clamp-3">
               {item.result.report ? item.result.report.substring(0, 300) : "No report content available."}
             </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
