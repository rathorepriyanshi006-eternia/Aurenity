'use client';

import { motion } from 'framer-motion';
import { Cpu, AlertCircle, CheckCircle, Clock } from 'lucide-react';

export default function AutonomousDefensePage() {
  const incidents = [
    { id: 1, name: 'Payment API Rate Limiting', severity: 'High', status: 'Remediated', action: 'Auto-scaled rate limits' },
    { id: 2, name: 'Auth Service Memory Leak', severity: 'Critical', status: 'Remediating', action: 'Gradual rollback initiated' },
    { id: 3, name: 'Database Connection Pool Exhaustion', severity: 'High', status: 'Quarantine', action: 'Service isolated' },
  ];

  const remediationPlans = [
    { risk: 'Critical API Failure', priority: 'P0', plan: 'Failover to standby + rollback to last stable' },
    { risk: 'Security Breach Detected', priority: 'P0', plan: 'Isolate affected service + collect forensics' },
    { risk: 'Data Corruption', priority: 'P1', plan: 'Restore from backup + validate consistency' },
  ];

  const recoveryWorkflow = [
    { step: 'Detect Anomaly', status: 'Complete', duration: '2s' },
    { step: 'Isolate Service', status: 'Complete', duration: '5s' },
    { step: 'Drain Connections', status: 'Active', duration: '15s' },
    { step: 'Restore Backup', status: 'Pending', duration: '45s' },
    { step: 'Health Check', status: 'Pending', duration: '10s' },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-8 space-y-6">
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-cyber-green to-cyber-cyan bg-clip-text text-transparent mb-2 flex items-center gap-3">
          <Cpu className="w-8 h-8 text-cyber-green" />
          Autonomous Defense
        </h1>
        <p className="text-gray-400">Automated incident remediation and recovery workflows</p>
      </div>

      {/* Active Incidents */}
      <motion.div className="rounded-lg border border-cyber-green/20 bg-cyber-panel/40 p-6">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-cyber-amber" />
          Active Incidents & Auto-Remediation
        </h2>
        <div className="space-y-3">
          {incidents.map((incident) => (
            <div key={incident.id} className="p-4 bg-cyber-panel/50 rounded-lg border border-cyber-green/10">
              <div className="flex items-start justify-between mb-2">
                <span className="font-medium text-white">{incident.name}</span>
                <span className={`px-2 py-1 rounded text-xs font-bold ${
                  incident.severity === 'Critical' ? 'bg-cyber-red/20 text-cyber-red' :
                  'bg-cyber-amber/20 text-cyber-amber'
                }`}>
                  {incident.severity}
                </span>
              </div>
              <div className="flex gap-4 text-sm">
                <span className="text-gray-400">Status: <span className="text-cyber-green font-bold">{incident.status}</span></span>
                <span className="text-gray-400">Action: <span className="text-cyber-cyan">{incident.action}</span></span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Remediation Plans */}
      <motion.div className="rounded-lg border border-cyber-green/20 bg-cyber-panel/40 p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Risk Prioritization & Remediation Plans</h2>
        <div className="space-y-3">
          {remediationPlans.map((plan) => (
            <div key={plan.risk} className="p-4 bg-cyber-panel/50 rounded-lg border border-cyber-green/10">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-white">{plan.risk}</span>
                <span className={`px-2 py-1 rounded text-xs font-bold text-white ${
                  plan.priority === 'P0' ? 'bg-cyber-red/20' : 'bg-cyber-amber/20'
                }`}>
                  {plan.priority}
                </span>
              </div>
              <p className="text-sm text-gray-400">Plan: {plan.plan}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Recovery Workflow */}
      <motion.div className="rounded-lg border border-cyber-green/20 bg-cyber-panel/40 p-6">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-cyber-cyan" />
          Recovery Workflow Timeline
        </h2>
        <div className="space-y-3">
          {recoveryWorkflow.map((step, i) => (
            <div key={i} className="p-3 bg-cyber-panel/50 rounded border border-cyber-green/10 flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                step.status === 'Complete' ? 'bg-cyber-green' :
                step.status === 'Active' ? 'bg-cyber-cyan animate-pulse' :
                'bg-gray-600'
              }`} />
              <div className="flex-1">
                <p className="text-sm font-medium text-white">{step.step}</p>
                <p className="text-xs text-gray-500">{step.duration}</p>
              </div>
              <span className={`px-2 py-1 rounded text-xs font-bold ${
                step.status === 'Complete' ? 'bg-cyber-green/20 text-cyber-green' :
                step.status === 'Active' ? 'bg-cyber-cyan/20 text-cyber-cyan' :
                'bg-gray-700/20 text-gray-400'
              }`}>
                {step.status}
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Self-Healing Stats */}
      <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Incidents Resolved', value: '247', color: 'cyber-green' },
          { label: 'Avg Resolution Time', value: '3.2m', color: 'cyber-cyan' },
          { label: 'Prevention Success Rate', value: '94%', color: 'cyber-green' },
        ].map((stat) => (
          <motion.div key={stat.label} whileHover={{ scale: 1.05 }} className="p-4 rounded-lg border border-cyber-green/20 bg-cyber-panel/40">
            <p className="text-sm text-gray-400 mb-2">{stat.label}</p>
            <p className={`text-2xl font-bold text-${stat.color}`}>{stat.value}</p>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}
