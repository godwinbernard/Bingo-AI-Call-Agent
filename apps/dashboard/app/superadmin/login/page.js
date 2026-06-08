'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldAlert, Eye, EyeOff, AlertCircle, Phone } from 'lucide-react';
import { apiFetch } from '@/lib/api';

function BingoLogo() {
  return (
    <div className="flex items-center gap-2.5">
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
          boxShadow: '0 2px 12px rgba(99,102,241,0.35)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Phone size={16} color="#fff" strokeWidth={2} />
      </div>
      <span style={{ fontWeight: 700, fontSize: 17, color: '#F1F1F5', letterSpacing: '-0.01em' }}>
        Bingo AI
      </span>
    </div>
  );
}

export default function SuperadminLoginPage() {
  const router = useRouter();
  const [secret, setSecret] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);

  const isLocked = attempts >= 5;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!secret.trim() || isLocked) return;

    setLoading(true);
    setError('');

    try {
      await apiFetch('/api/superadmin/unlock', {
        method: 'POST',
        body: JSON.stringify({ secret: secret.trim() }),
      });
      router.push('/superadmin');
    } catch (err) {
      const next = attempts + 1;
      setAttempts(next);
      setError(
        next >= 5
          ? 'Too many failed attempts. This session is locked.'
          : err.message || 'Invalid superadmin secret. Access denied.',
      );
      setSecret('');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: '#0A0A14' }}
    >
      {/* Subtle glow */}
      <div
        style={{
          position: 'fixed',
          top: '30%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 500,
          height: 300,
          background: 'radial-gradient(ellipse, rgba(239,68,68,0.05) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <div className="w-full max-w-md relative">
        <div
          style={{
            background: '#151525',
            border: '1px solid rgba(239,68,68,0.15)',
            borderRadius: 20,
            padding: '40px 40px 36px',
            boxShadow: '0 32px 64px rgba(0,0,0,0.7), 0 0 0 1px rgba(239,68,68,0.08)',
          }}
        >
          {/* Header */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="mb-5">
              <BingoLogo />
            </div>

            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
              style={{
                background: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.22)',
              }}
            >
              <ShieldAlert size={24} style={{ color: '#EF4444' }} strokeWidth={1.75} />
            </div>

            <div
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full mb-4 text-xs font-semibold tracking-wider uppercase"
              style={{
                background: 'rgba(239,68,68,0.08)',
                color: '#EF4444',
                border: '1px solid rgba(239,68,68,0.18)',
              }}
            >
              Restricted access
            </div>

            <h1
              className="text-xl font-bold mb-1.5"
              style={{ color: '#F1F1F5', letterSpacing: '-0.02em' }}
            >
              Superadmin portal
            </h1>
            <p className="text-sm max-w-xs" style={{ color: '#9898B3' }}>
              This is a highly privileged internal system. All access attempts are logged and audited.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                className="block text-xs font-semibold mb-2 tracking-wider uppercase"
                style={{ color: '#5A5A7A' }}
                htmlFor="superadmin-secret"
              >
                Superadmin secret
              </label>
              <div className="relative">
                <input
                  id="superadmin-secret"
                  type={showSecret ? 'text' : 'password'}
                  value={secret}
                  onChange={(e) => setSecret(e.target.value)}
                  placeholder="Enter superadmin secret"
                  className="input-base"
                  style={{
                    paddingRight: 44,
                    borderColor: isLocked ? 'rgba(239,68,68,0.35)' : undefined,
                  }}
                  disabled={isLocked}
                  autoFocus
                  autoComplete="off"
                />
                <button
                  type="button"
                  onClick={() => setShowSecret((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: '#5A5A7A', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
                  tabIndex={-1}
                  disabled={isLocked}
                >
                  {showSecret ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div
                className="flex items-start gap-2.5 p-3 rounded-lg"
                style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}
              >
                <AlertCircle size={15} style={{ color: '#EF4444', flexShrink: 0, marginTop: 1 }} />
                <p className="text-sm" style={{ color: '#EF4444' }}>{error}</p>
              </div>
            )}

            {!isLocked && attempts > 0 && attempts < 5 && (
              <p className="text-xs" style={{ color: '#9898B3' }}>
                {5 - attempts} attempt{5 - attempts !== 1 ? 's' : ''} remaining before lockout.
              </p>
            )}

            <button
              type="submit"
              disabled={loading || !secret.trim() || isLocked}
              style={{
                width: '100%',
                background: isLocked ? '#2A2A40' : 'rgba(239,68,68,0.85)',
                color: isLocked ? '#5A5A7A' : '#fff',
                padding: '11px 20px',
                borderRadius: 10,
                fontWeight: 500,
                fontSize: 14,
                border: 'none',
                cursor: isLocked ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                transition: 'background 0.15s',
                marginTop: 4,
              }}
            >
              {loading ? (
                <>
                  <span
                    style={{
                      width: 14, height: 14, borderRadius: '50%',
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderTopColor: '#fff',
                      animation: 'spin 0.6s linear infinite',
                      display: 'inline-block',
                    }}
                  />
                  Verifying…
                </>
              ) : isLocked ? (
                'Session locked'
              ) : (
                'Access superadmin portal'
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-7 pt-6 flex items-center justify-center" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <Link
              href="/admin/login"
              className="text-xs"
              style={{ color: '#5A5A7A' }}
            >
              ← Admin login
            </Link>
          </div>
        </div>

        <p className="text-center text-xs mt-5" style={{ color: '#3A3A35' }}>
          Unauthorized access is a violation of Bingo AI policy and may be subject to legal action.
        </p>
      </div>

      <style jsx global>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
