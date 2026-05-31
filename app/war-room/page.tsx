'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Zap, AlertTriangle, Play, RotateCcw, Activity, Terminal, ArrowRight, Lock, Server, ShieldCheck } from 'lucide-react';

interface RedAction {
  action: string;
  time: string;
  status: string;
  target: string;
}

interface BlueResponse {
  action: string;
  time: string;
  severity: string;
}

interface LateralHop {
  hop: string;
  stage: string;
  status: string;
}

interface DefenseStrategy {
  title: string;
  play: string;
}

export default function CyberWarRoomPage() {
  const [simulating, setSimulating] = useState(false);
  const [simCompleted, setSimCompleted] = useState(false);
  const [battleStep, setBattleStep] = useState(0);

  const [allRedActions, setAllRedActions] = useState<RedAction[]>([]);
  const [allBlueResponses, setAllBlueResponses] = useState<BlueResponse[]>([]);
  const [allLateralHops, setAllLateralHops] = useState<LateralHop[]>([]);
  const [defenseStrategies, setDefenseStrategies] = useState<DefenseStrategy[]>([]);

  const [visibleRedActions, setVisibleRedActions] = useState<RedAction[]>([]);
  const [visibleBlueResponses, setVisibleBlueResponses] = useState<BlueResponse[]>([]);
  const [visibleLateralHops, setVisibleLateralHops] = useState<LateralHop[]>([]);

  // Start simulated war room data fetch
  const triggerSimulationFetch = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/v1/war-room/simulate', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setAllRedActions(data.redAgentActions || []);
        setAllBlueResponses(data.blueAgentResponses || []);
        setAllLateralHops(data.lateralMovement || []);
        setDefenseStrategies(data.defenseStrategy || []);
        
        // Start the real-time simulation step-by-step playback
        startSimulationSequence(
          data.redAgentActions || [],
          data.blueAgentResponses || [],
          data.lateralMovement || []
        );
      }
    } catch (err) {
      console.error('Failed to run simulation payload fetch:', err);
      setSimulating(false);
    }
  };

  const startSimulationSequence = (red: RedAction[], blue: BlueResponse[], hops: LateralHop[]) => {
    setSimulating(true);
    setSimCompleted(false);
    setBattleStep(0);
    setVisibleRedActions([]);
    setVisibleBlueResponses([]);
    setVisibleLateralHops([]);

    let step = 0;
    const interval = setInterval(() => {
      step += 1;
      setBattleStep(step);

      if (step === 1) {
        // Red Action 1
        if (red.length > 0) setVisibleRedActions([red[0]]);
      } else if (step === 2) {
        // Blue Response 1
        if (blue.length > 0) setVisibleBlueResponses([blue[0]]);
      } else if (step === 3) {
        // Red Action 2
        if (red.length > 1) setVisibleRedActions(prev => [...prev, red[1]]);
      } else if (step === 4) {
        // Blue Response 2
        if (blue.length > 1) setVisibleBlueResponses(prev => [...prev, blue[1]]);
      } else if (step === 5) {
        // Red Action 3 & Lateral Hop 1
        if (red.length > 2) setVisibleRedActions(prev => [...prev, red[2]]);
        if (hops.length > 0) setVisibleLateralHops([hops[0]]);
      } else if (step === 6) {
        // Blue Response 3 & Lateral Hop 2
        if (blue.length > 2) setVisibleBlueResponses(prev => [...prev, blue[2]]);
        if (hops.length > 1) setVisibleLateralHops(prev => [...prev, hops[1]]);
      } else if (step === 7) {
        // Red Action 4
        if (red.length > 3) setVisibleRedActions(prev => [...prev, red[3]]);
      } else if (step === 8) {
        // Blue Response 4 & Lateral Hop 3 (Blocked)
        if (blue.length > 3) setVisibleBlueResponses(prev => [...prev, blue[3]]);
        if (hops.length > 2) setVisibleLateralHops(prev => [...prev, hops[2]]);
        
        // End simulation
        clearInterval(interval);
        setSimulating(false);
        setSimCompleted(true);
      }
    }, 1200);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyber-red to-cyber-purple bg-clip-text text-transparent mb-2 flex items-center gap-3">
            <Shield className="w-8 h-8 text-cyber-red animate-pulse" />
            Cyber War Room
          </h1>
          <p className="text-gray-400">Adversarial ML Red Agent vs Blue Agent live simulation suite</p>
        </div>

        <button
          onClick={triggerSimulationFetch}
          disabled={simulating}
          className={`px-5 py-2.5 rounded-lg border font-mono text-sm flex items-center gap-2 transition-all ${
            simulating
              ? 'bg-cyber-red/10 border-cyber-red/30 text-cyber-red cursor-not-allowed animate-pulse'
              : 'bg-cyber-red/20 border-cyber-red/50 text-cyber-red hover:bg-cyber-red/30 hover:shadow-lg hover:shadow-cyber-red/20'
          }`}
        >
          {simulating ? (
            <>
              <Terminal className="w-4 h-4 animate-spin" />
              Simulating Attack...
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              Deploy AI Agents
            </>
          )}
        </button>
      </div>

      {/* Live Simulation Status */}
      <motion.div className="rounded-xl border border-cyber-red/20 bg-cyber-panel/40 p-6 backdrop-blur-md">
        <div className="flex items-center justify-between mb-6 border-b border-gray-800 pb-4">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyber-red" />
            Live Battle Simulation
          </h2>
          <div className="flex items-center gap-2 font-mono">
            {simulating && (
              <>
                <div className="w-3 h-3 rounded-full bg-cyber-red animate-pulse" />
                <span className="text-cyber-red font-bold tracking-wider text-sm animate-pulse">INTRUSION DETECTED</span>
              </>
            )}
            {simCompleted && (
              <>
                <div className="w-3 h-3 rounded-full bg-cyber-green animate-pulse" />
                <span className="text-cyber-green font-bold tracking-wider text-sm">THREAT DEFENDED</span>
              </>
            )}
            {!simulating && !simCompleted && (
              <>
                <div className="w-3 h-3 rounded-full bg-gray-500" />
                <span className="text-gray-400 font-bold tracking-wider text-sm">SIMULATOR IDLE</span>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Red Agent Column */}
          <div className="border border-cyber-red/20 bg-cyber-panel/30 rounded-xl p-5 flex flex-col space-y-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-cyber-red" />
            <h3 className="text-lg font-semibold text-cyber-red flex items-center gap-2 font-mono uppercase tracking-wider">
              <Zap className="w-5 h-5 text-cyber-red animate-pulse" />
              Red Agent (Attacker Mode)
            </h3>
            
            <div className="space-y-3 min-h-[300px]">
              <AnimatePresence>
                {visibleRedActions.map((action, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-3 bg-cyber-red/5 rounded-lg border border-cyber-red/10 flex flex-col relative"
                  >
                    <div className="flex items-center justify-between mb-1 font-mono">
                      <span className="text-sm font-semibold text-white">{action.action}</span>
                      <span className="text-xs text-cyber-red">{action.time}</span>
                    </div>
                    <span className="text-xs text-gray-400 font-mono">Target: {action.target}</span>
                    <div className="mt-2 flex">
                      <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-widest font-mono ${
                        action.status.toLowerCase() === 'complete' ? 'bg-cyber-green/10 text-cyber-green border border-cyber-green/20' :
                        action.status.toLowerCase() === 'active' ? 'bg-cyber-red/20 text-cyber-red border border-cyber-red/35 animate-pulse' :
                        'bg-gray-700/20 text-gray-400 border border-gray-600/30'
                      }`}>
                        {action.status}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {!simulating && !simCompleted && (
                <div className="h-full flex items-center justify-center text-center text-gray-500 font-mono text-xs py-20">
                  Ready to deploy AI Red Agent threat loops.
                </div>
              )}
            </div>
          </div>

          {/* Blue Agent Column */}
          <div className="border border-cyber-green/20 bg-cyber-panel/30 rounded-xl p-5 flex flex-col space-y-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-cyber-green" />
            <h3 className="text-lg font-semibold text-cyber-green flex items-center gap-2 font-mono uppercase tracking-wider">
              <Shield className="w-5 h-5 text-cyber-green animate-pulse" />
              Blue Agent (Defender Mode)
            </h3>

            <div className="space-y-3 min-h-[300px]">
              <AnimatePresence>
                {visibleBlueResponses.map((action, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-3 bg-cyber-green/5 rounded-lg border border-cyber-green/10 flex flex-col"
                  >
                    <div className="flex items-center justify-between mb-1 font-mono">
                      <span className="text-sm font-semibold text-white">{action.action}</span>
                      <span className="text-xs text-cyber-green">{action.time}</span>
                    </div>
                    <div className="mt-2 flex">
                      <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-widest font-mono ${
                        action.severity.toLowerCase() === 'critical' ? 'bg-cyber-red/10 text-cyber-red border border-cyber-red/20' :
                        'bg-cyber-amber/10 text-cyber-amber border border-cyber-amber/20'
                      }`}>
                        {action.severity}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {!simulating && !simCompleted && (
                <div className="h-full flex items-center justify-center text-center text-gray-500 font-mono text-xs py-20">
                  Ready to deploy AI Blue Agent defensive nets.
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Lateral Movement Connector Path */}
      {(simulating || simCompleted) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-cyber-red/20 bg-cyber-panel/40 p-6 backdrop-blur-md"
        >
          <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2 font-mono uppercase tracking-wider">
            <AlertTriangle className="w-5 h-5 text-cyber-amber" />
            AI Lateral Intrusive Trace
          </h2>

          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 py-4">
            {allLateralHops.map((hop, i) => {
              const isVisible = visibleLateralHops.length > i;
              const details = visibleLateralHops[i];
              return (
                <div key={i} className="flex flex-col md:flex-row items-center gap-4 md:gap-8 w-full md:w-auto">
                  {/* Node representation */}
                  <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: isVisible ? 1 : 0.8, opacity: isVisible ? 1 : 0.4 }}
                    className={`p-4 rounded-xl border flex items-center gap-3 w-full md:w-56 font-mono ${
                      isVisible 
                        ? details.status.toLowerCase() === 'blocked' 
                          ? 'border-cyber-green bg-cyber-green/10 text-cyber-green' 
                          : 'border-cyber-red bg-cyber-red/10 text-cyber-red'
                        : 'border-gray-800 bg-cyber-panel/10 text-gray-500'
                    }`}
                  >
                    {isVisible && details.status.toLowerCase() === 'blocked' ? (
                      <Lock className="w-5 h-5 text-cyber-green" />
                    ) : (
                      <Server className="w-5 h-5" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs uppercase font-bold tracking-wider truncate">{hop.hop}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5 truncate">{isVisible ? details.stage : 'Awaiting Recon'}</p>
                    </div>
                    {isVisible && (
                      <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-bold tracking-widest ${
                        details.status.toLowerCase() === 'blocked' ? 'bg-cyber-green/20' : 'bg-cyber-red/20'
                      }`}>
                        {details.status}
                      </span>
                    )}
                  </motion.div>

                  {/* Connector Arrow */}
                  {i < allLateralHops.length - 1 && (
                    <ArrowRight className={`w-5 h-5 hidden md:block ${
                      visibleLateralHops.length > i + 1 ? 'text-cyber-red animate-pulse' : 'text-gray-700'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Defense Strategy recommendations */}
      {simCompleted && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-cyber-green/25 bg-cyber-panel/40 p-6 backdrop-blur-md relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-[3px] bg-cyber-green" />
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2 font-mono uppercase tracking-wider">
            <ShieldCheck className="w-5 h-5 text-cyber-green" />
            AI-Engine Defensive Playbook
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {defenseStrategies.map((strat, i) => (
              <div key={i} className="p-4 bg-cyber-green/5 rounded-lg border border-cyber-green/10 relative">
                <div className="absolute top-3 left-3 w-1.5 h-1.5 rounded-full bg-cyber-green" />
                <p className="text-xs text-cyber-green uppercase tracking-wider font-mono font-bold mb-2.5 pl-4">
                  {strat.title}
                </p>
                <p className="text-white text-sm pl-4 font-mono leading-relaxed">
                  {strat.play}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
