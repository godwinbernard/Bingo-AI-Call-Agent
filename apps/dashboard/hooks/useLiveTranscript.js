'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';

const FILLER_WORDS = new Set([
  'um', 'uh', 'like', 'you know', 'so', 'actually', 'basically',
  'literally', 'right', 'okay', 'well', 'i mean',
]);

function countFillers(text) {
  if (!text) return 0;
  const lower = text.toLowerCase();
  return Array.from(FILLER_WORDS).filter((w) => lower.includes(w)).length;
}

/**
 * @param {string} callId
 * @param {{ agentId?: string, orgId?: string }} identity
 */
export function useLiveTranscript(callId, identity = {}) {
  const [segments, setSegments] = useState([]);
  const [currentSpeaker, setCurrentSpeaker] = useState(null);
  const [agentMs, setAgentMs] = useState(0);
  const [contactMs, setContactMs] = useState(0);
  const [fillerWordCount, setFillerWordCount] = useState(0);
  const [sentimentSum, setSentimentSum] = useState(0);
  const [sentimentCount, setSentimentCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [callStatus, setCallStatus] = useState('idle');

  const socketRef = useRef(null);
  const speakerStartRef = useRef(null);
  const lastSpeakerRef = useRef(null);
  const bottomRef = useRef(null);

  // Auto-scroll to newest segment
  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (!callId) return;

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';

    const socket = io(backendUrl, {
      transports: ['websocket', 'polling'],
      auth: {
        agentId: identity.agentId || '',
        orgId: identity.orgId || '',
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      socket.emit('join_call', { callId });
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('joined', ({ callId: joinedId }) => {
      console.log('[Transcript] Joined call room', joinedId);
    });

    socket.on('transcript_update', (data) => {
      const { speaker, text, is_final, confidence, sentiment, start } = data;
      if (!text?.trim()) return;

      setCurrentSpeaker(speaker);

      // Track speaker timing
      const now = Date.now();
      if (lastSpeakerRef.current !== speaker) {
        if (lastSpeakerRef.current && speakerStartRef.current) {
          const elapsed = now - speakerStartRef.current;
          if (lastSpeakerRef.current === 'AGENT') setAgentMs((ms) => ms + elapsed);
          else if (lastSpeakerRef.current === 'CONTACT') setContactMs((ms) => ms + elapsed);
        }
        speakerStartRef.current = now;
        lastSpeakerRef.current = speaker;
      }

      if (is_final) {
        setFillerWordCount((n) => n + countFillers(text));
        if (typeof sentiment === 'number') {
          setSentimentSum((s) => s + sentiment);
          setSentimentCount((c) => c + 1);
        }
      }

      setSegments((prev) => {
        // Replace last interim segment for this speaker, or add a new one
        const last = prev[prev.length - 1];
        if (last && !last.is_final && last.speaker === speaker) {
          const updated = [...prev];
          updated[updated.length - 1] = {
            ...last,
            text,
            is_final,
            confidence: confidence ?? last.confidence,
            sentiment: sentiment ?? last.sentiment,
          };
          return updated;
        }
        return [
          ...prev,
          {
            id: `${callId}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
            speaker,
            text,
            is_final,
            confidence: confidence ?? 0,
            sentiment: sentiment ?? 0,
            timestamp: start ?? Date.now() / 1000,
          },
        ];
      });

      scrollToBottom();
    });

    socket.on('call_status', ({ status }) => {
      setCallStatus(status);
    });

    return () => {
      socket.emit('leave_call', { callId });
      socket.disconnect();
      socketRef.current = null;
    };
  }, [callId, identity.agentId, identity.orgId, scrollToBottom]);

  const totalMs = agentMs + contactMs;
  const agentTalkPercent = totalMs > 0 ? Math.round((agentMs / totalMs) * 100) : 0;
  const contactTalkPercent = totalMs > 0 ? Math.round((contactMs / totalMs) * 100) : 0;
  const avgSentiment = sentimentCount > 0 ? sentimentSum / sentimentCount : 0;

  return {
    segments,
    currentSpeaker,
    agentTalkPercent,
    contactTalkPercent,
    fillerWordCount,
    avgSentiment,
    isConnected,
    callStatus,
    bottomRef,
  };
}
