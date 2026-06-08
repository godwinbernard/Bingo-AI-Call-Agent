'use client';

import { useEffect, useState } from 'react';
import { Flag, Globe, Building2, Search, Save, RotateCcw, Info } from 'lucide-react';
import { apiFetch } from '@/lib/api';

const DEFAULT_FLAGS = [
  { key: 'human_dialer', label: 'Human Dialer', description: 'Enable the Twilio-powered human dialer and real-time transcript panel.', category: 'Core', risk: 'low' },
  { key: 'ai_scorecard', label: 'AI Call Scoring', description: 'Generate AI-powered call scorecards after each call using Claude.', category: 'AI', risk: 'low' },
  { key: 'ai_hints', label: 'Live AI Hints', description: 'Show real-time coaching hints to agents during active calls.', category: 'AI', risk: 'low' },
  { key: 'live_transcript', label: 'Live Transcript', description: 'Stream real-time call transcripts via Deepgram to the dashboard.', category: 'Core', risk: 'low' },
  { key: 'call_recording', label: 'Call Recording', description: 'Record calls and store audio in S3.', category: 'Compliance', risk: 'medium' },
  { key: 'dnc_scrubbing', label: 'DNC Scrubbing', description: 'Automatically scrub contact lists against the National DNC Registry.', category: 'Compliance', risk: 'low' },
  { key: 'api_keys', label: 'API Key Management', description: 'Allow organizations to create API keys for programmatic access.', category: 'Platform', risk: 'medium' },
  { key: 'team_invitations', label: 'Team Invitations', description: 'Enable team member invitations by email.', category: 'Platform', risk: 'low' },
  { key: 'billing_portal', label: 'Billing Portal', description: 'Show the Stripe billing portal link in settings.', category: 'Billing', risk: 'low' },
  { key: 'usage_overage', label: 'Usage Overage', description: 'Allow calls beyond the plan limit with per-minute overage billing.', category: 'Billing', risk: 'high' },
  { key: 'multi_concurrent', label: 'Multi-Concurrent Calls', description: 'Enable running more than 1 concurrent AI call per org.', category: 'Core', risk: 'medium' },
  { key: 'beta_features', label: 'Beta Features', description: 'Enable unreleased beta features for this org.', category: 'Platform', risk: 'high' },
];

const RISK_COLORS = { low: '#22C55E', medium: '#F59E0B', high: '#EF4444' };
const CATEGORY_COLORS = { Core: '#6366F1', AI: '#8B5CF6', Compliance: '#22C55E', Platform: '#818CF8', Billing: '#F59E0B' };

function Toggle({ checked, onChange, disabled }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      style={{
        width: 40, height: 22, borderRadius: 11, cursor: disabled ? 'not-allowed' : 'pointer',
        background: checked ? '#6366F1' : '#2A2A40', border: 'none', position: 'relative',
        transition: 'background 0.2s', flexShrink: 0, opacity: disabled ? 0.5 : 1,
      }}
    >
      <span style={{
        position: 'absolute', top: 3, left: checked ? 21 : 3, width: 16, height: 16,
        borderRadius: '50%', background: '#fff', transition: 'left 0.2s',
        boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
      }} />
    </button>
  );
}

