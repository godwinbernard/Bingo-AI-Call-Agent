'use client';

import { use } from 'react';
import Link from 'next/link';
import { ArrowLeft, PhoneOff, PhoneCall, Clock, User } from 'lucide-react';
import { LiveTranscriptPanel } from '@/components/dialer/LiveTranscriptPanel';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

function CallTimer({ startedAt }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const base = startedAt ? (Date.now() - new Date(startedAt).getTime()) / 1000 : 0;
    setElapsed(Math.floor(base));

    const interval = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, [startedAt]);

  const m = Math.floor(elapsed / 60);
  const s = elapsed % 60;
  return (
    <span style={{ fontVariantNumeric: 'tabular-nums', fontSize: 13, color: '#9898B3' }}>
      {String(m).padStart(2, '0')}:{String(s).padStart(2, '0')}
    </span>
  );
}

export default function DialerCallPage({ params }) {
  const { callId } = use(params);
  const [call, setCall] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch(`/api/dialer/call/${callId}`)
      .then((data) => setCall(data.call || data))
      .catch(() => setCall(null))
      .finally(() => setLoading(false));
  }, [callId]);

  return (
    <div style={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Top bar */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <Link
            href="/calls"
            className="flex items-center gap-1.5 text-sm"
            style={{ color: '#9898B3' }}
          >
            <ArrowLeft size={14} />
            Calls
          </Link>

          <div style={{ width: 1, height: 16, background: '#2A2A40' }} />

          {/* Contact info */}
          <div className="flex items-center gap-2.5">
            <div
              style={{
                width: 32, height: 32, borderRadius: '50%',
                background: 'linear-gradient(135deg, #6366F1, #818CF8)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <User size={14} color="#fff" strokeWidth={2} />
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#F1F1F5' }}>
                {call?.contact?.name || 'Unknown contact'}
              </p>
              <p style={{ fontSize: 11, color: '#9898B3' }}>
                {call?.contact?.phone || callId}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Clock size={13} style={{ color: '#9898B3' }} />
            <CallTimer startedAt={call?.started_at} />
          </div>

          {/* Active call indicator */}
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
            style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}
          >
            <PhoneCall size={12} style={{ color: '#22C55E' }} strokeWidth={2} />
            <span style={{ fontSize: 11, fontWeight: 600, color: '#22C55E' }}>Active</span>
          </div>

          <button
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
            style={{
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.25)',
              color: '#EF4444',
              fontSize: 12,
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            <PhoneOff size={13} strokeWidth={2} />
            End call
          </button>
        </div>
      </div>

      {/* Main panels */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 360px', gap: 16, minHeight: 0 }}>
        {/* Transcript */}
        <LiveTranscriptPanel
          callId={callId}
          agentId={call?.agent_id}
          orgId={call?.org_id}
          className="h-full"
        />

        {/* Right panel placeholder — AI Hints (Prompt 5) */}
        <div
          style={{
            background: '#1A1A2E',
            border: '1px solid #2A2A40',
            borderRadius: 16,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '12px 16px',
              borderBottom: '1px solid #2A2A40',
              flexShrink: 0,
            }}
          >
            <span style={{ fontSize: 12, fontWeight: 600, color: '#F1F1F5', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              AI Hints
            </span>
          </div>
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 24,
            }}
          >
            <p style={{ fontSize: 12.5, color: '#5A5A7A', textAlign: 'center', lineHeight: 1.6 }}>
              AI coaching hints will appear here during the call.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
