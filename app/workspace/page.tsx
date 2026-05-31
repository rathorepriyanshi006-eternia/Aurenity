'use client';

import { motion } from 'framer-motion';
import { Plus, Users, Activity, Server } from 'lucide-react';

interface Workspace {
  id: string;
  name: string;
  environment: string;
  members: number;
  activeScans: number;
  status: 'active' | 'inactive';
}

const workspaces: Workspace[] = [
  {
    id: 'prod-1',
    name: 'Production Infrastructure',
    environment: 'Production',
    members: 12,
    activeScans: 3,
    status: 'active',
  },
  {
    id: 'staging-1',
    name: 'Staging Environment',
    environment: 'Staging',
    members: 8,
    activeScans: 1,
    status: 'active',
  },
  {
    id: 'dev-1',
    name: 'Development Cluster',
    environment: 'Development',
    members: 6,
    activeScans: 0,
    status: 'active',
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function WorkspacePage() {
  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Workspace Management</h1>
          <p className="text-gray-400">Manage your infrastructure environments and team access</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium hover:shadow-lg hover:shadow-blue-500/50 transition-all"
        >
          <Plus className="w-5 h-5" />
          New Workspace
        </motion.button>
      </motion.div>

      {/* Workspace Grid */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {workspaces.map((workspace) => (
          <motion.div
            key={workspace.id}
            variants={item}
            whileHover={{ y: -4 }}
            className="group relative rounded-lg overflow-hidden border border-blue-500/20 hover:border-blue-500/50 transition-all"
            style={{ backgroundColor: '#111827' }}
          >
            {/* Background glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <div className="relative p-6 space-y-4 z-10">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">{workspace.name}</h3>
                  <p className="text-sm text-gray-400">{workspace.environment}</p>
                </div>
                <div
                  className={`w-3 h-3 rounded-full ${
                    workspace.status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-gray-500'
                  }`}
                />
              </div>

              {/* Metrics */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Users className="w-4 h-4 text-blue-400" />
                  <span className="text-gray-300">{workspace.members} team members</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Activity className="w-4 h-4 text-amber-400" />
                  <span className="text-gray-300">{workspace.activeScans} active scans</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Server className="w-4 h-4 text-cyan-400" />
                  <span className="text-gray-300">Production-ready</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 px-3 py-2 rounded text-sm font-medium bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 transition-colors"
                >
                  Access
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 px-3 py-2 rounded text-sm font-medium bg-gray-700/30 text-gray-300 hover:bg-gray-700/50 transition-colors"
                >
                  Settings
                </motion.button>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Add Workspace Card */}
      <motion.div
        variants={item}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -4 }}
        className="group relative rounded-lg overflow-hidden border-2 border-dashed border-blue-500/30 hover:border-blue-500/60 transition-all cursor-pointer"
        style={{ backgroundColor: 'rgba(17, 24, 39, 0.5)' }}
      >
        <div className="p-12 flex flex-col items-center justify-center space-y-4 text-center min-h-80">
          <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center group-hover:from-blue-500/30 group-hover:to-purple-500/30 transition-colors">
            <Plus className="w-8 h-8 text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white mb-1">Create New Workspace</h3>
            <p className="text-sm text-gray-400">Add a new infrastructure environment</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
