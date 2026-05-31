'use client';

import { motion } from 'framer-motion';
import { AlertTriangle, Zap, ServerCrash } from 'lucide-react';
import { useInfrastructureStore } from '@/lib/store';

interface BlastRadiusVisualizerProps {
  nodesData: any[];
  dependenciesData: any[];
  blastRadius: any;
}

export function BlastRadiusVisualizer({ nodesData, dependenciesData, blastRadius }: BlastRadiusVisualizerProps) {
  const { selectedNodeId } = useInfrastructureStore();

  const nodeInfo = nodesData.find(n => n.id === selectedNodeId);
  const nodeBlast = blastRadius[selectedNodeId || ''] || { direct: 0, indirect: 0, potentialDowntime: '$0/min' };

  // Trace downstream direct dependencies
  const directDeps = dependenciesData.filter(d => d.from === selectedNodeId).map(d => d.to);
  
  // Trace downstream indirect dependencies (transitive closure)
  const visited = new Set<string>();
  const queue = [...directDeps];
  while (queue.length > 0) {
    const current = queue.shift()!;
    if (!visited.has(current)) {
      visited.add(current);
      const nextDeps = dependenciesData.filter(d => d.from === current).map(d => d.to);
      queue.push(...nextDeps);
    }
  }
  const indirectDeps = Array.from(visited).filter(id => !directDeps.includes(id));

  const affectedServices: any[] = [];
  
  directDeps.forEach(depId => {
    const nodeObj = nodesData.find(n => n.id === depId);
    if (nodeObj) {
      affectedServices.push({
        name: nodeObj.name,
        risk: 'critical',
        impact: '100%',
        type: nodeObj.type
      });
    }
  });
  
  indirectDeps.forEach(depId => {
    const nodeObj = nodesData.find(n => n.id === depId);
    if (nodeObj) {
      affectedServices.push({
        name: nodeObj.name,
        risk: 'high',
        impact: '60%',
        type: nodeObj.type
      });
    }
  });

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'critical':
        return 'text-cyber-red';
      case 'high':
        return 'text-cyber-amber';
      case 'medium':
        return 'text-cyber-cyan';
      default:
        return 'text-cyber-green';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="rounded-xl bg-gradient-to-br from-cyber-panel to-cyber-panel-light border border-cyber-red/20 p-6 space-y-4"
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        <Zap className="w-5 h-5 text-cyber-red animate-pulse" />
        <h3 className="text-lg font-bold text-white">Blast Radius</h3>
      </div>

      {nodeInfo ? (
        <div className="space-y-4">
          <p className="text-xs text-gray-400">
            Downtime impact assessment if <span className="text-cyber-red font-semibold">{nodeInfo.name}</span> fails.
          </p>

          {/* Core Metrics */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-cyber-red/10 p-2.5 rounded border border-cyber-red/20 text-center">
              <p className="text-[10px] text-gray-500 font-mono">DIRECT</p>
              <p className="text-xl font-bold text-cyber-red">{nodeBlast.direct}</p>
            </div>
            <div className="bg-cyber-amber/10 p-2.5 rounded border border-cyber-amber/20 text-center">
              <p className="text-[10px] text-gray-500 font-mono">INDIRECT</p>
              <p className="text-xl font-bold text-cyber-amber">{nodeBlast.indirect}</p>
            </div>
            <div className="bg-cyber-purple/10 p-2.5 rounded border border-cyber-purple/20 text-center">
              <p className="text-[10px] text-gray-500 font-mono">LOSS RATE</p>
              <p className="text-xs font-bold text-cyber-purple truncate mt-1">{nodeBlast.potentialDowntime}</p>
            </div>
          </div>

          {/* Affected Services list */}
          {affectedServices.length > 0 ? (
            <div className="space-y-2.5">
              <p className="text-[10px] text-gray-500 font-mono">DOWNTIME CASCADE TIMELINE</p>
              <div className="space-y-2 max-h-36 overflow-y-auto pr-1 scrollbar-thin">
                {affectedServices.map((service, i) => (
                  <div
                    key={service.name}
                    className="p-2 rounded-lg bg-cyber-panel/50 border border-cyber-blue/10 flex flex-col gap-1.5"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-300 font-medium truncate max-w-44">{service.name}</span>
                      <span className={`font-semibold ${getRiskColor(service.risk)}`}>
                        {service.impact} Impact
                      </span>
                    </div>
                    <div className="w-full h-1 bg-black/40 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          service.risk === 'critical'
                            ? 'bg-cyber-red'
                            : 'bg-cyber-amber'
                        }`}
                        style={{ width: service.impact }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-xs text-cyber-green font-mono text-center py-2 bg-cyber-green/5 border border-cyber-green/20 rounded">
              ✓ isolated node: No downstream cascade risk.
            </p>
          )}

          {/* Warning Message if direct impact is high */}
          {affectedServices.length > 1 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="p-3 rounded-lg bg-cyber-red/10 border border-cyber-red/20 flex gap-2"
            >
              <AlertTriangle className="w-4 h-4 text-cyber-red flex-shrink-0 mt-0.5" />
              <p className="text-[10px] text-cyber-red leading-normal leading-relaxed">
                Critical path alert: Failure creates a single point failure loop across {affectedServices.length} entities.
              </p>
            </motion.div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 text-center border border-dashed border-cyber-red/10 rounded-lg">
          <ServerCrash className="w-8 h-8 text-gray-600 mb-2 opacity-50" />
          <p className="text-xs text-gray-500 font-mono">No active blast radius data</p>
        </div>
      )}
    </motion.div>
  );
}
