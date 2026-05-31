'use client';

import { motion } from 'framer-motion';
import { Cpu, Brain, BarChart3, Zap, Clock, Sword, GitBranch, Shield } from 'lucide-react';

const features = [
  {
    icon: Cpu,
    title: 'API Discovery Engine',
    description: 'Discover zombie, shadow and undocumented APIs across your enterprise infrastructure.',
  },
  {
    icon: GitBranch,
    title: 'Digital Twin Infrastructure',
    description: 'Generate a living virtual model of infrastructure relationships and dependencies.',
  },
  {
    icon: Brain,
    title: 'API Memory Genome™',
    description: 'Understand ownership entropy and infrastructure memory decay patterns.',
  },
  {
    icon: Zap,
    title: 'Cognitive Intelligence Engine',
    description: 'AI-powered risk explanation and root cause analysis for all threats.',
  },
  {
    icon: BarChart3,
    title: 'Prediction Lab',
    description: 'Forecast future infrastructure risks and emerging zombie APIs.',
  },
  {
    icon: Clock,
    title: 'Time Machine',
    description: 'Visualize infrastructure evolution and predict future attack probability.',
  },
  {
    icon: Sword,
    title: 'Cyber War Room',
    description: 'AI attacker vs AI defender simulations for red team exercises.',
  },
  {
    icon: Shield,
    title: 'Autonomous Defense',
    description: 'Generate recovery plans and automated remediation strategies.',
  },
];

export function FeaturesSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
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
            <h2 className="heading-medium text-white">Premium Features</h2>
            <p className="text-neutral-400">
              Enterprise-grade capabilities designed for sophisticated infrastructure security.
            </p>
          </motion.div>

          {/* Features Grid */}
          <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{ y: -5, borderColor: 'rgba(168, 85, 247, 0.5)' }}
                  className="group p-6 rounded-xl glass hover:bg-white/[0.08] transition-all border border-white/[0.05] hover:border-purple-600/50"
                >
                  <div className="mb-4 w-12 h-12 rounded-lg bg-gradient-to-br from-purple-600/20 to-purple-400/20 flex items-center justify-center group-hover:from-purple-600/30 group-hover:to-purple-400/30 transition-all">
                    <Icon className="w-6 h-6 text-purple-400 group-hover:text-purple-300 transition-colors" />
                  </div>
                  <h3 className="text-base font-semibold text-white mb-2 group-hover:text-purple-300 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-neutral-400 group-hover:text-neutral-300 transition-colors leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
