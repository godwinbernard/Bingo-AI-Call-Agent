'use client';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

function useCountUp(target, duration = 1200) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setValue(target); clearInterval(timer); }
      else setValue(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return value;
}

export default function StatCard({ icon, label, value, suffix = '', delta, deltaLabel, accentColor = '#6366F1', isLive = false }) {
  const numValue = typeof value === 'number' ? value : parseFloat(value) || 0;
  const displayed = useCountUp(numValue);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ scale: 1.02, y: -2 }}
      className="glass-card p-5 relative overflow-hidden cursor-default"
    >
      {/* Glow accent */}
      <div
        className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-10 -translate-y-6 translate-x-6"
        style={{ background: accentColor, filter: 'blur(20px)' }}
      />

      <div className="flex items-start justify-between mb-4">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
          style={{ background: `${accentColor}22`, border: `1px solid ${accentColor}33` }}
        >
          {icon}
        </div>
        {isLive && (
          <div className="flex items-center gap-1.5">
            <span className="status-dot-live" />
            <span className="text-xs font-medium" style={{ color: '#22C55E' }}>LIVE</span>
          </div>
        )}
      </div>

      <div className="mb-1">
        <span
          className="text-3xl font-bold tabular-nums"
          style={{ color: '#F1F1F5', fontVariantNumeric: 'tabular-nums' }}
        >
          {displayed.toLocaleString()}{suffix}
        </span>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm" style={{ color: '#9898B3' }}>{label}</span>
        {delta !== undefined && (
          <span
            className="text-xs font-medium px-2 py-0.5 rounded-full"
            style={{
              background: delta >= 0 ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
              color: delta >= 0 ? '#22C55E' : '#EF4444',
            }}
          >
            {delta >= 0 ? '+' : ''}{delta}{deltaLabel || ''}
          </span>
        )}
      </div>
    </motion.div>
  );
}
