'use client';

import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

export function HealthScore() {
  const score = 87;
  const targetScore = 95;

  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: '0 0 30px rgba(59, 130, 246, 0.2)' }}
      className="relative overflow-hidden rounded-xl bg-gradient-to-br from-cyber-panel to-cyber-panel-light border border-cyber-blue/20 p-6 transition-all duration-300"
    >
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-cyber-blue/10 rounded-full blur-3xl -z-10" />

      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-400">Infrastructure Health</span>
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="p-2 bg-cyber-green/10 rounded-lg"
          >
            <CheckCircle className="w-5 h-5 text-cyber-green" />
          </motion.div>
        </div>

        {/* Score Display */}
        <div className="space-y-2">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-cyber-blue">{score}</span>
            <span className="text-lg text-gray-500">/ {targetScore}</span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 bg-cyber-panel rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(score / targetScore) * 100}%` }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-cyber-blue to-cyber-cyan"
            />
          </div>
        </div>

        {/* Footer */}
        <p className="text-xs text-gray-500">
          <span className="text-cyber-green">↑ 2%</span> from last week
        </p>
      </div>
    </motion.div>
  );
}
