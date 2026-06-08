'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';

export default function AdminRevenuePage() {
  const [secret, setSecret] = useState('');
  const [loading, setLoading] = useState(true);
  const [unlocked, setUnlocked] = useState(false);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState('');

  async function loadRevenue() {
    setLoading(true);
    setError('');
    try {
      const response = await apiFetch('/api/admin/revenue');
      setSummary(response);
      setUnlocked(true);
    } catch (requestError) {
      if (requestError.status !== 401) {
        setError(requestError.message || 'Failed to load revenue summary');
      }
      setUnlocked(false);
      setSummary(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRevenue();
  }, []);

  async function unlock() {
    setError('');
    try {
      await apiFetch('/api/admin/unlock', {
        method: 'POST',
        body: JSON.stringify({ secret }),
      });
      await loadRevenue();
    } catch (requestError) {
      setError(requestError.message || 'Invalid admin secret');
    }
  }

  if (loading) {
    return (
      <div className="max-w-xl mx-auto glass-card p-8">
        <h1 className="text-2xl font-semibold">Revenue</h1>
        <p className="mt-2 text-slate-400">Loading protected revenue metrics…</p>
      </div>
    );
  }

  if (!unlocked) {
    return (
      <div className="glass-card p-8 max-w-xl mx-auto space-y-4">
        <h1 className="text-2xl font-semibold">Admin Access Required</h1>
        <p className="text-slate-400">Unlock the admin session to view revenue metrics.</p>
        <input className="input-base w-full" type="password" value={secret} onChange={(event) => setSecret(event.target.value)} placeholder="Admin secret" />
        {error ? <p className="text-sm text-red-400">{error}</p> : null}
        <button className="btn-primary" onClick={unlock}>Unlock</button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Revenue</h1>
          <p className="text-slate-400 text-sm mt-1">Platform revenue summary from the admin data service.</p>
        </div>
        <Link href="/admin" className="btn-ghost">Back to overview</Link>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {[
          ['MRR', summary?.mrr || '—'],
          ['Active orgs', summary?.activeOrganizations?.toLocaleString() || '—'],
          ['Trials', summary?.trialOrganizations?.toLocaleString() || '—'],
          ['Churned', summary?.churnedOrganizations?.toLocaleString() || '—'],
        ].map(([label, value]) => (
          <div key={label} className="glass-card p-5">
            <p className="text-sm text-slate-400">{label}</p>
            <p className="text-2xl font-semibold mt-2">{value}</p>
          </div>
        ))}
      </div>

      <div className="glass-card p-6">
        <p className="text-slate-400">MRR, churn, and LTV charts go here.</p>
        <div className="mt-6 h-64 rounded-xl bg-slate-900/60 grid place-items-center text-slate-500">
          LTV: {summary?.ltvEstimate || '—'}
        </div>
      </div>
    </div>
  );
}
