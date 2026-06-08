'use client';

import { useEffect, useState } from 'react';
import { DollarSign, Search, Building2, Gift, Clock, TrendingUp, AlertTriangle, Check, X, ChevronDown } from 'lucide-react';
import { apiFetch } from '@/lib/api';

const TIERS = ['STARTER', 'GROWTH', 'ENTERPRISE', 'PAY_AS_YOU_GO'];
const TIER_COLORS = { STARTER: '#818CF8', GROWTH: '#22C55E', ENTERPRISE: '#F59E0B', PAY_AS_YOU_GO: '#9898B3' };

function Modal({ title, children, onClose }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
      <div style={{ background: '#1A1A2E', border: '1px solid #2A2A40', borderRadius: 16, padding: 24, width: '100%', maxWidth: 480, position: 'relative', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
        <div className="flex items-center justify-between mb-5">
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#F1F1F5' }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#5A5A7A', display: 'flex', alignItems: 'center' }}><X size={16} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function OrgCard({ org, onAction }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ background: '#1E1E35', border: '1px solid #2A2A40', borderRadius: 12 }}>
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3 min-w-0">
          <div style={{ width: 36, height: 36, borderRadius: 9, background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Building2 size={15} style={{ color: '#F59E0B' }} strokeWidth={1.75} />
          </div>
          <div className="min-w-0">
            <p style={{ fontSize: 13.5, fontWeight: 600, color: '#F1F1F5' }} className="truncate">{org.name}</p>
            <div className="flex items-center gap-2">
              <span style={{ fontSize: 10, fontWeight: 600, color: TIER_COLORS[org.subscription_tier] || '#9898B3', background: `${TIER_COLORS[org.subscription_tier] || '#9898B3'}14`, padding: '1px 6px', borderRadius: 10 }}>
                {org.subscription_tier?.replace('_', ' ')}
              </span>
              {org.comp && <span style={{ fontSize: 10, color: '#22C55E', fontWeight: 600 }}>COMPED</span>}
              {org.trial_end && new Date(org.trial_end) > new Date() && (
                <span style={{ fontSize: 10, color: '#818CF8' }}>Trial until {new Date(org.trial_end).toLocaleDateString()}</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button onClick={() => setOpen(!open)} className="btn-ghost flex items-center gap-1.5" style={{ fontSize: 12, padding: '5px 10px' }}>
            Actions <ChevronDown size={11} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
          </button>
        </div>
      </div>

      {open && (
        <div className="flex flex-wrap gap-2 p-4 pt-0">
          {[
            { id: 'comp', label: 'Comp account', Icon: Gift, color: '#22C55E' },
            { id: 'trial', label: 'Extend trial', Icon: Clock, color: '#818CF8' },
            { id: 'tier', label: 'Change tier', Icon: TrendingUp, color: '#F59E0B' },
            { id: 'mrr', label: 'Adjust MRR', Icon: DollarSign, color: '#6366F1' },
          ].map(({ id, label, Icon, color }) => (
            <button
              key={id}
              onClick={() => { onAction(id, org); setOpen(false); }}
              className="flex items-center gap-1.5"
              style={{ fontSize: 12, padding: '6px 12px', borderRadius: 8, background: `${color}10`, border: `1px solid ${color}25`, color, cursor: 'pointer' }}
            >
              <Icon size={12} strokeWidth={1.75} />
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function BillingOverridesPage() {
  const [orgs, setOrgs] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // { action, org }
  const [form, setForm] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    apiFetch('/api/superadmin/orgs')
      .then((d) => { setOrgs(d.organizations || []); setFiltered(d.organizations || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const q = query.toLowerCase();
    setFiltered(orgs.filter((o) => !q || o.name.toLowerCase().includes(q)));
  }, [query, orgs]);

  function openModal(action, org) {
    setForm(action === 'tier' ? { tier: org.subscription_tier } : action === 'mrr' ? { mrr: org.mrr_override || '' } : action === 'trial' ? { days: 30 } : {});
    setModal({ action, org });
  }

  async function handleSubmit() {
    setSubmitting(true);
    try {
      await apiFetch('/api/superadmin/billing-override', {
        method: 'POST',
        body: JSON.stringify({ organizationId: modal.org.id, action: modal.action, ...form }),
      });
      // Optimistic update
      setOrgs((prev) => prev.map((o) => {
        if (o.id !== modal.org.id) return o;
        if (modal.action === 'comp') return { ...o, comp: true };
        if (modal.action === 'tier') return { ...o, subscription_tier: form.tier };
        if (modal.action === 'mrr') return { ...o, mrr_override: form.mrr };
        if (modal.action === 'trial') return { ...o, trial_end: new Date(Date.now() + form.days * 86400000).toISOString() };
        return o;
      }));
      setModal(null);
      setToast(`Override applied to ${modal.org.name}`);
      setTimeout(() => setToast(''), 3000);
    } catch (err) {
      setToast(err.message || 'Failed to apply override');
      setTimeout(() => setToast(''), 3000);
    } finally {
      setSubmitting(false);
    }
  }

  const ACTION_LABELS = { comp: 'Comp Account', trial: 'Extend Trial', tier: 'Change Tier', mrr: 'Adjust MRR Override' };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#F1F1F5', letterSpacing: '-0.02em' }}>Billing Overrides</h1>
        <p style={{ fontSize: 13, color: '#9898B3', marginTop: 2 }}>Comp accounts, extend trials, change tiers, and adjust MRR. All changes are logged.</p>
      </div>

      {/* Warning */}
      <div className="flex items-start gap-3 p-4 rounded-xl" style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)' }}>
        <AlertTriangle size={15} style={{ color: '#EF4444', flexShrink: 0, marginTop: 1 }} />
        <p style={{ fontSize: 12.5, color: '#9898B3', lineHeight: 1.65 }}>
          <strong style={{ color: '#F1F1F5' }}>These changes take effect immediately and bypass Stripe.</strong> MRR adjustments affect reported revenue metrics but do not change what the customer is charged. Tier changes override Clerk organization metadata.
        </p>
      </div>

      {/* Search */}
      <div style={{ position: 'relative' }}>
        <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#5A5A7A' }} />
        <input className="input-base" style={{ paddingLeft: 36 }} placeholder="Search organizations…" value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 72, borderRadius: 12 }} />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16"><Building2 size={28} style={{ color: '#3A3A55', margin: '0 auto 8px' }} /><p style={{ fontSize: 13, color: '#5A5A7A' }}>No organizations found</p></div>
      ) : (
        <div className="space-y-2">{filtered.map((org) => <OrgCard key={org.id} org={org} onAction={openModal} />)}</div>
      )}

      {/* Modals */}
      {modal && (
        <Modal title={`${ACTION_LABELS[modal.action]} — ${modal.org.name}`} onClose={() => setModal(null)}>
          <div className="space-y-4">
            {modal.action === 'comp' && (
              <p style={{ fontSize: 13, color: '#9898B3', lineHeight: 1.65 }}>
                This will mark <strong style={{ color: '#F1F1F5' }}>{modal.org.name}</strong> as a comped account. No Stripe charges will be applied and all plan features will be unlocked. This is stored in the database and does not modify the Stripe subscription.
              </p>
            )}
            {modal.action === 'trial' && (
              <div>
                <label className="label-base" style={{ marginBottom: 6, display: 'block' }}>Extend trial by (days)</label>
                <input className="input-base" type="number" min={1} max={365} value={form.days} onChange={(e) => setForm({ days: Number(e.target.value) })} />
                <p style={{ fontSize: 11, color: '#5A5A7A', marginTop: 6 }}>
                  New trial end: {new Date(Date.now() + (form.days || 0) * 86400000).toLocaleDateString()}
                </p>
              </div>
            )}
            {modal.action === 'tier' && (
              <div>
                <label className="label-base" style={{ marginBottom: 6, display: 'block' }}>New tier</label>
                <div className="grid grid-cols-2 gap-2">
                  {TIERS.map((tier) => (
                    <button
                      key={tier}
                      onClick={() => setForm({ tier })}
                      style={{
                        padding: '10px 12px', borderRadius: 9, cursor: 'pointer', textAlign: 'left', fontSize: 12,
                        border: `1px solid ${form.tier === tier ? TIER_COLORS[tier] : '#2A2A40'}`,
                        background: form.tier === tier ? `${TIER_COLORS[tier]}10` : '#2A2A40',
                        color: form.tier === tier ? TIER_COLORS[tier] : '#9898B3',
                        fontWeight: form.tier === tier ? 600 : 400,
                      }}
                    >
                      {form.tier === tier && <Check size={11} style={{ display: 'inline', marginRight: 4 }} />}
                      {tier.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {modal.action === 'mrr' && (
              <div>
                <label className="label-base" style={{ marginBottom: 6, display: 'block' }}>MRR override (USD/month)</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#5A5A7A', fontSize: 13 }}>$</span>
                  <input className="input-base" style={{ paddingLeft: 24 }} type="number" min={0} placeholder="0.00" value={form.mrr} onChange={(e) => setForm({ mrr: e.target.value })} />
                </div>
                <p style={{ fontSize: 11, color: '#5A5A7A', marginTop: 6 }}>Affects revenue reporting only. Does not change what Stripe charges.</p>
              </div>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setModal(null)} className="btn-ghost" style={{ fontSize: 13, padding: '8px 16px' }}>Cancel</button>
              <button onClick={handleSubmit} disabled={submitting} className="btn-primary flex items-center gap-2" style={{ fontSize: 13, padding: '8px 16px', background: modal.action === 'comp' ? 'rgba(34,197,94,0.15)' : undefined, borderColor: modal.action === 'comp' ? 'rgba(34,197,94,0.3)' : undefined, color: modal.action === 'comp' ? '#22C55E' : undefined }}>
                {submitting ? <span style={{ width: 12, height: 12, borderRadius: '50%', border: '2px solid #3A3A55', borderTopColor: '#fff', animation: 'spin 0.6s linear infinite', display: 'inline-block' }} /> : null}
                Apply override
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, background: '#1E1E35', border: '1px solid #2A2A40', borderRadius: 10, padding: '12px 16px', fontSize: 13, color: '#F1F1F5', boxShadow: '0 8px 24px rgba(0,0,0,0.4)', zIndex: 2000, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Check size={14} style={{ color: '#22C55E' }} />
          {toast}
        </div>
      )}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
