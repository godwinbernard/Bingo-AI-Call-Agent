import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatDuration(seconds) {
  if (!seconds) return '—';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s.toString().padStart(2, '0')}s`;
}

export function formatPhone(phone) {
  if (!phone) return '—';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    const n = cleaned.slice(1);
    return `+1 (${n.slice(0,3)}) ${n.slice(3,6)}-${n.slice(6)}`;
  }
  return phone;
}

export function maskPhone(phone) {
  if (!phone) return '—';
  const formatted = formatPhone(phone);
  return formatted.replace(/(\d{3})\d{3}(\d{4})/, '$1***$2');
}

export function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

export function formatDateTime(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('en-US', {
    month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true,
  });
}

export function formatRelativeTime(dateStr) {
  if (!dateStr) return '—';
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'Just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return formatDate(dateStr);
}

export function formatNumber(n) {
  if (n === null || n === undefined) return '—';
  return n.toLocaleString();
}

export function formatPercent(value, total) {
  if (!total) return '0%';
  return `${Math.round((value / total) * 100)}%`;
}

export const OUTCOME_COLORS = {
  success: '#22C55E',
  voicemail: '#6366F1',
  'no-answer': '#F59E0B',
  rejected: '#EF4444',
  busy: '#F97316',
  failed: '#EF4444',
  completed: '#22C55E',
  'in_progress': '#6366F1',
  initiated: '#9898B3',
};

export const OUTCOME_LABELS = {
  success: 'Success',
  voicemail: 'Voicemail',
  'no-answer': 'No Answer',
  rejected: 'Rejected',
  busy: 'Busy',
  failed: 'Failed',
  completed: 'Completed',
  in_progress: 'In Progress',
  initiated: 'Initiated',
  natural_close: 'Completed',
  dnc_requested: 'DNC Request',
  max_turns_reached: 'Completed',
};
