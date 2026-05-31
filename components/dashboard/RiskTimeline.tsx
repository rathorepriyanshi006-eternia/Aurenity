'use client';

import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { date: 'Mon', risk: 35, threats: 12 },
  { date: 'Tue', risk: 38, threats: 15 },
  { date: 'Wed', risk: 42, threats: 18 },
  { date: 'Thu', risk: 40, threats: 16 },
  { date: 'Fri', risk: 45, threats: 22 },
  { date: 'Sat', risk: 43, threats: 20 },
  { date: 'Sun', risk: 42, threats: 19 },
];

export function RiskTimeline() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-xl bg-gradient-to-br from-cyber-panel to-cyber-panel-light border border-cyber-blue/20 p-6"
    >
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-cyber-blue/5 rounded-full blur-3xl -z-10" />

      <div className="space-y-6">
        {/* Header */}
        <div>
          <h3 className="text-lg font-bold text-white">Risk Trend Analysis</h3>
          <p className="text-sm text-gray-400">7-day historical risk timeline</p>
        </div>

        {/* Chart */}
        <div className="h-64 -mx-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(59, 130, 246, 0.1)" />
              <XAxis 
                dataKey="date" 
                stroke="rgba(156, 163, 175, 0.5)"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="rgba(156, 163, 175, 0.5)"
                style={{ fontSize: '12px' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(17, 24, 39, 0.8)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: '8px',
                }}
                cursor={{ stroke: 'rgba(59, 130, 246, 0.3)' }}
              />
              <Line
                type="monotone"
                dataKey="risk"
                stroke="#3B82F6"
                strokeWidth={2}
                dot={{ fill: '#3B82F6', r: 4 }}
                isAnimationActive={true}
                animationDuration={1000}
              />
              <Line
                type="monotone"
                dataKey="threats"
                stroke="#EF4444"
                strokeWidth={2}
                dot={{ fill: '#EF4444', r: 4 }}
                isAnimationActive={true}
                animationDuration={1000}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-cyber-blue" />
            <span className="text-gray-400">Risk Score</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-cyber-red" />
            <span className="text-gray-400">Active Threats</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
