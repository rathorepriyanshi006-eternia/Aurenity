'use client';

import { useRouter } from 'next/navigation';
import { useNavigationStore } from '@/lib/store';
import { motion } from 'framer-motion';
import {
  Menu,
  Home,
  Search,
  Network,
  GitBranch,
  Zap,
  TrendingUp,
  Clock,
  Crosshair,
  Shield,
  Cpu,
  BarChart3,
  FileText,
  Settings,
  ChevronRight,
  Briefcase,
  Brain,
} from 'lucide-react';

const modules = [
  { id: 'dashboard', label: 'Home', icon: Home },
  { id: 'discovery', label: 'Discovery', icon: Search },
  { id: 'digital-twin', label: 'Digital Twin', icon: Network },
  { id: 'intelligence', label: 'Cognitive Intelligence', icon: Brain },
  { id: 'prediction', label: 'Prediction Lab', icon: TrendingUp },
  { id: 'time-machine', label: 'Time Machine', icon: Clock },
  { id: 'war-room', label: 'Cyber Simulation', icon: Shield },
  { id: 'reports', label: 'Reports', icon: FileText },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const router = useRouter();
  const { currentModule, setCurrentModule, sidebarOpen, toggleSidebar } =
    useNavigationStore();

  return (
    <motion.aside
      initial={false}
      animate={{
        width: sidebarOpen ? 280 : 80,
      }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="fixed left-0 top-0 h-screen flex flex-col overflow-hidden z-40"
      style={{
        backgroundColor: '#101624',
        borderRight: '1px solid rgba(59, 130, 246, 0.2)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between p-4"
        style={{ borderBottom: '1px solid rgba(59, 130, 246, 0.2)' }}
      >
        <motion.div
          animate={{ opacity: sidebarOpen ? 1 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex items-center gap-2"
        >
          <div className="w-8 h-8 rounded bg-gradient-to-br from-cyber-blue to-cyber-purple flex items-center justify-center">
            <span className="text-xs font-bold text-white">AX</span>
          </div>
          {sidebarOpen && (
            <span className="text-sm font-bold bg-gradient-to-r from-cyber-blue to-cyber-cyan bg-clip-text text-transparent">
              Aurenity X
            </span>
          )}
        </motion.div>
        <button
          onClick={toggleSidebar}
          className="p-1.5 hover:bg-cyber-blue/10 rounded transition-colors"
          aria-label="Toggle sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {modules.map((module) => {
          const Icon = module.icon;
          const isActive = currentModule === module.id;

          return (
            <motion.button
              key={module.id}
              whileHover={{ x: 4 }}
              onClick={() => {
                setCurrentModule(module.id as any);
                router.push(`/${module.id}`);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group relative overflow-hidden ${
                isActive
                  ? 'bg-gradient-to-r from-cyber-blue/30 to-cyber-purple/20 border border-cyber-blue/50'
                  : 'hover:bg-cyber-blue/10'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-cyber-blue to-cyber-cyan"
                  transition={{ type: 'spring', stiffness: 200, damping: 30 }}
                />
              )}

              <Icon
                className={`w-5 h-5 flex-shrink-0 ${
                  isActive
                    ? 'text-cyber-blue'
                    : 'text-cyber-blue/50 group-hover:text-cyber-blue/80'
                }`}
              />

              {sidebarOpen && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`text-sm font-medium flex-1 text-left ${
                    isActive ? 'text-cyber-blue' : 'text-gray-300'
                  }`}
                >
                  {module.label}
                </motion.span>
              )}

              {isActive && sidebarOpen && (
                <ChevronRight className="w-4 h-4 text-cyber-blue/60" />
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* Footer */}
      {sidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="p-4 space-y-2"
          style={{ borderTop: '1px solid rgba(59, 130, 246, 0.2)' }}
        >
          <p className="text-xs text-gray-400">System Status</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-cyber-green animate-pulse-glow" />
            <span className="text-xs text-gray-300">All Systems Operational</span>
          </div>
        </motion.div>
      )}
    </motion.aside>
  );
}
