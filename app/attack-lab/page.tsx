'use client';

import { motion } from 'framer-motion';
import { Crosshair, AlertTriangle, Zap } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AttackLabPage() {
  const vulnerabilities = [
    { name: 'SQL Injection', severity: 'Critical', owasp: 'A1', affectedApis: 5 },
    { name: 'Auth Bypass', severity: 'Critical', owasp: 'A7', affectedApis: 3 },
    { name: 'Rate Limiting Missing', severity: 'High', owasp: 'A5', affectedApis: 8 },
    { name: 'Weak Encryption', severity: 'High', owasp: 'A2', affectedApis: 6 },
    { name: 'CORS Misconfiguration', severity: 'Medium', owasp: 'A5', affectedApis: 4 },
  ];

  const testResults = [
    { test: 'Authentication', passed: 2, failed: 3, score: '40%' },
    { test: 'Authorization', passed: 4, failed: 2, score: '67%' },
    { test: 'Input Validation', passed: 1, failed: 4, score: '20%' },
    { test: 'Encryption', passed: 3, failed: 2, score: '60%' },
  ];

  const attackSurfaceData = [
    { endpoint: 'POST /api/auth', exposureLevel: 95 },
    { endpoint: 'GET /api/users', exposureLevel: 78 },
    { endpoint: 'PUT /api/payments', exposureLevel: 88 },
    { endpoint: 'DELETE /api/data', exposureLevel: 92 },
    { endpoint: 'POST /api/upload', exposureLevel: 85 },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-8 space-y-6">
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-cyber-red to-cyber-amber bg-clip-text text-transparent mb-2 flex items-center gap-3">
          <Crosshair className="w-8 h-8 text-cyber-red" />
          Attack Lab
        </h1>
        <p className="text-gray-400">Vulnerability detection, API fuzz testing, and OWASP validation</p>
      </div>

      {/* Vulnerabilities Found */}
      <motion.div className="rounded-lg border border-cyber-red/20 bg-cyber-panel/40 p-6">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-cyber-red" />
          Vulnerabilities Detected
        </h2>
        <div className="space-y-3">
          {vulnerabilities.map((vuln) => (
            <div key={vuln.name} className="p-4 bg-cyber-panel/50 rounded-lg border border-cyber-red/10">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-white">{vuln.name}</span>
                <span className={`px-2 py-1 rounded text-xs font-bold ${
                  vuln.severity === 'Critical' ? 'bg-cyber-red/20 text-cyber-red' :
                  'bg-cyber-amber/20 text-cyber-amber'
                }`}>
                  {vuln.severity}
                </span>
              </div>
              <div className="flex gap-4 text-sm">
                <span className="text-gray-400">OWASP: <span className="text-cyber-amber">{vuln.owasp}</span></span>
                <span className="text-gray-400">Affects: <span className="text-cyber-red font-bold">{vuln.affectedApis} APIs</span></span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Attack Surface Discovery */}
      <motion.div className="rounded-lg border border-cyber-red/20 bg-cyber-panel/40 p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Attack Surface Discovery</h2>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={attackSurfaceData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="endpoint" stroke="#64748b" angle={-45} textAnchor="end" />
            <YAxis stroke="#64748b" />
            <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #ef4444' }} />
            <Bar dataKey="exposureLevel" fill="#ef4444" />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Test Results */}
      <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-lg border border-cyber-red/20 bg-cyber-panel/40 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Security Test Results</h3>
          <div className="space-y-3">
            {testResults.map((test) => (
              <div key={test.test} className="p-3 bg-cyber-panel/50 rounded border border-cyber-red/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">{test.test}</span>
                  <span className="font-bold text-cyber-red">{test.score}</span>
                </div>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-cyber-red to-cyber-amber" style={{ width: test.score }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-cyber-red/20 bg-cyber-panel/40 p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-cyber-red" />
            Fuzz Testing Results
          </h3>
          <div className="space-y-3">
            <div className="bg-cyber-red/10 p-3 rounded border border-cyber-red/20">
              <p className="text-sm text-gray-400">Malformed Requests Sent</p>
              <p className="text-2xl font-bold text-cyber-red">10,428</p>
            </div>
            <div className="bg-cyber-amber/10 p-3 rounded border border-cyber-amber/20">
              <p className="text-sm text-gray-400">Crash/Hang Detected</p>
              <p className="text-2xl font-bold text-cyber-amber">23</p>
            </div>
            <div className="bg-cyber-green/10 p-3 rounded border border-cyber-green/20">
              <p className="text-sm text-gray-400">Memory Leaks Found</p>
              <p className="text-2xl font-bold text-cyber-green">7</p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
