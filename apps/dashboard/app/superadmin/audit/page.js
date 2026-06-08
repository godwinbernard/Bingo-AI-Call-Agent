'use client';

import { useEffect, useState, useCallback } from 'react';
import { ScrollText, Search, Filter, Download, ChevronLeft, ChevronRight, ExternalLink, RefreshCw } from 'lucide-react';
import { apiFetch } from '@/lib/api';

const ACTION_COLORS = {
  impersonate: '#818CF8',
  billing_override: '#F59E0B',
  feature_flag: '#22C55E',
  login: '#6366F1',
  logout: '#5A5A7A',
  org_create: '#34D399',
  org_delete: '#EF4444',
  tier_change: '#F59E0B',
  comp_account: '#22C55E',
  trial_extend: '#818CF8',
  call_started: '#6366F1',
  call_ended: '#9898B3',
};

const ACTION_LABELS = {
  impersonate: 'Impersonate',
  billing_override: 'Billing Override',
  feature_flag: 'Feature Flag',
  login: 'Login',
  logout: 'Logout',
  org_create: 'Org Created',
  org_delete: 'Org Deleted',
  tier_change: 'Tier Change',
  comp_account: 'Comp Account',
  trial_extend: 'Trial Extended',
  call_started: 'Call Started',
  call_ended: 'Call Ended',
};

const MOCK_ENTRIES = [
  { id: '1', actor: 'superadmin', action: 'impersonate', target_org: 'Acme Corp', target_org_id: 'org_1', ip: '192.168.1.1', created_at: new Date(Date.now() - 120000).toISOString(), meta: { duration: '12 minutes' } },
  { id: '2', actor: 'superadmin', action: 'tier_change', target_org: 'Beta Industries', target_org_id: 'org_2', ip: '192.168.1.1', created_at: new Date(Date.now() - 3600000).toISOString(), meta: { from: 'STARTER', to: 'GROWTH' } },
  { id: '3', actor: 'superadmin', action: 'comp_account', target_org: 'Startup XYZ', target_org_id: 'org_3', ip: '192.168.1.1', created_at: new Date(Date.now() - 7200000).toISOString(), meta: {} },
  { id: '4', actor: 'superadmin', action: 'feature_flag', target_org: 'Acme Corp', target_org_id: 'org_1', ip: '192.168.1.1', created_at: new Date(Date.now() - 86400000).toISOString(), meta: { flag: 'beta_features', value: true } },
  { id: '5', actor: 'superadmin', action: 'login', target_org: null, target_org_id: null, ip: '192.168.1.1', created_at: new Date(Date.now() - 90000000).toISOString(), meta: {} },
  { id: '6', actor: 'superadmin', action: 'trial_extend', target_org: 'Early Bird Co', target_org_id: 'org_4', ip: '192.168.1.1', created_at: new Date(Date.now() - 172800000).toISOString(), meta: { days: 30 } },
  { id: '7', actor: 'superadmin', action: 'billing_override', target_org: 'Enterprise Inc', target_org_id: 'org_5', ip: '192.168.1.1', created_at: new Date(Date.now() - 259200000).toISOString(), meta: { mrr: 4999 } },
];

function formatRelative(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 2) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

function MetaChip({ meta }) {
  const entries = Object.entries(meta || {});
  if (!entries.length) return null;
  return (
    <div className="flex flex-wrap gap-1 mt-1">
      {entries.map(([k, v]) => (
        <span key={k} style={{ fontSize: 10, color: '#9898B3', background: '#2A2A40', padding: '1px 6px', borderRadius: 6 }}>
          {k}: <strong style={{ color: '#F1F1F5' }}>{String(v)}</strong>
        </span>
      ))}
    </div>
  );
}

