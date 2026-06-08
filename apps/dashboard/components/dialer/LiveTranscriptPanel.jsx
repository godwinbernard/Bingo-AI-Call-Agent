'use client';

import { useRef, useEffect } from 'react';
import { Mic2, User, Radio, Wifi, WifiOff } from 'lucide-react';
import { useLiveTranscript } from '@/hooks/useLiveTranscript';

const AGENT_COLOR = '#6366F1';
const CONTACT_COLOR = '#F1F1F5';
const INTERIM_OPACITY = 0.55;

function formatTimestamp(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function ConfidenceBar({ confidence, color }) {
  const pct = Math.round((confidence ?? 0) * 100);
  return (
    <div className="flex items-center gap-1.5 mt-1">
      <div
        style={{
          flex: 1,
          height: 3,
          borderRadius: 2,
          background: '#2A2A40',
          overflow: 'hidden',
          maxWidth: 80,
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${pct}%`,
            background: color,
            borderRadius: 2,
            transition: 'width 0.3s ease',
          }}
        />
      </div>
      <span style={{ fontSize: 10, color: '#5A5A7A', fontVariantNumeric: 'tabular-nums' }}>
        {pct}%
      </span>
    </div>
  );
}

function TalkRatioBar({ agentPct, contactPct }) {
  return (
    <div className="flex items-center gap-2">
      <span style={{ fontSize: 11, color: '#9898B3', minWidth: 24 }}>{agentPct}%</span>
      <div
        style={{
          flex: 1,
          height: 4,
          borderRadius: 2,
          background: '#2A2A40',
          overflow: 'hidden',
          display: 'flex',
        }}
      >
        <div
          style={{
            width: `${agentPct}%`,
            background: AGENT_COLOR,
            transition: 'width 0.5s ease',
          }}
        />
        <div
          style={{
            width: `${contactPct}%`,
            background: '#9898B3',
            transition: 'width 0.5s ease',
          }}
        />
      </div>
      <span style={{ fontSize: 11, color: '#9898B3', minWidth: 24, textAlign: 'right' }}>
        {contactPct}%
      </span>
    </div>
  );
}

function TranscriptSegment({ segment }) {
  const isAgent = segment.speaker === 'AGENT';
  const color = isAgent ? AGENT_COLOR : CONTACT_COLOR;
  const opacity = segment.is_final ? 1 : INTERIM_OPACITY;

  return (
    <div
      className="flex gap-2.5 mb-4"
      style={{
        flexDirection: isAgent ? 'row-reverse' : 'row',
        opacity,
        transition: 'opacity 0.2s ease',
      }}
    >
      {/* Avatar */}
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: '50%',
          background: isAgent ? `${AGENT_COLOR}20` : 'rgba(255,255,255,0.07)',
          border: `1px solid ${isAgent ? `${AGENT_COLOR}40` : 'rgba(255,255,255,0.1)'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          marginTop: 2,
        }}
      >
        {isAgent
          ? <Mic2 size={13} style={{ color: AGENT_COLOR }} strokeWidth={1.75} />
          : <User size={13} style={{ color: '#9898B3' }} strokeWidth={1.75} />
        }
      </div>

      {/* Bubble */}
      <div style={{ maxWidth: '75%' }}>
        <div
          style={{
            background: isAgent ? `${AGENT_COLOR}14` : '#1E1E35',
            border: `1px solid ${isAgent ? `${AGENT_COLOR}28` : '#2A2A40'}`,
            borderRadius: isAgent ? '12px 4px 12px 12px' : '4px 12px 12px 12px',
            padding: '8px 12px',
          }}
        >
          <p
            style={{
              fontSize: 13.5,
              lineHeight: 1.6,
              color,
              wordBreak: 'break-word',
            }}
          >
            {segment.text}
            {!segment.is_final && (
              <span
                style={{
                  display: 'inline-block',
                  width: 2,
                  height: 14,
                  background: color,
                  marginLeft: 2,
                  verticalAlign: 'text-bottom',
                  animation: 'blink 0.8s step-end infinite',
                }}
              />
            )}
          </p>
        </div>

        <div
          className="flex items-center gap-2 mt-1 px-1"
          style={{ flexDirection: isAgent ? 'row-reverse' : 'row' }}
        >
          <span style={{ fontSize: 10.5, color: '#5A5A7A', fontVariantNumeric: 'tabular-nums' }}>
            {formatTimestamp(segment.timestamp)}
          </span>
          <ConfidenceBar confidence={segment.confidence} color={color} />
        </div>
      </div>
    </div>
  );
}

function SpeakingIndicator({ speaker }) {
  if (!speaker) return null;
  const isAgent = speaker === 'AGENT';
  return (
    <div
      className="flex items-center gap-2 px-3 py-1.5 rounded-full"
      style={{
        background: isAgent ? `${AGENT_COLOR}12` : 'rgba(255,255,255,0.05)',
        border: `1px solid ${isAgent ? `${AGENT_COLOR}25` : 'rgba(255,255,255,0.08)'}`,
        width: 'fit-content',
      }}
    >
      <div className="flex items-center gap-0.5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: 3,
              height: 3,
              borderRadius: '50%',
              background: isAgent ? AGENT_COLOR : '#9898B3',
              animation: `bounce 0.9s ease-in-out ${i * 0.15}s infinite`,
            }}
          />
        ))}
      </div>
      <span style={{ fontSize: 11, color: isAgent ? AGENT_COLOR : '#9898B3' }}>
        {isAgent ? 'You are speaking' : 'Contact is speaking'}
      </span>
    </div>
  );
}

