'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { 
  Network, 
  AlertTriangle, 
  Zap, 
  Shield, 
  Search, 
  SlidersHorizontal, 
  Eye, 
  Globe, 
  RefreshCw, 
  Cpu, 
  Trash2, 
  Plus, 
  Link, 
  Unlink, 
  Activity, 
  Clock, 
  Settings, 
  ShieldAlert, 
  Sparkles, 
  RotateCcw 
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useInfrastructureStore } from '@/lib/store';
import { InfrastructureGraph } from '@/components/digital-twin/InfrastructureGraph';
import { ThreeDInfrastructureGraph } from '@/components/digital-twin/ThreeDInfrastructureGraph';
import { NodeDetailsPanel } from '@/components/digital-twin/NodeDetailsPanel';
import { BlastRadiusVisualizer } from '@/components/digital-twin/BlastRadiusVisualizer';

interface SandboxInsights {
  summary: string;
  impactScore: number;
  impactRating: string;
  affectedNodes: string[];
  recommendations: string[];
}

export default function DigitalTwinPage() {
  const { setSelectedNode, selectedNodeId } = useInfrastructureStore();

  // Dynamic state hooks
  const [nodes, setNodes] = useState<any[]>([]);
  const [dependencies, setDependencies] = useState<any[]>([]);
  const [blastRadius, setBlastRadius] = useState<any>({});
  const [threatReadings, setThreatReadings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Navigation workspace tabs
  const [activeTab, setActiveTab] = useState<'infrastructure' | 'dependency' | 'timeline' | 'sandbox'>('infrastructure');

  // Sandbox simulation states
  const [simNodes, setSimNodes] = useState<any[]>([]);
  const [simDeps, setSimDeps] = useState<any[]>([]);
  const [sandboxActions, setSandboxActions] = useState<string[]>([]);
  const [simulatedAttackPath, setSimulatedAttackPath] = useState<string[]>([]);
  
  // Sandbox inputs
  const [selectedNodeForRemoval, setSelectedNodeForRemoval] = useState('');
  const [newNodeName, setNewNodeName] = useState('');
  const [newNodeType, setNewNodeType] = useState('Microservice');
  const [newNodeConnectTo, setNewNodeConnectTo] = useState('');
  const [srcNodeConn, setSrcNodeConn] = useState('');
  const [dstNodeConn, setDstNodeConn] = useState('');
  const [trafficLoad, setTrafficLoad] = useState('Normal');
  const [attackType, setAttackType] = useState('Compromised API (SQLi)');
  const [attackTarget, setAttackTarget] = useState('');
  const [futurePredictMode, setFuturePredictMode] = useState(false);

  const [sandboxInsights, setSandboxInsights] = useState<SandboxInsights>({
    summary: "Sandbox is idle. Select an action from the controls to begin testing modifications.",
    impactScore: 100,
    impactRating: "Optimal",
    affectedNodes: [],
    recommendations: [
      "Remove vulnerable legacy nodes to reduce overall blast radius.",
      "Deploy a Security Gateway to enforce credential token checking on shadow routes."
    ]
  });

  const fetchGraphData = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://127.0.0.1:8000/api/v1/twin/graph');
      if (res.ok) {
        const data = await res.json();
        setNodes(data.nodes || []);
        setDependencies(data.dependencies || []);
        setBlastRadius(data.blastRadius || {});
        setThreatReadings(data.threatReadings || []);
        
        // Auto-select gateway or default node
        if (data.nodes && data.nodes.length > 1) {
          setSelectedNode(data.nodes[1].id);
        } else if (data.nodes && data.nodes.length > 0) {
          setSelectedNode(data.nodes[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load twin graph:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGraphData();
  }, []);

  // Initialize and clone Sandbox state
  const resetSimulation = () => {
    setSimNodes(JSON.parse(JSON.stringify(nodes)));
    setSimDeps(JSON.parse(JSON.stringify(dependencies)));
    setSandboxActions([]);
    setSimulatedAttackPath([]);
    setSandboxInsights({
      summary: "Sandbox is idle. Select an action from the controls to begin testing modifications.",
      impactScore: 100,
      impactRating: "Optimal",
      affectedNodes: [],
      recommendations: [
        "Remove vulnerable legacy nodes to reduce overall blast radius.",
        "Deploy a Security Gateway to enforce credential token checking on shadow routes."
      ]
    });
    setSelectedNodeForRemoval("");
    setNewNodeName("");
    setNewNodeType("Microservice");
    setNewNodeConnectTo("");
    setSrcNodeConn("");
    setDstNodeConn("");
    setTrafficLoad("Normal");
    setAttackType("Compromised API (SQLi)");
    setAttackTarget("");
    setFuturePredictMode(false);
  };

  useEffect(() => {
    if (activeTab === 'sandbox' && nodes.length > 0 && simNodes.length === 0) {
      resetSimulation();
    }
  }, [activeTab, nodes]);

  // Simulation capability handlers
  const handleSimulateRemoval = () => {
    const nodeId = selectedNodeForRemoval || selectedNodeId;
    if (!nodeId) return;

    // Filter nodes and dependencies
    const updatedNodes = simNodes.filter(n => n.id !== nodeId);
    const updatedDeps = simDeps.filter(d => d.from !== nodeId && d.to !== nodeId);

    // Trace downstream direct and indirect dependencies to find affected nodes
    const directDeps = simDeps.filter(d => d.from === nodeId).map(d => d.to);
    const visited = new Set<string>();
    const queue = [...directDeps];
    while (queue.length > 0) {
      const curr = queue.shift()!;
      if (!visited.has(curr)) {
        visited.add(curr);
        const next = simDeps.filter(d => d.from === curr).map(d => d.to);
        queue.push(...next);
      }
    }

    // Set statuses of downstream affected nodes to 'Critical' to render Red
    const finalNodes = updatedNodes.map(node => {
      if (visited.has(node.id)) {
        return {
          ...node,
          status: 'Critical',
          health: Math.max(15, node.health - 40),
          isSimulatedImpacted: true
        };
      }
      return node;
    });

    const removedName = simNodes.find(n => n.id === nodeId)?.name || nodeId;

    setSimNodes(finalNodes);
    setSimDeps(updatedDeps);
    setSandboxActions(prev => [...prev, `Removed: ${removedName}`]);

    setSandboxInsights({
      summary: `CRITICAL PATH SEVERED: Removing '${removedName}' broke ${directDeps.length} direct connection dependency links. Downstream services (${Array.from(visited).map(id => simNodes.find(n => n.id === id)?.name || id).join(', ') || 'none'}) are experiencing packet drop / service timeout cascades.`,
      impactScore: Math.max(15, 100 - directDeps.length * 20 - visited.size * 10),
      impactRating: directDeps.length > 1 ? 'Critical risk' : 'Moderate Risk',
      affectedNodes: Array.from(visited),
      recommendations: [
        `Re-route connections from dependent components before decommission of '${removedName}'.`,
        `Configure circuit breakers at the API gateway layer to prevent resource starvation.`
      ]
    });
  };

  const handleSimulateAddition = () => {
    if (!newNodeName || !newNodeConnectTo) return;
    const newId = `sim-${Date.now()}`;
    const isSec = newNodeType === 'Security';

    const newNode = {
      id: newId,
      name: newNodeName,
      type: newNodeType,
      status: 'Healthy',
      health: 98,
      latency: 12,
      dependencies: 1,
      isSimulatedAdded: true
    };

    const newDep = {
      from: newNodeConnectTo,
      to: newId,
      strength: 'high',
      isSimulatedAdded: true
    };

    // If type is security, improve target node health status
    const updatedNodes = simNodes.map(node => {
      if (node.id === newNodeConnectTo && isSec) {
        return {
          ...node,
          status: 'Healthy',
          health: Math.min(100, node.health + 10),
          isSimulatedImproved: true
        };
      }
      return node;
    });

    setSimNodes([...updatedNodes, newNode]);
    setSimDeps([...simDeps, newDep]);
    setSandboxActions(prev => [...prev, `Added: ${newNodeName}`]);

    setSandboxInsights({
      summary: isSec 
        ? `HARDENING PATTERN INSTANTIATED: Added Security Gateway '${newNodeName}' targeting '${simNodes.find(n => n.id === newNodeConnectTo)?.name}'. Connection transport secured, adjacent exposure vectors reduced by 35%.`
        : `ARCHITECTURAL COMPLEXITY INCREASED: Adding new service component '${newNodeName}' expands the dependency matrix. Total routing paths increased.`,
      impactScore: isSec ? 100 : 92,
      impactRating: isSec ? 'Improvement' : 'Stable',
      affectedNodes: [newNodeConnectTo, newId],
      recommendations: isSec
        ? [`Enforce token expiration checks on the new gateway '${newNodeName}' router.`]
        : [`Scale cluster resources to allocate memory threads for '${newNodeName}'.`]
    });

    // Reset inputs
    setNewNodeName('');
  };

  const handleSimulateLinkEdit = (action: 'connect' | 'sever') => {
    if (!srcNodeConn || !dstNodeConn || srcNodeConn === dstNodeConn) return;

    if (action === 'connect') {
      if (simDeps.some(d => d.from === srcNodeConn && d.to === dstNodeConn)) return;
      
      const newDep = {
        from: srcNodeConn,
        to: dstNodeConn,
        strength: 'high',
        isSimulatedAdded: true
      };

      setSimDeps([...simDeps, newDep]);
      setSandboxActions(prev => [...prev, `Linked: ${srcNodeConn} → ${dstNodeConn}`]);

      setSandboxInsights({
        summary: `PROPOSED CONNECTION MODIFIED: Established routing dependencies between '${simNodes.find(n => n.id === srcNodeConn)?.name}' and '${simNodes.find(n => n.id === dstNodeConn)?.name}'. Systems connected successfully.`,
        impactScore: 95,
        impactRating: 'Stable',
        affectedNodes: [srcNodeConn, dstNodeConn],
        recommendations: [
          `Audit endpoints connectivity payload schema formats.`,
          `Monitor connection packet latency; typical overhead increases by 5ms.`
        ]
      });
    } else {
      const updatedDeps = simDeps.map(dep => {
        if (dep.from === srcNodeConn && dep.to === dstNodeConn) {
          return { ...dep, isSimulatedSevered: true }; // Visual severed state
        }
        return dep;
      });

      setSimDeps(updatedDeps);
      setSandboxActions(prev => [...prev, `Severed Link: ${srcNodeConn} → ${dstNodeConn}`]);

      setSandboxInsights({
        summary: `COMMUNICATION PATH DECOMMISSIONED: Severed dependencies between '${simNodes.find(n => n.id === srcNodeConn)?.name}' and '${simNodes.find(n => n.id === dstNodeConn)?.name}'. Direct communication blocked.`,
        impactScore: 78,
        impactRating: 'Degraded',
        affectedNodes: [srcNodeConn, dstNodeConn],
        recommendations: [
          `Ensure backup pathways handle requests target fallback flows.`,
          `Verify consumers does not trigger 502 connection refused packets.`
        ]
      });
    }
  };

  const handleTrafficSimulation = (load: string) => {
    setTrafficLoad(load);

    const updatedNodes = simNodes.map(node => {
      if (load === 'Surge') {
        return {
          ...node,
          latency: node.latency + 80,
          health: Math.max(50, node.health - 15),
          status: node.health - 15 < 75 ? 'Degraded' : 'Healthy',
          isSimulatedImpacted: node.health - 15 < 75
        };
      } else if (load === 'Overload') {
        const isTarget = ['app-gateway', 'db-postgresql', 'user-service'].includes(node.id);
        return {
          ...node,
          latency: node.latency + 290,
          health: isTarget ? 28 : Math.max(30, node.health - 40),
          status: isTarget ? 'Critical' : 'Degraded',
          isSimulatedImpacted: true
        };
      } else if (load === 'Inactivity') {
        return {
          ...node,
          latency: Math.max(2, node.latency - 15),
          health: Math.max(40, node.health - 5),
          status: 'Healthy'
        };
      } else {
        // Normal
        return {
          ...node,
          latency: Math.max(5, node.latency - 50),
          health: 95,
          status: 'Healthy',
          isSimulatedImpacted: false
        };
      }
    });

    setSimNodes(updatedNodes);
    setSandboxActions(prev => [...prev, `Traffic: ${load} load`]);

    setSandboxInsights({
      summary: load === 'Surge'
        ? `VOLUME TRAFFIC SURGE: Ingestion load raised +200%. Mean cluster response latency rose to 110ms.`
        : load === 'Overload'
        ? `CRITICAL COMPONENT OVERLOAD: Primary DB and Gateways reporting CPU thread exhaust. Gateway timeouts occurring.`
        : load === 'Inactivity'
        ? `RESOURCE INACTIVITY: Low transaction volume simulated. Stale cached endpoints alerted.`
        : `STEADY TRAFFIC INGESTION: Normal operations within optimal threshold parameters.`,
      impactScore: load === 'Normal' ? 100 : (load === 'Surge' ? 76 : (load === 'Inactivity' ? 88 : 26)),
      impactRating: load === 'Normal' ? 'Optimal' : (load === 'Surge' ? 'Degraded' : (load === 'Inactivity' ? 'Idle' : 'Critical bottleneck')),
      affectedNodes: load === 'Overload' ? ['app-gateway', 'db-postgresql'] : [],
      recommendations: load === 'Overload'
        ? [`Scale container replica pods horizontally.`, `Establish transaction queuing middleware layers.`]
        : [`System operations executing normally.`]
    });
  };

  const handleAttackSimulation = () => {
    if (!attackTarget) return;

    const path: string[] = [attackTarget];
    // Trace direct connections to simulate lateral pivot propagation
    const downstream = simDeps.filter(d => d.from === attackTarget).map(d => d.to);
    if (downstream.length > 0) {
      path.push(...downstream);
    }

    const updatedNodes = simNodes.map(node => {
      if (path.includes(node.id)) {
        return {
          ...node,
          status: 'Critical',
          health: 15,
          isSimulatedCompromised: true
        };
      }
      return node;
    });

    const updatedDeps = simDeps.map(dep => {
      if (path.includes(dep.from) && path.includes(dep.to)) {
        return { ...dep, isSimulatedAttackPath: true };
      }
      return dep;
    });

    setSimNodes(updatedNodes);
    setSimDeps(updatedDeps);
    setSimulatedAttackPath(path);
    setSandboxActions(prev => [...prev, `Breach: ${attackType} on ${attackTarget}`]);

    setSandboxInsights({
      summary: `INTRUSION ATTACK PATH SIMULATED: Malicious actor executed a '${attackType}' exploit targeting '${simNodes.find(n => n.id === attackTarget)?.name}'. Lateral breach pivot compromises downstream services: ${path.slice(1).map(id => simNodes.find(n => n.id === id)?.name || id).join(', ') || 'none'}.`,
      impactScore: 10,
      impactRating: 'Critical Threat Vector',
      affectedNodes: path,
      recommendations: [
        `Enable network quarantines at the gateway layer to isolate compromised nodes.`,
        `Force rotation of JWT access secret signatures immediately.`,
        `Apply strict parameter boundaries checks to block malicious payloads.`
      ]
    });
  };

  const handleToggleFuturePredict = (val: boolean) => {
    setFuturePredictMode(val);

    if (val) {
      const updatedNodes = simNodes.map(node => {
        const isDecaying = ['analytics-service', 'ext-twilio'].includes(node.id);
        if (isDecaying) {
          return {
            ...node,
            status: 'Critical',
            health: 30,
            name: `${node.name} [Zombie Risk]`,
            isSimulatedImpacted: true
          };
        }
        return {
          ...node,
          health: Math.max(65, node.health - 20)
        };
      });

      setSimNodes(updatedNodes);
      setSandboxActions(prev => [...prev, `ML Evolution forecast`]);

      setSandboxInsights({
        summary: `INFRASTRUCTURE DECAY PREDICTION: Dynamic modeling predicts 2 critical zombie service transitions within 90 days. Low code update commit rates result in high ownership decay risks.`,
        impactScore: 60,
        impactRating: 'Architectural Debt Alert',
        affectedNodes: ['analytics-service', 'ext-twilio'],
        recommendations: [
          `Schedule a quarterly code ownership audit to assign maintainer squads.`,
          `Retire legacy external Twilio webhook dependencies.`
        ]
      });
    } else {
      const restoredNodes = simNodes.map(node => {
        const cleanName = node.name.replace(' [Zombie Risk]', '');
        return {
          ...node,
          name: cleanName,
          health: 95,
          status: 'Healthy',
          isSimulatedImpacted: false
        };
      });
      setSimNodes(restoredNodes);
    }
  };

  // Determine active datasets to pass to graph visualizations
  const activeNodes = activeTab === 'sandbox' ? simNodes : nodes;
  const activeDeps = activeTab === 'sandbox' ? simDeps : dependencies;

  const selectedNodeData = activeNodes.find(n => n.id === selectedNodeId);

  // Filter matrix elements based on search and category
  const filteredNodes = activeNodes.filter(node => {
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
  });

  const filteredDependencies = activeDeps.filter(dep => {
    const fromNode = activeNodes.find(n => n.id === dep.from);
    const toNode = activeNodes.find(n => n.id === dep.to);
    if (!fromNode || !toNode) return false;
    
    return filteredNodes.some(n => n.id === dep.from) || filteredNodes.some(n => n.id === dep.to);
  });

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-cyber-cyan border-t-transparent animate-spin" />
        <p className="text-gray-400 animate-pulse font-mono">Synchronizing Live Digital Twin Topologies...</p>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-8 space-y-6 max-w-7xl mx-auto text-white select-none">
      
      {/* Header and Switches */}
      <div className="flex justify-between items-start flex-wrap gap-4 border-b border-cyber-panel pb-4">
        <div>
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-cyber-cyan via-cyber-blue to-cyber-purple bg-clip-text text-transparent mb-2 flex items-center gap-3">
            <Network className="w-8 h-8 text-cyber-cyan animate-pulse" />
            Digital Twin Workspace
          </h1>
          <p className="text-gray-400 text-sm">
            Live infrastructure mapping, dependency cascade tracking, and dynamic sandboxing simulation overlays.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* View Mode Toggle (2D/3D) */}
          <div className="flex bg-black/40 border border-cyber-blue/20 rounded-lg p-1">
            <button
              onClick={() => setViewMode('2d')}
              className={`px-3 py-1.5 rounded text-xs font-mono font-semibold transition-colors ${
                viewMode === '2d' ? 'bg-cyber-blue/20 text-cyber-cyan' : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              2D Topo
            </button>
            <button
              onClick={() => setViewMode('3d')}
              className={`px-3 py-1.5 rounded text-xs font-mono font-semibold transition-colors ${
                viewMode === '3d' ? 'bg-cyber-blue/20 text-cyber-cyan' : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              3D Hologram
            </button>
          </div>

          <button 
            onClick={fetchGraphData}
            className="p-2 bg-cyber-blue/10 border border-cyber-blue/30 rounded-lg hover:bg-cyber-blue/20 transition-all"
            title="Sync Production Telemetry"
          >
            <RefreshCw className="w-4.5 h-4.5 text-cyber-cyan" />
          </button>
        </div>
      </div>

      {/* Navigation Workspace Tabs */}
      <div className="flex border-b border-cyber-blue/15 gap-2 pb-px overflow-x-auto scrollbar-none">
        {[
          { id: 'infrastructure', name: 'Infrastructure View', icon: <Network className="w-4 h-4" /> },
          { id: 'dependency', name: 'Dependency Explorer', icon: <SlidersHorizontal className="w-4 h-4" /> },
          { id: 'timeline', name: 'Timeline View', icon: <Clock className="w-4 h-4" /> },
          { id: 'sandbox', name: 'Sandbox Simulation', icon: <Cpu className="w-4 h-4 animate-pulse text-cyber-purple" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id as any);
              if (tab.id === 'sandbox' && simNodes.length === 0) {
                resetSimulation();
              }
            }}
            className={`px-5 py-3 border-b-2 font-mono text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-cyber-cyan text-cyber-cyan bg-cyber-blue/5'
                : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-600'
            }`}
          >
            {tab.icon}
            {tab.name}
          </button>
        ))}
      </div>

      {/* Control Filters Panel (only for non-sandbox tabs) */}
      {activeTab !== 'sandbox' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-cyber-panel/20 border border-cyber-blue/10 rounded-xl">
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search nodes by name or service type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-cyber-panel/40 border border-cyber-blue/15 rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyber-cyan font-mono"
            />
          </div>

          <div className="relative">
            <SlidersHorizontal className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-cyber-panel/45 border border-cyber-blue/15 rounded-lg text-xs text-gray-300 focus:outline-none focus:border-cyber-cyan font-mono appearance-none"
            >
              <option value="All">All Categories</option>
              <option value="Microservices">Microservices</option>
              <option value="Databases">Databases</option>
              <option value="External Integrations">Integrations</option>
              <option value="Security">Security / Auth</option>
            </select>
          </div>

          <div className="flex items-center justify-between px-3 py-2 bg-cyber-panel/10 border border-cyber-blue/10 rounded-lg text-xs font-mono">
            <span className="text-gray-400">Inspecting:</span>
            <span className="text-cyber-cyan font-bold truncate max-w-28">{selectedNodeData?.name || 'None'}</span>
          </div>
        </div>
      )}

      {/* Main Grid Layout: Graph (70%) + Dynamic Widgets (30%) */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
        
        {/* Left Column: Infrastructure Graph */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
          <div className="relative flex-1 rounded-xl overflow-hidden border border-cyber-cyan/20 bg-cyber-panel/40 min-h-[450px]">
            {viewMode === '2d' ? (
              <InfrastructureGraph
                nodesData={filteredNodes}
                dependenciesData={filteredDependencies}
                searchQuery={searchQuery}
                categoryFilter={categoryFilter}
              />
            ) : (
              <ThreeDInfrastructureGraph
                nodesData={filteredNodes}
                dependenciesData={filteredDependencies}
              />
            )}

            {/* Sandbox mode header indicator badge */}
            {activeTab === 'sandbox' && (
              <div className="absolute top-4 left-4 pointer-events-none z-10 font-mono text-[10px] text-cyber-purple/80 space-y-1 bg-cyber-purple/10 border border-cyber-purple/30 p-2.5 rounded backdrop-blur-md animate-pulse">
                <div>● SANDBOX ACTIVE: OPERATING ON CLONED TOPOLOGY</div>
                <div>STATE MODIFIED: {sandboxActions.length > 0 ? `${sandboxActions.length} changes applied` : 'Idle'}</div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Context Widgets based on Active Tab */}
        <div className="lg:col-span-3 space-y-6">
          <AnimatePresence mode="wait">
            
            {/* 1. Infrastructure View Widgets */}
            {activeTab === 'infrastructure' && (
              <motion.div key="infra-widgets" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
                <NodeDetailsPanel nodesData={nodes} />
                <BlastRadiusVisualizer 
                  nodesData={nodes} 
                  dependenciesData={dependencies} 
                  blastRadius={blastRadius} 
                />
                
                {/* Static scanned threat readings */}
                <div className="rounded-xl border border-cyber-blue/20 bg-cyber-panel/40 p-5 space-y-4">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-cyber-red animate-pulse" />
                    Scanned Threat Telemetry
                  </h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-thin">
                    {threatReadings.map((threat, i) => (
                      <div
                        key={i}
                        className={`p-2.5 rounded border text-[10px] font-mono leading-normal ${
                          threat.severity === 'critical' ? 'bg-cyber-red/10 border-cyber-red/30 text-cyber-red' :
                          threat.severity === 'high' ? 'bg-cyber-amber/10 border-cyber-amber/30 text-cyber-amber' :
                          'bg-cyber-blue/10 border-cyber-blue/30 text-cyber-blue'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold uppercase">{threat.type}</span>
                          <span className="opacity-50">{threat.time}</span>
                        </div>
                        <p className="text-gray-300 text-[10px]">{threat.detail}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* 2. Dependency Explorer Widgets */}
            {activeTab === 'dependency' && (
              <motion.div key="dep-widgets" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
                <NodeDetailsPanel nodesData={nodes} />
                <div className="rounded-xl border border-cyber-blue/20 bg-cyber-panel/40 p-5 space-y-4">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4 text-cyber-cyan" />
                    Topology Stats
                  </h3>
                  <div className="space-y-3 font-mono text-xs text-gray-300 leading-relaxed">
                    <div className="flex justify-between border-b border-cyber-panel pb-1.5">
                      <span>Total Route Segments</span>
                      <span className="font-semibold text-white">{dependencies.length} paths</span>
                    </div>
                    <div className="flex justify-between border-b border-cyber-panel pb-1.5">
                      <span>Direct Database Links</span>
                      <span className="font-semibold text-white">
                        {nodes.filter(n => n.type === 'Database').length} connections
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-cyber-panel pb-1.5">
                      <span>Gateway Access Points</span>
                      <span className="font-semibold text-white">
                        {nodes.filter(n => n.type === 'Gateway' || n.type === 'Frontend').length} endpoints
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-500 leading-normal">
                      Verify routing strength classifications. Red badges mark critical dependencies that propagate downstreams.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 3. Timeline View Widgets */}
            {activeTab === 'timeline' && (
              <motion.div key="time-widgets" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
                <div className="rounded-xl border border-cyber-blue/20 bg-cyber-panel/40 p-5 space-y-4">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Clock className="w-4 h-4 text-cyber-cyan" />
                    Evolution Timeline
                  </h3>
                  <div className="space-y-4 font-mono text-xs">
                    <div className="p-3 bg-cyber-bg-secondary/40 border border-cyber-panel rounded">
                      <div className="text-cyber-cyan font-bold mb-1">Today</div>
                      <p className="text-[10px] text-gray-400 leading-normal">
                        Ecosystem scanning online. Active APIs count stable. Exposure index is monitored.
                      </p>
                    </div>
                    <div className="p-3 bg-cyber-bg-secondary/20 border border-cyber-panel/60 rounded">
                      <div className="text-gray-400 font-bold mb-1">3 Months Ago</div>
                      <p className="text-[10px] text-gray-500 leading-normal">
                        Minor route modifications detected. Added PostgreSQL database entity mapping.
                      </p>
                    </div>
                    <div className="p-3 bg-cyber-bg-secondary/25 border border-cyber-panel/40 rounded">
                      <div className="text-gray-400 font-bold mb-1">6 Months Ago</div>
                      <p className="text-[10px] text-gray-500 leading-normal">
                        Baseline infrastructure generation. Discovered Express route gateway and frontend clients.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 4. Sandbox Simulation Widgets */}
            {activeTab === 'sandbox' && (
              <motion.div key="sandbox-widgets" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
                
                {/* Sandbox Control Center Card */}
                <div className="rounded-xl border border-cyber-purple/30 bg-cyber-panel/40 p-5 space-y-4 shadow-[0_0_15px_rgba(139,92,246,0.05)]">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2 font-mono">
                    <Settings className="w-4.5 h-4.5 text-cyber-purple animate-spin-slow" />
                    SANDBOX CONTROLS
                  </h3>
                  
                  {/* Option 1: Node Removal */}
                  <div className="space-y-2 border-b border-cyber-panel pb-3.5">
                    <label className="block text-[10px] font-bold font-mono text-cyber-purple uppercase">1. Simulate Node Removal</label>
                    <div className="flex gap-2">
                      <select
                        id="select-remove-node"
                        value={selectedNodeForRemoval || selectedNodeId || ''}
                        onChange={(e) => setSelectedNodeForRemoval(e.target.value)}
                        className="flex-1 px-2.5 py-1.5 bg-cyber-bg-secondary border border-cyber-panel rounded text-xs text-white focus:outline-none focus:border-cyber-purple/50 font-mono"
                      >
                        <option value="">Select node to remove...</option>
                        {simNodes.map(n => (
                          <option key={n.id} value={n.id}>{n.name}</option>
                        ))}
                      </select>
                      <button
                        onClick={handleSimulateRemoval}
                        disabled={!(selectedNodeForRemoval || selectedNodeId)}
                        className="px-3 py-1.5 bg-cyber-red/10 border border-cyber-red/30 rounded text-cyber-red hover:bg-cyber-red hover:text-white font-bold text-xs tracking-wider uppercase transition-colors disabled:opacity-40"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Option 2: Node Addition */}
                  <div className="space-y-2 border-b border-cyber-panel pb-3.5">
                    <label className="block text-[10px] font-bold font-mono text-cyber-purple uppercase">2. Simulate Node Addition</label>
                    <div className="space-y-2">
                      <input 
                        id="input-node-name"
                        type="text" 
                        placeholder="Ghost Service name..."
                        value={newNodeName}
                        onChange={(e) => setNewNodeName(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-cyber-bg-secondary border border-cyber-panel rounded text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyber-purple/50 font-mono"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <select 
                          id="select-node-type"
                          value={newNodeType}
                          onChange={(e) => setNewNodeType(e.target.value)}
                          className="px-2 py-1.5 bg-cyber-bg-secondary border border-cyber-panel rounded text-[10px] text-white focus:outline-none focus:border-cyber-purple/50 font-mono"
                        >
                          <option>Microservice</option>
                          <option>Database</option>
                          <option>External Integration</option>
                          <option>Security</option>
                        </select>
                        <select 
                          id="select-node-connect"
                          value={newNodeConnectTo}
                          onChange={(e) => setNewNodeConnectTo(e.target.value)}
                          className="px-2 py-1.5 bg-cyber-bg-secondary border border-cyber-panel rounded text-[10px] text-white focus:outline-none focus:border-cyber-purple/50 font-mono"
                        >
                          <option value="">Connect to Node...</option>
                          {simNodes.map(n => (
                            <option key={n.id} value={n.id}>{n.name}</option>
                          ))}
                        </select>
                      </div>
                      <button
                        onClick={handleSimulateAddition}
                        disabled={!newNodeName || !newNodeConnectTo}
                        className="w-full py-1.5 bg-cyber-purple/10 border border-cyber-purple/40 text-cyber-purple rounded hover:bg-cyber-purple hover:text-black font-semibold text-xs tracking-wider uppercase transition-all disabled:opacity-40"
                      >
                        Add simulated Node
                      </button>
                    </div>
                  </div>

                  {/* Option 3: Link Modifications */}
                  <div className="space-y-2 border-b border-cyber-panel pb-3.5">
                    <label className="block text-[10px] font-bold font-mono text-cyber-purple uppercase">3. Connection Link Changes</label>
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <select 
                          id="select-src-node"
                          value={srcNodeConn}
                          onChange={(e) => setSrcNodeConn(e.target.value)}
                          className="px-2 py-1.5 bg-cyber-bg-secondary border border-cyber-panel rounded text-[10px] text-white focus:outline-none focus:border-cyber-purple/50 font-mono"
                        >
                          <option value="">Source Node...</option>
                          {simNodes.map(n => (
                            <option key={n.id} value={n.id}>{n.name}</option>
                          ))}
                        </select>
                        <select 
                          id="select-dst-node"
                          value={dstNodeConn}
                          onChange={(e) => setDstNodeConn(e.target.value)}
                          className="px-2 py-1.5 bg-cyber-bg-secondary border border-cyber-panel rounded text-[10px] text-white focus:outline-none focus:border-cyber-purple/50 font-mono"
                        >
                          <option value="">Target Node...</option>
                          {simNodes.map(n => (
                            <option key={n.id} value={n.id}>{n.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSimulateLinkEdit('connect')}
                          disabled={!srcNodeConn || !dstNodeConn || srcNodeConn === dstNodeConn}
                          className="flex-1 py-1.5 bg-cyber-green/10 border border-cyber-green/30 text-cyber-green rounded hover:bg-cyber-green hover:text-black font-semibold text-xs tracking-wider uppercase transition-colors flex items-center justify-center gap-1.5 disabled:opacity-40"
                        >
                          <Link className="w-3 h-3" /> Connect
                        </button>
                        <button
                          onClick={() => handleSimulateLinkEdit('sever')}
                          disabled={!srcNodeConn || !dstNodeConn || srcNodeConn === dstNodeConn}
                          className="flex-1 py-1.5 bg-cyber-red/10 border border-cyber-red/30 text-cyber-red rounded hover:bg-cyber-red hover:text-white font-semibold text-xs tracking-wider uppercase transition-colors flex items-center justify-center gap-1.5 disabled:opacity-40"
                        >
                          <Unlink className="w-3 h-3" /> Sever Link
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Option 4: Traffic Surge */}
                  <div className="space-y-2 border-b border-cyber-panel pb-3.5">
                    <label className="block text-[10px] font-bold font-mono text-cyber-purple uppercase">4. Traffic Load Simulation</label>
                    <div className="grid grid-cols-4 gap-1">
                      {['Normal', 'Surge', 'Overload', 'Inactivity'].map((load) => (
                        <button
                          key={load}
                          onClick={() => handleTrafficSimulation(load)}
                          className={`py-1 text-[9px] font-bold border rounded uppercase transition-colors ${
                            trafficLoad === load 
                              ? 'bg-cyber-purple border-cyber-purple text-black' 
                              : 'bg-cyber-bg-secondary border-cyber-panel text-gray-400 hover:text-gray-200'
                          }`}
                        >
                          {load === 'Inactivity' ? 'Idle' : load}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Option 5: Attack Inject */}
                  <div className="space-y-2 border-b border-cyber-panel pb-3.5">
                    <label className="block text-[10px] font-bold font-mono text-cyber-purple uppercase">5. Attack Vector Injection</label>
                    <div className="space-y-2">
                      <select 
                        id="select-attack-type"
                        value={attackType}
                        onChange={(e) => setAttackType(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-cyber-bg-secondary border border-cyber-panel rounded text-xs text-white focus:outline-none focus:border-cyber-purple/50 font-mono"
                      >
                        <option>Compromised API (SQLi)</option>
                        <option>Auth Bypass Token</option>
                        <option>Lateral Pivot</option>
                      </select>
                      <div className="flex gap-2">
                        <select 
                          id="select-attack-target"
                          value={attackTarget}
                          onChange={(e) => setAttackTarget(e.target.value)}
                          className="flex-1 px-2.5 py-1.5 bg-cyber-bg-secondary border border-cyber-panel rounded text-xs text-white focus:outline-none focus:border-cyber-purple/50 font-mono"
                        >
                          <option value="">Select target node...</option>
                          {simNodes.map(n => (
                            <option key={n.id} value={n.id}>{n.name}</option>
                          ))}
                        </select>
                        <button
                          onClick={handleAttackSimulation}
                          disabled={!attackTarget}
                          className="px-4 py-1.5 bg-cyber-red/20 border border-cyber-red/50 text-cyber-red rounded hover:bg-cyber-red hover:text-white font-bold text-xs tracking-wider uppercase transition-colors disabled:opacity-40"
                        >
                          Inject
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Option 6: Future ML Predict */}
                  <div className="flex items-center justify-between border-b border-cyber-panel pb-3.5">
                    <div>
                      <label className="block text-[10px] font-bold font-mono text-cyber-purple uppercase">6. ML Future Decay projection</label>
                      <p className="text-[9px] text-gray-500 font-mono mt-0.5">Forecast 90-day architectural debt</p>
                    </div>
                    <button
                      id="toggle-future-predict"
                      onClick={() => handleToggleFuturePredict(!futurePredictMode)}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full border border-cyber-panel transition-colors focus:outline-none ${
                        futurePredictMode ? 'bg-cyber-purple' : 'bg-cyber-bg-secondary'
                      }`}
                    >
                      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                        futurePredictMode ? 'translate-x-4.5' : 'translate-x-0.5'
                      }`} />
                    </button>
                  </div>

                  {/* Reset Sandbox */}
                  <button
                    onClick={resetSimulation}
                    className="w-full py-2 bg-cyber-panel-light border border-cyber-panel hover:border-cyber-purple/40 text-gray-400 hover:text-white rounded font-mono text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-cyber-purple" />
                    Reset Sandbox Simulator
                  </button>
                </div>

                {/* AI Sandbox Recommendation Insights Panel */}
                <div className="rounded-xl border border-cyber-cyan/20 bg-cyber-panel/40 p-5 space-y-4 shadow-[0_0_15px_rgba(6,182,212,0.02)]">
                  <div className="flex items-center justify-between border-b border-cyber-panel pb-2">
                    <h3 className="text-sm font-bold text-white flex items-center gap-1.5 font-mono">
                      <Sparkles className="w-4 h-4 text-cyber-cyan animate-pulse" />
                      AI SIMULATED RECOMS
                    </h3>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold font-mono uppercase ${
                      sandboxInsights.impactScore > 85 ? 'bg-cyber-green/20 text-cyber-green border border-cyber-green/30' :
                      sandboxInsights.impactScore > 50 ? 'bg-cyber-amber/20 text-cyber-amber border border-cyber-amber/30' :
                      'bg-cyber-red/20 text-cyber-red border border-cyber-red/30'
                    }`}>
                      {sandboxInsights.impactRating} ({sandboxInsights.impactScore}%)
                    </span>
                  </div>

                  <p className="text-xs text-gray-300 leading-relaxed">
                    {sandboxInsights.summary}
                  </p>

                  <div className="space-y-2">
                    <p className="text-[10px] text-gray-500 font-mono">REMEDIATION ACTION CHECKLIST</p>
                    {sandboxInsights.recommendations.map((rec, idx) => (
                      <div key={idx} className="p-2 rounded bg-cyber-bg-secondary/30 border border-cyber-panel flex items-start gap-2 text-[10.5px] leading-normal text-gray-400">
                        <Shield className="w-3.5 h-3.5 text-cyber-cyan flex-shrink-0 mt-0.5" />
                        <span>{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </motion.div>
            )}

          </AnimatePresence>
        </div>

      </div>

      {/* Dependency Matrix Table (rendered for Dependency Explorer, and optionally others) */}
      {activeTab === 'dependency' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl border border-cyber-blue/20 bg-cyber-panel/40 p-6"
        >
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5 text-cyber-cyan" />
            Topological Dependency Matrix
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-cyber-panel/50 border-b border-cyber-blue/25 text-gray-400 font-mono">
                <tr>
                  <th className="px-4 py-3">Source Node</th>
                  <th className="px-4 py-3">Target Node</th>
                  <th className="px-4 py-3">Link Classification</th>
                  <th className="px-4 py-3">Strength</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cyber-blue/10 font-mono text-gray-300">
                {filteredDependencies.map((dep, i) => {
                  const fromNode = activeNodes.find(n => n.id === dep.from);
                  const toNode = activeNodes.find(n => n.id === dep.to);
                  
                  if (!fromNode || !toNode) return null;
                  
                  return (
                    <tr key={i} className="hover:bg-cyber-panel/20 transition-colors">
                      <td className="px-4 py-3 font-semibold text-white">{fromNode.name}</td>
                      <td className="px-4 py-3 font-semibold text-white">{toNode.name}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-cyber-blue/10 text-cyber-blue border border-cyber-blue/20">
                          {fromNode.type} → {toNode.type}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                          dep.strength === 'critical' ? 'bg-cyber-red/20 text-cyber-red border border-cyber-red/30' :
                          dep.strength === 'high' ? 'bg-cyber-amber/20 text-cyber-amber font-semibold' :
                          'bg-cyber-blue/20 text-cyber-blue'
                        }`}>
                          {dep.strength.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Sandbox Modified Changes History (only for Sandbox tab) */}
      {activeTab === 'sandbox' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-xl border border-cyber-purple/20 bg-cyber-panel/40 p-6 space-y-4"
        >
          <div className="flex items-center justify-between border-b border-cyber-panel pb-3">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2 font-mono">
              <ShieldAlert className="w-5 h-5 text-cyber-purple" />
              SIMULATION PROPOSAL DELTA SUMMARY (DIFF)
            </h2>
            {sandboxActions.length > 0 && (
              <span className="text-xs px-2.5 py-0.5 bg-cyber-purple/10 border border-cyber-purple/30 rounded font-mono text-cyber-purple font-bold">
                {sandboxActions.length} Pending Modifications
              </span>
            )}
          </div>

          {sandboxActions.length === 0 ? (
            <p className="text-xs text-gray-500 font-mono text-center py-6 border border-dashed border-cyber-panel rounded">
              No proposal delta recorded. Select an action in the controls to modify cloned graph.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Changes list */}
              <div className="space-y-2">
                <p className="text-[10px] text-gray-500 font-mono">APPLIED ACTION MATRIX</p>
                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1 scrollbar-thin">
                  {sandboxActions.map((action, idx) => (
                    <div key={idx} className="p-2 bg-cyber-bg-secondary/40 border border-cyber-panel rounded font-mono text-xs flex items-center gap-2">
                      <span className="text-cyber-purple">+{idx + 1}</span>
                      <span className="text-gray-300">{action}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dynamic blast radius in sandbox */}
              <div className="space-y-2">
                <p className="text-[10px] text-gray-500 font-mono">SIMULATED OVERALL SECURITY SHIELD LEVEL</p>
                <div className="p-4 bg-cyber-bg-secondary/40 border border-cyber-panel rounded-lg space-y-3 font-mono">
                  <div className="flex justify-between items-center text-xs">
                    <span>Target Nodes Count</span>
                    <span className="text-white font-bold">{simNodes.length} nodes</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span>Dependencies Count</span>
                    <span className="text-white font-bold">{simDeps.length} paths</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span>Encountered Bottlenecks</span>
                    <span className={sandboxInsights.impactScore < 50 ? 'text-cyber-red font-bold' : 'text-cyber-green'}>
                      {sandboxInsights.impactScore < 50 ? 'Critical' : 'None'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      )}

    </motion.div>
  );
}
