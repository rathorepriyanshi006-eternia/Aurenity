'use client';

import { motion } from 'framer-motion';
import { Upload, Zap, Brain, TrendingUp, Cpu, Shield } from 'lucide-react';

const steps = [
  {
    number: '1',
    title: 'Upload API Specifications',
    description: 'Import your OpenAPI, GraphQL, and API specifications',
    icon: Upload,
  },
  {
    number: '2',
    title: 'Discover Infrastructure',
    description: 'Automatically scan and identify all APIs and services',
    icon: Zap,
  },
  {
    number: '3',
    title: 'Build Digital Twin',
    description: 'Create a comprehensive model of your infrastructure',
    icon: Brain,
  },
  {
    number: '4',
    title: 'Run AI Analysis',
    description: 'Apply cognitive intelligence to identify threats',
    icon: Cpu,
  },
  {
    number: '5',
    title: 'Predict Future Risks',
    description: 'Forecast emerging vulnerabilities and zombies',
    icon: TrendingUp,
  },
  {
    number: '6',
    title: 'Generate Defense',
    description: 'Get actionable remediation recommendations',
    icon: Shield,
  },
];

export function HowItWorksSection() {
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
            <h2 className="heading-medium text-white">How It Works</h2>
            <p className="text-neutral-400">
              Six simple steps to autonomous cognitive security for your infrastructure.
            </p>
          </motion.div>

          {/* Steps Grid */}
          <motion.div
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="relative group"
                >
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600/20 to-purple-400/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-300" />
                  <div className="relative p-6 rounded-xl glass hover:bg-white/[0.08] transition-all border border-white/[0.05] group-hover:border-purple-600/30">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-600/30 to-purple-400/30 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-6 h-6 text-purple-400" />
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="text-xs font-semibold text-purple-400">Step {step.number}</div>
                        <h3 className="text-base font-semibold text-white group-hover:text-purple-300 transition-colors">
                          {step.title}
                        </h3>
                        <p className="text-sm text-neutral-400 group-hover:text-neutral-300 transition-colors">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

export function ArchitectureSection() {
  const layers = [
    { title: 'Data Sources', color: 'from-blue-600/30 to-blue-400/30' },
    { title: 'Discovery Layer', color: 'from-cyan-600/30 to-cyan-400/30' },
    { title: 'Graph Intelligence', color: 'from-purple-600/30 to-purple-400/30' },
    { title: 'AI Reasoning Layer', color: 'from-indigo-600/30 to-indigo-400/30' },
    { title: 'Prediction Layer', color: 'from-violet-600/30 to-violet-400/30' },
    { title: 'Simulation Layer', color: 'from-fuchsia-600/30 to-fuchsia-400/30' },
    { title: 'Defense Layer', color: 'from-rose-600/30 to-rose-400/30' },
  ];

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
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
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
            <h2 className="heading-medium text-white">System Architecture</h2>
            <p className="text-neutral-400">
              Multi-layered cognitive intelligence platform built for enterprise scale.
            </p>
          </motion.div>

          {/* Architecture Stack */}
          <motion.div variants={containerVariants} className="flex flex-col gap-3 max-w-2xl mx-auto">
            {layers.map((layer, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ x: 4 }}
                className={`p-4 rounded-lg bg-gradient-to-r ${layer.color} border border-white/[0.05] hover:border-white/[0.1] transition-all cursor-pointer`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                    {index + 1}
                  </div>
                  <span className="text-sm font-semibold text-white">{layer.title}</span>
                  {index < layers.length - 1 && (
                    <div className="flex-1 flex justify-end text-neutral-600">↓</div>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
