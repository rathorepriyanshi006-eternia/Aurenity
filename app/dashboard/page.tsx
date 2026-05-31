'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { 
  AlertTriangle, TrendingUp, Shield, Zap, Layers, BarChart3, 
  Activity, Lock, ChevronRight, Server, Database, Key, 
  Globe, Code, ListCollapse, FileCode, CheckCircle, HelpCircle
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0 },
};

export default function DashboardPage() {
  const [report, setReport] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeAiTab, setActiveAiTab] = useState('executive');

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://127.0.0.1:8000/api/v1/discovery/inventory');
      if (res.ok) {
        const data = await res.json();
        setReport(data.report || null);
        setStats(data.stats || null);
        setTrendData(data.trendData || []);
      }
    } catch (err) {
      console.error('Failed to fetch dashboard intelligence:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-cyber-cyan border-t-transparent animate-spin" />
        <p className="text-gray-400 animate-pulse font-mono">Assembling Intelligence Metrics Dashboard...</p>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="p-8 text-center space-y-4">
        <AlertTriangle className="w-16 h-16 text-cyber-amber mx-auto" />
        <h2 className="text-2xl font-bold text-white">No Scan Telemetry Available</h2>
        <p className="text-gray-400 max-w-md mx-auto">Please go to the Discovery tab to run a repository code audit and initialize the dashboard.</p>
      </div>
    );
  }

  // Pre-calculate statistics
  const apiList = report.apis || [];
  const authList = report.auth || [];
  const dbList = report.databases || [];
  const extList = report.external_integrations || [];
  const envList = report.env_vars || [];
  const secList = report.security_findings || [];
  const metadata = report.metadata || {};
  const architecture = report.architecture || {};
  const aiSummary = report.ai_summary || {};

  // Calculate dynamic health score
  const criticalIssuesCount = secList.filter((s: any) => s.severity === 'Critical').length;
  const highIssuesCount = secList.filter((s: any) => s.severity === 'High').length;
  const mediumIssuesCount = secList.filter((s: any) => s.severity === 'Medium').length;
  
  let healthScore = 98;
  healthScore -= (criticalIssuesCount * 15);
  healthScore -= (highIssuesCount * 8);
  healthScore -= (mediumIssuesCount * 3);
  healthScore = Math.max(35, healthScore);

  // Parse architecture flow steps
  const flowNodes = architecture.flow ? architecture.flow.split('\n↓\n') : [];

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="p-8 space-y-8"
    >
      {/* Page Header */}
      <motion.div variants={item} className="flex justify-between items-start flex-wrap gap-4">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyber-blue via-cyber-cyan to-cyber-purple bg-clip-text text-transparent mb-2">
            Executive Cyber Intelligence Overview
          </h1>
          <p className="text-gray-400">
            Real-time scanner insights for <span className="text-cyber-cyan font-semibold">{metadata.name}</span> ({metadata.url})
          </p>
        </div>
        <button 
          onClick={fetchDashboardData}
          className="px-4 py-2 bg-cyber-blue/20 border border-cyber-blue/50 rounded-lg text-white hover:bg-cyber-blue/30 flex items-center gap-2 transition-colors text-sm font-medium"
        >
          <Activity className="w-4 h-4 text-cyber-cyan" /> Refresh Telemetry
        </button>
      </motion.div>

      {/* Primary KPI Section: Health Score & Repo Metadata */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          variants={item}
          className="rounded-lg border border-cyber-cyan/30 bg-gradient-to-br from-cyber-panel/60 to-cyber-panel/30 p-6 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">Ecosystem Health</h2>
            <Shield className={`w-6 h-6 animate-pulse ${healthScore > 80 ? 'text-cyber-green' : healthScore > 60 ? 'text-cyber-amber' : 'text-cyber-red'}`} />
          </div>
          <div className="flex items-end gap-6 my-2">
            <div>
              <div className={`text-6xl font-bold text-transparent bg-gradient-to-r bg-clip-text ${healthScore > 80 ? 'from-cyber-green to-cyber-cyan' : healthScore > 60 ? 'from-cyber-amber to-cyber-yellow' : 'from-cyber-red to-cyber-purple'}`}>{healthScore}</div>
              <p className="text-xs text-gray-400 mt-1">Ecosystem security score</p>
            </div>
            <div className="flex-1 h-20 bg-gray-800/40 rounded flex items-end gap-1 p-2">
              {[65, 72, 68, 78, 82, 78, 75, 79, 76, 74, healthScore].map((val, i) => (
                <div
                  key={i}
                  className="flex-1 bg-gradient-to-t from-cyber-blue to-cyber-cyan rounded-t"
                  style={{ height: `${(val / 100) * 100}%` }}
                />
              ))}
            </div>
          </div>
          <div className="text-xs text-gray-400 mt-2 border-t border-cyber-blue/15 pt-2">
            Critical Issues: <span className="text-cyber-red font-bold">{criticalIssuesCount}</span> | High: <span className="text-cyber-amber font-bold">{highIssuesCount}</span>
          </div>
        </motion.div>

        {/* Repository Metadata Card */}
        <motion.div
          variants={item}
          className="lg:col-span-2 rounded-lg border border-cyber-blue/20 bg-cyber-panel/40 p-6"
        >
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Code className="w-5 h-5 text-cyber-blue" />
            Repository Specifications
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Language', value: metadata.language || 'TypeScript', detail: 'Primary Source' },
              { label: 'Framework / Stack', value: metadata.framework || 'Express.js', detail: 'Routing' },
              { label: 'Files Scanned', value: metadata.file_count || 0, detail: 'Codebase files' },
              { label: 'Discovered APIs', value: metadata.api_count || 0, detail: 'Active routes' },
            ].map((meta, i) => (
              <div key={i} className="p-4 bg-cyber-panel/30 rounded border border-cyber-blue/10">
                <p className="text-xs text-gray-500 mb-1">{meta.label}</p>
                <p className="text-xl font-bold text-white truncate">{meta.value}</p>
                <p className="text-[10px] text-gray-400 mt-1">{meta.detail}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* API Inventory Metrics */}
      {stats && (
        <motion.div variants={item} className="space-y-3">
          <h3 className="text-lg font-semibold text-white">API Inventory Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Scanned Routes', value: stats.total, icon: Layers, color: 'text-cyber-blue', desc: 'Discovered endpoints' },
              { label: 'Active Channels', value: stats.active, icon: Activity, color: 'text-cyber-green', desc: 'Secure validations' },
              { label: 'Zombie / Orphan APIs', value: stats.zombie, icon: Lock, color: 'text-cyber-red', desc: 'Low updates activity' },
              { label: 'Shadow Endpoints', value: stats.shadow, icon: AlertTriangle, color: 'text-cyber-amber', desc: 'No auth middleware' },
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div
                  key={i}
                  className="rounded-lg border border-cyber-blue/15 bg-cyber-panel/30 p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <Icon className="w-5 h-5 text-gray-400" />
                    <span className="text-[10px] text-gray-500">{stat.desc}</span>
                  </div>
                  <p className="text-xs text-gray-400 mb-1">{stat.label}</p>
                  <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* AI Intelligence Summary Section (Grok) */}
      <motion.div variants={item} className="rounded-lg border border-cyber-purple/20 bg-cyber-panel/40 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-cyber-purple animate-pulse" />
            AI Intelligence Summary (Grok Cloud)
          </h2>
          <span className="text-xs font-mono text-cyber-purple border border-cyber-purple/30 px-2 py-0.5 rounded">
            Llama-3.3-70b-Versatile
          </span>
        </div>
        
        {/* Tab Navigation for AI summaries */}
        <div className="flex gap-2 border-b border-cyber-purple/10 pb-2 mb-4 overflow-x-auto">
          {[
            { id: 'executive', label: 'Executive Summary' },
            { id: 'purpose', label: 'Purpose' },
            { id: 'architecture', label: 'Architecture' },
            { id: 'apis', label: 'API Insights' },
            { id: 'auth', label: 'Auth Flow' },
            { id: 'database', label: 'Database relations' },
            { id: 'security', label: 'Security Insights' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveAiTab(tab.id)}
              className={`px-3 py-1 text-xs font-medium rounded transition-all whitespace-nowrap ${
                activeAiTab === tab.id
                  ? 'bg-cyber-purple/20 text-cyber-purple border border-cyber-purple/40'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content display */}
        <div className="bg-cyber-panel/20 p-4 rounded border border-cyber-purple/5 min-h-24">
          <p className="text-gray-300 text-sm leading-relaxed font-mono">
            {aiSummary[activeAiTab] || "Generating summary insights..."}
          </p>
        </div>
      </motion.div>

      {/* Architecture Flow Chart & Threat Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Architecture Flow Card */}
        <motion.div variants={item} className="lg:col-span-2 rounded-lg border border-cyber-cyan/20 bg-cyber-panel/40 p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
              <Server className="w-5 h-5 text-cyber-cyan" />
              Discovered Architecture Diagram
            </h2>
            <p className="text-xs text-gray-400 mb-4">{architecture.summary}</p>
          </div>
          
          {/* Architectural Node Flow renderer */}
          <div className="p-4 bg-black/40 rounded border border-cyber-cyan/10 flex items-center justify-center py-6">
            <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4 flex-wrap justify-center">
              {flowNodes.map((node: string, index: number) => (
                <div key={index} className="flex flex-col md:flex-row items-center gap-2 md:gap-4">
                  <div className="px-4 py-2 rounded-md bg-cyber-panel border border-cyber-cyan/20 text-xs font-mono text-white text-center hover:border-cyber-cyan/60 transition-colors shadow shadow-cyber-cyan/10">
                    {node}
                  </div>
                  {index < flowNodes.length - 1 && (
                    <div className="text-cyber-cyan font-bold text-sm transform rotate-90 md:rotate-0">
                      →
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Dynamic Threat Timeline Chart */}
        <motion.div variants={item} className="rounded-lg border border-cyber-blue/20 bg-cyber-panel/40 p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-cyber-cyan" />
            Threat Scan Index (24h)
          </h2>
          <div className="w-full h-44">
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="day" stroke="#64748b" fontSize={10} />
                  <YAxis stroke="#64748b" fontSize={10} />
                  <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #3b82f6', fontSize: 11 }} />
                  <Area type="monotone" dataKey="discovered" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorRisk)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-gray-500 font-mono">No trend data</div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Discovered APIs List & Security Findings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Security Findings List */}
        <motion.div variants={item} className="rounded-lg border border-cyber-red/20 bg-cyber-panel/40 p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-cyber-red" />
              Security Exposure Audit
            </h2>
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {secList.length === 0 ? (
                <div className="p-4 bg-cyber-green/5 border border-cyber-green/20 rounded text-center text-xs text-cyber-green font-mono">
                  ✓ Codebase Audit Clear: No security vulnerabilities flagged.
                </div>
              ) : (
                secList.map((sec: any, i: number) => (
                  <div key={i} className="p-3 bg-cyber-panel/40 border border-cyber-red/10 hover:border-cyber-red/35 rounded transition-all">
                    <div className="flex justify-between items-start gap-2 mb-1">
                      <p className="text-xs font-bold text-white leading-tight">{sec.finding}</p>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                        sec.severity === 'Critical' ? 'bg-cyber-red/20 text-cyber-red border border-cyber-red/30' :
                        sec.severity === 'High' ? 'bg-cyber-amber/20 text-cyber-amber' :
                        'bg-cyber-blue/20 text-cyber-blue'
                      }`}>
                        {sec.severity}
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-500 font-mono truncate">{sec.file}</p>
                    <p className="text-[10px] text-gray-400 mt-2 bg-black/30 p-1.5 rounded">{sec.recommendation}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </motion.div>

        {/* API Routes Discovered */}
        <motion.div variants={item} className="lg:col-span-2 rounded-lg border border-cyber-blue/20 bg-cyber-panel/40 p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <ListCollapse className="w-5 h-5 text-cyber-cyan" />
            Codebase Discovered Routes ({apiList.length})
          </h2>
          <div className="overflow-x-auto max-h-80 scrollbar-thin">
            <table className="w-full text-xs text-left">
              <thead className="bg-cyber-panel/50 border-b border-cyber-blue/25 text-gray-400">
                <tr>
                  <th className="px-4 py-2">Method</th>
                  <th className="px-4 py-2">Endpoint Route</th>
                  <th className="px-4 py-2">File Source Path</th>
                  <th className="px-4 py-2 text-right">Confidence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cyber-blue/10 font-mono text-gray-300">
                {apiList.slice(0, 8).map((api: any, i: number) => (
                  <tr key={i} className="hover:bg-cyber-panel/20 transition-colors">
                    <td className="px-4 py-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        api.method === 'GET' ? 'bg-cyber-green/20 text-cyber-green' :
                        api.method === 'POST' ? 'bg-cyber-blue/20 text-cyber-blue' :
                        api.method === 'DELETE' ? 'bg-cyber-red/20 text-cyber-red' :
                        'bg-cyber-amber/20 text-cyber-amber'
                      }`}>
                        {api.method}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-white truncate max-w-44 font-semibold">{api.endpoint}</td>
                    <td className="px-4 py-2 truncate max-w-44 text-gray-400">{api.file_source}</td>
                    <td className="px-4 py-2 text-right text-cyber-cyan">{Math.round((api.confidence || 0.95) * 100)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>

      {/* Auth mechanisms, Database Analysis, External integrations, and Env variables */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Auth */}
        <motion.div variants={item} className="rounded-lg border border-cyber-cyan/15 bg-cyber-panel/40 p-5">
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <Key className="w-4 h-4 text-cyber-cyan" />
            Authentication Analysis
          </h3>
          <div className="space-y-3 max-h-48 overflow-y-auto">
            {authList.length === 0 ? (
              <p className="text-xs text-gray-500 font-mono text-center py-4">No Auth detected</p>
            ) : (
              authList.map((item: any, i: number) => (
                <div key={i} className="p-2.5 bg-cyber-panel/30 rounded border border-cyber-cyan/10">
                  <p className="text-xs font-semibold text-white">{item.type}</p>
                  <p className="text-[10px] text-gray-500 font-mono mt-1 truncate">{item.file_source}</p>
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Database */}
        <motion.div variants={item} className="rounded-lg border border-cyber-blue/15 bg-cyber-panel/40 p-5">
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <Database className="w-4 h-4 text-cyber-blue" />
            Database Systems
          </h3>
          <div className="space-y-3 max-h-48 overflow-y-auto">
            {dbList.length === 0 ? (
              <p className="text-xs text-gray-500 font-mono text-center py-4">No Database detected</p>
            ) : (
              dbList.map((item: any, i: number) => (
                <div key={i} className="p-2.5 bg-cyber-panel/30 rounded border border-cyber-blue/10">
                  <p className="text-xs font-semibold text-white">{item.type}</p>
                  <p className="text-[10px] text-cyber-cyan mt-0.5">{item.connection_method || 'Driver Connection'}</p>
                  <p className="text-[10px] text-gray-500 font-mono mt-1 truncate">{item.file_source}</p>
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* External integrations */}
        <motion.div variants={item} className="rounded-lg border border-cyber-green/15 bg-cyber-panel/40 p-5">
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <Globe className="w-4 h-4 text-cyber-green" />
            External Integrations
          </h3>
          <div className="space-y-3 max-h-48 overflow-y-auto">
            {extList.length === 0 ? (
              <p className="text-xs text-gray-500 font-mono text-center py-4">No external APIs detected</p>
            ) : (
              extList.map((item: any, i: number) => (
                <div key={i} className="p-2.5 bg-cyber-panel/30 rounded border border-cyber-green/10">
                  <p className="text-xs font-semibold text-white">{item.service_name}</p>
                  <p className="text-[9px] text-gray-500 font-mono mt-1 truncate">{item.endpoint}</p>
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Env Variables */}
        <motion.div variants={item} className="rounded-lg border border-cyber-yellow/15 bg-cyber-panel/40 p-5">
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <FileCode className="w-4 h-4 text-cyber-yellow" />
            Environment Variables
          </h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {envList.length === 0 ? (
              <p className="text-xs text-gray-500 font-mono text-center py-4">No Env variables detected</p>
            ) : (
              envList.map((item: any, i: number) => (
                <div key={i} className="flex justify-between items-center p-2 bg-cyber-panel/30 rounded border border-cyber-yellow/10">
                  <span className="text-xs font-mono font-bold text-gray-300 truncate max-w-36">{item.name}</span>
                  <span className="text-[9px] text-gray-500 font-mono truncate max-w-16">Active</span>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
