'use client';

import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Users, Shield } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AnalyticsPage() {
  const riskAnalytics = [
    { month: 'Jan', highRisk: 5, mediumRisk: 12, lowRisk: 28 },
    { month: 'Feb', highRisk: 8, mediumRisk: 15, lowRisk: 25 },
    { month: 'Mar', highRisk: 12, mediumRisk: 18, lowRisk: 22 },
    { month: 'Apr', highRisk: 15, mediumRisk: 20, lowRisk: 20 },
    { month: 'May', highRisk: 18, mediumRisk: 22, lowRisk: 18 },
  ];

  const usageAnalytics = [
    { api: 'Payment', requests: 45000, avgLatency: 45 },
    { api: 'Auth', requests: 38000, avgLatency: 32 },
    { api: 'Users', requests: 28000, avgLatency: 62 },
    { api: 'Analytics', requests: 18000, avgLatency: 125 },
  ];

  const metricsKpis = [
    { label: 'Mean Time to Detect', value: '4.2 min', trend: '↓ 15% better' },
    { label: 'Mean Time to Respond', value: '8.5 min', trend: '↓ 22% better' },
    { label: 'Security Score', value: '78/100', trend: '↑ 12% improvement' },
    { label: 'Uptime SLA', value: '99.98%', trend: '↑ 0.15% better' },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-8 space-y-6">
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-cyber-blue to-cyber-purple bg-clip-text text-transparent mb-2 flex items-center gap-3">
          <BarChart3 className="w-8 h-8 text-cyber-blue" />
          Analytics
        </h1>
        <p className="text-gray-400">Risk, ownership, usage, compliance, and executive metrics</p>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricsKpis.map((metric) => (
          <motion.div key={metric.label} whileHover={{ scale: 1.05 }} className="rounded-lg border border-cyber-blue/20 bg-cyber-panel/40 p-4">
            <p className="text-xs text-gray-400 mb-1">{metric.label}</p>
            <p className="text-2xl font-bold text-white">{metric.value}</p>
            <p className="text-xs text-cyber-green mt-2">{metric.trend}</p>
          </motion.div>
        ))}
      </div>

      {/* Risk Analytics */}
      <motion.div className="rounded-lg border border-cyber-blue/20 bg-cyber-panel/40 p-6">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-cyber-red" />
          Risk Analytics Trend (5 Months)
        </h2>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={riskAnalytics}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="month" stroke="#64748b" />
            <YAxis stroke="#64748b" />
            <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #3b82f6' }} />
            <Line type="monotone" dataKey="highRisk" stroke="#ef4444" dot={false} />
            <Line type="monotone" dataKey="mediumRisk" stroke="#f59e0b" dot={false} />
            <Line type="monotone" dataKey="lowRisk" stroke="#10b981" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Usage Analytics */}
      <motion.div className="rounded-lg border border-cyber-blue/20 bg-cyber-panel/40 p-6">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-cyber-cyan" />
          API Usage Analytics
        </h2>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={usageAnalytics}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="api" stroke="#64748b" />
            <YAxis stroke="#64748b" />
            <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #06b6d4' }} />
            <Bar dataKey="requests" fill="#06b6d4" />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Ownership Analytics */}
      <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-lg border border-cyber-blue/20 bg-cyber-panel/40 p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-cyber-purple" />
            Ownership Distribution
          </h3>
          <div className="space-y-3">
            {[
              { team: 'Platform Team', apis: 67, coverage: '27%' },
              { team: 'Payments Team', apis: 34, coverage: '14%' },
              { team: 'Analytics Team', apis: 28, coverage: '11%' },
              { team: 'Unassigned', apis: 118, coverage: '48%' },
            ].map((item) => (
              <div key={item.team} className="p-3 bg-cyber-panel/50 rounded border border-cyber-purple/10">
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-white font-medium">{item.team}</span>
                  <span className="text-sm text-gray-400">{item.apis} APIs</span>
                </div>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-cyber-purple" style={{ width: item.coverage }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-cyber-blue/20 bg-cyber-panel/40 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Compliance Analytics</h3>
          <div className="space-y-3">
            {[
              { standard: 'OWASP Compliance', score: '78%', status: 'On Track' },
              { standard: 'SOC 2 Requirements', score: '92%', status: 'Exceeding' },
              { standard: 'Documentation Standards', score: '63%', status: 'At Risk' },
              { standard: 'Security Policies', score: '85%', status: 'On Track' },
            ].map((item) => (
              <div key={item.standard} className="p-3 bg-cyber-panel/50 rounded border border-cyber-blue/10">
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-white font-medium">{item.standard}</span>
                  <span className={`text-sm font-bold ${item.score > '80' ? 'text-cyber-green' : item.score > '70' ? 'text-cyber-amber' : 'text-cyber-red'}`}>
                    {item.score}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
