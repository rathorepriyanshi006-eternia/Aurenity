'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, TrendingUp, AlertTriangle, Zap, Search, FileCode, CheckCircle, Database, ShieldAlert, FileText, ArrowRight, UserCheck, SlidersHorizontal } from 'lucide-react';
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function CognitiveIntelligencePage() {
  // Page states
  const [apiProfiles, setApiProfiles] = useState<any[]>([]);
  const [knowledgeDecay, setKnowledgeDecay] = useState<any[]>([]);
  const [activityTimeline, setActivityTimeline] = useState<any[]>([]);
  const [overallStats, setOverallStats] = useState<any>({
    cognitiveHealthScore: 0,
    documentationHealth: 0,
    ownershipEntropy: 0,
    infrastructureMemoryScore: 0
  });
  const [entropyRisk, setEntropyRisk] = useState<any>({
    criticalLoss: '0 zombie API(s) at 100% knowledge loss risk',
    mediumLoss: '0 shadow API(s) showing 80% ownership entropy'
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedApiId, setSelectedApiId] = useState<string | null>(null);

  // Fetch dynamic cognitive audit payload
  const fetchAuditData = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://127.0.0.1:8000/api/v1/cognitive/audit');
      if (res.ok) {
        const data = await res.json();
        setApiProfiles(data.apiProfiles || []);
        setKnowledgeDecay(data.knowledgeDecay || []);
        setActivityTimeline(data.activityTimeline || []);
        setOverallStats(data.overallStats || {
          cognitiveHealthScore: 0,
          documentationHealth: 0,
          ownershipEntropy: 0,
          infrastructureMemoryScore: 0
        });
        setEntropyRisk(data.entropyRisk || {
          criticalLoss: '0 zombie API(s) at 100% knowledge loss risk',
          mediumLoss: '0 shadow API(s) showing 80% ownership entropy'
        });
        
        // Auto-select first API for side-panel inspection
        if (data.apiProfiles && data.apiProfiles.length > 0) {
          setSelectedApiId(data.apiProfiles[0].apiName);
        }
      }
    } catch (err) {
      console.error('Failed to fetch cognitive audit data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditData();
  }, []);

  const selectedApiData = apiProfiles.find(a => a.apiName === selectedApiId);

  const filteredApis = apiProfiles.filter(api =>
    api.apiName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    api.endpoint.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-cyber-purple border-t-transparent animate-spin" />
        <p className="text-gray-400 animate-pulse font-mono font-medium">Assembling API Memory Genomes™...</p>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-cyber-purple to-cyber-pink bg-clip-text text-transparent mb-2 flex items-center gap-3">
          <Brain className="w-8 h-8 text-cyber-purple animate-pulse" />
          Cognitive Intelligence
        </h1>
        <p className="text-gray-400">API Memory Genome™ - Mapping code documentation coverage, ownership entropy, and knowledge retention levels</p>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Cognitive Health Score', value: `${overallStats.cognitiveHealthScore}%`, icon: Brain, color: 'text-cyber-purple', bg: 'from-cyber-purple/20 to-cyber-pink/5', border: 'border-cyber-purple/35' },
          { label: 'Documentation Health', value: `${overallStats.documentationHealth}%`, icon: FileText, color: 'text-cyber-green', bg: 'from-cyber-green/20 to-cyber-cyan/5', border: 'border-cyber-green/30' },
          { label: 'Ownership Entropy', value: `${overallStats.ownershipEntropy}%`, icon: ShieldAlert, color: 'text-cyber-red', bg: 'from-cyber-red/20 to-cyber-purple/5', border: 'border-cyber-red/30' },
          { label: 'Infrastructure Memory', value: `${overallStats.infrastructureMemoryScore}%`, icon: Database, color: 'text-cyber-cyan', bg: 'from-cyber-cyan/20 to-cyber-blue/5', border: 'border-cyber-cyan/30' },
        ].map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <motion.div
              key={kpi.label}
              whileHover={{ scale: 1.02 }}
              className={`rounded-xl border ${kpi.border} bg-gradient-to-br ${kpi.bg} p-5 flex items-center justify-between shadow shadow-black/40`}
            >
              <div className="space-y-1">
                <p className="text-[10px] text-gray-400 font-mono tracking-wider uppercase">{kpi.label}</p>
                <p className={`text-3xl font-extrabold ${kpi.color}`}>{kpi.value}</p>
              </div>
              <div className="p-3 bg-black/40 rounded-lg border border-white/5">
                <Icon className={`w-6 h-6 ${kpi.color}`} />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Chart Layout: 50% Decay Chart, 50% Activity Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Knowledge Decay Chart */}
        <motion.div className="rounded-xl border border-cyber-purple/20 bg-cyber-panel/40 p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-cyber-purple" />
              Knowledge Genome Decay Detection
            </h2>
            <p className="text-xs text-gray-400 mb-4">Simulated team familiarity decline over time without active commits</p>
          </div>
          
          <div className="w-full h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={knowledgeDecay}>
                <defs>
                  <linearGradient id="colorKnowledge" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #8B5CF6', fontSize: 11 }} />
                <Area type="monotone" dataKey="knowledge" stroke="#8B5CF6" strokeWidth={2} fillOpacity={1} fill="url(#colorKnowledge)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Activity Timeline Correlation */}
        <motion.div className="rounded-xl border border-cyber-purple/20 bg-cyber-panel/40 p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
              <Zap className="w-5 h-5 text-cyber-pink" />
              Commit Activity vs Ingestion Traffic
            </h2>
            <p className="text-xs text-gray-400 mb-4">Correlation mapping of code repository updates vs API request activity</p>
          </div>

          <div className="w-full h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={activityTimeline}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="week" stroke="#64748b" fontSize={10} />
                <YAxis yAxisId="left" stroke="#64748b" fontSize={10} />
                <YAxis yAxisId="right" orientation="right" stroke="#64748b" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #ec4899', fontSize: 11 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line yAxisId="left" type="monotone" dataKey="commits" name="Commits Frequency" stroke="#ec4899" strokeWidth={2.5} activeDot={{ r: 6 }} />
                <Line yAxisId="right" type="monotone" dataKey="usage" name="Ingested Queries (k)" stroke="#06b6d4" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Main Grid: APIs Registry (70%) + Genome Profile Inspector (30%) */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
        {/* APIs Register List */}
        <div className="lg:col-span-7 rounded-xl border border-cyber-blue/15 bg-cyber-panel/40 p-6">
          <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
            <h2 className="text-lg font-semibold text-white">API Memory Genome™ Registry</h2>
            
            {/* Search Input */}
            <div className="relative max-w-xs w-full">
              <Search className="w-4 h-4 text-gray-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search registry endpoints..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 bg-cyber-panel/50 border border-cyber-blue/15 rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyber-purple transition-colors font-mono"
              />
            </div>
          </div>

          <div className="overflow-x-auto max-h-96 scrollbar-thin">
            <table className="w-full text-xs text-left">
              <thead className="bg-cyber-panel/60 border-b border-cyber-blue/20 text-gray-400 font-mono">
                <tr>
                  <th className="px-4 py-3">API Descriptor</th>
                  <th className="px-4 py-3">Cognitive Health</th>
                  <th className="px-4 py-3">Ownership</th>
                  <th className="px-4 py-3">Documentation</th>
                  <th className="px-4 py-3 text-right">Decay Risk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cyber-blue/10 font-mono text-gray-300">
                {filteredApis.map((api) => (
                  <tr
                    key={api.apiName}
                    onClick={() => setSelectedApiId(api.apiName)}
                    className={`hover:bg-cyber-purple/5 transition-colors cursor-pointer ${
                      selectedApiId === api.apiName ? 'bg-cyber-purple/10 border-l-2 border-cyber-purple' : ''
                    }`}
                  >
                    <td className="px-4 py-3">
                      <p className="font-semibold text-white truncate max-w-xs">{api.apiName}</p>
                      <p className="text-[10px] text-gray-500 truncate max-w-xs mt-0.5">{api.endpoint}</p>
                    </td>
                    <td className="px-4 py-3 font-bold text-cyber-cyan">{api.healthScore}%</td>
                    <td className="px-4 py-3">{api.ownership}%</td>
                    <td className="px-4 py-3">{api.documentation}%</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                        api.decayRisk > 60 ? 'bg-cyber-red/25 text-cyber-red border border-cyber-red/35' :
                        api.decayRisk > 30 ? 'bg-cyber-amber/20 text-cyber-amber' :
                        'bg-cyber-green/20 text-cyber-green'
                      }`}>
                        {api.decayRisk > 60 ? 'Critical' : api.decayRisk > 30 ? 'Moderate' : 'Stable'} ({api.decayRisk}%)
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Genome Profile Inspector */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            {selectedApiData ? (
              <motion.div
                key={selectedApiData.apiName}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="rounded-xl border border-cyber-purple/20 bg-gradient-to-b from-cyber-panel/60 to-cyber-panel-light/30 p-6 space-y-5"
              >
                <div>
                  <h3 className="text-sm font-bold text-gray-400 font-mono uppercase tracking-wider">Genome Profile</h3>
                  <h2 className="text-lg font-bold text-white leading-tight mt-1 truncate">{selectedApiData.apiName}</h2>
                  <p className="text-[10px] text-cyber-purple font-mono truncate mt-1">{selectedApiData.endpoint}</p>
                </div>

                {/* Genome Metrics Progress Bars */}
                <div className="space-y-4">
                  {[
                    { label: 'Cognitive Health Score', val: selectedApiData.healthScore, color: 'bg-cyber-purple' },
                    { label: 'Documentation Coverage', val: selectedApiData.documentation, color: 'bg-cyber-green' },
                    { label: 'Ownership Retention', val: selectedApiData.ownership, color: 'bg-cyber-cyan' },
                    { label: 'Infrastructure Memory', val: selectedApiData.memoryScore, color: 'bg-cyber-blue' },
                  ].map((m) => (
                    <div key={m.label} className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-400">{m.label}</span>
                        <span className="font-bold text-white font-mono">{m.val}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden border border-white/5">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${m.val}%` }}
                          transition={{ duration: 0.8 }}
                          className={`h-full ${m.color}`}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Detailed stats */}
                <div className="pt-3 border-t border-cyber-blue/10 space-y-2 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Ownership Entropy</span>
                    <span className="text-cyber-red font-semibold">{selectedApiData.entropy}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Latency Profile</span>
                    <span className="text-cyber-amber font-semibold">{selectedApiData.latency}ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Telemetry Error Rate</span>
                    <span className="text-white font-semibold">{selectedApiData.errorRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Commit Frequency Index</span>
                    <span className="text-cyber-pink font-semibold">{selectedApiData.activity} / 1.0</span>
                  </div>
                </div>

                {/* Knowledge Loss Warning */}
                {selectedApiData.decayRisk > 50 && (
                  <div className="p-3 bg-cyber-red/10 border border-cyber-red/20 rounded-lg flex gap-2">
                    <AlertTriangle className="w-4.5 h-4.5 text-cyber-red flex-shrink-0 mt-0.5 animate-pulse" />
                    <p className="text-[10px] text-cyber-red leading-normal font-mono">
                      HIGH RISK CASCADE: Knowledge decay exceeds critical threshold. Turnover risks total context loss.
                    </p>
                  </div>
                )}
              </motion.div>
            ) : (
              <div className="rounded-xl border border-dashed border-cyber-purple/20 bg-cyber-panel/20 p-8 text-center flex flex-col items-center justify-center min-h-[350px]">
                <Brain className="w-8 h-8 text-gray-600 mb-2 animate-pulse" />
                <p className="text-xs text-gray-500 font-mono">Select an API registry endpoint to load memory genome profiles</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Entropy Risk alerts panel */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {/* Alerts panel 1 */}
        <div className="rounded-xl border border-cyber-purple/25 bg-cyber-panel/40 p-5 space-y-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-cyber-red animate-pulse" />
            Knowledge Loss & Entropy Warnings
          </h3>
          <div className="space-y-3">
            <div className="bg-cyber-red/10 p-3 rounded-lg border border-cyber-red/20 flex gap-3">
              <AlertTriangle className="w-5 h-5 text-cyber-red flex-shrink-0 mt-0.5" />
              <p className="text-xs text-cyber-red font-mono leading-relaxed">
                Critical Danger: {entropyRisk.criticalLoss}. Immediate knowledge capture and onboarding actions are advised.
              </p>
            </div>
          </div>
        </div>

        {/* Alerts panel 2 */}
        <div className="rounded-xl border border-cyber-purple/25 bg-cyber-panel/40 p-5 space-y-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-cyber-amber" />
            Ecosystem Familiarity Levels
          </h3>
          <div className="space-y-3">
            <div className="bg-cyber-amber/10 p-3 rounded-lg border border-cyber-amber/20 flex gap-3">
              <UserCheck className="w-5 h-5 text-cyber-amber flex-shrink-0 mt-0.5" />
              <p className="text-xs text-cyber-amber font-mono leading-relaxed">
                Risk Alert: {entropyRisk.mediumLoss}. Relational boundaries display high vulnerability due to undocumented endpoints.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
