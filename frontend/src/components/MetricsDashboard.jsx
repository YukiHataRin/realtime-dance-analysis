import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const MetricCard = ({ title, value, unit, data, dataKey, color, description }) => {
  return (
    <div className="glass-card flex flex-col h-full min-h-[220px]">
      <div className="flex justify-between items-start mb-2">
        <div>
            <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{title}</h3>
            <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-bold font-mono" style={{ color }}>
                    {typeof value === 'number' ? value.toFixed(2) : value}
                </span>
                <span className="text-xs text-slate-400 font-mono">{unit}</span>
            </div>
        </div>
        {/* Optional icon or status indicator could go here */}
      </div>
      
      {description && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 line-clamp-1 flex-shrink-0" title={description}>
              {description}
          </p>
      )}

      <div className="flex-1 w-full min-h-[80px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" vertical={false} />
            <YAxis 
                domain={['auto', 'auto']} 
                tick={{ fontSize: 10, fill: '#94a3b8' }} 
                width={30}
                axisLine={false}
                tickLine={false}
            />
            <Tooltip 
                contentStyle={{ 
                    backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: '#fff',
                    backdropFilter: 'blur(8px)'
                }}
                itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                labelStyle={{ display: 'none' }}
                isAnimationActive={false}
            />
            <Line 
                type="monotone" 
                dataKey={dataKey} 
                stroke={color} 
                strokeWidth={2} 
                dot={false}
                isAnimationActive={false} // Disable animation for better realtime perf
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export const MetricsDashboard = ({ dataHistory }) => {
    // 9 Metrics mapping strictly following the pseudocode
    const metricsConfig = [
        { key: 'energy', title: '1. Intensity (Energy)', unit: 'rad²/s', color: '#ef4444', desc: 'Limb angular velocity sum' },
        { key: 'sync_velocity', title: '2. Sync - Balance', unit: 'ratio', color: '#f59e0b', desc: 'L/R velocity magnitude balance [0, 1]' },
        { key: 'sync_correlation', title: '3. Sync - Correlation', unit: 'corr', color: '#fbbf24', desc: 'L/R rolling correlation [-1, 1]' },
        { key: 'expansion', title: '4. Volume (Expansion)', unit: 'vol', color: '#10b981', desc: 'Convex hull of 17 joints' },
        { key: 'curvature', title: '5. Roundness (Curvature)', unit: 'k', color: '#06b6d4', desc: 'Extremities trajectory curvature' },
        { key: 'height', title: '6. Stability - Height', unit: 'm', color: '#3b82f6', desc: 'Center of Mass Y-axis' },
        { key: 'sway', title: '7. Stability - Sway', unit: 'm', color: '#6366f1', desc: 'CoM horizontal deviation from Base' },
        { key: 'torque', title: '8. Effort (Torque)', unit: 'rad/s²', color: '#8b5cf6', desc: 'Angular acceleration sum' },
        { key: 'jerk', title: '9. Smoothness (Jerk)', unit: 'rad/s³', color: '#d946ef', desc: 'Angular jerk squared sum' }
    ];

    const currentValues = dataHistory.length > 0 ? dataHistory[dataHistory.length - 1] : {};

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 h-full p-2 overflow-y-auto">
            {metricsConfig.map((config, i) => {
                const val = currentValues[config.key] || 0;
                return (
                    <MetricCard 
                        key={i}
                        title={config.title}
                        value={val}
                        unit={config.unit}
                        color={config.color}
                        dataKey={config.key}
                        data={dataHistory}
                        description={config.desc}
                    />
                )
            })}
        </div>
    );
};
