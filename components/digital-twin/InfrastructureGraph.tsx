'use client';

import { motion } from 'framer-motion';
import { useInfrastructureStore } from '@/lib/store';
import { ZoomIn, ZoomOut, Maximize2, Layers } from 'lucide-react';

interface InfrastructureGraphProps {
  nodesData: any[];
  dependenciesData: any[];
  searchQuery: string;
  categoryFilter: string;
}

export function InfrastructureGraph({ nodesData, dependenciesData, searchQuery, categoryFilter }: InfrastructureGraphProps) {
  const { graphZoom, setGraphZoom, setSelectedNode, selectedNodeId } = useInfrastructureStore();

  const handleZoom = (direction: 'in' | 'out') => {
    const newZoom = direction === 'in' ? Math.min(2, graphZoom + 0.15) : Math.max(0.5, graphZoom - 0.15);
    setGraphZoom(newZoom);
  };

  // 1. Layout nodes: Horizontal flow for entry, circular for components
  const layoutNodes = nodesData.map((node) => {
    let x = 300;
    let y = 200;
    
    if (node.id === 'client-frontend') {
      x = 70;
      y = 200;
    } else if (node.id === 'app-gateway') {
      x = 180;
      y = 200;
    } else if (node.id === 'auth-filter') {
      x = 290;
      y = 200;
    } else {
      // Circle layout for other nodes
      const circleNodes = nodesData.filter(
        n => !['client-frontend', 'app-gateway', 'auth-filter'].includes(n.id)
      );
      const circleIndex = circleNodes.findIndex(n => n.id === node.id);
      if (circleIndex !== -1 && circleNodes.length > 0) {
        const theta = (circleIndex / circleNodes.length) * Math.PI * 2;
        x = 450 + Math.cos(theta) * 105;
        y = 200 + Math.sin(theta) * 105;
      }
    }
    
    return { ...node, x, y };
  });

  // 2. Filter layout nodes based on Search Query and Category Filter for opacity/highlight styling
  const getIsMatch = (node: any) => {
    const matchesSearch = node.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          node.type.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesCategory = true;
    if (categoryFilter === 'Microservices') {
      matchesCategory = node.type === 'Microservice' || node.type === 'Gateway' || node.type === 'Frontend';
    } else if (categoryFilter === 'Databases') {
      matchesCategory = node.type === 'Database';
    } else if (categoryFilter === 'External Integrations') {
      matchesCategory = node.type === 'External Integration';
    } else if (categoryFilter === 'Security') {
      matchesCategory = node.type === 'Security';
    }
    
    return matchesSearch && matchesCategory;
  };

  // Node category colors mapping supporting Sandbox simulation overlays
  const getNodeColor = (node: any) => {
    if (node.isSimulatedAdded) return '#8B5CF6'; // Proposed State (Purple)
    if (node.isSimulatedCompromised || node.isSimulatedImpacted) return '#EF4444'; // Negative Impact (Red)
    if (node.isSimulatedImproved) return '#10B981'; // Improvement / Security gate (Green)

    if (node.zombie_classification === 'Zombie API') return '#EF4444'; // Red = Zombie
    if (node.documentation_status === 'Undocumented') return '#F59E0B'; // Yellow = Undocumented
    if (node.zombie_classification === 'Shadow API') return '#10B981'; // Green = Active/Shadow

    if (node.status === 'Critical') return '#EF4444'; // Red
    if (node.status === 'Degraded') return '#F59E0B'; // Amber
    
    switch (node.type) {
      case 'Frontend':
        return '#3B82F6'; // Blue
      case 'Gateway':
        return '#8B5CF6'; // Purple
      case 'Security':
        return '#EC4899'; // Pink
      case 'Database':
        return '#10B981'; // Green
      case 'External Integration':
        return '#06B6D4'; // Cyan
      default:
        return '#F59E0B'; // Amber / default
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative w-full h-full min-h-[450px] rounded-xl overflow-hidden border border-cyber-cyan/20 bg-gradient-to-br from-cyber-panel to-cyber-panel-light"
    >
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-radial from-cyber-cyan/5 to-transparent pointer-events-none" />

      {/* Canvas Area */}
      <div className="w-full h-full relative">
        <svg
          className="w-full h-full min-h-[450px]"
          viewBox="0 0 600 400"
        >
          {/* Grid background */}
          <defs>
            <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(6, 182, 212, 0.08)" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-pattern)" />

          {/* Connection Lines (Edges) */}
          <g style={{ transform: `scale(${graphZoom})`, transformOrigin: 'center' }} className="transition-transform duration-300">
            {dependenciesData.map((dep, i) => {
              const fromNode = layoutNodes.find(n => n.id === dep.from);
              const toNode = layoutNodes.find(n => n.id === dep.to);
              
              if (!fromNode || !toNode) return null;
              
              const isAffected = selectedNodeId === dep.from || selectedNodeId === dep.to;
              const isFromMatched = getIsMatch(fromNode);
              const isToMatched = getIsMatch(toNode);
              const opacity = isFromMatched && isToMatched ? (isAffected ? 0.95 : 0.4) : 0.1;
              
              // Custom Sandbox Edge coloring
              let strokeColor = isAffected ? '#ef4444' : 'rgba(59, 130, 246, 0.5)';
              let strokeWidth = isAffected ? 2.5 : 1.5;
              let isDashed = dep.strength === 'medium';
              let lineOpacity = opacity;

              if (dep.isSimulatedAdded) {
                strokeColor = '#8B5CF6'; // Proposed (Purple)
                strokeWidth = 2.0;
                isDashed = true;
              } else if (dep.isSimulatedAttackPath) {
                strokeColor = '#EF4444'; // Threat Vector (Red)
                strokeWidth = 3.0;
                lineOpacity = 0.95;
              } else if (dep.isSimulatedSevered) {
                strokeColor = '#EF4444'; // Severed (Red dashed)
                strokeWidth = 1.0;
                isDashed = true;
                lineOpacity = 0.2;
              }
              
              return (
                <line
                  key={`edge-${i}`}
                  x1={fromNode.x}
                  y1={fromNode.y}
                  x2={toNode.x}
                  y2={toNode.y}
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  opacity={lineOpacity}
                  strokeDasharray={isDashed ? '4,4' : undefined}
                  className="transition-all duration-300"
                />
              );
            })}
          </g>

          {/* Render Nodes */}
          <g style={{ transform: `scale(${graphZoom})`, transformOrigin: 'center' }} className="transition-transform duration-300">
            {layoutNodes.map((node) => {
              const isSelected = selectedNodeId === node.id;
              const isMatched = getIsMatch(node);
              const color = getNodeColor(node);
              
              return (
                <g
                  key={node.id}
                  cursor="pointer"
                  onClick={() => setSelectedNode(node.id)}
                  opacity={isMatched ? 1 : 0.2}
                  className="transition-all duration-300"
                >
                  {/* Hologram outer ring for selected nodes */}
                  {isSelected && (
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r="22"
                      fill="none"
                      stroke={color}
                      strokeWidth="1.5"
                      className="animate-ping"
                      style={{ transformOrigin: `${node.x}px ${node.y}px` }}
                    />
                  )}

                  {/* Node Circle */}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r="16"
                    fill="#111827"
                    stroke={color}
                    strokeWidth={isSelected ? 3.5 : 2}
                    className="hover:stroke-cyber-cyan transition-all"
                  />

                  {/* Small inner pulse for degraded/critical systems */}
                  {node.status !== 'Healthy' && (
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r="6"
                      fill={color}
                      className="animate-pulse"
                    />
                  )}

                  {/* Node label */}
                  <text
                    x={node.x}
                    y={node.y + 26}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="9"
                    fill={isSelected ? '#22d3ee' : '#cbd5e1'}
                    fontWeight={isSelected ? 'bold' : '500'}
                    className="select-none pointer-events-none font-mono"
                  >
                    {node.name.length > 15 ? `${node.name.slice(0, 13)}...` : node.name}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>

        {/* Zoom Controls */}
        <div className="absolute bottom-4 left-4 flex gap-2 z-10">
          <button
            onClick={() => handleZoom('in')}
            className="p-2 bg-cyber-blue/20 border border-cyber-blue/40 rounded-lg text-cyber-blue hover:bg-cyber-blue/30 transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleZoom('out')}
            className="p-2 bg-cyber-blue/20 border border-cyber-blue/40 rounded-lg text-cyber-blue hover:bg-cyber-blue/30 transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={() => setGraphZoom(1.0)}
            className="p-2 bg-cyber-blue/20 border border-cyber-blue/40 rounded-lg text-cyber-blue hover:bg-cyber-blue/30 transition-colors"
            title="Reset Zoom"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>

        {/* Node stats badge */}
        <div className="absolute top-4 right-4 px-3 py-1.5 bg-cyber-panel/85 border border-cyber-cyan/20 rounded-lg text-xs text-cyber-cyan font-mono flex items-center gap-1.5 backdrop-blur">
          <Layers className="w-3.5 h-3.5" />
          {nodesData.length} Nodes • {dependenciesData.length} Edges
        </div>
      </div>
    </motion.div>
  );
}
