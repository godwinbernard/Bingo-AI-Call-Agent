'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { MOCK_LIVE_CALLS } from '@/lib/mockData';
import { maskPhone, formatDuration } from '@/lib/utils';

function WaveformBars() {
  return (
    <div className="flex items-center gap-0.5" style={{ height: 20 }}>
      {[1,2,3,4,5].map(i => (
        <div key={i} className="waveform-bar" />
      ))}
    </div>
  );
}

function LiveCallRow({ call }) {
  const [elapsed, setElapsed] = useState(call.duration);

  useEffect(() => {
    const interval = setInterval(() => setElapsed(s => s + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const statusColors = {
    Talking: '#22C55E', Listening: '#6366F1', Processing: '#F59E0B',
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="flex items-center gap-3 p-3 rounded-xl"
      style={{ background: '#1E1E35', border: '1px solid #2A2A40' }}
    >
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
        style={{ background: 'linear-gradient(135deg, #6366F1, #818CF8)', color: 'white' }}
      >
        {call.contact.split(' ').map(n => n[0]).join('')}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium truncate" style={{ color: '#F1F1F5' }}>{call.contact}</span>
          <span
            className="text-[10px] px-1.5 py-0.5 rounded-full font-medium flex-shrink-0"
            style={{ background: `${statusColors[call.status]}22`, color: statusColors[call.status] }}
          >
            {call.status}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs truncate" style={{ color: '#5A5A7A' }}>{call.campaign}</span>
        </div>
      </div>

      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        <span className="text-sm font-mono tabular-nums" style={{ color: '#9898B3' }}>
          {Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, '0')}
        </span>
        {call.status === 'Talking' && <WaveformBars />}
      </div>
    </motion.div>
  );
}

export default function LiveCallsPanel() {
  const [calls, setCalls] = useState(MOCK_LIVE_CALLS);

  // Simulate a call completing after a few seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setCalls(prev => prev.filter(c => c.callSid !== 'CA002'));
    }, 8000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="glass-card p-5 h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-sm" style={{ color: '#F1F1F5' }}>Live Calls</h3>
          <span
            className="text-xs px-2 py-0.5 rounded-full font-medium"
            style={{ background: 'rgba(99,102,241,0.15)', color: '#6366F1' }}
          >
            {calls.length} active
          </span>
        </div>
        <span className="status-dot-live" />
      </div>

      <div className="flex flex-col gap-2">
        <AnimatePresence>
          {calls.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8"
            >
              <div className="text-2xl mb-2">📵</div>
              <p className="text-sm" style={{ color: '#5A5A7A' }}>No active calls</p>
            </motion.div>
          ) : (
            calls.map(call => <LiveCallRow key={call.callSid} call={call} />)
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
