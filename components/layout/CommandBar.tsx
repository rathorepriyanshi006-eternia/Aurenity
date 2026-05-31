'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, AlertTriangle, Bell, User } from 'lucide-react';

export function CommandBar() {
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  return (
    <motion.header
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="fixed top-0 left-80 right-0 h-16 backdrop-blur-sm flex items-center justify-between px-6 z-30"
      style={{
        backgroundColor: 'rgba(5, 8, 22, 0.95)',
        borderBottom: '1px solid rgba(59, 130, 246, 0.1)',
      }}
    >
      {/* Global Search */}
      <motion.div
        animate={{
          flex: isSearchFocused ? 1 : 0.3,
        }}
        transition={{ duration: 0.3 }}
        className="flex items-center gap-2 rounded-lg px-4 py-2 transition-colors"
        style={{
          backgroundColor: 'rgba(17, 24, 39, 0.6)',
          border: '1px solid rgba(59, 130, 246, 0.2)',
        }}
      >
        <Search className="w-4 h-4 text-cyber-blue/60" />
        <input
          type="text"
          placeholder="Search infrastructure..."
          className="bg-transparent text-sm text-white placeholder-gray-500 outline-none flex-1"
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setIsSearchFocused(false)}
        />
      </motion.div>

      {/* Right Section */}
      <div className="flex items-center gap-4 ml-4">
        {/* Threat Indicator */}
        <motion.div
          animate={{
            boxShadow: ['0 0 10px rgba(239, 68, 68, 0)', '0 0 20px rgba(239, 68, 68, 0.3)', '0 0 10px rgba(239, 68, 68, 0)'],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
          className="px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs cursor-pointer transition-colors"
          style={{
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
          }}
        >
          <AlertTriangle className="w-4 h-4 text-cyber-red" />
          <span className="text-cyber-red font-medium">3 Threats</span>
        </motion.div>

        {/* Notifications */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative p-2 text-gray-400 hover:text-cyber-blue transition-colors"
        >
          <Bell className="w-5 h-5" />
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-1 right-1 w-2 h-2 bg-cyber-red rounded-full"
          />
        </motion.button>

        {/* User Menu */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="p-2 text-gray-400 hover:text-cyber-blue transition-colors"
        >
          <User className="w-5 h-5" />
        </motion.button>
      </div>
    </motion.header>
  );
}
