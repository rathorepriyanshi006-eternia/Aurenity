'use client';

import { motion } from 'framer-motion';
import { Lightbulb, TrendingUp, AlertCircle } from 'lucide-react';

const insights = [
  {
    id: 1,
    title: 'Anomaly Detected',
    description: 'API-2847 showing 300% traffic spike',
    type: 'warning',
    icon: AlertCircle,
  },
  {
    id: 2,
    title: 'Optimization Opportunity',
    description: 'Cache hit rate below optimal threshold',
    type: 'insight',
    icon: Lightbulb,
  },
  {
    id: 3,
    title: 'Growth Trend',
    description: 'API requests up 45% this month',
    type: 'positive',
    icon: TrendingUp,
  },
];

const typeStyles = {
  warning: 'bg-cyber-amber/10 border-cyber-amber/30 text-cyber-amber',
  insight: 'bg-cyber-blue/10 border-cyber-blue/30 text-cyber-blue',
  positive: 'bg-cyber-green/10 border-cyber-green/30 text-cyber-green',
};

export function AIInsightsPanel() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-xl bg-gradient-to-br from-cyber-panel to-cyber-panel-light border border-cyber-purple/20 p-6 h-full"
    >
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-cyber-purple/5 rounded-full blur-3xl -z-10" />

      <div className="space-y-4">
        {/* Header */}
        <div>
          <h3 className="text-lg font-bold text-white">AI Insights</h3>
          <p className="text-sm text-gray-400">Intelligent recommendations</p>
        </div>

        {/* Insights List */}
        <div className="space-y-3">
          {insights.map((insight, i) => {
            const Icon = insight.icon;
            return (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer hover:bg-cyber-panel/50 transition-colors ${
                  typeStyles[insight.type as keyof typeof typeStyles]
                }`}
              >
                <Icon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white">{insight.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{insight.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* CTA Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full mt-4 px-4 py-2 rounded-lg bg-gradient-to-r from-cyber-blue/20 to-cyber-purple/20 border border-cyber-blue/30 text-sm font-medium text-cyber-blue hover:border-cyber-blue/50 transition-colors"
        >
          View All Insights →
        </motion.button>
      </div>
    </motion.div>
  );
}