export default function AuditLogPage() {
  const [entries, setEntries] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const PER_PAGE = 25;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: PER_PAGE });
      if (search) params.set('q', search);
      if (actionFilter) params.set('action', actionFilter);
      const data = await apiFetch(`/api/superadmin/audit?${params}`);
      setEntries(data.entries || []);
      setTotal(data.total || 0);
    } catch {
      setEntries(MOCK_ENTRIES.filter((e) => {
        if (search && !e.target_org?.toLowerCase().includes(search.toLowerCase()) && !e.action.includes(search)) return false;
        if (actionFilter && e.action !== actionFilter) return false;
        return true;
      }));
      setTotal(MOCK_ENTRIES.length);
    } finally {
      setLoading(false);
    }
  }, [page, search, actionFilter]);

  useEffect(() => { load(); }, [load]);

  const totalPages = Math.ceil(total / PER_PAGE);

  function exportCSV() {
    const rows = [['Time', 'Actor', 'Action', 'Organization', 'IP', 'Meta']];
    entries.forEach((e) => rows.push([new Date(e.created_at).toISOString(), e.actor, e.action, e.target_org || '', e.ip, JSON.stringify(e.meta)]));
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `audit-log-page${page}.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="max-w-5xl space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#F1F1F5', letterSpacing: '-0.02em' }}>Audit Log</h1>
          <p style={{ fontSize: 13, color: '#9898B3', marginTop: 2 }}>All superadmin and system actions across every organization.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load} disabled={loading} className="btn-ghost flex items-center gap-1.5" style={{ fontSize: 12, padding: '7px 12px' }}>
            <RefreshCw size={12} style={{ animation: loading ? 'spin 0.8s linear infinite' : 'none' }} />
            Refresh
          </button>
          <button onClick={exportCSV} className="btn-ghost flex items-center gap-1.5" style={{ fontSize: 12, padding: '7px 12px' }}>
            <Download size={12} /> Export CSV
          </button>
        </div>
      </div>

      {/* Search + filter bar */}
      <div className="flex gap-2">
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#5A5A7A' }} />
          <input className="input-base" style={{ paddingLeft: 36 }} placeholder="Search by org name, action, or IP…" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <button onClick={() => setShowFilters(!showFilters)} className="btn-ghost flex items-center gap-1.5" style={{ fontSize: 12, padding: '7px 12px', background: showFilters ? 'rgba(99,102,241,0.08)' : undefined, borderColor: showFilters ? 'rgba(99,102,241,0.2)' : undefined }}>
          <Filter size={12} /> Filters {actionFilter && <span style={{ fontSize: 10, color: '#818CF8', fontWeight: 700 }}>•</span>}
        </button>
      </div>

      {showFilters && (
        <div className="flex flex-wrap gap-2 p-4 rounded-xl" style={{ background: '#1A1A2E', border: '1px solid #2A2A40' }}>
          <p style={{ fontSize: 11, color: '#5A5A7A', marginRight: 4, alignSelf: 'center' }}>Action:</p>
          {['', ...Object.keys(ACTION_LABELS)].map((a) => (
            <button
              key={a}
              onClick={() => { setActionFilter(a); setPage(1); }}
              style={{
                fontSize: 11, padding: '4px 10px', borderRadius: 20, cursor: 'pointer', border: 'none',
                background: actionFilter === a ? 'rgba(99,102,241,0.15)' : '#2A2A40',
                color: actionFilter === a ? '#818CF8' : '#9898B3',
                fontWeight: actionFilter === a ? 600 : 400,
              }}
            >
              {a ? ACTION_LABELS[a] : 'All'}
            </button>
          ))}
        </div>
      )}

      {/* Table */}
      <div style={{ background: '#1A1A2E', border: '1px solid #2A2A40', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr 120px 90px', padding: '10px 16px', borderBottom: '1px solid #2A2A40' }}>
          {['Time', 'Action & Details', 'Organization', 'IP'].map((h) => (
            <span key={h} style={{ fontSize: 10, fontWeight: 600, color: '#5A5A7A', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{h}</span>
          ))}
        </div>

        {loading ? (
          <div className="space-y-0">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '140px 1fr 120px 90px', padding: '12px 16px', borderBottom: '1px solid #2A2A40' }}>
                {[1,2,3,4].map(j => <div key={j} className="skeleton" style={{ height: 14, borderRadius: 6, marginRight: 12 }} />)}
              </div>
            ))}
          </div>
        ) : entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <ScrollText size={24} style={{ color: '#3A3A55', marginBottom: 8 }} />
            <p style={{ fontSize: 13, color: '#5A5A7A' }}>No audit entries found</p>
          </div>
        ) : (
          entries.map((entry, i) => {
            const color = ACTION_COLORS[entry.action] || '#9898B3';
            const label = ACTION_LABELS[entry.action] || entry.action;
            return (
              <div
                key={entry.id}
                style={{ display: 'grid', gridTemplateColumns: '140px 1fr 120px 90px', padding: '11px 16px', borderBottom: i < entries.length - 1 ? '1px solid #1E1E35' : 'none', alignItems: 'start' }}
              >
                <div>
                  <p style={{ fontSize: 12, color: '#9898B3', fontVariantNumeric: 'tabular-nums' }}>{formatRelative(entry.created_at)}</p>
                  <p style={{ fontSize: 10, color: '#5A5A7A' }}>{new Date(entry.created_at).toLocaleTimeString()}</p>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span style={{ fontSize: 11, fontWeight: 600, color, background: `${color}14`, padding: '1px 7px', borderRadius: 10, flexShrink: 0 }}>{label}</span>
                    <span style={{ fontSize: 12, color: '#9898B3' }}>{entry.actor}</span>
                  </div>
                  <MetaChip meta={entry.meta} />
                </div>
                <div>
                  {entry.target_org ? (
                    <p style={{ fontSize: 12, color: '#F1F1F5' }} className="truncate">{entry.target_org}</p>
                  ) : (
                    <span style={{ fontSize: 11, color: '#5A5A7A' }}>—</span>
                  )}
                </div>
                <p style={{ fontSize: 11, color: '#5A5A7A', fontVariantNumeric: 'tabular-nums' }}>{entry.ip}</p>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p style={{ fontSize: 12, color: '#5A5A7A' }}>
            Page {page} of {totalPages} · {total.toLocaleString()} entries
          </p>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="btn-ghost flex items-center gap-1" style={{ fontSize: 12, padding: '6px 10px', opacity: page === 1 ? 0.4 : 1 }}>
              <ChevronLeft size={13} /> Prev
            </button>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn-ghost flex items-center gap-1" style={{ fontSize: 12, padding: '6px 10px', opacity: page === totalPages ? 0.4 : 1 }}>
              Next <ChevronRight size={13} />
            </button>
          </div>
        </div>
      )}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
