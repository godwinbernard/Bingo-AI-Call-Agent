'use client';
import { motion } from 'framer-motion';
import { MOCK_CALLS } from '@/lib/mockData';
import StatusBadge from '@/components/shared/StatusBadge';
import { maskPhone, formatDuration, formatRelativeTime } from '@/lib/utils';

export default function RecentCallsTable({ onSelectCall }) {
  const recent = MOCK_CALLS.slice(0, 10);

  return (
    <div className="glass-card overflow-hidden">
      <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid #2A2A40' }}>
        <h3 className="font-semibold text-sm" style={{ color: '#F1F1F5' }}>Recent Calls</h3>
        <a href="/calls" className="text-xs font-medium transition-colors" style={{ color: '#6366F1' }}
          onMouseEnter={e => e.target.style.color = '#818CF8'}
          onMouseLeave={e => e.target.style.color = '#6366F1'}
        >
          View all →
        </a>
      </div>
      <div className="overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Campaign</th>
              <th>Duration</th>
              <th>Outcome</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {recent.map((call, i) => (
              <motion.tr
                key={call.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => onSelectCall?.(call)}
                style={{ cursor: 'pointer' }}
              >
                <td>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg, #6366F1, #818CF8)', color: 'white' }}
                    >
                      {call.first_name[0]}{call.last_name[0]}
                    </div>
                    <span className="font-medium">{call.first_name} {call.last_name}</span>
                  </div>
                </td>
                <td style={{ color: '#9898B3', fontFamily: 'monospace', fontSize: 12 }}>
                  {maskPhone(call.phone)}
                </td>
                <td style={{ color: '#9898B3' }}>
                  <span className="truncate max-w-[120px] block">{call.campaign_name}</span>
                </td>
                <td style={{ color: '#9898B3' }}>{formatDuration(call.duration_seconds)}</td>
                <td><StatusBadge status={call.outcome} /></td>
                <td style={{ color: '#5A5A7A', fontSize: 12 }}>{formatRelativeTime(call.started_at)}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
