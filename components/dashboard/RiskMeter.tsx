'use client';

import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

export function RiskMeter() {
  const riskLevel = 42;
  const maxRisk = 100;

  const getRiskColor = (level: number) => {
    if (level < 30) return 'from-cyber-green';
    if (level < 60) return 'from-cyber-amber';
    return 'from-cyber-red';
  };

  const getRiskLabel = (level: number) => {
    if (level < 30) return 'Low';
    if (level < 60) return 'Medium';
    return 'High';
  };

  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: '0 0 30px rgba(139, 92, 246, 0.2)' }}
      className="relative overflow-hidden rounded-xl bg-gradient-to-br from-cyber-panel to-cyber-panel-light border border-cyber-purple/20 p-6 transition-all duration-300"
    >
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-cyber-purple/10 rounded-full blur-3xl -z-10" />

      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-400">Enterprise Risk Level</span>
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="p-2 bg-cyber-amber/10 rounded-lg"
          >
            <AlertTriangle className="w-5 h-5 text-cyber-amber" />
          </motion.div>
        </div>

        {/* Gauge */}
        <div className="space-y-2">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-cyber-amber">{riskLevel}</span>
            <span className="text-lg text-gray-500">%</span>
          </div>

          {/* Gauge Bar */}
          <div className="w-full h-3 bg-cyber-panel rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${riskLevel}%` }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
              className={`h-full bg-gradient-to-r ${getRiskColor(riskLevel)} to-cyber-red`}
            />
          </div>
        </div>

        {/* Risk Label */}
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            riskLevel < 30 ? 'bg-cyber-green animate-pulse-glow' :
            riskLevel < 60 ? 'bg-cyber-amber animate-pulse-glow' :
            'bg-cyber-red animate-pulse-glow'
          }`} />
          <span className="text-xs text-gray-400">
            Risk Level: <span className="font-medium text-gray-300">{getRiskLabel(riskLevel)}</span>
          </span>
        </div>
      </div>
    </motion.div>
  );
}
