'use client';
import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter } from 'lucide-react';
import StatusBadge from '@/components/shared/StatusBadge';
import CallDetailDrawer from '@/components/calls/CallDetailDrawer';
import { MOCK_CALLS } from '@/lib/mockData';
import { maskPhone, formatDuration, formatRelativeTime } from '@/lib/utils';

const OUTCOME_FILTERS = ['All', 'success', 'voicemail', 'no-answer', 'rejected', 'busy'];

export default function CallsPage() {
  const [search, setSearch] = useState('');
  const [outcomeFilter, setOutcomeFilter] = useState('All');
  const [selectedCall, setSelectedCall] = useState(null);
  const [page, setPage] = useState(1);
  const PER_PAGE = 15;

  const filtered = useMemo(() => {
    return MOCK_CALLS.filter(c => {
      const matchSearch = !search || `${c.first_name} ${c.last_name} ${c.phone} ${c.campaign_name}`.toLowerCase().includes(search.toLowerCase());
      const matchOutcome = outcomeFilter === 'All' || c.outcome === outcomeFilter;
      return matchSearch && matchOutcome;
    });
  }, [search, outcomeFilter]);

  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const totalPages = Math.ceil(filtered.length / PER_PAGE);

  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex items-center flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3" style={{ color: '#5A5A7A' }} />
          <input
            className="input-base pl-9"
            placeholder="Search by name, phone, campaign..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>

        <div className="flex gap-1">
          {OUTCOME_FILTERS.map(f => (
            <button
              key={f}
              onClick={() => { setOutcomeFilter(f); setPage(1); }}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize"
              style={{
                background: outcomeFilter === f ? 'rgba(99,102,241,0.2)' : '#1E1E35',
                color: outcomeFilter === f ? '#6366F1' : '#9898B3',
                border: `1px solid ${outcomeFilter === f ? 'rgba(99,102,241,0.3)' : '#2A2A40'}`,
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid #2A2A40' }}>
          <h3 className="font-semibold text-sm" style={{ color: '#F1F1F5' }}>
            Call History
            <span className="ml-2 text-xs font-normal" style={{ color: '#5A5A7A' }}>({filtered.length} results)</span>
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Contact</th>
                <th>Phone</th>
                <th>Campaign</th>
                <th>Duration</th>
                <th>Outcome</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12" style={{ color: '#5A5A7A' }}>No calls match your filters</td></tr>
              ) : paginated.map((call, i) => (
                <motion.tr
                  key={call.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => setSelectedCall(call)}
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
                  <td style={{ color: '#9898B3', fontFamily: 'monospace', fontSize: 12 }}>{maskPhone(call.phone)}</td>
                  <td style={{ color: '#9898B3' }}>
                    <span className="max-w-[140px] truncate block">{call.campaign_name}</span>
                  </td>
                  <td style={{ color: '#9898B3' }}>{formatDuration(call.duration_seconds)}</td>
                  <td><StatusBadge status={call.outcome} /></td>
                  <td style={{ color: '#5A5A7A', fontSize: 12 }}>{formatRelativeTime(call.started_at)}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3" style={{ borderTop: '1px solid #2A2A40' }}>
            <span className="text-xs" style={{ color: '#5A5A7A' }}>
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-ghost px-3 py-1 text-xs" style={{ opacity: page === 1 ? 0.4 : 1 }}>
                ← Prev
              </button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn-ghost px-3 py-1 text-xs" style={{ opacity: page === totalPages ? 0.4 : 1 }}>
                Next →
              </button>
            </div>
          </div>
        )}
      </div>

      <CallDetailDrawer call={selectedCall} onClose={() => setSelectedCall(null)} />
    </div>
  );
}
