'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Pause, Square, Play, ChevronRight } from 'lucide-react';
import StatusBadge from '@/components/shared/StatusBadge';
import { formatDate, formatPercent } from '@/lib/utils';

export default function CampaignCard({ campaign, onPause, onStop, onResume }) {
  const pct = Math.round((campaign.calls_made / campaign.total_contacts) * 100);

  const metaStats = [
    { label: 'Done', value: campaign.calls_made, color: '#9898B3' },
    { label: 'Success', value: campaign.calls_success, color: '#22C55E' },
    { label: 'Voicemail', value: campaign.calls_voicemail, color: '#6366F1' },
    { label: 'No Ans', value: campaign.calls_no_answer, color: '#F59E0B' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01, y: -2 }}
      transition={{ duration: 0.2 }}
      className="glass-card p-5 relative overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <StatusBadge status={campaign.status} />
        </div>
        <div className="flex items-center gap-1">
          {campaign.status === 'active' && (
            <>
              <button
                onClick={() => onPause?.(campaign.id)}
                className="p-1.5 rounded-lg transition-colors"
                style={{ color: '#9898B3', background: '#1E1E35' }}
                title="Pause"
              >
                <Pause size={13} />
              </button>
              <button
                onClick={() => onStop?.(campaign.id)}
                className="p-1.5 rounded-lg transition-colors"
                style={{ color: '#9898B3', background: '#1E1E35' }}
                title="Stop"
              >
                <Square size={13} />
              </button>
            </>
          )}
          {campaign.status === 'paused' && (
            <button
              onClick={() => onResume?.(campaign.id)}
              className="p-1.5 rounded-lg transition-colors"
              style={{ color: '#22C55E', background: 'rgba(34,197,94,0.1)' }}
              title="Resume"
            >
              <Play size={13} />
            </button>
          )}
        </div>
      </div>

      <Link href={`/campaigns/${campaign.id}`}>
        <h3 className="font-semibold text-base mb-1 hover:text-indigo-400 transition-colors" style={{ color: '#F1F1F5' }}>
          {campaign.name}
        </h3>
      </Link>
      <p className="text-xs mb-4" style={{ color: '#5A5A7A' }}>Created {formatDate(campaign.created_at)}</p>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs" style={{ color: '#9898B3' }}>
            {campaign.calls_made.toLocaleString()} / {campaign.total_contacts.toLocaleString()} calls
          </span>
          <span className="text-xs font-semibold" style={{ color: '#6366F1' }}>{pct}%</span>
        </div>
        <div className="progress-bar">
          <motion.div
            className="progress-bar-fill"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
          />
        </div>
      </div>

      {/* Mini stats */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {metaStats.map(s => (
          <div key={s.label} className="text-center p-2 rounded-xl" style={{ background: '#1E1E35' }}>
            <div className="text-base font-bold tabular-nums" style={{ color: s.color }}>
              {s.value}
            </div>
            <div className="text-[10px] mt-0.5" style={{ color: '#5A5A7A' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <span className="text-xs" style={{ color: '#5A5A7A' }}>
          Script: {campaign.script_name}
        </span>
        <Link href={`/campaigns/${campaign.id}`}>
          <span className="text-xs flex items-center gap-1" style={{ color: '#6366F1' }}>
            View details <ChevronRight size={12} />
          </span>
        </Link>
      </div>
    </motion.div>
  );
}
