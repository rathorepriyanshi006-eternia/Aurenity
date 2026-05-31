'use client';

import { motion } from 'framer-motion';
import { HeatMapGrid } from 'recharts';

const services = [
  'Auth Service',
  'API Gateway',
  'Payment Service',
  'Database Layer',
  'Cache Layer',
  'Queue Service',
  'File Storage',
  'Analytics',
];

const hours = Array.from({ length: 24 }, (_, i) =>
  `${String(i).padStart(2, '0')}:00`
);

// Generate random risk scores
const generateHeatmapData = () => {
  const data: any[] = [];
  services.forEach((service) => {
    hours.forEach((hour) => {
      const riskScore = Math.floor(Math.random() * 100);
      data.push({
        service,
        hour,
        riskScore,
      });
    });
  });
  return data;
};

const heatmapData = generateHeatmapData();

const getRiskColor = (value: number) => {
  if (value < 20) return 'bg-cyber-green/20';
  if (value < 40) return 'bg-cyber-cyan/20';
  if (value < 60) return 'bg-cyber-blue/20';
  if (value < 80) return 'bg-cyber-amber/20';
  return 'bg-cyber-red/20';
};

export function RiskHeatmap() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-xl bg-gradient-to-br from-cyber-panel to-cyber-panel-light border border-cyber-blue/20 p-6"
    >
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-cyber-blue/5 rounded-full blur-3xl -z-10" />

      <div className="space-y-6">
        {/* Header */}
        <div>
          <h3 className="text-lg font-bold text-white">Service Risk Heatmap</h3>
          <p className="text-sm text-gray-400">24-hour risk distribution by service</p>
        </div>

        {/* Heatmap Grid */}
        <div className="overflow-x-auto">
          {/* Service Labels */}
          <div className="flex gap-2">
            <div className="w-24 flex-shrink-0"></div>
            <div className="flex gap-1">
              {hours.map((hour) => (
                <div key={hour} className="w-6 text-xs text-gray-500 text-center">
                  {hour.split(':')[0]}
                </div>
              ))}
            </div>
          </div>

          {/* Heatmap Rows */}
          <div className="space-y-2">
            {services.map((service) => (
              <div key={service} className="flex gap-2 items-center">
                <div className="w-24 text-sm text-gray-400 truncate flex-shrink-0">
                  {service}
                </div>
                <div className="flex gap-1">
                  {hours.map((hour) => {
                    const data = heatmapData.find(
                      (d) => d.service === service && d.hour === hour
                    );
                    return (
                      <motion.div
                        key={`${service}-${hour}`}
                        whileHover={{ scale: 1.2 }}
                        className={`w-6 h-6 rounded cursor-pointer transition-colors ${
                          getRiskColor(data?.riskScore || 0)
                        }`}
                        title={`${service} at ${hour}: ${data?.riskScore || 0}%`}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs pt-4 border-t border-cyber-blue/10">
          <span className="text-gray-400">Low</span>
          <div className="flex gap-1">
            <div className="w-4 h-4 rounded bg-cyber-green/30" />
            <div className="w-4 h-4 rounded bg-cyber-cyan/30" />
            <div className="w-4 h-4 rounded bg-cyber-blue/30" />
            <div className="w-4 h-4 rounded bg-cyber-amber/30" />
            <div className="w-4 h-4 rounded bg-cyber-red/30" />
          </div>
          <span className="text-gray-400">High</span>
        </div>
      </div>
    </motion.div>
  );
}
