'use client';

import { motion } from 'framer-motion';
import { BarChart3, Home, Radar, Brain, TrendingUp, Clock, Swords, FileText, GitBranch } from 'lucide-react';

export function PlatformShowcase() {
  const sidebarItems = [
    { icon: Home, label: 'Home' },
    { icon: Radar, label: 'Discovery' },
    { icon: GitBranch, label: 'Digital Twin' },
    { icon: Brain, label: 'Intelligence' },
    { icon: TrendingUp, label: 'Prediction' },
    { icon: Clock, label: 'Time Machine' },
    { icon: Swords, label: 'War Room' },
    { icon: FileText, label: 'Reports' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  return (
    <section className="relative py-20 overflow-hidden border-t border-white/[0.1]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="space-y-12"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="text-center space-y-4 max-w-2xl mx-auto">
            <h2 className="heading-medium text-white">Platform Overview</h2>
            <p className="text-neutral-400">
              Comprehensive dashboard for infrastructure intelligence and security management.
            </p>
          </motion.div>

          {/* Dashboard Preview */}
          <motion.div variants={itemVariants}>
            <div className="relative rounded-2xl overflow-hidden glass border border-white/[0.1] p-1">
              <div className="relative rounded-xl overflow-hidden bg-black/40 backdrop-blur-sm">
                <div className="flex h-96 md:h-[500px]">
                  {/* Sidebar */}
                  <div className="w-48 hidden md:flex flex-col border-r border-white/[0.05] p-4 gap-1 bg-black/20">
                    <div className="text-xs font-semibold text-neutral-500 px-2 py-1 uppercase tracking-wider">
                      Navigation
                    </div>
                    {sidebarItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <motion.div
                          key={item.label}
                          whileHover={{ x: 4, backgroundColor: 'rgba(168, 85, 247, 0.1)' }}
                          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-neutral-400 hover:text-white transition-all cursor-pointer"
                        >
                          <Icon className="w-4 h-4" />
                          <span>{item.label}</span>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Main Content */}
                  <div className="flex-1 p-6 md:p-8 overflow-auto">
                    <div className="space-y-6">
                      {/* Header */}
                      <div className="flex justify-between items-center pb-4 border-b border-white/[0.05]">
                        <div>
                          <h3 className="text-lg font-semibold text-white">Infrastructure Intelligence</h3>
                          <p className="text-sm text-neutral-500 mt-1">Real-time threat analysis and predictions</p>
                        </div>
                        <div className="flex gap-2">
                          <div className="px-3 py-1 rounded text-xs bg-purple-600/20 text-purple-300 border border-purple-600/30">
                            Live
                          </div>
                        </div>
                      </div>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[
                          { label: 'Threats Detected', value: '847' },
                          { label: 'APIs Monitored', value: '3,204' },
                          { label: 'Risk Score', value: '8.7/10' },
                          { label: 'Uptime', value: '99.98%' },
                        ].map((stat) => (
                          <motion.div
                            key={stat.label}
                            whileHover={{ scale: 1.05 }}
                            className="p-3 rounded-lg bg-white/[0.03] border border-white/[0.05] hover:border-purple-600/30 transition-all"
                          >
                            <div className="text-2xl font-bold text-purple-400">{stat.value}</div>
                            <p className="text-xs text-neutral-500 mt-1">{stat.label}</p>
                          </motion.div>
                        ))}
                      </div>

                      {/* Chart Area */}
                      <div className="h-32 rounded-lg bg-gradient-to-br from-purple-600/10 to-purple-400/10 border border-white/[0.05] flex items-end justify-around p-4">
                        {[0.3, 0.6, 0.8, 0.5, 0.9, 0.4, 0.7].map((height, i) => (
                          <motion.div
                            key={i}
                            initial={{ height: 0 }}
                            whileInView={{ height: `${height * 100}%` }}
                            transition={{ duration: 0.8, delay: i * 0.1 }}
                            className="flex-1 bg-gradient-to-t from-purple-600 to-purple-400 rounded-t-md mx-1"
                          />
                        ))}
                      </div>

                      {/* Recent Activity */}
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold text-white">Recent Activity</h4>
                        {[
                          'API Gateway: Anomalous traffic detected',
                          'Auth Service: Deprecated endpoint still in use',
                          'Database: Unusual query patterns',
                        ].map((activity, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="flex items-start gap-3 p-2 rounded bg-white/[0.02] border-l-2 border-purple-600/50"
                          >
                            <div className="w-2 h-2 rounded-full bg-purple-400 mt-1.5 flex-shrink-0" />
                            <p className="text-xs text-neutral-300">{activity}</p>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Glow effect */}
              <div className="absolute -inset-px bg-gradient-to-r from-purple-600/20 to-purple-400/20 rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity blur-xl" />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
