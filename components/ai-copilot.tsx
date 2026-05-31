'use client';

import { motion } from 'framer-motion';
import { Send } from 'lucide-react';

const prompts = [
  'Why is this API dangerous?',
  'Predict future zombie APIs',
  'Explain dependency risk',
  'Generate remediation plan',
];

const sampleResponse = {
  question: 'Why is this API dangerous?',
  answer:
    'The /api/auth/legacy endpoint is dangerous because: 1) It uses deprecated OAuth 1.0 instead of OAuth 2.0, 2) No rate limiting enabled (risk of brute force), 3) Returns sensitive user data in plaintext responses, 4) Has 47 orphaned consumer services still hitting this endpoint.',
};

export function AICopilotSection() {
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
            <h2 className="heading-medium text-white">AI Copilot</h2>
            <p className="text-neutral-400">
              Ask questions. Get intelligent answers about your infrastructure security.
            </p>
          </motion.div>

          {/* Chat Interface */}
          <motion.div variants={itemVariants} className="max-w-3xl mx-auto">
            <div className="rounded-2xl glass border border-white/[0.1] overflow-hidden">
              {/* Chat Header */}
              <div className="border-b border-white/[0.1] p-4 md:p-6 bg-white/[0.02]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-purple-400 flex items-center justify-center">
                    <span className="text-white font-bold text-lg">AI</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">Aurenity AI Assistant</h3>
                    <p className="text-xs text-neutral-500">Always learning</p>
                  </div>
                </div>
              </div>

              {/* Chat Content */}
              <div className="p-4 md:p-6 space-y-6 min-h-64 md:min-h-80">
                {/* Sample Question */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex justify-end"
                >
                  <div className="max-w-xs md:max-w-sm p-3 rounded-lg bg-purple-600/30 border border-purple-600/50 text-white text-sm">
                    {sampleResponse.question}
                  </div>
                </motion.div>

                {/* Sample Response */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex justify-start"
                >
                  <div className="max-w-xs md:max-w-sm p-3 rounded-lg bg-white/[0.05] border border-white/[0.1] text-neutral-300 text-sm space-y-2">
                    <p>{sampleResponse.answer}</p>
                  </div>
                </motion.div>
              </div>

              {/* Input Area */}
              <div className="border-t border-white/[0.1] p-4 md:p-6 bg-white/[0.01]">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ask me anything..."
                    className="flex-1 px-4 py-2 rounded-lg bg-white/[0.05] border border-white/[0.1] text-white placeholder-neutral-500 focus:outline-none focus:border-purple-600/50 transition-all"
                  />
                  <button className="p-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white transition-all">
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Sample Prompts */}
            <motion.div
              variants={containerVariants}
              className="mt-8 space-y-3"
            >
              <p className="text-sm font-semibold text-neutral-400 px-1">Try asking:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {prompts.map((prompt, index) => (
                  <motion.button
                    key={index}
                    variants={itemVariants}
                    whileHover={{ scale: 1.02, borderColor: 'rgba(168, 85, 247, 0.5)' }}
                    className="p-3 rounded-lg glass border border-white/[0.05] hover:bg-white/[0.08] transition-all text-left text-sm text-neutral-300 hover:text-white"
                  >
                    {prompt}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
