'use client';

import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

const trustIndicators = [
  'AI-Native Security',
  'Digital Twin Intelligence',
  'Infrastructure Memory Engine',
  'Predictive Threat Detection',
  'Autonomous Defense',
];

export function TrustSection() {
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
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.6 },
    },
  };

  return (
    <section className="relative py-16 overflow-hidden border-t border-white/[0.1]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="space-y-8"
        >
          {/* Header */}
          <div className="text-center space-y-2">
            <motion.h2 variants={itemVariants} className="heading-medium text-white">
              Enterprise-Grade Security
            </motion.h2>
            <motion.p variants={itemVariants} className="text-neutral-400">
              Built for Banking, Enterprise and Critical Infrastructure.
            </motion.p>
          </div>

          {/* Trust Indicators Grid */}
          <motion.div variants={containerVariants} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {trustIndicators.map((indicator) => (
              <motion.div
                key={indicator}
                variants={itemVariants}
                className="flex items-center gap-3 p-4 rounded-lg glass hover:bg-white/[0.08] transition-all group"
              >
                <CheckCircle2 className="w-5 h-5 text-purple-400 flex-shrink-0 group-hover:text-purple-300 transition-colors" />
                <span className="text-sm font-medium text-neutral-300 group-hover:text-white transition-colors">
                  {indicator}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
