'use client';

import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { InfrastructureVisualization } from './infrastructure-visualization';
import { Play } from 'lucide-react';

export function HeroSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: 'easeOut' },
    },
  };

  return (
    <section className="relative min-h-screen pt-24 overflow-hidden">
      {/* Background visualization */}
      <div className="absolute inset-0">
        <InfrastructureVisualization />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
        >
          {/* Left Content */}
          <div className="space-y-8">
            {/* Badge */}
            <motion.div variants={itemVariants}>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
                <span className="text-xs font-medium text-purple-300">
                  Autonomous Cognitive Intelligence
                </span>
              </div>
            </motion.div>

            {/* Headline */}
            <motion.div variants={itemVariants}>
              <h1 className="heading-large text-white">
                The Future of API Security Thinks Before It Reacts.
              </h1>
            </motion.div>

            {/* Subheadline */}
            <motion.p variants={itemVariants} className="text-lg text-neutral-300 leading-relaxed max-w-lg">
              Aurenity X creates a living digital twin of enterprise infrastructure to discover zombie APIs,
              predict future risks, simulate attacks, and provide autonomous defense recommendations.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white border-0 shadow-lg shadow-purple-600/50 font-semibold"
              >
                Launch Platform
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-purple-600/50 text-white hover:bg-purple-600/10 gap-2"
              >
                <Play className="w-4 h-4" />
                Watch Demo
              </Button>
            </motion.div>

            {/* Trust indicators */}
            <motion.div variants={itemVariants} className="pt-4 space-y-3">
              <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                Trusted by Fortune 500 Companies
              </p>
              <div className="flex flex-wrap gap-4">
                {['JP Morgan', 'Goldman Sachs', 'Barclays', 'Morgan Stanley'].map((company) => (
                  <div
                    key={company}
                    className="text-sm text-neutral-500 font-medium"
                  >
                    {company}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right Visual - Enhanced for better UX */}
          <motion.div
            variants={itemVariants}
            className="hidden lg:flex items-center justify-center relative h-96"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-purple-400/10 rounded-2xl blur-3xl" />
            <div className="relative w-full h-full flex items-center justify-center">
              <div className="text-center space-y-4">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                  className="w-32 h-32 mx-auto border-2 border-purple-600/30 border-t-purple-400 rounded-full"
                />
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
                  className="w-24 h-24 mx-auto border-2 border-purple-500/30 border-t-purple-300 rounded-full"
                />
                <p className="text-sm text-neutral-400">Cognitive Intelligence Processing</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background via-transparent to-transparent pointer-events-none" />
    </section>
  );
}
