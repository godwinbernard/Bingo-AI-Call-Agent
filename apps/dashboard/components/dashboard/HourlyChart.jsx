'use client';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { MOCK_HOURLY_DATA } from '@/lib/mockData';

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card px-3 py-2 text-sm">
      <div className="font-medium mb-1" style={{ color: '#9898B3' }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span style={{ color: '#F1F1F5' }}>{p.name}: <strong>{p.value}</strong></span>
        </div>
      ))}
    </div>
  );
}

export default function HourlyChart() {
  // Only show hours that have activity context
  const data = MOCK_HOURLY_DATA.filter((_, i) => i % 2 === 0);

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-sm" style={{ color: '#F1F1F5' }}>Calls Per Hour Today</h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-0.5 rounded" style={{ background: '#6366F1' }} />
            <span className="text-xs" style={{ color: '#9898B3' }}>Total</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-0.5 rounded" style={{ background: '#22C55E' }} />
            <span className="text-xs" style={{ color: '#9898B3' }}>Successful</span>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="totalGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="successGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22C55E" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#2A2A40" vertical={false} />
          <XAxis
            dataKey="hour"
            tick={{ fill: '#5A5A7A', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: '#5A5A7A', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="total"
            name="Total"
            stroke="#6366F1"
            strokeWidth={2}
            fill="url(#totalGrad)"
            dot={false}
          />
          <Area
            type="monotone"
            dataKey="success"
            name="Successful"
            stroke="#22C55E"
            strokeWidth={2}
            fill="url(#successGrad)"
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
