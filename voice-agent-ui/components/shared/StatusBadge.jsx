'use client';

const STATUS_CONFIG = {
  active:       { bg: 'rgba(34,197,94,0.12)',  color: '#22C55E', dot: '#22C55E',  label: 'Active' },
  completed:    { bg: 'rgba(99,102,241,0.12)', color: '#818CF8', dot: '#6366F1',  label: 'Completed' },
  paused:       { bg: 'rgba(245,158,11,0.12)', color: '#F59E0B', dot: '#F59E0B',  label: 'Paused' },
  failed:       { bg: 'rgba(239,68,68,0.12)',  color: '#EF4444', dot: '#EF4444',  label: 'Failed' },
  success:      { bg: 'rgba(34,197,94,0.12)',  color: '#22C55E', dot: '#22C55E',  label: 'Success' },
  voicemail:    { bg: 'rgba(99,102,241,0.12)', color: '#818CF8', dot: '#6366F1',  label: 'Voicemail' },
  'no-answer':  { bg: 'rgba(245,158,11,0.12)', color: '#F59E0B', dot: '#F59E0B',  label: 'No Answer' },
  rejected:     { bg: 'rgba(239,68,68,0.12)',  color: '#EF4444', dot: '#EF4444',  label: 'Rejected' },
  busy:         { bg: 'rgba(249,115,22,0.12)', color: '#F97316', dot: '#F97316',  label: 'Busy' },
  in_progress:  { bg: 'rgba(99,102,241,0.12)', color: '#818CF8', dot: '#6366F1',  label: 'In Progress' },
  initiated:    { bg: 'rgba(152,152,179,0.12)', color: '#9898B3', dot: '#9898B3', label: 'Initiated' },
  live:         { bg: 'rgba(34,197,94,0.12)',  color: '#22C55E', dot: '#22C55E',  label: 'Live' },
};

export default function StatusBadge({ status, size = 'sm', showDot = true }) {
  const cfg = STATUS_CONFIG[status] || { bg: 'rgba(152,152,179,0.12)', color: '#9898B3', dot: '#9898B3', label: status };
  const fontSize = size === 'lg' ? 13 : 11;
  const padding = size === 'lg' ? '6px 12px' : '3px 8px';

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full font-medium whitespace-nowrap"
      style={{ background: cfg.bg, color: cfg.color, fontSize, padding, fontWeight: 500 }}
    >
      {showDot && (
        <span
          className="flex-shrink-0 rounded-full"
          style={{ width: 6, height: 6, background: cfg.dot }}
        />
      )}
      {cfg.label}
    </span>
  );
}
