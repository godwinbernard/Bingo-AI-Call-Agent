'use client';

import { useEffect, useState } from 'react';
import { Search, Users, LogIn, AlertTriangle, ExternalLink, X, Building2 } from 'lucide-react';
import { apiFetch } from '@/lib/api';

const TIER_COLORS = { STARTER: '#818CF8', GROWTH: '#22C55E', ENTERPRISE: '#F59E0B', PAY_AS_YOU_GO: '#9898B3' };

function OrgRow({ org, onImpersonate, impersonating }) {
  return (
    <div className="flex items-center justify-between gap-4 p-4 rounded-xl glass-card-hover"
      style={{ background: '#1E1E35', border: '1px solid #2A2A40' }}>
      <div className="flex items-center gap-3 min-w-0">
        <div style={{ width: 36, height: 36, borderRadius: 9, background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Building2 size={16} style={{ color: '#818CF8' }} strokeWidth={1.75} />
        </div>
        <div className="min-w-0">
          <p style={{ fontSize: 13.5, fontWeight: 600, color: '#F1F1F5' }} className="truncate">{org.name}</p>
          <p style={{ fontSize: 11, color: '#5A5A7A' }}>{org.slug} · {org.memberCount} member{org.memberCount !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-shrink-0">
        <span style={{ fontSize: 11, fontWeight: 600, color: TIER_COLORS[org.subscription_tier] || '#9898B3', background: `${TIER_COLORS[org.subscription_tier] || '#9898B3'}14`, padding: '2px 8px', borderRadius: 20 }}>
          {org.subscription_tier?.replace('_', ' ')}
        </span>
        <button
          onClick={() => onImpersonate(org)}
          disabled={impersonating === org.id}
          className="btn-ghost flex items-center gap-1.5"
          style={{ fontSize: 12, padding: '6px 12px' }}
        >
          {impersonating === org.id
            ? <span style={{ width: 12, height: 12, borderRadius: '50%', border: '2px solid #3A3A55', borderTopColor: '#818CF8', animation: 'spin 0.6s linear infinite', display: 'inline-block' }} />
            : <LogIn size={12} />}
          Impersonate
        </button>
      </div>
    </div>
  );
}

export default function ImpersonationPage() {
  const [orgs, setOrgs] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [impersonating, setImpersonating] = useState(null);
  const [activeSession, setActiveSession] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    apiFetch('/api/superadmin/orgs')
      .then((data) => { setOrgs(data.organizations || []); setFiltered(data.organizations || []); })
      .catch(() => setOrgs([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const q = query.toLowerCase();
    setFiltered(orgs.filter((o) => !q || o.name.toLowerCase().includes(q) || o.slug.toLowerCase().includes(q) || o.billing_email?.toLowerCase().includes(q)));
  }, [query, orgs]);

  async function handleImpersonate(org) {
    setImpersonating(org.id);
    setError('');
    try {
      const data = await apiFetch('/api/superadmin/impersonate', {
        method: 'POST',
        body: JSON.stringify({ organizationId: org.id }),
      });
      setActiveSession({ org, token: data.token, expiresAt: data.expiresAt });
      // Store token so dashboard API calls include it
      window.localStorage.setItem('voiceagent_impersonation_token', data.token);
    } catch (err) {
      setError(err.message || 'Impersonation failed');
    } finally {
      setImpersonating(null);
    }
  }

  function endSession() {
    window.localStorage.removeItem('voiceagent_impersonation_token');
    setActiveSession(null);
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#F1F1F5', letterSpacing: '-0.02em' }}>User Impersonation</h1>
        <p style={{ fontSize: 13, color: '#9898B3', marginTop: 2 }}>Log in as any organization to debug issues. All actions are logged.</p>
      </div>

      {/* Warning */}
      <div className="flex items-start gap-3 p-4 rounded-xl" style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.18)' }}>
        <AlertTriangle size={15} style={{ color: '#F59E0B', flexShrink: 0, marginTop: 1 }} />
        <p style={{ fontSize: 12.5, color: '#9898B3', lineHeight: 1.65 }}>
          <strong style={{ color: '#F1F1F5' }}>Impersonation is fully audited.</strong> Every action you take while impersonating an organization is recorded against your superadmin session. Use only for legitimate debugging and support purposes.
        </p>
      </div>

      {/* Active session banner */}
      {activeSession && (
        <div className="flex items-center justify-between p-4 rounded-xl" style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.25)' }}>
          <div className="flex items-center gap-3">
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22C55E', animation: 'pulse 2s ease-in-out infinite' }} />
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#F1F1F5' }}>Active impersonation: {activeSession.org.name}</p>
              <p style={{ fontSize: 11, color: '#5A5A7A' }}>Token expires {new Date(activeSession.expiresAt).toLocaleTimeString()}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a href="/dashboard" target="_blank" className="btn-ghost flex items-center gap-1.5" style={{ fontSize: 12, padding: '6px 12px' }}>
              <ExternalLink size={11} /> Open dashboard
            </a>
            <button onClick={endSession} className="flex items-center gap-1.5" style={{ fontSize: 12, padding: '6px 12px', borderRadius: 8, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#EF4444', cursor: 'pointer' }}>
              <X size={11} /> End session
            </button>
          </div>
        </div>
      )}

      {/* Search */}
      <div style={{ position: 'relative' }}>
        <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#5A5A7A' }} />
        <input
          className="input-base"
          style={{ paddingLeft: 36 }}
          placeholder="Search organizations by name, slug, or email…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {error && <p style={{ fontSize: 13, color: '#EF4444' }}>{error}</p>}

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton" style={{ height: 68, borderRadius: 12 }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Users size={28} style={{ color: '#3A3A55', margin: '0 auto 8px' }} />
          <p style={{ fontSize: 13, color: '#5A5A7A' }}>{query ? 'No organizations match your search' : 'No organizations found'}</p>
        </div>
      ) : (
        <div className="space-y-2">
          <p style={{ fontSize: 11, color: '#5A5A7A', marginBottom: 4 }}>{filtered.length} organization{filtered.length !== 1 ? 's' : ''}</p>
          {filtered.map((org) => (
            <OrgRow key={org.id} org={org} onImpersonate={handleImpersonate} impersonating={impersonating} />
          ))}
        </div>
      )}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
    </div>
  );
}
