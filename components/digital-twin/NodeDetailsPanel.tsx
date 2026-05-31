'use client';

import { motion } from 'framer-motion';
import { useInfrastructureStore } from '@/lib/store';
import { AlertTriangle, CheckCircle, Activity, ShieldAlert, Cpu } from 'lucide-react';

interface NodeDetailsPanelProps {
  nodesData: any[];
}

export function NodeDetailsPanel({ nodesData }: NodeDetailsPanelProps) {
  const { selectedNodeId } = useInfrastructureStore();

  const nodeInfo = nodesData.find(n => n.id === selectedNodeId);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-xl bg-gradient-to-br from-cyber-panel to-cyber-panel-light border border-cyber-blue/20 p-6 space-y-6"
    >
      {/* Header */}
      <div>
        <h3 className="text-lg font-bold text-white mb-1">Node Details</h3>
        <p className="text-xs text-cyber-cyan font-mono truncate">
          {selectedNodeId ? `ID: ${selectedNodeId}` : 'Select a node in the graph'}
        </p>
      </div>

      {nodeInfo ? (
        <div className="space-y-4">
          {/* Node Identity */}
          <div className="space-y-2 pb-4 border-b border-cyber-blue/10">
            <p className="text-[10px] text-gray-500 font-mono">NODE IDENTIFIER</p>
            <p className="text-sm font-semibold text-white truncate">{nodeInfo.name}</p>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyber-blue/10 border border-cyber-blue/30 text-cyber-blue uppercase">
              {nodeInfo.type}
            </span>
          </div>

          {/* Status */}
          <div className="flex items-center gap-2 py-1">
            <CheckCircle className={`w-4 h-4 ${nodeInfo.status === 'Healthy' ? 'text-cyber-green' : nodeInfo.status === 'Degraded' ? 'text-cyber-amber' : 'text-cyber-red'}`} />
            <span className="text-xs text-gray-300 font-medium">
              Status: <span className={nodeInfo.status === 'Healthy' ? 'text-cyber-green' : nodeInfo.status === 'Degraded' ? 'text-cyber-amber' : 'text-cyber-red'}>{nodeInfo.status}</span>
            </span>
          </div>

          {/* Metrics */}
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-400">Node Integrity</span>
              <span className={`font-semibold ${nodeInfo.health > 80 ? 'text-cyber-green' : nodeInfo.health > 60 ? 'text-cyber-amber' : 'text-cyber-red'}`}>{nodeInfo.health}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Mean Latency</span>
              <span className="text-cyber-cyan font-semibold">{nodeInfo.latency}ms</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Threat Exposure</span>
              <span className={`font-semibold ${nodeInfo.health > 85 ? 'text-cyber-green' : 'text-cyber-red'}`}>
                {nodeInfo.health > 85 ? 'Low' : 'Vulnerable'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Active Connections</span>
              <span className="text-white font-semibold">{(nodeInfo.health * 12).toLocaleString()}</span>
            </div>
            {nodeInfo.documentation_status && (
              <div className="flex justify-between">
                <span className="text-gray-400">Documentation Status</span>
                <span className={`font-semibold ${nodeInfo.documentation_status === 'Documented' ? 'text-cyber-green' : 'text-cyber-amber'}`}>
                  {nodeInfo.documentation_status}
                </span>
              </div>
            )}
            {nodeInfo.zombie_classification && (
              <div className="flex justify-between">
                <span className="text-gray-400">API Classification</span>
                <span className={`font-semibold ${nodeInfo.zombie_classification === 'Zombie API' ? 'text-cyber-red' : 'text-cyber-green'}`}>
                  {nodeInfo.zombie_classification}
                </span>
              </div>
            )}
            {nodeInfo.days_since_last_use !== undefined && (
              <div className="flex justify-between">
                <span className="text-gray-400">Days Since Last Usage</span>
                <span className="text-cyber-cyan font-semibold font-mono">{nodeInfo.days_since_last_use} days</span>
              </div>
            )}
          </div>

          {/* Endpoints checklist if Microservice */}
          {nodeInfo.endpoints && nodeInfo.endpoints.length > 0 && (
            <div className="pt-2">
              <p className="text-[10px] text-gray-500 font-mono mb-2">ROUTING ENDPOINTS ({nodeInfo.endpoints.length})</p>
              <div className="space-y-1 max-h-32 overflow-y-auto pr-1 scrollbar-thin">
                {nodeInfo.endpoints.map((ep: string, idx: number) => {
                  const [method, route] = ep.split(' ');
                  return (
                    <div key={idx} className="p-1.5 bg-black/30 rounded border border-cyber-blue/15 text-[10px] font-mono flex items-center gap-1.5">
                      <span className={`px-1 py-0.5 rounded text-[8px] font-bold ${
                        method === 'GET' ? 'bg-cyber-green/20 text-cyber-green' :
                        method === 'POST' ? 'bg-cyber-blue/20 text-cyber-blue' :
                        'bg-cyber-amber/20 text-cyber-amber'
                      }`}>{method}</span>
                      <span className="text-gray-300 truncate">{route}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Dependencies count */}
          <div className="mt-4 p-3 rounded-lg bg-cyber-blue/10 border border-cyber-blue/20 flex items-center justify-between">
            <span className="text-xs text-cyber-blue font-medium flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5" /> Connections
            </span>
            <span className="text-xs font-mono font-bold text-white bg-cyber-blue/30 px-2 py-0.5 rounded border border-cyber-blue/50">
              {nodeInfo.dependencies} Active
            </span>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-cyber-blue/10 rounded-lg">
          <Activity className="w-8 h-8 text-gray-600 mb-2 animate-pulse" />
          <p className="text-xs text-gray-500 font-mono">Select a graph node to inspect dependencies</p>
        </div>
      )}
    </motion.div>
  );
}