export function LiveTranscriptPanel({ callId, agentId, orgId, className = '' }) {
  const {
    segments,
    currentSpeaker,
    agentTalkPercent,
    contactTalkPercent,
    fillerWordCount,
    avgSentiment,
    isConnected,
    callStatus,
    bottomRef,
  } = useLiveTranscript(callId, { agentId, orgId });

  const sentimentColor =
    avgSentiment > 0.3 ? '#22C55E' : avgSentiment < -0.3 ? '#EF4444' : '#F59E0B';
  const sentimentLabel =
    avgSentiment > 0.3 ? 'Positive' : avgSentiment < -0.3 ? 'Negative' : 'Neutral';

  return (
    <div
      className={`flex flex-col ${className}`}
      style={{
        background: '#1A1A2E',
        border: '1px solid #2A2A40',
        borderRadius: 16,
        overflow: 'hidden',
        minHeight: 0,
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '12px 16px',
          borderBottom: '1px solid #2A2A40',
          flexShrink: 0,
        }}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span style={{ fontSize: 12, fontWeight: 600, color: '#F1F1F5', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Live Transcript
            </span>
            {isConnected ? (
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22C55E', display: 'inline-block', animation: 'pulse 2s ease-in-out infinite' }} />
                <span style={{ fontSize: 10, fontWeight: 600, color: '#22C55E' }}>LIVE</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                <WifiOff size={10} style={{ color: '#EF4444' }} />
                <span style={{ fontSize: 10, fontWeight: 600, color: '#EF4444' }}>OFFLINE</span>
              </div>
            )}
          </div>

          {/* Sentiment */}
          {segments.length > 0 && (
            <div style={{ fontSize: 11, color: sentimentColor, fontWeight: 500 }}>
              {sentimentLabel}
            </div>
          )}
        </div>

        {/* Talk ratio */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span style={{ fontSize: 10.5, color: '#5A5A7A' }}>You</span>
            <span style={{ fontSize: 10.5, color: '#5A5A7A' }}>Contact</span>
          </div>
          <TalkRatioBar agentPct={agentTalkPercent} contactPct={contactTalkPercent} />
        </div>
      </div>

      {/* Transcript feed */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px 14px',
          minHeight: 0,
          scrollbarWidth: 'thin',
          scrollbarColor: '#3A3A55 transparent',
        }}
      >
        {segments.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: 'rgba(99,102,241,0.08)',
                border: '1px solid rgba(99,102,241,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 12,
              }}
            >
              <Radio size={20} style={{ color: '#6366F1' }} strokeWidth={1.5} />
            </div>
            <p style={{ fontSize: 13, color: '#5A5A7A', lineHeight: 1.6 }}>
              {isConnected
                ? 'Waiting for audio stream…'
                : 'Connecting to live transcript…'}
            </p>
          </div>
        ) : (
          <>
            {segments.map((seg) => (
              <TranscriptSegment key={seg.id} segment={seg} />
            ))}
            <div ref={bottomRef} />
          </>
        )}
      </div>

      {/* Footer — speaking indicator + stats */}
      <div
        style={{
          padding: '10px 14px',
          borderTop: '1px solid #2A2A40',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
        }}
      >
        <SpeakingIndicator speaker={currentSpeaker} />

        <div className="flex items-center gap-3" style={{ marginLeft: 'auto' }}>
          {fillerWordCount > 0 && (
            <span style={{ fontSize: 10.5, color: '#5A5A7A' }}>
              {fillerWordCount} filler{fillerWordCount !== 1 ? 's' : ''}
            </span>
          )}
          <span style={{ fontSize: 10.5, color: '#5A5A7A' }}>
            {segments.filter((s) => s.is_final).length} utterances
          </span>
        </div>
      </div>

      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}
