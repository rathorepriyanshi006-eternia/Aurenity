'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, AlertTriangle, Search, SlidersHorizontal, Brain, Coins, ShieldAlert, Hourglass, Activity, ChevronRight, BarChart3, Database } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface ZombiePrediction {
  apiName: string;
  endpoint: string;
  method: string;
  status: string;
  rf_prob: number;
  gb_prob: number;
  probability: string;
  riskScore: number;
  criticalFactors: string[];
}

interface DecayData {
  zombiePredictions: any[];
  riskForecast: any[];
  decayTimeline: any[];
  businessImpact: {
    critical: string;
    high: string;
    medium: string;
  };
  financialImpact: {
    worstCase: string;
    expectedLoss: string;
  };
}

export default function PredictionLabPage() {
  const [decayData, setDecayData] = useState<DecayData | null>(null);
  const [zombiePredictions, setZombiePredictions] = useState<ZombiePrediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedApiName, setSelectedApiName] = useState<string | null>(null);

  const fetchPredictions = async () => {
    try {
      setLoading(true);
      const [resDecay, resZombie] = await Promise.all([
        fetch('http://127.0.0.1:8000/api/v1/prediction/decay'),
        fetch('http://127.0.0.1:8000/api/v1/prediction/zombie')
      ]);

      if (resDecay.ok && resZombie.ok) {
        const decayJson = await resDecay.json();
        const zombieJson = await resZombie.json();
        setDecayData(decayJson);
        setZombiePredictions(zombieJson);
        
        // Auto-select highest risk API
        if (zombieJson && zombieJson.length > 0) {
          setSelectedApiName(zombieJson[0].apiName);
        }
      }
    } catch (err) {
      console.error('Failed to fetch prediction telemetry:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPredictions();
  }, []);

  const selectedApi = zombiePredictions.find(a => a.apiName === selectedApiName);

  // Filter and Search logic
  const filteredPredictions = zombiePredictions.filter(api => {
    const matchesSearch = api.apiName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          api.endpoint.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' ? true : api.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'zombie': return 'text-cyber-red bg-cyber-red/10 border-cyber-red/35';
      case 'shadow': return 'text-cyber-amber bg-cyber-amber/10 border-cyber-amber/35';
      case 'deprecated': return 'text-cyber-yellow bg-cyber-yellow/10 border-cyber-yellow/35';
      default: return 'text-cyber-green bg-cyber-green/10 border-cyber-green/35';
    }
  };

  if (loading) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-cyber-amber border-t-transparent animate-spin" />
        <p className="text-gray-400 animate-pulse font-mono font-medium">Running Random Forest & Gradient Boosting Simulations...</p>
      </div>
    );
  }

  const averageRisk = zombiePredictions.length > 0
    ? Math.round(zombiePredictions.reduce((acc, curr) => acc + curr.riskScore, 0) / zombiePredictions.length)
    : 0;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyber-amber to-cyber-red bg-clip-text text-transparent mb-2 flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-cyber-amber animate-pulse" />
            Prediction Lab
          </h1>
          <p className="text-gray-400">Ensemble ML forecasting (Random Forest & Gradient Boosting) for ecosystem security decay risk</p>
        </div>
        <button
          onClick={fetchPredictions}
          className="px-4 py-2 rounded-lg bg-cyber-amber/10 text-cyber-amber border border-cyber-amber/30 hover:bg-cyber-amber/20 transition-all font-mono text-sm"
        >
          Re-Run ML Engine
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Ecosystem Risk Index', value: `${averageRisk}%`, icon: Brain, color: 'text-cyber-amber', bg: 'from-cyber-amber/20 to-cyber-red/5', border: 'border-cyber-amber/35' },
          { label: 'Predicted Zombie APIs', value: decayData?.businessImpact.critical || '0 APIs', icon: ShieldAlert, color: 'text-cyber-red', bg: 'from-cyber-red/20 to-cyber-purple/5', border: 'border-cyber-red/30' },
          { label: 'Worst Case Loss', value: decayData?.financialImpact.worstCase || '$0.0M/day', icon: Coins, color: 'text-cyber-red', bg: 'from-cyber-red/20 to-cyber-amber/5', border: 'border-cyber-red/30' },
          { label: 'Expected Impact', value: decayData?.financialImpact.expectedLoss || '$0K/day', icon: Activity, color: 'text-cyber-amber', bg: 'from-cyber-amber/20 to-cyber-yellow/5', border: 'border-cyber-amber/30' },
        ].map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <div key={i} className={`p-6 rounded-xl border ${kpi.border} bg-gradient-to-br ${kpi.bg} bg-cyber-panel/30 backdrop-blur-md`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-400">{kpi.label}</span>
                <Icon className={`w-5 h-5 ${kpi.color}`} />
              </div>
              <div className="text-2xl font-bold text-white font-mono">{kpi.value}</div>
            </div>
          );
        })}
      </div>

      {/* Main Split Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Zombie API Predictions */}
        <div className="lg:col-span-2 rounded-xl border border-cyber-red/20 bg-cyber-panel/40 p-6 backdrop-blur-md flex flex-col space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-cyber-red animate-bounce" />
              API Zombie Probabilities
            </h2>

            {/* Filters */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search endpoints..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-1.5 w-48 md:w-60 rounded-lg bg-cyber-bg/85 border border-cyber-amber/25 text-white placeholder-gray-400 focus:outline-none focus:border-cyber-amber focus:ring-1 focus:ring-cyber-amber text-sm transition-all"
                />
              </div>

              <div className="relative">
                <SlidersHorizontal className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="pl-9 pr-8 py-1.5 rounded-lg bg-cyber-bg/85 border border-cyber-amber/25 text-white focus:outline-none focus:border-cyber-amber focus:ring-1 focus:ring-cyber-amber text-sm transition-all appearance-none cursor-pointer"
                >
                  <option value="all">All States</option>
                  <option value="zombie">Zombie</option>
                  <option value="shadow">Shadow</option>
                  <option value="deprecated">Deprecated</option>
                  <option value="active">Active</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto rounded-lg border border-gray-800 bg-cyber-panel/20">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-800 bg-cyber-panel/50 text-gray-400 text-xs uppercase tracking-wider font-mono">
                  <th className="py-3 px-4">Endpoint</th>
                  <th className="py-3 px-4">State</th>
                  <th className="py-3 px-4 text-center">Decay Probability</th>
                  <th className="py-3 px-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/40 text-sm font-mono">
                <AnimatePresence>
                  {filteredPredictions.map((api) => {
                    const isSelected = selectedApiName === api.apiName;
                    return (
                      <tr
                        key={api.apiName}
                        onClick={() => setSelectedApiName(api.apiName)}
                        className={`cursor-pointer transition-all hover:bg-cyber-amber/5 ${
                          isSelected ? 'bg-cyber-amber/10 border-l-2 border-l-cyber-amber' : ''
                        }`}
                      >
                        <td className="py-3.5 px-4 max-w-[220px] truncate">
                          <div className="flex items-center gap-2">
                            <span className="text-xs px-1.5 py-0.5 rounded bg-cyber-panel/80 text-gray-300 font-bold border border-gray-700">
                              {api.method}
                            </span>
                            <span className="text-white font-medium hover:text-cyber-amber transition-colors">
                              {api.endpoint}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500 block truncate mt-0.5">{api.apiName}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border uppercase tracking-wider font-bold ${getStatusColor(api.status)}`}>
                            {api.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center justify-center gap-3">
                            <div className="w-20 bg-gray-800 rounded-full h-1.5 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  api.riskScore > 75
                                    ? 'bg-cyber-red'
                                    : api.riskScore > 40
                                    ? 'bg-cyber-amber'
                                    : 'bg-cyber-green'
                                }`}
                                style={{ width: `${api.riskScore}%` }}
                              />
                            </div>
                            <span
                              className={`font-bold w-8 text-right ${
                                api.riskScore > 75
                                  ? 'text-cyber-red'
                                  : api.riskScore > 40
                                  ? 'text-cyber-amber'
                                  : 'text-cyber-green'
                              }`}
                            >
                              {api.probability}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <ChevronRight className={`w-4 h-4 text-gray-500 transition-transform ${isSelected ? 'translate-x-1 text-cyber-amber' : ''}`} />
                        </td>
                      </tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
            {filteredPredictions.length === 0 && (
              <div className="p-8 text-center text-gray-500 font-mono">
                No matching decay classifications found.
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Model & Risk Inspector */}
        <div className="rounded-xl border border-cyber-amber/20 bg-cyber-panel/40 p-6 backdrop-blur-md">
          {selectedApi ? (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-mono text-cyber-amber uppercase tracking-wider block mb-1">
                  Classifier Breakdown
                </span>
                <h3 className="text-xl font-bold text-white truncate">{selectedApi.apiName}</h3>
                <code className="text-xs text-gray-400 break-all block mt-1 bg-cyber-bg/40 p-2 rounded border border-gray-800">
                  {selectedApi.method} {selectedApi.endpoint}
                </code>
              </div>

              {/* Ensemble Probability Gauge */}
              <div className="p-4 bg-cyber-bg/50 rounded-lg border border-cyber-amber/15 text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-cyber-amber" />
                <p className="text-xs font-mono text-gray-400 uppercase tracking-wider">Ensemble Confidence Index</p>
                <p className="text-5xl font-extrabold text-cyber-amber font-mono mt-2 mb-1">
                  {selectedApi.probability}
                </p>
                <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold uppercase tracking-widest ${getStatusColor(selectedApi.status)}`}>
                  {selectedApi.status}
                </span>
              </div>

              {/* Classifier Split */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-cyber-amber" />
                  Model Probability Split
                </h4>

                <div className="space-y-3 font-mono text-xs">
                  {/* Random Forest */}
                  <div className="p-3 bg-cyber-panel/30 rounded border border-gray-800/80">
                    <div className="flex justify-between text-gray-400 mb-1">
                      <span>Random Forest Classifier</span>
                      <span className="font-bold text-white">{Math.round(selectedApi.rf_prob * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-1">
                      <div className="bg-cyber-purple h-full rounded-full" style={{ width: `${selectedApi.rf_prob * 100}%` }} />
                    </div>
                  </div>

                  {/* Gradient Boosting */}
                  <div className="p-3 bg-cyber-panel/30 rounded border border-gray-800/80">
                    <div className="flex justify-between text-gray-400 mb-1">
                      <span>Gradient Boosting Classifier</span>
                      <span className="font-bold text-white">{Math.round(selectedApi.gb_prob * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-1">
                      <div className="bg-cyber-cyan h-full rounded-full" style={{ width: `${selectedApi.gb_prob * 100}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Critical Decay Factors */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-cyber-red animate-pulse" />
                  Critical Decay Factors
                </h4>
                <div className="space-y-2">
                  {selectedApi.criticalFactors.map((factor, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs font-mono text-gray-300 p-2 bg-cyber-red/5 rounded border border-cyber-red/10">
                      <span className="text-cyber-red font-bold">!</span>
                      <span>{factor}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-500 font-mono">
              <Database className="w-10 h-10 text-gray-600 mb-2" />
              Select an endpoint to inspect ML features and classifications.
            </div>
          )}
        </div>
      </div>

      {/* Chart Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Risk Forecasting */}
        <motion.div className="rounded-xl border border-cyber-amber/20 bg-cyber-panel/40 p-6 backdrop-blur-md">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Hourglass className="w-5 h-5 text-cyber-amber animate-spin-slow" />
            6-Week Risk Forecast
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={decayData?.riskForecast || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="week" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #f59e0b' }} />
              <Legend verticalAlign="top" height={36} />
              <Line name="Predicted Active Risks" type="monotone" dataKey="predicted" stroke="#f59e0b" strokeDasharray="5 5" strokeWidth={2} />
              <Line name="Actual Active Risks" type="monotone" dataKey="actual" stroke="#10b981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* API Health Decay */}
        <motion.div className="rounded-xl border border-cyber-amber/20 bg-cyber-panel/40 p-6 backdrop-blur-md">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyber-amber" />
            API Health Decay Timeline (5 Months)
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={decayData?.decayTimeline || []}>
              <defs>
                <linearGradient id="colorDecay" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="month" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #f59e0b' }} />
              <Area type="monotone" dataKey="health" stroke="#f59e0b" fill="url(#colorDecay)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Business Impact Section */}
      <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-xl border border-cyber-amber/20 bg-cyber-panel/40 p-6 backdrop-blur-md">
          <h3 className="text-lg font-semibold text-white mb-4">Predicted Failures (30 Days)</h3>
          <div className="space-y-2 font-mono text-sm">
            <div className="flex justify-between py-2.5 border-b border-cyber-amber/10">
              <span className="text-gray-400">Critical Anomaly Risk</span>
              <span className="font-bold text-cyber-red">{decayData?.businessImpact.critical || '0 APIs'}</span>
            </div>
            <div className="flex justify-between py-2.5 border-b border-cyber-amber/10">
              <span className="text-gray-400">High Decay / Inactive Risk</span>
              <span className="font-bold text-cyber-amber">{decayData?.businessImpact.high || '0 APIs'}</span>
            </div>
            <div className="flex justify-between py-2.5">
              <span className="text-gray-400">Medium Inactivity Risk</span>
              <span className="font-bold text-cyber-yellow">{decayData?.businessImpact.medium || '0 APIs'}</span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-cyber-amber/20 bg-cyber-panel/40 p-6 backdrop-blur-md">
          <h3 className="text-lg font-semibold text-white mb-4 font-mono">Financial Threat Simulation</h3>
          <div className="space-y-3">
            <div className="bg-cyber-red/10 p-4 rounded-lg border border-cyber-red/20 flex justify-between items-center">
              <div>
                <p className="text-xs text-gray-400 uppercase font-mono">Worst Case Failure Loss</p>
                <p className="text-2xl font-bold text-cyber-red font-mono mt-1">
                  {decayData?.financialImpact.worstCase || '$0.0M/day'}
                </p>
              </div>
              <ShieldAlert className="w-8 h-8 text-cyber-red opacity-50" />
            </div>
            <div className="bg-cyber-amber/10 p-4 rounded-lg border border-cyber-amber/20 flex justify-between items-center">
              <div>
                <p className="text-xs text-gray-400 uppercase font-mono">Expected Daily Loss Mode</p>
                <p className="text-2xl font-bold text-cyber-amber font-mono mt-1">
                  {decayData?.financialImpact.expectedLoss || '$0K/day'}
                </p>
              </div>
              <Coins className="w-8 h-8 text-cyber-amber opacity-50" />
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
