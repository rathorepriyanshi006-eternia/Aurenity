'use client';

import { motion } from 'framer-motion';
import { AlertTriangle, Lock, Shield, Zap } from 'lucide-react';

const threats = [
  {
    id: 1,
    title: 'SQL Injection Attempt',
    severity: 'critical',
    icon: AlertTriangle,
    time: '2 min ago',
    source: 'API-2847',
  },
  {
    id: 2,
    title: 'Unusual API Activity',
    severity: 'high',
    icon: Zap,
    time: '12 min ago',
    source: 'Service-1234',
  },
  {
    id: 3,
    title: 'Certificate Expiring Soon',
    severity: 'medium',
    icon: Lock,
    time: '1 hour ago',
    source: 'Auth-Server',
  },
  {
    id: 4,
    title: 'DDoS Pattern Detected',
    severity: 'high',
    icon: Shield,
    time: '3 hours ago',
    source: 'LB-Primary',
  },
];

const severityColors = {
  critical: 'bg-cyber-red/10 border-cyber-red/30 text-cyber-red',
  high: 'bg-cyber-amber/10 border-cyber-amber/30 text-cyber-amber',
  medium: 'bg-cyber-cyan/10 border-cyber-cyan/30 text-cyber-cyan',
  low: 'bg-cyber-green/10 border-cyber-green/30 text-cyber-green',
};

export function ThreatFeed() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-xl bg-gradient-to-br from-cyber-panel to-cyber-panel-light border border-cyber-red/20 p-6 h-full"
    >
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-cyber-red/5 rounded-full blur-3xl -z-10" />

      <div className="space-y-4">
        {/* Header */}
        <div>
          <h3 className="text-lg font-bold text-white">Threat Activity</h3>
          <p className="text-sm text-gray-400">Real-time threat feed</p>
        </div>

        {/* Threats List */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {threats.map((threat, i) => {
            const Icon = threat.icon;
            return (
              <motion.div
                key={threat.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer hover:bg-cyber-panel/50 transition-colors ${
                  severityColors[threat.severity as keyof typeof severityColors]
                }`}
              >
                <Icon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{threat.title}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-gray-500">{threat.source}</span>
                    <span className="text-xs text-gray-500">{threat.time}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
