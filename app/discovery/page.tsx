'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Download, Eye, Shield, AlertTriangle, FileText, Users, Play, Copy, Lock, RefreshCw, X } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function DiscoveryPage() {
  const [activeTab, setActiveTab] = useState('inventory');
  const [searchTerm, setSearchTerm] = useState('');
  const [initialized, setInitialized] = useState(false);
  const [showScanner, setShowScanner] = useState(false);

  // Form states
  const [repoUrl, setRepoUrl] = useState('');
  const [token, setToken] = useState('');
  const [username, setUsername] = useState('');

  // Dynamic inventory states
  const [apis, setApis] = useState<any[]>([]);
  const [stats, setStats] = useState({
    total: '0',
    active: '0',
    zombie: '0',
    shadow: '0',
    deprecated: '0'
  });
  const [trendData, setTrendData] = useState<any[]>([]);
  const [lifecycleData, setLifecycleData] = useState<any[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState('');

  const fetchInventory = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('http://127.0.0.1:8000/api/v1/discovery/inventory');
      if (res.ok) {
        const data = await res.json();
        setApis(data.apis || []);
        setStats(data.stats || { total: '0', active: '0', zombie: '0', shadow: '0', deprecated: '0' });
        setTrendData(data.trendData || []);
        setLifecycleData(data.lifecycleData || []);
        if (data.apis && data.apis.length > 0) {
          setInitialized(true);
        }
      }
    } catch (err) {
      console.error('Failed to fetch inventory:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsScanning(true);
      setScanMessage('Connecting to repository & launching static code scanner...');
      const res = await fetch('http://127.0.0.1:8000/api/v1/discovery/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repo_url: repoUrl,
          token: token,
          username: username
        })
      });
      if (res.ok) {
        const data = await res.json();
        setApis(data.apis || []);
        setStats(data.stats || { total: '0', active: '0', zombie: '0', shadow: '0', deprecated: '0' });
        setTrendData(data.trendData || []);
        setLifecycleData(data.lifecycleData || []);
        setInitialized(true);
        setShowScanner(false);
        setScanMessage('Scan completed successfully! Graph models updated.');
      } else {
        setScanMessage('Scan failed. Please verify repository details or access token.');
      }
    } catch (err) {
      console.error('Scan error:', err);
      setScanMessage('Failed to connect to backend server. Ensure backend is running.');
    } finally {
      setIsScanning(false);
    }
  };

  const filteredApis = apis.filter(api => 
    api.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    api.endpoint?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    api.owner?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    api.status?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading && apis.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-cyber-blue border-t-transparent animate-spin" />
        <p className="text-gray-400 animate-pulse font-mono">Initializing Neural API Discovery Engine...</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-8 space-y-6"
    >
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyber-blue to-cyber-cyan bg-clip-text text-transparent mb-2 flex items-center gap-3">
            <Search className="w-8 h-8 text-cyber-blue" />
            API Discovery & Inventory
          </h1>
          <p className="text-gray-400">Automatic discovery, shadow API detection, zombie API identification, and comprehensive ownership mapping</p>
        </div>
        
        {initialized && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowScanner(!showScanner)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyber-blue/20 border border-cyber-blue/50 text-white font-medium hover:bg-cyber-blue/30 transition-all"
          >
            {showScanner ? <X className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {showScanner ? 'Close Scanner' : 'Trigger New Scan'}
          </motion.button>
        )}
      </div>

      {/* Onboarding Workflow Setup Card */}
      {(!initialized || showScanner) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg border border-cyber-blue/30 bg-gradient-to-br from-cyber-blue/10 to-cyber-purple/10 p-6"
        >
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Play className="w-5 h-5 text-cyber-blue" />
            {initialized ? 'Trigger Repository Scan' : 'First-Time Setup: Initialize Discovery'}
          </h3>
          
          <form onSubmit={handleScan} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Repository Link / Source Code</label>
                <input
                  type="text"
                  placeholder="https://github.com/yourorg/repo"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  className="w-full px-4 py-2 bg-cyber-panel/50 border border-cyber-blue/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyber-blue transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Access Token (Optional)</label>
                <input
                  type="password"
                  placeholder="ghp_xxxxxxxxxxxxxxxxx"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  className="w-full px-4 py-2 bg-cyber-panel/50 border border-cyber-blue/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyber-blue transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Operator Username</label>
                <input
                  type="text"
                  placeholder="your-username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-2 bg-cyber-panel/50 border border-cyber-blue/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyber-blue transition-colors"
                  required
                />
              </div>
            </div>
            
            {scanMessage && (
              <div className="text-sm font-mono text-cyber-cyan bg-cyber-cyan/5 p-3 rounded border border-cyber-cyan/20">
                {scanMessage}
              </div>
            )}

            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={isScanning}
                className="flex items-center gap-2 px-6 py-2 rounded-lg bg-gradient-to-r from-cyber-blue to-cyber-cyan text-white font-medium hover:shadow-lg hover:shadow-cyber-blue/50 transition-all disabled:opacity-50"
              >
                {isScanning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                {isScanning ? 'Scanning...' : 'Initialize Discovery Scan'}
              </motion.button>
              
              {!initialized && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  type="button"
                  onClick={() => {
                    // Trigger mockup seed
                    setRepoUrl('');
                    setUsername('Demo Admin');
                    const mockEvent = { preventDefault: () => {} } as React.FormEvent;
                    handleScan(mockEvent);
                  }}
                  className="px-6 py-2 rounded-lg bg-gray-700/30 text-gray-300 hover:bg-gray-700/50 transition-colors"
                >
                  Skip for Now (Demo Seeding)
                </motion.button>
              )}
            </div>
          </form>
        </motion.div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Total APIs', value: stats.total, color: 'text-cyber-blue' },
          { label: 'Active', value: stats.active, color: 'text-cyber-green' },
          { label: 'Zombie', value: stats.zombie, color: 'text-cyber-red' },
          { label: 'Shadow', value: stats.shadow, color: 'text-cyber-amber' },
          { label: 'Deprecated', value: stats.deprecated, color: 'text-cyber-purple' },
        ].map((stat) => (
          <motion.div key={stat.label} whileHover={{ scale: 1.05 }} className="rounded-lg bg-cyber-panel/50 border border-cyber-blue/10 p-4">
            <p className="text-xs text-gray-400 mb-1">{stat.label}</p>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-cyber-blue/20">
        {[
          { id: 'inventory', label: 'API Inventory', icon: FileText },
          { id: 'lifecycle', label: 'API Lifecycle', icon: AlertTriangle },
          { id: 'documentation', label: 'Documentation', icon: FileText },
          { id: 'ownership', label: 'Ownership', icon: Users },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 font-medium text-sm flex items-center gap-2 transition-colors ${
              activeTab === tab.id
                ? 'text-cyber-blue border-b-2 border-cyber-blue'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'inventory' && (
        <>
          {/* Discovery Trend */}
          {trendData.length > 0 && (
            <motion.div whileHover={{ scale: 1.01 }} className="rounded-lg border border-cyber-blue/20 bg-cyber-panel/40 p-6 backdrop-blur-sm">
              <h3 className="text-lg font-semibold text-white mb-4">API Discovery Trend</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="day" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #3b82f6' }} labelStyle={{ color: '#fff' }} />
                  <Line type="monotone" dataKey="discovered" stroke="#3b82f6" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="active" stroke="#10b981" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="zombie" stroke="#ef4444" strokeWidth={1} dot={false} />
                  <Line type="monotone" dataKey="shadow" stroke="#f59e0b" strokeWidth={1} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>
          )}

          {/* Search and Filter */}
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-64 relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search APIs by name, endpoint, owner or status..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-cyber-panel border border-cyber-blue/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyber-blue"
              />
            </div>
            <button 
              onClick={fetchInventory}
              className="px-4 py-2 bg-cyber-blue/20 border border-cyber-blue/50 rounded-lg text-white hover:bg-cyber-blue/30 flex items-center gap-2 transition-colors"
            >
              <RefreshCw className="w-4 h-4" /> Refresh
            </button>
          </div>

          {/* API Inventory Table */}
          <motion.div className="rounded-lg border border-cyber-blue/20 bg-cyber-panel/40 overflow-hidden backdrop-blur-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-cyber-panel/80 border-b border-cyber-blue/20">
                  <tr className="text-gray-400">
                    <th className="px-6 py-3 text-left font-semibold">API Name</th>
                    <th className="px-6 py-3 text-left font-semibold">Endpoint</th>
                    <th className="px-6 py-3 text-left font-semibold">Status</th>
                    <th className="px-6 py-3 text-left font-semibold">Usage</th>
                    <th className="px-6 py-3 text-left font-semibold">Owner</th>
                    <th className="px-6 py-3 text-left font-semibold">Security Score</th>
                    <th className="px-6 py-3 text-left font-semibold">Documented</th>
                    <th className="px-6 py-3 text-left font-semibold">Documentation Status</th>
                    <th className="px-6 py-3 text-left font-semibold">API Classification</th>
                    <th className="px-6 py-3 text-left font-semibold">Days Since Last Usage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cyber-blue/10">
                  {filteredApis.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="px-6 py-8 text-center text-gray-500 font-mono">
                        No APIs matched the search query.
                      </td>
                    </tr>
                  ) : (
                    filteredApis.map((api) => (
                      <tr key={api.id || api.endpoint} className="hover:bg-cyber-panel/50 transition-colors">
                        <td className="px-6 py-4 text-white font-medium">{api.name}</td>
                        <td className="px-6 py-4 text-gray-400 font-mono text-xs">{api.endpoint}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            api.status === 'active' ? 'bg-cyber-green/20 text-cyber-green' : 
                            api.status === 'shadow' ? 'bg-cyber-amber/20 text-cyber-amber' :
                            api.status === 'zombie' ? 'bg-cyber-red/20 text-cyber-red' :
                            'bg-cyber-purple/20 text-cyber-purple'
                          }`}>
                            {api.status ? (api.status.charAt(0).toUpperCase() + api.status.slice(1)) : 'Unknown'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-400">{api.usage}</td>
                        <td className="px-6 py-4 text-gray-400">{api.owner || 'Unassigned'}</td>
                        <td className="px-6 py-4">
                          <span className={`font-bold ${
                            api.health_score >= 80 ? 'text-cyber-green' :
                            api.health_score >= 60 ? 'text-cyber-amber' :
                            'text-cyber-red'
                          }`}>
                            {api.health_score}%
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {api.documented ? <span className="text-cyber-green text-xs font-bold">✓ Yes</span> : <span className="text-cyber-red text-xs font-bold">✗ No</span>}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded text-xs font-semibold ${
                            api.documentation_status === 'Documented' ? 'bg-cyber-green/20 text-cyber-green' : 'bg-cyber-amber/20 text-cyber-amber'
                          }`}>
                            {api.documentation_status || 'Undocumented'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded text-xs font-semibold ${
                            api.zombie_classification === 'Zombie API' ? 'bg-cyber-red/20 text-cyber-red' : 'bg-cyber-green/20 text-cyber-green'
                          }`}>
                            {api.zombie_classification || 'Shadow API'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-300 font-mono">
                          {api.days_since_last_use !== undefined ? api.days_since_last_use : 0}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        </>
      )}

      {activeTab === 'lifecycle' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {lifecycleData.map((item) => (
            <motion.div key={item.stage} whileHover={{ scale: 1.05 }} className="rounded-lg border border-cyber-blue/20 bg-cyber-panel/40 p-6 text-center">
              <p className="text-sm text-gray-400 mb-2">{item.stage}</p>
              <p className="text-3xl font-bold text-white">{item.count}</p>
              <div className="mt-4 h-2 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-cyber-blue to-cyber-cyan" style={{ width: `${Math.min(100, (item.count / (parseInt(stats.total) || 1)) * 100)}%` }} />
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {activeTab === 'documentation' && (
        <motion.div className="rounded-lg border border-cyber-blue/20 bg-cyber-panel/40 p-6 backdrop-blur-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Documentation Coverage</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-400">Documented APIs</span>
                    <span className="text-sm font-bold text-cyber-green">
                      {apis.filter(a => a.documented).length} / {apis.length} ({apis.length > 0 ? Math.round((apis.filter(a => a.documented).length / apis.length) * 100) : 0}%)
                    </span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-cyber-green" style={{ width: `${apis.length > 0 ? (apis.filter(a => a.documented).length / apis.length) * 100 : 0}%` }} />
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Zombie & Shadow Exposure</h3>
              <p className="text-sm text-gray-400">
                Found <span className="text-cyber-red font-bold">{stats.zombie} zombie APIs</span> and <span className="text-cyber-amber font-bold">{stats.shadow} shadow APIs</span> currently exposed to traffic.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {activeTab === 'ownership' && (
        <motion.div className="rounded-lg border border-cyber-blue/20 bg-cyber-panel/40 p-6 backdrop-blur-sm">
          <h3 className="text-lg font-semibold text-white mb-4">Team Ownership Mapping</h3>
          <div className="space-y-3">
            {[
              { team: 'Platform Team', apis: apis.filter(a => a.owner?.includes('Platform')).length, lastActivity: '2 hours ago' },
              { team: 'Operator/Pod Teams', apis: apis.filter(a => a.owner && !a.owner.includes('Platform')).length, lastActivity: 'Active now' },
              { team: 'Unassigned (Shadow)', apis: apis.filter(a => !a.owner || a.owner === 'Unassigned').length, lastActivity: 'Never' },
            ].map((item) => (
              <div key={item.team} className="p-4 bg-cyber-panel/50 rounded-lg border border-cyber-blue/10">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-white">{item.team}</span>
                  <span className="text-sm text-cyber-blue font-mono">{item.apis} APIs</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
