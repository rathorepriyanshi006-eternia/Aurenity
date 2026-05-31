'use client';

import { motion } from 'framer-motion';
import { GitBranch } from 'lucide-react';

export function APIMetrics() {
  const metrics = [
    { label: 'APIs Monitored', value: '2,847', change: '+12%', color: 'text-cyber-blue' },
    { label: 'Zombie APIs', value: '156', change: '+8%', color: 'text-cyber-red' },
    { label: 'Shadow APIs', value: '23', change: '+3%', color: 'text-cyber-amber' },
  ];

  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: '0 0 30px rgba(6, 182, 212, 0.2)' }}
      className="relative overflow-hidden rounded-xl bg-gradient-to-br from-cyber-panel to-cyber-panel-light border border-cyber-cyan/20 p-6 transition-all duration-300"
    >
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-cyber-cyan/10 rounded-full blur-3xl -z-10" />

      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-400">API Inventory</span>
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            className="p-2 bg-cyber-cyan/10 rounded-lg"
          >
            <GitBranch className="w-5 h-5 text-cyber-cyan" />
          </motion.div>
        </div>

        {/* Metrics Grid */}
        <div className="space-y-3">
          {metrics.map((metric, i) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center justify-between px-3 py-2 rounded-lg bg-cyber-panel/50 hover:bg-cyber-panel transition-colors"
            >
              <span className="text-xs text-gray-400">{metric.label}</span>
              <div className="flex items-baseline gap-2">
                <span className={`font-bold ${metric.color}`}>{metric.value}</span>
                <span className="text-xs text-gray-500">{metric.change}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
