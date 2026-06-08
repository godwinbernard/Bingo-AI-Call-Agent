'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Shield, Eye, EyeOff, AlertCircle, Phone } from 'lucide-react';
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

export default function AdminLoginPage() {
  const router = useRouter();
  const [secret, setSecret] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!secret.trim()) return;

    setLoading(true);
    setError('');

    try {
      await apiFetch('/api/admin/unlock', {
        method: 'POST',
        body: JSON.stringify({ secret: secret.trim() }),
      });
      router.push('/admin');
    } catch (err) {
      setError(err.message || 'Invalid admin secret. Access denied.');
      setSecret('');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: '#0F0F1A' }}
    >
      {/* Background glow */}
      <div
        style={{
          position: 'fixed',
          top: '30%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 600,
          height: 400,
          background: 'radial-gradient(ellipse, rgba(99,102,241,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <div className="w-full max-w-md relative">
        {/* Card */}
        <div
          style={{
            background: '#1A1A2E',
            border: '1px solid #2A2A40',
            borderRadius: 20,
            padding: '40px 40px 36px',
            boxShadow: '0 32px 64px rgba(0,0,0,0.6)',
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
                background: 'rgba(99,102,241,0.1)',
                border: '1px solid rgba(99,102,241,0.25)',
              }}
            >
              <Shield size={24} style={{ color: '#818CF8' }} strokeWidth={1.75} />
            </div>

            <h1
              className="text-xl font-bold mb-1.5"
              style={{ color: '#F1F1F5', letterSpacing: '-0.02em' }}
            >
              Admin access
            </h1>
            <p className="text-sm" style={{ color: '#9898B3' }}>
              This area is restricted to authorized Bingo AI administrators.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                className="block text-xs font-semibold mb-2 tracking-wider uppercase"
                style={{ color: '#5A5A7A' }}
                htmlFor="admin-secret"
              >
                Admin secret
              </label>
              <div className="relative">
                <input
                  id="admin-secret"
                  type={showSecret ? 'text' : 'password'}
                  value={secret}
                  onChange={(e) => setSecret(e.target.value)}
                  placeholder="Enter admin secret key"
                  className="input-base"
                  style={{ paddingRight: 44 }}
                  autoFocus
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowSecret((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: '#5A5A7A', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
                  tabIndex={-1}
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

            <button
              type="submit"
              disabled={loading || !secret.trim()}
              className="btn-primary w-full justify-center"
              style={{ borderRadius: 10, padding: '11px 20px', fontSize: 14, marginTop: 4 }}
            >
              {loading ? (
                <span className="flex items-center gap-2">
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
                </span>
              ) : (
                'Access admin dashboard'
              )}
            </button>
          </form>

          {/* Footer links */}
          <div className="mt-7 pt-6 flex items-center justify-between" style={{ borderTop: '1px solid #2A2A40' }}>
            <Link
              href="/sign-in"
              className="text-xs"
              style={{ color: '#5A5A7A' }}
            >
              ← User sign-in
            </Link>
            <Link
              href="/superadmin/login"
              className="text-xs"
              style={{ color: '#5A5A7A' }}
            >
              Superadmin →
            </Link>
          </div>
        </div>

        {/* Bottom note */}
        <p className="text-center text-xs mt-5" style={{ color: '#3A3A55' }}>
          Unauthorized access attempts are logged and monitored.
        </p>
      </div>

      <style jsx global>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
