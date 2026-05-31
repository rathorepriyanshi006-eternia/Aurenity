'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, Send, Brain, Lightbulb, AlertTriangle, ShieldAlert, Cpu, FileText, Activity } from 'lucide-react';

export default function AIEnginePage() {
  const [messages, setMessages] = useState<Array<{ role: string; content: string; type?: string }>>([
    {
      role: 'assistant',
      content: "Hello, I am your Aurenity AI Security Copilot. I have analyzed your parsed repository endpoints and configurations.\n\nAsk me about security vulnerability risks, system dependencies, code remediation plans, infrastructure summaries, or ask me to compile a full security audit report.",
      type: 'system',
    },
  ]);
  const [input, setInput] = useState('');
  const [activeTab, setActiveTab] = useState('chat');
  const [isLoading, setIsLoading] = useState(false);
  const [repoMetadata, setRepoMetadata] = useState<any>(null);

  const fetchContextMetadata = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/v1/discovery/inventory');
      if (res.ok) {
        const data = await res.json();
        if (data.report && data.report.metadata) {
          setRepoMetadata(data.report.metadata);
        }
      }
    } catch (err) {
      console.error('Failed to load scan context metadata:', err);
    }
  };

  useEffect(() => {
    fetchContextMetadata();
  }, []);

  const handleSend = async (customPrompt?: string) => {
    const promptToSend = customPrompt || input;
    if (promptToSend.trim() && !isLoading) {
      setMessages((prev) => [...prev, { role: 'user', content: promptToSend }]);
      if (!customPrompt) setInput('');
      setIsLoading(true);

      try {
        const res = await fetch('http://127.0.0.1:8000/api/v1/ai/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: promptToSend })
        });
        
        if (res.ok) {
          const data = await res.json();
          setMessages((prev) => [
            ...prev,
            { role: 'assistant', content: data.content || 'I could not generate a response.' }
          ]);
        } else {
          setMessages((prev) => [
            ...prev,
            { role: 'assistant', content: 'Connection error. The AI Intelligence Engine is currently offline.' }
          ]);
        }
      } catch (err) {
        console.error('Failed to communicate with AI Engine', err);
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: 'Fatal link exception. Please check if the FastAPI backend is running.' }
        ]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Custom markdown parsing function for code blocks and bold titles
  const formatMessageContent = (content: string) => {
    const parts = content.split(/(```[\s\S]*?```)/g);
    return parts.map((part, idx) => {
      if (part.startsWith('```')) {
        const lines = part.split('\n');
        const codeLines = lines.slice(1, -1).join('\n');
        return (
          <pre key={idx} className="bg-black/90 p-3 rounded-lg border border-cyber-purple/20 text-[10px] font-mono text-cyber-cyan my-2 overflow-x-auto whitespace-pre-wrap select-text leading-normal">
            {codeLines}
          </pre>
        );
      }
      
      const boldParts = part.split(/(\*\*.*?\*\*)/g);
      return (
        <span key={idx} className="whitespace-pre-wrap">
          {boldParts.map((bPart, bIdx) => {
            if (bPart.startsWith('**') && bPart.endsWith('**')) {
              return <strong key={bIdx} className="text-white font-bold">{bPart.slice(2, -2)}</strong>;
            }
            return bPart;
          })}
        </span>
      );
    });
  };

  const quickPrompts = [
    { label: 'Explain Risks', prompt: 'Show active security vulnerability risks in my infrastructure', icon: ShieldAlert, color: 'text-cyber-red' },
    { label: 'Map Dependencies', prompt: 'Explain my infrastructure dependencies and system call graph', icon: Cpu, color: 'text-cyber-cyan' },
    { label: 'Remediation Plan', prompt: 'Generate a step-by-step remediation plan for code vulnerabilities', icon: Lightbulb, color: 'text-cyber-green' },
    { label: 'Summarize App', prompt: 'Summarize the scanned infrastructure stack, files, and databases', icon: Brain, color: 'text-cyber-purple' },
    { label: 'Compile Report', prompt: 'Compile a complete security audit report for this repository', icon: FileText, color: 'text-cyber-pink' }
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8 space-y-6 flex flex-col min-h-[85vh]">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyber-purple to-cyber-pink bg-clip-text text-transparent mb-2 flex items-center gap-3">
            <Zap className="w-8 h-8 text-cyber-purple" />
            AI Security Copilot
          </h1>
          <p className="text-gray-400">Contextual black-box analysis and automated remediation planning</p>
        </div>

        {/* Scan Context Badge */}
        {repoMetadata && (
          <div className="px-3 py-1.5 bg-cyber-purple/10 border border-cyber-purple/35 rounded-lg text-xs font-mono text-cyber-purple flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-cyber-pink animate-pulse" />
            Context: {repoMetadata.name} ({repoMetadata.language})
          </div>
        )}
      </div>

      {/* Suggested Prompts Actions Bar */}
      {messages.length === 1 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 md:grid-cols-5 gap-3 max-w-5xl w-full mx-auto">
          {quickPrompts.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.button
                key={i}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSend(item.prompt)}
                className="p-3 rounded-xl border border-cyber-purple/20 bg-cyber-purple/5 hover:bg-cyber-purple/15 text-center transition-all flex flex-col items-center justify-center space-y-2 cursor-pointer shadow shadow-purple-900/10"
              >
                <Icon className={`w-5 h-5 ${item.color}`} />
                <span className="text-xs font-bold text-white leading-tight font-mono">{item.label}</span>
              </motion.button>
            );
          })}
        </motion.div>
      )}

      {/* Chat Window Frame */}
      <div className="flex-1 flex items-stretch justify-center">
        <motion.div
          initial={{ scale: 0.98, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-4xl rounded-2xl border border-cyber-purple/20 bg-gradient-to-b from-cyber-panel/60 to-black/40 backdrop-blur-md p-6 flex flex-col justify-between overflow-hidden shadow-2xl min-h-[480px] relative"
        >
          {/* Cyber scanner grid layout overlay */}
          <div className="absolute inset-0 bg-cyber-grid-pattern opacity-5 pointer-events-none" />

          {/* Header Controls */}
          <div className="relative z-10 mb-4 flex items-center justify-between border-b border-cyber-purple/10 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyber-purple animate-ping" />
              <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wider">Aurenity SecOps Shell</h2>
            </div>
            <button
              onClick={() => setActiveTab(activeTab === 'chat' ? 'capabilities' : 'chat')}
              className="text-[10px] font-mono px-2 py-1 rounded bg-cyber-purple/20 text-cyber-purple border border-cyber-purple/35 hover:bg-cyber-purple/35 transition-colors"
            >
              {activeTab === 'chat' ? 'Vulnerability Model Specs' : 'Access Chat Engine'}
            </button>
          </div>

          {/* Chat Panel */}
          {activeTab === 'chat' && (
            <>
              {/* Messages Container */}
              <div className="relative z-10 flex-1 overflow-y-auto space-y-4 mb-4 pr-1 scrollbar-thin max-h-[350px]">
                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xl px-4 py-2.5 rounded-xl text-xs leading-relaxed font-mono ${
                        msg.role === 'user'
                          ? 'bg-cyber-purple/20 border border-cyber-purple/40 text-white'
                          : 'bg-black/30 border border-cyber-blue/15 text-gray-200 shadow shadow-black'
                      }`}
                    >
                      {formatMessageContent(msg.content)}
                    </div>
                  </motion.div>
                ))}
                
                {isLoading && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                    <div className="bg-cyber-purple/10 border border-cyber-purple/25 text-cyber-purple max-w-xs px-3 py-2 rounded-xl text-xs italic font-mono animate-pulse">
                      Analyzing memory genomes and dependency flow...
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Chat Input Field */}
              <div className="relative z-10 flex gap-2 border-t border-cyber-blue/10 pt-4">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Query codebase risks, remediation patches, or ask to compile reports..."
                  disabled={isLoading}
                  className="flex-1 px-4 py-2.5 rounded-xl text-xs bg-black/40 border border-cyber-purple/20 text-white placeholder-gray-500 focus:outline-none focus:border-cyber-purple/55 focus:bg-black/60 transition-all disabled:opacity-50 font-mono"
                />
                <button
                  onClick={() => handleSend()}
                  disabled={isLoading}
                  className="px-5 py-2.5 rounded-xl text-xs bg-gradient-to-r from-cyber-purple to-cyber-pink text-white font-medium hover:shadow-lg hover:shadow-cyber-purple/30 transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  Send
                </button>
              </div>
            </>
          )}

          {/* Capabilities Specs Tab */}
          {activeTab === 'capabilities' && (
            <div className="relative z-10 space-y-4 max-h-[350px] overflow-y-auto scrollbar-thin pr-1 font-mono">
              {[
                { title: 'Explain Security Risks', desc: 'Queries scan database arrays to identify unvalidated endpoints, exposed keys, and CORS wildcards.' },
                { title: 'Map System Dependencies', desc: 'Traces node relationship matrix layers, outlining microservices to persistent storage.' },
                { title: 'Remediation Patching', desc: 'Generates step-by-step mitigation command checklists and code edits to secure vulnerable areas.' },
                { title: 'Infrastructure Summaries', desc: 'Provides metadata outlines summarizing scanned file weights, libraries, and languages.' },
                { title: 'Audit Report Generation', desc: 'Generates formatted cyber security audit summaries ready for extraction.' }
              ].map((cap, i) => (
                <div key={i} className="p-3.5 rounded-xl border border-cyber-purple/20 bg-cyber-purple/5 space-y-1">
                  <p className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-cyber-pink rounded-full" /> {cap.title}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-1 leading-normal">{cap.desc}</p>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
