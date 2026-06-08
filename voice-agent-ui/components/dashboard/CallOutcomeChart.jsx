'use client';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useState } from 'react';
import { MOCK_CALLS } from '@/lib/mockData';

const OUTCOME_DATA = [
  { name: 'Success',   key: 'success',   color: '#22C55E' },
  { name: 'Voicemail', key: 'voicemail', color: '#6366F1' },
  { name: 'No Answer', key: 'no-answer', color: '#F59E0B' },
  { name: 'Rejected',  key: 'rejected',  color: '#EF4444' },
  { name: 'Busy',      key: 'busy',      color: '#F97316' },
];

const TIME_FILTERS = ['Today', '7 days', '30 days', 'All time'];

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const { name, value, payload: p } = payload[0];
  const total = p.total;
  return (
    <div className="glass-card px-3 py-2 text-sm">
      <div className="font-medium mb-1" style={{ color: '#F1F1F5' }}>{name}</div>
      <div style={{ color: '#9898B3' }}>{value} calls ({Math.round((value / total) * 100)}%)</div>
    </div>
  );
}

export default function CallOutcomeChart() {
  const [filter, setFilter] = useState('7 days');

  const data = OUTCOME_DATA.map(o => ({
    ...o,
    value: MOCK_CALLS.filter(c => c.outcome === o.key).length,
    total: MOCK_CALLS.length,
  })).filter(d => d.value > 0);

  return (
    <div className="glass-card p-5 h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-sm" style={{ color: '#F1F1F5' }}>Call Outcomes</h3>
        <div className="flex gap-1">
          {TIME_FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="px-2.5 py-1 rounded-lg text-xs font-medium transition-colors"
              style={{
                background: filter === f ? 'rgba(99,102,241,0.2)' : 'transparent',
                color: filter === f ? '#6366F1' : '#5A5A7A',
                border: filter === f ? '1px solid rgba(99,102,241,0.3)' : '1px solid transparent',
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={80}
            paddingAngle={3}
            dataKey="value"
            strokeWidth={0}
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} opacity={0.9} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-2">
        {data.map(d => (
          <div key={d.key} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: d.color }} />
            <span className="text-xs" style={{ color: '#9898B3' }}>{d.name}</span>
            <span className="text-xs ml-auto font-medium tabular-nums" style={{ color: '#F1F1F5' }}>{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
