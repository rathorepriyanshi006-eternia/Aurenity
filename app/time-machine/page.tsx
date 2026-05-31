'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, RotateCcw, AlertTriangle, Play, Pause, SkipBack, SkipForward, ChevronRight, RefreshCw, BarChart2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface HistoryPoint {
  date: string;
  healthScore: number;
}

interface FuturePoint {
  timeframe: string;
  riskScore: number;
}

interface AttackScenario {
  scenario: string;
  probability: string;
  impact: string;
}

interface Snapshot {
  period: string;
  health: string;
  trend: string;
}

export default function TimeMachinePage() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [timelinePosition, setTimelinePosition] = useState(50);
  
  const [historyData, setHistoryData] = useState<HistoryPoint[]>([]);
  const [futureData, setFutureData] = useState<FuturePoint[]>([]);
  const [attackScenarios, setAttackScenarios] = useState<AttackScenario[]>([]);
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [loading, setLoading] = useState(true);

  const [currentStats, setCurrentStats] = useState({
    health: 90,
    activeCount: 24,
    risk: 10
  });

  const playbackInterval = useRef<NodeJS.Timeout | null>(null);

  const fetchTelemetry = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://127.0.0.1:8000/api/v1/time-machine/telemetry');
      if (res.ok) {
        const data = await res.json();
        setHistoryData(data.historyData || []);
        setFutureData(data.futureData || []);
        setAttackScenarios(data.scenarios || []);
        setSnapshots(data.snapshots || []);
      }
    } catch (err) {
      console.error('Failed to fetch time-machine telemetry:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStateAtPosition = async (pos: number) => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/v1/time-machine/state?position=${pos}`);
      if (res.ok) {
        const data = await res.json();
        setCurrentStats(data);
      }
    } catch (err) {
      console.error('Failed to fetch state for position:', pos, err);
    }
  };

  useEffect(() => {
    fetchTelemetry();
  }, []);

  // Fetch state whenever slider position changes
  useEffect(() => {
    fetchStateAtPosition(timelinePosition);
  }, [timelinePosition]);

  // Handle timeline simulation playback
  useEffect(() => {
    if (isPlaying) {
      playbackInterval.current = setInterval(() => {
        setTimelinePosition((prev) => {
          if (prev >= 100) {
            return 0; // Wrap around to historical start
          }
          return prev + 2; // Step position forward
        });
      }, 250);
    } else {
      if (playbackInterval.current) {
        clearInterval(playbackInterval.current);
      }
    }

    return () => {
      if (playbackInterval.current) {
        clearInterval(playbackInterval.current);
      }
    };
  }, [isPlaying]);

  const getTimelineLabel = (pos: number) => {
    if (pos === 50) return 'Today';
    if (pos < 50) {
      const monthsAgo = Math.round((50 - pos) / 8.3);
      return monthsAgo === 0 ? 'Today' : `${monthsAgo} Month${monthsAgo > 1 ? 's' : ''} Ago`;
    } else {
      const weeksAhead = Math.round((pos - 50) / 6.25);
      return weeksAhead === 0 ? 'Today' : `+${weeksAhead} Week${weeksAhead > 1 ? 's' : ''}`;
    }
  };

  if (loading) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-cyber-cyan border-t-transparent animate-spin" />
        <p className="text-gray-400 animate-pulse font-mono font-medium">Reconstructing Historical Replays...</p>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyber-cyan to-cyber-blue bg-clip-text text-transparent mb-2 flex items-center gap-3">
            <Clock className="w-8 h-8 text-cyber-cyan" />
            Time Machine
          </h1>
          <p className="text-gray-400">Replay historical evolution, visualize future risks, and analyze attack cascades</p>
        </div>
        <button
          onClick={fetchTelemetry}
          className="px-4 py-2 rounded-lg bg-cyber-cyan/10 text-cyber-cyan border border-cyber-cyan/30 hover:bg-cyber-cyan/20 transition-all font-mono text-sm flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh Registry
        </button>
      </div>

      {/* Timeline Controls */}
      <motion.div className="rounded-xl border border-cyber-cyan/25 bg-cyber-panel/40 p-6 backdrop-blur-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-white">Timeline Navigation</h3>
          <span className="text-sm font-bold text-cyber-cyan font-mono bg-cyber-cyan/10 px-3 py-1 rounded border border-cyber-cyan/30">
            Current State: {getTimelineLabel(timelinePosition)} ({timelinePosition}%)
          </span>
        </div>
        <div className="space-y-6">
          {/* Timeline Scrubber */}
          <div>
            <input
              type="range"
              min="0"
              max="100"
              value={timelinePosition}
              onChange={(e) => {
                setIsPlaying(false); // Pause on manual scrub
                setTimelinePosition(Number(e.target.value));
              }}
              className="w-full h-2.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-cyber-cyan"
            />
            <div className="flex justify-between text-xs text-gray-500 font-mono mt-2.5">
              <span>6 Months Ago (Historical)</span>
              <span className="text-cyber-cyan font-bold">Today</span>
              <span>+2 Months (Forecast)</span>
            </div>
          </div>

          {/* Playback Controls */}
          <div className="flex gap-4 items-center justify-center pt-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setIsPlaying(false);
                setTimelinePosition(0);
              }}
              className="p-2.5 rounded-lg bg-cyber-cyan/10 border border-cyber-cyan/30 text-cyber-cyan hover:bg-cyber-cyan/20 transition-colors"
              title="Reset to 6 Months Ago"
            >
              <SkipBack className="w-5 h-5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-3.5 rounded-lg bg-gradient-to-r from-cyber-cyan to-cyber-blue text-white hover:shadow-lg hover:shadow-cyber-cyan/30 transition-all"
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setIsPlaying(false);
                setTimelinePosition(100);
              }}
              className="p-2.5 rounded-lg bg-cyber-cyan/10 border border-cyber-cyan/30 text-cyber-cyan hover:bg-cyber-cyan/20 transition-colors"
              title="Skip to +2 Months"
            >
              <SkipForward className="w-5 h-5" />
            </motion.button>
          </div>

          {/* Current State Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-800/80">
            <div className="text-center p-4 bg-cyber-panel/40 rounded-xl border border-cyber-cyan/15 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-[3px] bg-cyber-cyan" />
              <p className="text-xs text-gray-400 uppercase font-mono mb-1">Simulated Health Index</p>
              <p className="text-3xl font-extrabold text-cyber-cyan font-mono">{currentStats.health}%</p>
            </div>
            <div className="text-center p-4 bg-cyber-panel/40 rounded-xl border border-cyber-cyan/15 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-[3px] bg-cyber-cyan" />
              <p className="text-xs text-gray-400 uppercase font-mono mb-1">Endpoints Discovered</p>
              <p className="text-3xl font-extrabold text-cyber-cyan font-mono">{currentStats.activeCount}</p>
            </div>
            <div className="text-center p-4 bg-cyber-panel/40 rounded-xl border border-cyber-cyan/15 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-[3px] bg-cyber-amber" />
              <p className="text-xs text-gray-400 uppercase font-mono mb-1">System Exposure Index</p>
              <p className="text-3xl font-extrabold text-cyber-amber font-mono">{currentStats.risk}%</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main split details charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Historical Replay */}
        <motion.div className="rounded-xl border border-cyber-cyan/20 bg-cyber-panel/40 p-6 backdrop-blur-md flex flex-col justify-between">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-cyber-cyan" />
              Historical Evolution Trend
            </h2>
            <p className="text-xs text-gray-400 mt-1">Ingestion records mapped going back 6 months</p>
          </div>
          <ResponsiveContainer width="100%" height={230}>
            <LineChart data={historyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" stroke="#64748b" fontFamily="monospace" />
              <YAxis stroke="#64748b" domain={[40, 100]} fontFamily="monospace" />
              <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #06b6d4' }} />
              <Line type="monotone" name="Ecosystem Health" dataKey="healthScore" stroke="#06b6d4" strokeWidth={2.5} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Future State Visualization */}
        <motion.div className="rounded-xl border border-cyber-cyan/20 bg-cyber-panel/40 p-6 backdrop-blur-md flex flex-col justify-between">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-cyber-amber animate-pulse" />
              Predictive Threat Progression
            </h2>
            <p className="text-xs text-gray-400 mt-1">Autonomous regression forecast next 2 months</p>
          </div>
          <ResponsiveContainer width="100%" height={230}>
            <LineChart data={futureData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="timeframe" stroke="#64748b" fontFamily="monospace" />
              <YAxis stroke="#64748b" domain={[0, 100]} fontFamily="monospace" />
              <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #06b6d4' }} />
              <Line type="monotone" name="Decay Exposure" dataKey="riskScore" stroke="#f59e0b" strokeDasharray="5 5" strokeWidth={2.5} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Attack Probability Timeline */}
      <motion.div className="rounded-xl border border-cyber-red/20 bg-cyber-panel/40 p-6 backdrop-blur-md">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-cyber-red animate-bounce" />
          Dynamically Projected Attack Vectors
        </h2>
        <div className="space-y-3">
          {attackScenarios.map((scenario) => (
            <div key={scenario.scenario} className="p-4 bg-cyber-panel/50 rounded-lg border border-cyber-red/10 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:border-cyber-red/25 transition-all">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-cyber-red animate-pulse" />
                <span className="font-semibold text-white text-sm font-mono">{scenario.scenario}</span>
              </div>
              <div className="flex items-center gap-3 font-mono">
                <span className="text-xs text-gray-400">Probability Index:</span>
                <span className="text-md font-bold text-cyber-red">{scenario.probability}</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full border border-cyber-red/35 bg-cyber-red/15 text-cyber-red uppercase tracking-wider font-bold">
                  {scenario.impact}
                </span>
              </div>
            </div>
          ))}
          {attackScenarios.length === 0 && (
            <div className="p-4 text-center text-gray-500 font-mono text-sm">
              Continuous intelligence running. No high threat vulnerability paths discovered.
            </div>
          )}
        </div>
      </motion.div>

      {/* Evolution Simulator Cards */}
      <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {snapshots.map((snapshot) => (
          <motion.div
            key={snapshot.period}
            whileHover={{ scale: 1.02, border: '1px solid rgba(6, 182, 212, 0.4)' }}
            className="p-5 rounded-xl border border-cyber-cyan/15 bg-cyber-panel/40 backdrop-blur-md flex items-center justify-between"
          >
            <div>
              <p className="text-xs text-gray-400 font-mono uppercase tracking-wider mb-1">{snapshot.period}</p>
              <p className="text-3xl font-extrabold text-white font-mono">{snapshot.health}</p>
            </div>
            <span className={`text-xs font-mono px-2.5 py-1 rounded-full ${
              snapshot.trend.includes('Healthy') 
                ? 'bg-cyber-green/10 text-cyber-green border border-cyber-green/20' 
                : 'bg-cyber-amber/10 text-cyber-amber border border-cyber-amber/20'
            }`}>
              {snapshot.trend}
            </span>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}
