'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Download, 
  Calendar, 
  Loader2, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Settings, 
  Plus, 
  Search, 
  Copy, 
  Check, 
  Eye, 
  X, 
  ShieldAlert, 
  Layers, 
  CheckSquare, 
  RefreshCw, 
  Trash2, 
  Info 
} from 'lucide-react';

interface CompiledReport {
  name: string;
  type: string;
  date: string;
  format: string;
  status: string;
  content: string;
  download_url: string;
}

interface ScheduleItem {
  id: string;
  report: string;
  schedule: string;
  nextRun: string;
  active: boolean;
}

// Custom parser to map markdown string into styled React elements
function parseInline(text: string): React.ReactNode[] {
  let tokens: (string | React.ReactNode)[] = [text];

  const replaceToken = (
    regex: RegExp, 
    fn: (match: string, ...args: any[]) => React.ReactNode
  ) => {
    const newTokens: (string | React.ReactNode)[] = [];
    for (const t of tokens) {
      if (typeof t !== 'string') {
        newTokens.push(t);
        continue;
      }
      
      let lastIndex = 0;
      t.replace(regex, (match: string, ...args: any[]) => {
        const offset = args[args.length - 2];
        if (offset > lastIndex) {
          newTokens.push(t.substring(lastIndex, offset));
        }
        newTokens.push(fn(match, ...args));
        lastIndex = offset + match.length;
        return match;
      });
      
      if (lastIndex < t.length) {
        newTokens.push(t.substring(lastIndex));
      }
    }
    tokens = newTokens;
  };

  // 1. Highlight standard severity notations
  replaceToken(/\[Critical\]|\[CRITICAL\]/g, () => (
    <span className="px-2 py-0.5 text-[10px] bg-red-950/40 text-cyber-red border border-cyber-red/30 rounded font-bold font-mono align-middle mx-1">
      CRITICAL
    </span>
  ));
  
  replaceToken(/\[High\]|\[HIGH\]/g, () => (
    <span className="px-2 py-0.5 text-[10px] bg-orange-950/40 text-cyber-amber border border-cyber-amber/30 rounded font-bold font-mono align-middle mx-1">
      HIGH
    </span>
  ));
  
  replaceToken(/\[Medium\]|\[MEDIUM\]/g, () => (
    <span className="px-2 py-0.5 text-[10px] bg-yellow-950/20 text-yellow-400 border border-yellow-500/20 rounded font-bold font-mono align-middle mx-1">
      MEDIUM
    </span>
  ));

  replaceToken(/\[OK\]|\[Stable\]|\[STABLE\]|\[Ready\]|\[READY\]/gi, () => (
    <span className="px-2 py-0.5 text-[10px] bg-green-950/40 text-cyber-green border border-cyber-green/20 rounded font-bold font-mono align-middle mx-1">
      READY
    </span>
  ));

  // 2. Parse inline backtick code `something`
  replaceToken(/`([^`]+)`/g, (match, code) => (
    <code className="px-1.5 py-0.5 bg-cyber-panel border border-cyber-amber/20 rounded font-mono text-xs text-cyber-cyan select-all">
      {code}
    </code>
  ));

  // 3. Parse double asterisks bold **bold**
  replaceToken(/\*\*([^*]+)\*\*/g, (match, boldText) => (
    <strong className="font-semibold text-white">
      {boldText}
    </strong>
  ));

  return tokens.map((t, idx) => <span key={idx}>{t}</span>);
}

function MarkdownRenderer({ content }: { content: string }) {
  const lines = content.split('\n');
  let inCodeBlock = false;
  let codeBlockLines: string[] = [];
  const parsedElements = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Code Blocks
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        parsedElements.push(
          <pre key={`code-${i}`} className="p-3 bg-cyber-bg-secondary border border-cyber-amber/10 rounded font-mono text-xs text-gray-300 overflow-x-auto my-3 leading-relaxed">
            {codeBlockLines.join('\n')}
          </pre>
        );
        codeBlockLines = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockLines.push(line);
      continue;
    }

    // H1 Headings
    if (line.startsWith('# ')) {
      parsedElements.push(
        <h1 key={`h1-${i}`} className="text-2xl font-bold bg-gradient-to-r from-cyber-amber to-cyber-orange bg-clip-text text-transparent mt-6 mb-4 border-b border-cyber-amber/20 pb-2 flex items-center gap-2">
          {parseInline(line.substring(2))}
        </h1>
      );
      continue;
    }

    // H2 Headings
    if (line.startsWith('## ')) {
      parsedElements.push(
        <h2 key={`h2-${i}`} className="text-xl font-bold text-white mt-5 mb-3 border-b border-cyber-panel/60 pb-1">
          {parseInline(line.substring(3))}
        </h2>
      );
      continue;
    }

    // H3 Headings
    if (line.startsWith('### ')) {
      parsedElements.push(
        <h3 key={`h3-${i}`} className="text-lg font-semibold text-gray-200 mt-4 mb-2 flex items-center gap-2">
          {parseInline(line.substring(4))}
        </h3>
      );
      continue;
    }

    // Dividers
    if (line.startsWith('===') || line.startsWith('---')) {
      parsedElements.push(
        <hr key={`hr-${i}`} className="border-cyber-amber/20 my-4" />
      );
      continue;
    }

    // Bullet points
    if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      const cleanLine = line.trim().substring(2);
      parsedElements.push(
        <div key={`li-${i}`} className="flex items-start gap-2 my-1.5 pl-4 text-gray-300 text-sm">
          <span className="text-cyber-amber mt-1.5 select-none text-[8px]">■</span>
          <span>{parseInline(cleanLine)}</span>
        </div>
      );
      continue;
    }

    // Blank lines
    if (line.trim() === '') {
      parsedElements.push(<div key={`br-${i}`} className="h-2" />);
      continue;
    }

    // Default lines
    parsedElements.push(
      <p key={`p-${i}`} className="text-gray-300 text-sm my-1 leading-relaxed pl-1">
        {parseInline(line)}
      </p>
    );
  }

  return <div className="space-y-1 font-sans">{parsedElements}</div>;
}

const compileSteps = [
  "Initializing enterprise report compiler connection...",
  "Querying dynamic scanner metrics from local db.json...",
  "Computing cognitive genome documentation coverage index...",
  "Evaluating security finding severity levels and file origins...",
  "Simulating prediction fail vectors & potential downtime losses...",
  "Synthesizing markdown audit metadata properties...",
  "Encoding download stream base64 URI buffers..."
];

export default function ReportsPage() {
  const [reports, setReports] = useState<CompiledReport[]>([
    {
      name: 'Aurenity X Security Vulnerability Assessment',
      type: 'Security Reports',
      date: '2026-05-31',
      format: 'Markdown',
      status: 'Ready',
      content: `# Aurenity X Security Vulnerability Assessment\nDate: 2026-05-31\nAudited Surface: 24 Endpoints\n\n## Executive Summary\nThis report profiles the vulnerabilities, their severities, and files of origin found during static scanning.\n\n## Vulnerability Logs\n### [Critical] Hardcoded JWT secret key pattern in auth middleware\n- **Origin File**: \`src/middleware/auth.ts:15\`\n- **Remediation Recommendation**: Migrate hardcoded secret tokens into system environment configurations (.env).\n\n### [High] Unprotected Database Dump / Backup endpoint exposed\n- **Origin File**: \`src/routes/admin.ts:112\`\n- **Remediation Recommendation**: Wrap debug dump routes inside administrative user access check filters.\n\n### [Medium] Insecure CORS Wildcard Header detected\n- **Origin File**: \`src/server.ts:42\`\n- **Remediation Recommendation**: Configure Access-Control-Allow-Origin to specific verified domains.\n\n## Mitigation Workflow\n1. Apply secret scanning hooks to block hardcoded keys.\n2. Implement CORS restrictions to verify originating clients.`,
      download_url: 'data:text/markdown;charset=utf-8,' + encodeURIComponent(`# Aurenity X Security Vulnerability Assessment\nDate: 2026-05-31...`)
    },
    {
      name: 'Aurenity X Infrastructure & Topology Summary',
      type: 'Infrastructure Reports',
      date: '2026-05-30',
      format: 'Markdown',
      status: 'Ready',
      content: `# Aurenity X Infrastructure & Topology Summary\nDate: 2026-05-30\n\n## Executive Summary\nThis report summarizes logical infrastructure mapping, database integrations, and gateway endpoints.\n\n## Topology Composition\n- Total Discoverable Endpoints: 24\n- Active Microservices: 4\n- Discovered Database Connections: 2\n- External API Integrations: 3\n\n## System Dependencies Flow\n- Database: PostgreSQL connected via Prisma ORM in \`prisma/schema.prisma\`\n- Database: Redis Cache connected via ioredis connector in \`src/config/redis.ts\`\n- External API: Stripe targeting \`https://api.stripe.com/v3\`\n- External API: Twilio targeting \`https://api.twilio.com/2010-04-01\`\n- External API: OpenAI targeting \`https://api.openai.com/v1\``,
      download_url: 'data:text/markdown;charset=utf-8,' + encodeURIComponent(`# Aurenity X Infrastructure & Topology Summary\nDate: 2026-05-30...`)
    }
  ]);

  const [schedules, setSchedules] = useState<ScheduleItem[]>([
    { id: '1', report: 'Security Reports', schedule: 'Monthly on 1st', nextRun: '2026-06-01', active: true },
    { id: '2', report: 'Infrastructure Reports', schedule: 'Weekly on Monday', nextRun: '2026-06-01', active: true },
    { id: '3', report: 'Audit Reports', schedule: 'Quarterly on 15th', nextRun: '2026-08-15', active: false },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [compiling, setCompiling] = useState(false);
  const [compilationStep, setCompilationStep] = useState(0);
  const [compilationLogs, setCompilationLogs] = useState<string[]>([]);
  const [activeReportType, setActiveReportType] = useState('');
  const [selectedReport, setSelectedReport] = useState<CompiledReport | null>(null);
  const [copied, setCopied] = useState(false);

  // Scheduled reports creation state
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [newSchedReport, setNewSchedReport] = useState('Overall Ecosystem Audit');
  const [newSchedInterval, setNewSchedInterval] = useState('Weekly');

  // Custom Toast State
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const triggerToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast(prev => prev?.message === message ? null : prev);
    }, 3000);
  };

  const reportTypes = [
    { 
      name: 'Overall Ecosystem Audit', 
      desc: 'Master compilation. Details dynamic codebase inventory discovery, cognitive health scores, network topology, predictive risks, and security issues.', 
      icon: <Layers className="w-6 h-6 text-cyber-amber" />,
      color: 'border-cyber-amber/30 hover:border-cyber-amber hover:shadow-[0_0_15px_rgba(245,158,11,0.2)] bg-cyber-panel/40',
      badge: 'Master Feature Report'
    },
    { 
      name: 'Security Reports', 
      desc: 'Security scan assessments including hardcoded authentication secret logs, wildcard CORS domains, and specific code line locations.', 
      icon: <ShieldAlert className="w-6 h-6 text-cyber-red" />,
      color: 'border-cyber-red/30 hover:border-cyber-red hover:shadow-[0_0_15px_rgba(239,68,68,0.2)] bg-cyber-panel/40',
      badge: 'Vulnerabilities'
    },
    { 
      name: 'Infrastructure Reports', 
      desc: 'Infrastructure dependencies logs detailing database engine routes, microservice endpoints, and third party APIs.', 
      icon: <Settings className="w-6 h-6 text-cyber-cyan" />,
      color: 'border-cyber-cyan/30 hover:border-cyber-cyan hover:shadow-[0_0_15px_rgba(6,182,212,0.2)] bg-cyber-panel/40',
      badge: 'Gateway Topology'
    },
    { 
      name: 'Audit Reports', 
      desc: 'Compliance audits evaluating OAuth2/JWT auth strength metrics, anonymous controller endpoints, and CC6.1 policies.', 
      icon: <CheckSquare className="w-6 h-6 text-cyber-green" />,
      color: 'border-cyber-green/30 hover:border-cyber-green hover:shadow-[0_0_15px_rgba(16,185,129,0.2)] bg-cyber-panel/40',
      badge: 'SOC2 & GDPR Regulatory'
    },
  ];

  const handleCompile = async (reportType: string) => {
    if (compiling) return;
    setCompiling(true);
    setActiveReportType(reportType);
    setCompilationStep(0);
    
    const logs = [
      `[SYSTEM] Connecting to enterprise intelligence compiler for: ${reportType}...`,
    ];
    setCompilationLogs(logs);

    // Visual compiler logs incrementing
    const stepInterval = setInterval(() => {
      setCompilationStep(prev => {
        const next = prev + 1;
        if (next < compileSteps.length) {
          setCompilationLogs(curr => [
            ...curr,
            `[COMPILER] ${compileSteps[next]}`,
          ]);
          return next;
        } else {
          clearInterval(stepInterval);
          return prev;
        }
      });
    }, 450);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/v1/reports/compile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ report_type: reportType })
      });

      if (!response.ok) {
        throw new Error(`Compile server responded with error status: ${response.status}`);
      }

      const data = await response.json();

      // Enforce 3.5s minimum compilation transition for premium feel
      setTimeout(() => {
        clearInterval(stepInterval);
        setCompilationLogs(curr => [
          ...curr,
          `[OK] Compiled ${data.name || reportType} successfully. Encoding data buffer.`,
          `[SYSTEM] Compilation phase finished. Opening report interactive preview.`
        ]);
        
        const newRep: CompiledReport = {
          name: data.name || `${reportType} Brief`,
          type: reportType,
          date: data.date || new Date().toISOString().split('T')[0],
          format: 'Markdown',
          status: data.status || 'Ready',
          content: data.content || '',
          download_url: data.download_url || `data:text/markdown;charset=utf-8,${encodeURIComponent(data.content || '')}`
        };

        setReports(prev => [newRep, ...prev]);
        setCompiling(false);
        setSelectedReport(newRep);
        triggerToast(`Successfully compiled: ${newRep.name}`, 'success');
      }, 3500);

    } catch (error) {
      console.warn('Backend compiler failed, invoking offline compilation model fallback:', error);
      clearInterval(stepInterval);
      setCompilationLogs(curr => [
        ...curr,
        `[WARNING] Cannot reach FastAPI service port 8000. Toggling client-side processor...`,
        `[COMPILER] Synthesizing offline mockup matrix using database cache...`
      ]);

      // Dynamic offline mock generator
      setTimeout(() => {
        const timestamp = new Date().toISOString().split('T')[0];
        const offlineContent = `# Aurenity X ${reportType} (Offline Compilation)
Date: ${timestamp}
System Status: LOCAL SIMULATED BRIEF

## Summary
The local database cache was queried because the FastAPI server was unreachable on http://127.0.0.1:8000.

## Scanned Findings Summary
- Total endpoints discovered in memory: 24 APIs.
- Critical vulnerabilities logged: 1 critical JWT key patterns.
- Open ports/exposures: Insecure CORS wildcard routes in server middleware.

## Autonomous Action Recommendations
- Verify backend listener execution state via command window.
- Retry compiler trigger once FastAPI connectivity is restored.`;

        const newRep: CompiledReport = {
          name: `Aurenity X ${reportType} (Simulated)`,
          type: reportType,
          date: timestamp,
          format: 'Markdown',
          status: 'Ready',
          content: offlineContent,
          download_url: `data:text/markdown;charset=utf-8,${encodeURIComponent(offlineContent)}`
        };

        setReports(prev => [newRep, ...prev]);
        setCompiling(false);
        setSelectedReport(newRep);
        triggerToast('Compiled simulated local report', 'info');
      }, 3800);
    }
  };

  const handleToggleSchedule = (id: string) => {
    setSchedules(prev => 
      prev.map(s => s.id === id ? { ...s, active: !s.active } : s)
    );
    const item = schedules.find(s => s.id === id);
    if (item) {
      triggerToast(`${item.report} schedule ${!item.active ? 'Activated' : 'Suspended'}`, 'info');
    }
  };

  const handleAddSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = String(schedules.length + 1);
    const today = new Date();
    today.setDate(today.getDate() + 7);
    const nextRunStr = today.toISOString().split('T')[0];

    const newSched: ScheduleItem = {
      id: newId,
      report: newSchedReport,
      schedule: `${newSchedInterval} on ${newSchedInterval === 'Weekly' ? 'Monday' : '1st'}`,
      nextRun: nextRunStr,
      active: true
    };

    setSchedules(prev => [...prev, newSched]);
    setShowScheduleForm(false);
    triggerToast(`Scheduled new ${newSchedReport} compilation`, 'success');
  };

  const handleDeleteReport = (name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setReports(prev => prev.filter(r => r.name !== name));
    triggerToast('Report deleted from history', 'info');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    triggerToast('Report Markdown copied to clipboard', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadAll = () => {
    if (reports.length === 0) return;
    reports.forEach((rep) => {
      const link = document.createElement('a');
      link.href = rep.download_url;
      link.download = `${rep.name.toLowerCase().replace(/ /g, '_')}_${rep.date}.md`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
    triggerToast(`Triggered download of ${reports.length} report(s)`, 'success');
  };

  const filteredReports = reports.filter(r => 
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-8 space-y-6 max-w-7xl mx-auto min-h-screen text-white select-none">
      
      {/* Toast Notification Container */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-lg border backdrop-blur-xl shadow-2xl ${
              toast.type === 'success' ? 'bg-cyber-green/10 border-cyber-green text-cyber-green' :
              toast.type === 'error' ? 'bg-cyber-red/10 border-cyber-red text-cyber-red' :
              'bg-cyber-blue/10 border-cyber-blue text-cyber-blue'
            }`}
          >
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 animate-pulse" />}
            {toast.type === 'error' && <AlertTriangle className="w-5 h-5 animate-bounce" />}
            {toast.type === 'info' && <Info className="w-5 h-5 animate-pulse" />}
            <span className="text-sm font-semibold tracking-wide font-mono">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Title Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-cyber-panel/60 pb-6">
        <div>
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-cyber-amber to-cyber-orange bg-clip-text text-transparent mb-2 flex items-center gap-3 font-sans">
            <FileText className="w-8 h-8 text-cyber-amber animate-pulse" />
            Audit Reports Center
          </h1>
          <p className="text-gray-400 text-sm md:text-base">
            Compile dynamic compliance audits, code vulnerabilities lists, and comprehensive master ecosystem assessments.
          </p>
        </div>
        
        {/* Dynamic Global Action triggers */}
        <div className="flex items-center gap-3">
          <button 
            id="btn-download-all"
            disabled={reports.length === 0}
            onClick={handleDownloadAll}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-cyber-amber/30 bg-cyber-amber/10 text-cyber-amber hover:bg-cyber-amber hover:text-black font-semibold text-sm transition-all shadow-md hover:shadow-glow-cyan disabled:opacity-40 disabled:pointer-events-none"
          >
            <Download className="w-4 h-4" />
            Export All History
          </button>
        </div>
      </div>

      {/* Dynamic Compile Trigger Area */}
      <div>
        <h2 className="text-lg font-bold text-gray-300 mb-4 flex items-center gap-2 font-mono">
          <RefreshCw className="w-4 h-4 text-cyber-amber animate-spin-slow" />
          COMPILE NEW ON-DEMAND BRIEF
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reportTypes.map((report) => (
            <motion.div 
              key={report.name} 
              whileHover={{ scale: 1.01, y: -2 }}
              className={`rounded-lg border p-5 cursor-pointer transition-all flex flex-col justify-between ${report.color}`}
              onClick={() => handleCompile(report.name)}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 bg-cyber-bg-secondary border border-cyber-panel rounded-lg shadow-inner">
                    {report.icon}
                  </div>
                  <span className="px-2 py-0.5 text-[10px] bg-cyber-bg-secondary text-gray-400 border border-cyber-panel rounded font-mono font-semibold">
                    {report.badge}
                  </span>
                </div>
                <h3 className="font-extrabold text-white text-base mb-1 tracking-wide">{report.name}</h3>
                <p className="text-xs text-gray-400 leading-relaxed mb-4">{report.desc}</p>
              </div>
              <button 
                id={`btn-compile-${report.name.toLowerCase().replace(/ /g, '-')}`}
                className="w-full mt-2 py-2 px-3 bg-cyber-amber/10 border border-cyber-amber/30 text-cyber-amber rounded font-semibold text-xs tracking-wider uppercase hover:bg-cyber-amber hover:text-black transition-all flex items-center justify-center gap-2"
              >
                Compile Report
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Dynamic Compilation Term Terminal Box Overlay */}
      <AnimatePresence>
        {compiling && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-cyber-bg/90 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="w-full max-w-2xl bg-cyber-bg-secondary border border-cyber-amber/40 rounded-xl p-6 shadow-2xl flex flex-col gap-4"
            >
              <div className="flex items-center justify-between border-b border-cyber-panel pb-3">
                <div className="flex items-center gap-3">
                  <Loader2 className="w-5 h-5 text-cyber-amber animate-spin" />
                  <span className="font-bold font-mono tracking-widest text-cyber-amber uppercase text-sm">
                    Compiling: {activeReportType}
                  </span>
                </div>
                <span className="text-xs text-gray-500 font-mono">
                  {Math.min(100, Math.round(((compilationStep + 1) / compileSteps.length) * 100))}%
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-cyber-panel h-1.5 rounded overflow-hidden">
                <motion.div 
                  initial={{ width: '0%' }}
                  animate={{ width: `${((compilationStep + 1) / compileSteps.length) * 100}%` }}
                  transition={{ duration: 0.3 }}
                  className="bg-gradient-to-r from-cyber-amber to-cyber-cyan h-full rounded"
                />
              </div>

              {/* Shell output console */}
              <div className="flex-1 min-h-[220px] max-h-[300px] overflow-y-auto bg-black/60 p-4 border border-cyber-panel rounded-lg font-mono text-xs text-cyber-green leading-relaxed space-y-1.5 flex flex-col justify-end">
                {compilationLogs.map((log, idx) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -5 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    key={idx}
                    className="flex gap-2"
                  >
                    <span className="text-gray-600 select-none">[{idx + 1}]</span>
                    <span>{log}</span>
                  </motion.div>
                ))}
              </div>

              <div className="text-center text-xs text-gray-500 font-mono animate-pulse">
                System scanning operations locked. Please do not close this modal.
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Generated Reports List Panel */}
      <motion.div className="rounded-lg border border-cyber-panel bg-cyber-panel/20 p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2 font-mono">
            <Calendar className="w-5 h-5 text-cyber-amber" />
            RECENTLY GENERATED REPORTS HISTORY
          </h2>
          
          {/* Filtering control */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-3.5 text-gray-500" />
            <input 
              id="input-search-reports"
              type="text" 
              placeholder="Search reports by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-cyber-bg-secondary border border-cyber-panel rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyber-amber/50 font-mono"
            />
          </div>
        </div>

        {/* History items */}
        <div className="space-y-3">
          {filteredReports.length === 0 ? (
            <div className="p-8 border border-dashed border-cyber-panel rounded-lg text-center text-gray-500 text-sm font-mono">
              No compiled audit records matched your filter terms.
            </div>
          ) : (
            filteredReports.map((report, idx) => (
              <div 
                key={idx} 
                onClick={() => setSelectedReport(report)}
                className="p-4 bg-cyber-panel/30 hover:bg-cyber-panel/50 rounded-lg border border-cyber-panel/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:border-cyber-amber/20 transition-all shadow-inner"
              >
                <div className="flex-1">
                  <h3 className="font-bold text-white hover:text-cyber-amber transition-colors text-sm md:text-base">
                    {report.name}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-gray-400 font-mono">
                    <span className="px-2 py-0.5 bg-cyber-bg-secondary rounded border border-cyber-panel text-cyber-cyan">
                      {report.type}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {report.date}
                    </span>
                    <span>•</span>
                    <span>{report.format} Document</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 self-end sm:self-center">
                  <span className="px-2.5 py-0.5 rounded bg-cyber-green/20 border border-cyber-green/30 text-cyber-green text-xs font-bold font-mono uppercase">
                    {report.status}
                  </span>
                  
                  {/* Action buttons */}
                  <button 
                    title="View Report Content"
                    className="p-2 hover:bg-cyber-amber/10 hover:border-cyber-amber/30 border border-transparent rounded text-cyber-amber transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  
                  <a 
                    title="Download raw file"
                    href={report.download_url} 
                    download={`${report.name.toLowerCase().replace(/ /g, '_')}_${report.date}.md`}
                    onClick={(e) => {
                      e.stopPropagation();
                      triggerToast(`Downloading: ${report.name}`, 'success');
                    }}
                    className="p-2 hover:bg-cyber-cyan/10 hover:border-cyber-cyan/30 border border-transparent rounded text-cyber-cyan transition-colors"
                  >
                    <Download className="w-4 h-4" />
                  </a>

                  <button 
                    title="Remove from history list"
                    onClick={(e) => handleDeleteReport(report.name, e)}
                    className="p-2 hover:bg-cyber-red/10 hover:border-cyber-red/30 border border-transparent rounded text-cyber-red transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>

      {/* Scheduled Generation Segment */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Scheduled List Box */}
        <motion.div className="lg:col-span-2 rounded-lg border border-cyber-panel bg-cyber-panel/20 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 font-mono">
              <Clock className="w-5 h-5 text-cyber-amber" />
              SCHEDULED AUDIT CRONS
            </h2>
            <button 
              id="btn-show-schedule-form"
              onClick={() => setShowScheduleForm(!showScheduleForm)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-cyber-cyan/30 bg-cyber-cyan/10 text-cyber-cyan hover:bg-cyber-cyan hover:text-black font-semibold text-xs tracking-wider uppercase transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Cron Schedule
            </button>
          </div>

          <div className="space-y-3">
            {schedules.map((item) => (
              <div 
                key={item.id} 
                className={`p-4 bg-cyber-panel/40 rounded border flex items-center justify-between transition-colors ${
                  item.active ? 'border-cyber-panel-light' : 'border-cyber-panel opacity-50'
                }`}
              >
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-white text-sm">{item.report}</span>
                    <span className="text-[10px] px-1.5 py-0.5 bg-cyber-bg-secondary border border-cyber-panel rounded font-mono text-cyber-amber">
                      {item.schedule}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1 font-mono">
                    Next Run Dispatch Date: {item.nextRun}
                  </p>
                </div>
                
                {/* Active switch */}
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-bold font-mono uppercase ${
                    item.active ? 'text-cyber-green' : 'text-gray-500'
                  }`}>
                    {item.active ? 'Active' : 'Suspended'}
                  </span>
                  
                  <button 
                    id={`toggle-schedule-${item.id}`}
                    onClick={() => handleToggleSchedule(item.id)}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none border border-cyber-panel ${
                      item.active ? 'bg-cyber-green' : 'bg-cyber-bg-secondary'
                    }`}
                  >
                    <span 
                      className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                        item.active ? 'translate-x-4.5' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Schedule form overlay box */}
        <motion.div className="rounded-lg border border-cyber-panel bg-cyber-panel/20 p-6 flex flex-col justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2 font-mono mb-2">
              <Settings className="w-5 h-5 text-cyber-amber animate-spin-slow" />
              SCHEDULING PROPERTIES
            </h2>
            <p className="text-xs text-gray-400 leading-relaxed mb-4">
              Configure system cron jobs to trigger dynamic backend compilations and save reports to archive paths automatically.
            </p>

            <AnimatePresence mode="wait">
              {showScheduleForm ? (
                <motion.form 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  onSubmit={handleAddSchedule}
                  className="space-y-4 border border-cyber-panel p-4 bg-cyber-bg-secondary/40 rounded-lg"
                >
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold font-mono text-gray-400 uppercase">Target Report type</label>
                    <select 
                      id="select-schedule-report"
                      value={newSchedReport} 
                      onChange={(e) => setNewSchedReport(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-cyber-panel border border-cyber-panel rounded text-xs text-white focus:outline-none focus:border-cyber-amber/50 font-mono"
                    >
                      <option>Overall Ecosystem Audit</option>
                      <option>Security Reports</option>
                      <option>Infrastructure Reports</option>
                      <option>Audit Reports</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold font-mono text-gray-400 uppercase">Interval Frequency</label>
                    <select 
                      id="select-schedule-interval"
                      value={newSchedInterval} 
                      onChange={(e) => setNewSchedInterval(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-cyber-panel border border-cyber-panel rounded text-xs text-white focus:outline-none focus:border-cyber-amber/50 font-mono"
                    >
                      <option>Daily</option>
                      <option>Weekly</option>
                      <option>Monthly</option>
                      <option>Quarterly</option>
                    </select>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button 
                      id="btn-submit-schedule"
                      type="submit" 
                      className="flex-1 py-2 bg-cyber-amber/20 border border-cyber-amber/50 rounded font-semibold text-xs text-cyber-amber hover:bg-cyber-amber hover:text-black transition-all"
                    >
                      Create Cron
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setShowScheduleForm(false)}
                      className="px-3 py-2 bg-cyber-panel border border-cyber-panel rounded font-semibold text-xs text-gray-400 hover:text-white transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </motion.form>
              ) : (
                <div className="p-5 border border-dashed border-cyber-panel rounded-lg text-center flex flex-col items-center justify-center gap-3">
                  <Calendar className="w-8 h-8 text-cyber-amber/40 animate-pulse" />
                  <span className="text-xs text-gray-500 font-mono leading-relaxed">
                    Cron schedules trigger compiler scripts in backend background.
                  </span>
                  <button 
                    id="btn-activate-scheduler"
                    onClick={() => setShowScheduleForm(true)}
                    className="px-4 py-2 border border-cyber-amber/30 bg-cyber-amber/10 text-cyber-amber rounded font-bold text-xs tracking-wider uppercase hover:bg-cyber-amber hover:text-black transition-all"
                  >
                    Open Scheduling Form
                  </button>
                </div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* Dynamic Report Content Markdown Viewer Modal */}
      <AnimatePresence>
        {selectedReport && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-cyber-bg/85 backdrop-blur-md"
            onClick={() => setSelectedReport(null)}
          >
            <motion.div 
              initial={{ scale: 0.96, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0, y: 15 }}
              className="relative w-full max-w-4xl max-h-[85vh] bg-cyber-bg-secondary border border-cyber-amber/30 rounded-xl shadow-2xl flex flex-col overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="px-6 py-4 bg-cyber-panel/50 border-b border-cyber-panel flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-white text-base md:text-lg tracking-wide flex items-center gap-2">
                    <FileText className="w-5 h-5 text-cyber-amber" />
                    {selectedReport.name}
                  </h3>
                  <div className="flex gap-3 text-xs text-gray-400 mt-1 font-mono">
                    <span>Type: {selectedReport.type}</span>
                    <span>•</span>
                    <span>Compiled: {selectedReport.date}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Action elements in Header */}
                  <button 
                    id="btn-copy-report-header"
                    onClick={() => copyToClipboard(selectedReport.content)}
                    className="p-2 hover:bg-cyber-amber/10 border border-cyber-panel/60 rounded text-cyber-amber transition-colors flex items-center gap-1 text-xs font-mono font-semibold"
                    title="Copy Raw Markdown"
                  >
                    {copied ? <Check className="w-4 h-4 text-cyber-green" /> : <Copy className="w-4 h-4" />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>

                  <a 
                    id="btn-download-report-header"
                    href={selectedReport.download_url} 
                    download={`${selectedReport.name.toLowerCase().replace(/ /g, '_')}_${selectedReport.date}.md`}
                    onClick={() => triggerToast(`Downloading: ${selectedReport.name}`, 'success')}
                    className="p-2 hover:bg-cyber-cyan/10 border border-cyber-panel/60 rounded text-cyber-cyan transition-colors flex items-center gap-1 text-xs font-mono font-semibold"
                    title="Download raw file"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </a>

                  <button 
                    onClick={() => setSelectedReport(null)}
                    className="p-2 hover:bg-white/10 border border-cyber-panel/60 rounded text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Modal Body: Beautiful styled markdown document */}
              <div className="flex-1 p-8 overflow-y-auto bg-cyber-bg/30">
                <div className="max-w-3xl mx-auto py-2">
                  <MarkdownRenderer content={selectedReport.content} />
                </div>
              </div>

              {/* Modal Footer Controls */}
              <div className="px-6 py-4 bg-cyber-panel/40 border-t border-cyber-panel flex justify-end gap-3">
                <button 
                  onClick={() => setSelectedReport(null)}
                  className="px-5 py-2 border border-cyber-panel rounded-lg text-sm text-gray-300 hover:text-white hover:bg-cyber-panel/60 transition-all font-semibold"
                >
                  Close Viewer
                </button>
                
                <a 
                  href={selectedReport.download_url} 
                  download={`${selectedReport.name.toLowerCase().replace(/ /g, '_')}_${selectedReport.date}.md`}
                  onClick={() => {
                    setSelectedReport(null);
                    triggerToast(`Downloading: ${selectedReport.name}`, 'success');
                  }}
                  className="px-5 py-2 bg-gradient-to-r from-cyber-amber to-cyber-orange text-black rounded-lg text-sm hover:shadow-[0_0_15px_rgba(245,158,11,0.3)] transition-all font-bold"
                >
                  Download Markdown File
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
