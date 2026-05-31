'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const problemMetrics = [
  { label: 'Zombie APIs', value: '30%+' },
  { label: 'Shadow APIs', value: '50%+' },
  { label: 'Orphan Services', value: '40%+' },
  { label: 'Hidden Dependencies', value: '60%+' },
];

export function ProblemSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
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
          {/* Problem Title */}
          <motion.div variants={itemVariants} className="text-center space-y-4 max-w-2xl mx-auto">
            <h2 className="heading-medium text-white">
              Modern Enterprises Are Losing Visibility Into Their Infrastructure.
            </h2>
            <p className="text-neutral-400">
              Most security incidents originate from forgotten infrastructure rather than visible threats.
            </p>
          </motion.div>

          {/* Metrics Grid */}
          <motion.div
            variants={containerVariants}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {problemMetrics.map((metric) => (
              <motion.div
                key={metric.label}
                variants={itemVariants}
                className="group p-6 rounded-xl glass hover:bg-white/[0.08] transition-all border border-white/[0.05] hover:border-purple-600/50"
              >
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent mb-2">
                  {metric.value}
                </div>
                <p className="text-sm text-neutral-400 group-hover:text-neutral-300 transition-colors">
                  {metric.label}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

export function SolutionSection() {
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

  const steps = [
    'Discovery',
    'Digital Twin',
    'Cognitive Intelligence',
    'Prediction',
    'Simulation',
    'Defense',
  ];

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
          {/* Solution Header */}
          <motion.div variants={itemVariants} className="text-center space-y-4 max-w-2xl mx-auto">
            <h2 className="heading-medium text-white">Meet Aurenity X</h2>
            <p className="text-neutral-400">
              An autonomous cognitive security platform that discovers, maps, predicts, explains and
              simulates infrastructure risks before they become business threats.
            </p>
          </motion.div>

          {/* Visual Workflow */}
          <motion.div variants={itemVariants}>
            <div className="flex flex-wrap justify-center items-center gap-2 md:gap-4">
              {steps.map((step, index) => (
                <div key={step} className="flex items-center gap-2 md:gap-4">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="px-4 py-2 rounded-full glass hover:bg-white/[0.08] transition-all text-sm font-medium text-purple-300 hover:text-purple-200"
                  >
                    {step}
                  </motion.div>
                  {index < steps.length - 1 && (
                    <ArrowRight className="w-4 h-4 text-neutral-600 hidden md:block" />
                  )}
                  {index < steps.length - 1 && index % 2 === 1 && (
                    <div className="w-full basis-full md:hidden" />
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
