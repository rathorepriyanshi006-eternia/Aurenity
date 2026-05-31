'use client';

import { motion } from 'framer-motion';
import { Settings, Lock, Bell, Database, Users, ShieldCheck } from 'lucide-react';
import { useState } from 'react';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('workspace');

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-8 space-y-6">
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-400 to-gray-300 bg-clip-text text-transparent mb-2 flex items-center gap-3">
          <Settings className="w-8 h-8 text-gray-400" />
          Settings & Configuration
        </h1>
        <p className="text-gray-400">Workspace management, security, and integrations</p>
      </div>

      {/* Settings Tabs */}
      <div className="flex gap-2 border-b border-cyber-blue/20 flex-wrap">
        {[
          { id: 'workspace', label: 'Workspace', icon: Database },
          { id: 'access', label: 'Access Control', icon: Lock },
          { id: 'integrations', label: 'Integrations', icon: ShieldCheck },
          { id: 'notifications', label: 'Notifications', icon: Bell },
          { id: 'security', label: 'Security Policies', icon: Lock },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                activeTab === tab.id
                  ? 'text-cyber-blue border-b-2 border-cyber-blue'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {activeTab === 'workspace' && (
        <motion.div className="space-y-6">
          <div className="rounded-lg border border-cyber-blue/20 bg-cyber-panel/40 p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Workspace Management</h2>
            <div className="space-y-4">
              {[
                { name: 'Production Environment', status: 'Active', type: 'Main' },
                { name: 'Staging Environment', status: 'Active', type: 'Testing' },
                { name: 'Development Environment', status: 'Active', type: 'Internal' },
              ].map((workspace) => (
                <div key={workspace.name} className="p-4 bg-cyber-panel/50 rounded border border-cyber-blue/10 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-white">{workspace.name}</p>
                    <p className="text-sm text-gray-400">{workspace.type}</p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-cyber-green/20 text-cyber-green text-xs font-bold">{workspace.status}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-cyber-blue/20 bg-cyber-panel/40 p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Projects</h2>
            <div className="space-y-3">
              {[
                { name: 'Main Platform', apis: 189, status: 'Monitoring' },
                { name: 'Payment System', apis: 34, status: 'Critical' },
                { name: 'Analytics', apis: 28, status: 'Active' },
              ].map((project) => (
                <div key={project.name} className="p-3 bg-cyber-panel/50 rounded border border-cyber-blue/10 flex items-center justify-between">
                  <span className="text-white font-medium">{project.name}</span>
                  <span className="text-sm text-gray-400">{project.apis} APIs</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {activeTab === 'access' && (
        <motion.div className="rounded-lg border border-cyber-blue/20 bg-cyber-panel/40 p-6">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-cyber-blue" />
            User Roles & Access Control
          </h2>
          <div className="space-y-4">
            {[
              { role: 'Admin', users: 3, permissions: 'Full Access' },
              { role: 'Security Officer', users: 5, permissions: 'View All + Modify Policies' },
              { role: 'Analyst', users: 12, permissions: 'View Only' },
              { role: 'Developer', users: 28, permissions: 'Limited to Dev/Staging' },
            ].map((role) => (
              <div key={role.role} className="p-4 bg-cyber-panel/50 rounded border border-cyber-blue/10">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-white">{role.role}</p>
                  <span className="text-sm text-gray-400">{role.users} users</span>
                </div>
                <p className="text-sm text-gray-500">{role.permissions}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {activeTab === 'integrations' && (
        <motion.div className="rounded-lg border border-cyber-blue/20 bg-cyber-panel/40 p-6">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-cyber-blue" />
            Connected Integrations
          </h2>
          <div className="space-y-3">
            {[
              { name: 'Slack Notifications', status: 'Connected', icon: '💬' },
              { name: 'GitHub Webhooks', status: 'Connected', icon: '⚙️' },
              { name: 'Datadog Metrics', status: 'Connected', icon: '📊' },
              { name: 'PagerDuty Alerts', status: 'Connected', icon: '🚨' },
            ].map((integration) => (
              <div key={integration.name} className="p-4 bg-cyber-panel/50 rounded border border-cyber-blue/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{integration.icon}</span>
                  <span className="text-white font-medium">{integration.name}</span>
                </div>
                <span className="px-3 py-1 rounded text-xs font-bold bg-cyber-green/20 text-cyber-green">{integration.status}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {activeTab === 'notifications' && (
        <motion.div className="rounded-lg border border-cyber-blue/20 bg-cyber-panel/40 p-6">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5 text-cyber-blue" />
            Notification Settings
          </h2>
          <div className="space-y-4">
            {[
              { event: 'Critical Vulnerabilities', channels: 'Email, Slack, PagerDuty' },
              { event: 'API Degradation', channels: 'Email, Slack' },
              { event: 'New Zombie APIs', channels: 'Email, Weekly Report' },
              { event: 'Security Policy Violations', channels: 'Email, Slack' },
            ].map((notification) => (
              <div key={notification.event} className="p-4 bg-cyber-panel/50 rounded border border-cyber-blue/10">
                <p className="font-medium text-white mb-1">{notification.event}</p>
                <p className="text-sm text-gray-400">{notification.channels}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {activeTab === 'security' && (
        <motion.div className="rounded-lg border border-cyber-blue/20 bg-cyber-panel/40 p-6">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Lock className="w-5 h-5 text-cyber-red" />
            Organization-Wide Security Policies
          </h2>
          <div className="space-y-4">
            {[
              { policy: 'API Rate Limiting', status: 'Enforced', threshold: '1000 req/min' },
              { policy: 'Encryption Requirements', status: 'Enforced', threshold: 'TLS 1.3+' },
              { policy: 'Authentication MFA', status: 'Required', threshold: '2FA for admins' },
              { policy: 'Data Retention', status: 'Enforced', threshold: '90 days' },
            ].map((policy) => (
              <div key={policy.policy} className="p-4 bg-cyber-panel/50 rounded border border-cyber-red/10">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-medium text-white">{policy.policy}</p>
                  <span className="px-2 py-1 rounded text-xs font-bold bg-cyber-red/20 text-cyber-red">{policy.status}</span>
                </div>
                <p className="text-sm text-gray-500">{policy.threshold}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
