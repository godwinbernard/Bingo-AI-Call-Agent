'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check, Bot, User } from 'lucide-react';
import { useState } from 'react';
import StatusBadge from '@/components/shared/StatusBadge';
import { formatPhone, formatDuration, formatDateTime } from '@/lib/utils';

export default function CallDetailDrawer({ call, onClose }) {
  const [copied, setCopied] = useState(false);

  function copyTranscript() {
    if (!call?.transcript) return;
    const text = call.transcript.map(m => `${m.role === 'assistant' ? 'Agent' : 'Contact'}: ${m.content}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <AnimatePresence>
      {call && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40"
            style={{ background: 'rgba(0,0,0,0.6)' }}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 400, damping: 40 }}
            className="fixed right-0 top-0 h-full z-50 flex flex-col overflow-hidden"
            style={{ width: 420, background: '#12121F', borderLeft: '1px solid #2A2A40' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 flex-shrink-0" style={{ borderBottom: '1px solid #2A2A40' }}>
              <div>
                <h2 className="font-semibold text-base" style={{ color: '#F1F1F5' }}>
                  {call.first_name} {call.last_name}
                </h2>
                <p className="text-sm mt-0.5" style={{ color: '#9898B3' }}>
                  {formatPhone(call.phone)}
                </p>
              </div>
              <button onClick={onClose} className="p-2 rounded-lg" style={{ color: '#5A5A7A', background: '#1E1E35' }}>
                <X size={16} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
              {/* Meta */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Campaign', value: call.campaign_name },
                  { label: 'Duration', value: formatDuration(call.duration_seconds) },
                  { label: 'Date', value: formatDateTime(call.started_at) },
                  { label: 'Outcome', value: <StatusBadge status={call.outcome} size="sm" /> },
                ].map(({ label, value }) => (
                  <div key={label} className="p-3 rounded-xl" style={{ background: '#1E1E35', border: '1px solid #2A2A40' }}>
                    <div className="text-xs mb-1" style={{ color: '#5A5A7A' }}>{label}</div>
                    <div className="text-sm font-medium" style={{ color: '#F1F1F5' }}>{value}</div>
                  </div>
                ))}
              </div>

              {/* Transcript */}
              {call.transcript?.length > 0 ? (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold" style={{ color: '#F1F1F5' }}>Transcript</h4>
                    <motion.button
                      onClick={copyTranscript}
                      whileTap={{ scale: 0.9 }}
                      className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg"
                      style={{ background: '#1E1E35', border: '1px solid #2A2A40', color: copied ? '#22C55E' : '#9898B3' }}
                    >
                      {copied ? <Check size={12} /> : <Copy size={12} />}
                      {copied ? 'Copied!' : 'Copy'}
                    </motion.button>
                  </div>

                  <div className="flex flex-col gap-3">
                    {call.transcript.map((msg, i) => {
                      const isAgent = msg.role === 'assistant';
                      return (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className={`flex gap-2.5 ${isAgent ? 'flex-row' : 'flex-row-reverse'}`}
                        >
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                            style={{
                              background: isAgent ? 'rgba(99,102,241,0.2)' : 'rgba(34,197,94,0.12)',
                              border: `1px solid ${isAgent ? 'rgba(99,102,241,0.3)' : 'rgba(34,197,94,0.2)'}`,
                            }}
                          >
                            {isAgent
                              ? <Bot size={14} style={{ color: '#6366F1' }} />
                              : <User size={14} style={{ color: '#22C55E' }} />
                            }
                          </div>

                          <div className="flex flex-col gap-1 max-w-[85%]">
                            {msg.timestamp && (
                              <span className={`text-[10px] ${isAgent ? 'text-left' : 'text-right'}`} style={{ color: '#5A5A7A' }}>
                                {isAgent ? 'Alex' : call.first_name} · {msg.timestamp}
                              </span>
                            )}
                            <div
                              className="px-3 py-2 rounded-2xl text-sm"
                              style={{
                                background: isAgent ? 'rgba(99,102,241,0.12)' : '#1E1E35',
                                border: `1px solid ${isAgent ? 'rgba(99,102,241,0.2)' : '#2A2A40'}`,
                                color: '#F1F1F5',
                                lineHeight: 1.5,
                                borderTopLeftRadius: isAgent ? 4 : 16,
                                borderTopRightRadius: isAgent ? 16 : 4,
                              }}
                            >
                              {msg.content}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8" style={{ color: '#5A5A7A' }}>
                  <p className="text-sm">No transcript available</p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
