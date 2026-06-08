'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';

const fallbackStats = [
  ['Total organizations', '—'],
  ['MRR', '—'],
  ['Active trials', '—'],
  ['Churned this month', '—'],
  ['Calls today', '—'],
];

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [unlocked, setUnlocked] = useState(false);
  const [stats, setStats] = useState(fallbackStats);
  const [error, setError] = useState('');

  async function loadOverview() {
    setLoading(true);
    setError('');
    try {
      const overview = await apiFetch('/api/admin/overview');
      setUnlocked(true);
      setStats([
        ['Total organizations', overview.totalOrganizations.toLocaleString()],
        ['MRR', new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(overview.mrr / 100)],
        ['Active trials', overview.activeTrials.toLocaleString()],
        ['Churned this month', overview.churnedThisMonth.toLocaleString()],
        ['Calls today', overview.totalCallsToday.toLocaleString()],
      ]);
    } catch (requestError) {
      if (requestError.status === 401) {
        // Not authenticated — redirect to the dedicated login page
        router.replace('/admin/login');
        return;
      }
      setError(requestError.message || 'Failed to load admin overview');
      setUnlocked(false);
      setStats(fallbackStats);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOverview();
  }, []);

  async function logout() {
    await apiFetch('/api/admin/logout', { method: 'POST' }).catch(() => undefined);
    router.replace('/admin/login');
  }

  if (loading) {
    return (
      <div className="max-w-xl mx-auto glass-card p-8">
        <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
        <p className="mt-2 text-slate-400">Loading protected metrics…</p>
      </div>
    );
  }

  if (!unlocked) {
    return (
      <div className="max-w-md mx-auto glass-card p-8 space-y-4">
        {error && <p className="text-sm text-red-400">{error}</p>}
        <Link href="/admin/login" className="btn-primary">
          Go to admin login
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Platform Overview</h1>
          <p className="text-slate-400 text-sm mt-1">Protected internal dashboard for platform operations.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/customers" className="btn-ghost">Customers</Link>
          <Link href="/admin/revenue" className="btn-ghost">Revenue</Link>
          <button className="btn-primary" onClick={logout}>Lock Admin</button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-5 gap-4">
        {stats.map(([label, value]) => (
          <div key={label} className="glass-card p-5">
            <p className="text-sm text-slate-400">{label}</p>
            <p className="text-2xl font-semibold mt-2">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