export default function FeatureFlagsPage() {
  const [globalFlags, setGlobalFlags] = useState({});
  const [orgOverrides, setOrgOverrides] = useState({});
  const [orgs, setOrgs] = useState([]);
  const [selectedOrg, setSelectedOrg] = useState('');
  const [orgSearch, setOrgSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('global');

  useEffect(() => {
    Promise.all([
      apiFetch('/api/superadmin/flags').catch(() => ({ global: {}, orgOverrides: {} })),
      apiFetch('/api/superadmin/orgs').catch(() => ({ organizations: [] })),
    ]).then(([flagData, orgData]) => {
      const defaults = Object.fromEntries(DEFAULT_FLAGS.map((f) => [f.key, true]));
      setGlobalFlags({ ...defaults, ...(flagData.global || {}) });
      setOrgOverrides(flagData.orgOverrides || {});
      setOrgs(orgData.organizations || []);
    }).finally(() => setLoading(false));
  }, []);

  async function saveFlags() {
    setSaving(true);
    try {
      await apiFetch('/api/superadmin/flags', {
        method: 'POST',
        body: JSON.stringify({ global: globalFlags, orgOverrides }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch { /* silent */ }
    finally { setSaving(false); }
  }

  function setGlobal(key, val) {
    setGlobalFlags((f) => ({ ...f, [key]: val }));
  }

  function setOrgFlag(orgId, key, val) {
    setOrgOverrides((o) => ({
      ...o,
      [orgId]: { ...(o[orgId] || {}), [key]: val },
    }));
  }

  function resetOrgOverride(orgId, key) {
    setOrgOverrides((o) => {
      const next = { ...o, [orgId]: { ...(o[orgId] || {}) } };
      delete next[orgId][key];
      if (!Object.keys(next[orgId]).length) delete next[orgId];
      return next;
    });
  }

  const filteredOrgs = orgs.filter((o) => !orgSearch || o.name.toLowerCase().includes(orgSearch.toLowerCase()));
  const selectedOrgData = orgs.find((o) => o.id === selectedOrg);

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#F1F1F5', letterSpacing: '-0.02em' }}>Feature Flags</h1>
          <p style={{ fontSize: 13, color: '#9898B3', marginTop: 2 }}>Control platform features globally or per organization.</p>
        </div>
        <button onClick={saveFlags} disabled={saving} className="btn-primary flex items-center gap-2" style={{ fontSize: 13, padding: '8px 16px' }}>
          <Save size={13} />
          {saving ? 'Saving…' : saved ? 'Saved ✓' : 'Save changes'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl" style={{ background: '#1A1A2E', border: '1px solid #2A2A40', width: 'fit-content' }}>
        {[
          { id: 'global', label: 'Global defaults', Icon: Globe },
          { id: 'org', label: 'Per-org overrides', Icon: Building2 },
        ].map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 9,
              fontSize: 13, fontWeight: 500, cursor: 'pointer', border: 'none',
              background: activeTab === id ? '#2A2A40' : 'transparent',
              color: activeTab === id ? '#F1F1F5' : '#9898B3',
              transition: 'all 0.15s',
            }}
          >
            <Icon size={13} strokeWidth={1.75} />
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3,4,5].map(i => <div key={i} className="skeleton" style={{ height: 64, borderRadius: 12 }} />)}</div>
      ) : activeTab === 'global' ? (
        <div className="space-y-2">
          {DEFAULT_FLAGS.map((flag) => (
            <div key={flag.key} className="flex items-center justify-between gap-4 p-4 rounded-xl"
              style={{ background: '#1E1E35', border: '1px solid #2A2A40' }}>
              <div className="flex items-start gap-3 min-w-0">
                <div style={{ marginTop: 2 }}>
                  <Toggle checked={!!globalFlags[flag.key]} onChange={(v) => setGlobal(flag.key, v)} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span style={{ fontSize: 13.5, fontWeight: 600, color: '#F1F1F5' }}>{flag.label}</span>
                    <span style={{ fontSize: 10, fontWeight: 600, color: CATEGORY_COLORS[flag.category], background: `${CATEGORY_COLORS[flag.category]}14`, padding: '1px 6px', borderRadius: 10 }}>
                      {flag.category}
                    </span>
                    <span style={{ fontSize: 10, color: RISK_COLORS[flag.risk], fontWeight: 500 }}>
                      {flag.risk} risk
                    </span>
                  </div>
                  <p style={{ fontSize: 12, color: '#5A5A7A', lineHeight: 1.5 }}>{flag.description}</p>
                </div>
              </div>
              <code style={{ fontSize: 11, color: '#5A5A7A', background: '#2A2A40', padding: '2px 6px', borderRadius: 5, flexShrink: 0 }}>{flag.key}</code>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-[240px_1fr] gap-4">
          {/* Org picker */}
          <div className="space-y-2">
            <div style={{ position: 'relative' }}>
              <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#5A5A7A' }} />
              <input className="input-base" style={{ paddingLeft: 30, fontSize: 12, padding: '8px 8px 8px 30px' }} placeholder="Search orgs…" value={orgSearch} onChange={e => setOrgSearch(e.target.value)} />
            </div>
            <div className="space-y-1" style={{ maxHeight: 480, overflowY: 'auto' }}>
              {filteredOrgs.map((org) => (
                <button
                  key={org.id}
                  onClick={() => setSelectedOrg(org.id)}
                  style={{
                    width: '100%', textAlign: 'left', padding: '8px 10px', borderRadius: 8,
                    background: selectedOrg === org.id ? 'rgba(99,102,241,0.1)' : 'transparent',
                    border: `1px solid ${selectedOrg === org.id ? 'rgba(99,102,241,0.25)' : 'transparent'}`,
                    cursor: 'pointer',
                  }}
                >
                  <p style={{ fontSize: 12.5, fontWeight: 500, color: '#F1F1F5' }} className="truncate">{org.name}</p>
                  <p style={{ fontSize: 11, color: '#5A5A7A' }}>{orgOverrides[org.id] ? `${Object.keys(orgOverrides[org.id]).length} override(s)` : 'No overrides'}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Flag overrides */}
          {!selectedOrg ? (
            <div className="flex flex-col items-center justify-center py-20 glass-card">
              <Building2 size={24} style={{ color: '#3A3A55', marginBottom: 8 }} />
              <p style={{ fontSize: 13, color: '#5A5A7A' }}>Select an organization to configure overrides</p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-3">
                <p style={{ fontSize: 13, fontWeight: 600, color: '#F1F1F5' }}>{selectedOrgData?.name}</p>
                <span style={{ fontSize: 11, color: '#5A5A7A' }}>— overrides global defaults when set</span>
              </div>
              {DEFAULT_FLAGS.map((flag) => {
                const orgVal = orgOverrides[selectedOrg]?.[flag.key];
                const hasOverride = orgVal !== undefined;
                const effectiveVal = hasOverride ? orgVal : globalFlags[flag.key];
                return (
                  <div key={flag.key} className="flex items-center justify-between gap-4 p-4 rounded-xl"
                    style={{ background: hasOverride ? 'rgba(99,102,241,0.05)' : '#1E1E35', border: `1px solid ${hasOverride ? 'rgba(99,102,241,0.2)' : '#2A2A40'}` }}>
                    <div className="flex items-center gap-3 min-w-0">
                      <Toggle checked={!!effectiveVal} onChange={(v) => setOrgFlag(selectedOrg, flag.key, v)} />
                      <div>
                        <span style={{ fontSize: 13, fontWeight: 500, color: '#F1F1F5' }}>{flag.label}</span>
                        {hasOverride && <span style={{ fontSize: 10, color: '#818CF8', marginLeft: 6, fontWeight: 600 }}>OVERRIDE</span>}
                        {!hasOverride && <span style={{ fontSize: 10, color: '#5A5A7A', marginLeft: 6 }}>inherited</span>}
                      </div>
                    </div>
                    {hasOverride && (
                      <button onClick={() => resetOrgOverride(selectedOrg, flag.key)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#5A5A7A', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11 }}>
                        <RotateCcw size={11} /> Reset
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
