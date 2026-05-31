'use client';

import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { Github, Linkedin, FileText, ArrowRight } from 'lucide-react';

export function FinalCTASection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.2,
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
    <section className="relative py-20 overflow-hidden border-t border-white/[0.1]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="text-center space-y-8"
        >
          {/* Headline */}
          <motion.h2 variants={itemVariants} className="heading-large text-white">
            Stop Discovering Threats After They Happen.
          </motion.h2>

          {/* Subheadline */}
          <motion.p
            variants={itemVariants}
            className="text-xl text-neutral-300 leading-relaxed max-w-2xl mx-auto"
          >
            Build a Cognitive Immune System for Your Infrastructure.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white border-0 shadow-lg shadow-purple-600/50 font-semibold"
            >
              Launch Platform
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-purple-600/50 text-white hover:bg-purple-600/10"
            >
              Request Demo
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

export function Footer() {
  const footerSections = [
    {
      title: 'Product',
      links: [
        { label: 'Platform', href: '#' },
        { label: 'Features', href: '#' },
        { label: 'Pricing', href: '#' },
        { label: 'Security', href: '#' },
      ],
    },
    {
      title: 'Resources',
      links: [
        { label: 'Documentation', href: '#' },
        { label: 'API Reference', href: '#' },
        { label: 'Blog', href: '#' },
        { label: 'Case Studies', href: '#' },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'About', href: '#' },
        { label: 'Careers', href: '#' },
        { label: 'Contact', href: '#' },
        { label: 'Privacy', href: '#' },
      ],
    },
  ];

  const socialLinks = [
    { icon: Github, label: 'GitHub', href: '#' },
    { icon: Linkedin, label: 'LinkedIn', href: '#' },
    { icon: FileText, label: 'Documentation', href: '#' },
  ];

  return (
    <footer className="border-t border-white/[0.1] bg-black/30 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-purple-400 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <span className="text-white font-bold">Aurenity X</span>
            </div>
            <p className="text-sm text-neutral-400">
              Autonomous Cognitive API Immune System
            </p>
          </div>

          {/* Links Sections */}
          {footerSections.map((section) => (
            <div key={section.title} className="space-y-4">
              <h3 className="text-sm font-semibold text-white">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-neutral-400 hover:text-purple-400 transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/[0.05] pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            {/* Copyright */}
            <p className="text-sm text-neutral-500">
              © 2024 Aurenity X. All rights reserved.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-4">
              {socialLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <motion.a
                    key={link.label}
                    href={link.href}
                    whileHover={{ y: -3 }}
                    className="p-2 rounded-lg hover:bg-white/[0.1] transition-all text-neutral-400 hover:text-purple-400"
                    aria-label={link.label}
                  >
                    <Icon className="w-5 h-5" />
                  </motion.a>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
