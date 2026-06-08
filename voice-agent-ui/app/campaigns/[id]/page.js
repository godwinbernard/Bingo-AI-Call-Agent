'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Pause, Play, Square, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import StatusBadge from '@/components/shared/StatusBadge';
import CallDetailDrawer from '@/components/calls/CallDetailDrawer';
import { MOCK_CAMPAIGNS, MOCK_CALLS } from '@/lib/mockData';
import { formatDuration, formatRelativeTime, maskPhone } from '@/lib/utils';

const OUTCOME_EMOJIS = { success: '✅', voicemail: '📭', 'no-answer': '📵', rejected: '❌', busy: '⏳', in_progress: '🔄' };
const OUTCOME_COLORS = { success: '#22C55E', voicemail: '#6366F1', 'no-answer': '#F59E0B', rejected: '#EF4444', busy: '#F97316' };

function CircularProgress({ pct, label, sublabel }) {
  const r = 70;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;

  return (
    <div className="flex flex-col items-center">
      <svg width={180} height={180} className="-rotate-90">
        <circle cx={90} cy={90} r={r} fill="none" stroke="#2A2A40" strokeWidth={12} />
        <motion.circle
          cx={90} cy={90} r={r} fill="none"
          stroke="url(#progressGrad)" strokeWidth={12}
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - dash }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
        <defs>
          <linearGradient id="progressGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#6366F1" />
            <stop offset="100%" stopColor="#818CF8" />
          </linearGradient>
        </defs>
      </svg>
      <div className="text-center -mt-[100px]">
        <div className="text-3xl font-bold" style={{ color: '#F1F1F5' }}>{pct}%</div>
        <div className="text-sm" style={{ color: '#9898B3' }}>{label}</div>
        <div className="text-xs mt-1" style={{ color: '#5A5A7A' }}>{sublabel}</div>
      </div>
    </div>
  );
}

export default function CampaignDetailPage({ params }) {
  const id = params.id;
  const campaign = MOCK_CAMPAIGNS.find(c => c.id === id) || MOCK_CAMPAIGNS[0];
  const calls = MOCK_CALLS.filter(c => c.campaign_id === id).slice(0, 20);
  const pct = Math.round((campaign.calls_made / campaign.total_contacts) * 100);
  const [selectedCall, setSelectedCall] = useState(null);
  const [status, setStatus] = useState(campaign.status);

  const outcomeData = [
    { name: 'Success', value: campaign.calls_success, fill: '#22C55E' },
    { name: 'Voicemail', value: campaign.calls_voicemail, fill: '#6366F1' },
    { name: 'No Answer', value: campaign.calls_no_answer, fill: '#F59E0B' },
    { name: 'Rejected', value: campaign.calls_rejected, fill: '#EF4444' },
  ];

  const liveFeed = [
    { emoji: '✅', name: 'John Smith', detail: '2m 34s — Success', time: '2s ago', color: '#22C55E' },
    { emoji: '📭', name: 'Sara Lee', detail: 'Voicemail left', time: '15s ago', color: '#6366F1' },
    { emoji: '🔄', name: 'Alice Wu', detail: 'In progress...', time: 'live', color: '#F59E0B', live: true },
    { emoji: '❌', name: 'Bob Jones', detail: 'Rejected', time: '1m ago', color: '#EF4444' },
    { emoji: '📵', name: 'Tom Blake', detail: 'No answer', time: '2m ago', color: '#F59E0B' },
  ];

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/campaigns">
            <button className="p-2 rounded-lg btn-ghost"><ArrowLeft size={16} /></button>
          </Link>
          <div>
            <h1 className="text-xl font-bold" style={{ color: '#F1F1F5' }}>{campaign.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <StatusBadge status={status} />
              <span className="text-xs" style={{ color: '#5A5A7A' }}>
                {campaign.calls_made} / {campaign.total_contacts} calls
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          {status === 'active' && <>
            <button onClick={() => setStatus('paused')} className="btn-ghost"><Pause size={14} /> Pause</button>
            <button onClick={() => setStatus('completed')} className="btn-danger"><Square size={14} /> Stop</button>
          </>}
          {status === 'paused' && (
            <button onClick={() => setStatus('active')} className="btn-primary"><Play size={14} /> Resume</button>
          )}
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT */}
        <div className="flex flex-col gap-4">
          <div className="glass-card p-5 flex justify-center">
            <CircularProgress pct={pct} label={`${campaign.calls_made} calls`} sublabel={`of ${campaign.total_contacts} total`} />
          </div>

          <div className="glass-card p-5">
            <h3 className="font-semibold text-sm mb-4" style={{ color: '#F1F1F5' }}>Outcome Breakdown</h3>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={outcomeData} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2A40" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: '#5A5A7A', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#5A5A7A', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#1A1A2E', border: '1px solid #2A2A40', borderRadius: 8 }}
                  labelStyle={{ color: '#F1F1F5' }}
                  itemStyle={{ color: '#9898B3' }}
                />
                <Bar dataKey="value" radius={[4,4,0,0]}>
                  {outcomeData.map((d, i) => (
                    <Cell key={i} fill={d.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* RIGHT: Live feed */}
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="font-semibold text-sm" style={{ color: '#F1F1F5' }}>Live Call Feed</h3>
            <span className="status-dot-live" />
          </div>
          <div className="flex flex-col gap-2">
            {liveFeed.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-3 py-2 px-3 rounded-xl"
                style={{ background: '#1E1E35' }}
              >
                <span className="text-lg">{item.emoji}</span>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium" style={{ color: '#F1F1F5' }}>{item.name}</span>
                  <span className="text-xs ml-2" style={{ color: item.color }}>{item.detail}</span>
                </div>
                <span className="text-xs flex-shrink-0" style={{ color: item.live ? '#22C55E' : '#5A5A7A' }}>
                  {item.live ? <span className="flex items-center gap-1"><span className="status-dot-live" />live</span> : item.time}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Calls table */}
      <div className="glass-card overflow-hidden">
        <div className="px-5 py-4" style={{ borderBottom: '1px solid #2A2A40' }}>
          <h3 className="font-semibold text-sm" style={{ color: '#F1F1F5' }}>All Calls in Campaign</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead><tr><th>Name</th><th>Phone</th><th>Duration</th><th>Outcome</th><th>Time</th></tr></thead>
            <tbody>
              {calls.length === 0
                ? <tr><td colSpan={5} className="text-center py-8" style={{ color: '#5A5A7A' }}>No calls yet</td></tr>
                : calls.map(call => (
                  <tr key={call.id} onClick={() => setSelectedCall(call)}>
                    <td className="font-medium">{call.first_name} {call.last_name}</td>
                    <td style={{ color: '#9898B3', fontFamily: 'monospace', fontSize: 12 }}>{maskPhone(call.phone)}</td>
                    <td style={{ color: '#9898B3' }}>{formatDuration(call.duration_seconds)}</td>
                    <td><StatusBadge status={call.outcome} /></td>
                    <td style={{ color: '#5A5A7A', fontSize: 12 }}>{formatRelativeTime(call.started_at)}</td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>

      <CallDetailDrawer call={selectedCall} onClose={() => setSelectedCall(null)} />
    </div>
  );
}
