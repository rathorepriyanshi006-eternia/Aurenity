'use client';

import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from './ui/button';

interface NavbarProps {
  onLoginClick?: () => void;
}

export function Navbar({ onLoginClick }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { label: 'Features', href: '#features' },
    { label: 'Platform', href: '#platform' },
    { label: 'Architecture', href: '#architecture' },
    { label: 'Demo', href: '#demo' },
    { label: 'Documentation', href: '#documentation' },
  ];

  return (
    <nav className="fixed top-0 w-full z-50">
      <div className="glass border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-2"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-purple-400 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <span className="text-white font-bold">Aurenity X</span>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <motion.a
                  key={link.label}
                  href={link.href}
                  whileHover={{ color: '#a78bfa' }}
                  className="text-neutral-400 hover:text-purple-400 transition-colors text-sm"
                >
                  {link.label}
                </motion.a>
              ))}
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-4">
              <Button
                onClick={onLoginClick}
                variant="outline"
                size="sm"
                className="hidden sm:block border-purple-600/50 text-white hover:bg-purple-600/10"
              >
                Login
              </Button>

              {/* Mobile Menu Button */}
              <button
                className="md:hidden"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Toggle menu"
              >
                {isOpen ? (
                  <X className="w-6 h-6 text-white" />
                ) : (
                  <Menu className="w-6 h-6 text-white" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="md:hidden pb-4 border-t border-white/[0.1]"
            >
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="block py-2 text-neutral-400 hover:text-purple-400 text-sm"
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </a>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </nav>
  );
}
