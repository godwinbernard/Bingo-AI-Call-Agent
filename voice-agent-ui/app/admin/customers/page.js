'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';

export default function AdminCustomersPage() {
  const [secret, setSecret] = useState('');
  const [loading, setLoading] = useState(true);
  const [unlocked, setUnlocked] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [error, setError] = useState('');

  async function loadCustomers() {
    setLoading(true);
    setError('');
    try {
      const response = await apiFetch('/api/admin/customers');
      setCustomers(response.customers || []);
      setUnlocked(true);
    } catch (requestError) {
      if (requestError.status !== 401) {
        setError(requestError.message || 'Failed to load customers');
      }
      setUnlocked(false);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCustomers();
  }, []);

  async function unlock() {
    setError('');
    try {
      await apiFetch('/api/admin/unlock', {
        method: 'POST',
        body: JSON.stringify({ secret }),
      });
      await loadCustomers();
    } catch (requestError) {
      setError(requestError.message || 'Invalid admin secret');
    }
  }

  if (loading) {
    return (
      <div className="max-w-xl mx-auto glass-card p-8">
        <h1 className="text-2xl font-semibold">Customers</h1>
        <p className="mt-2 text-slate-400">Loading protected customer rows…</p>
      </div>
    );
  }

  if (!unlocked) {
    return (
      <div className="glass-card p-8 max-w-xl mx-auto space-y-4">
        <h1 className="text-2xl font-semibold">Admin Access Required</h1>
        <p className="text-slate-400">Unlock the admin session to view customer accounts.</p>
        <input className="input-base w-full" type="password" value={secret} onChange={(event) => setSecret(event.target.value)} placeholder="Admin secret" />
        {error ? <p className="text-sm text-red-400">{error}</p> : null}
        <button className="btn-primary" onClick={unlock}>Unlock</button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Customers</h1>
          <p className="text-slate-400 text-sm mt-1">Live organization rows from the admin data service.</p>
        </div>
        <Link href="/admin" className="btn-ghost">Back to overview</Link>
      </div>

      <div className="glass-card p-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-slate-400">
            <tr className="text-left border-b border-slate-800">
              <th className="py-3">Org</th>
              <th className="py-3">Plan</th>
              <th className="py-3">MRR</th>
              <th className="py-3">Calls Used</th>
              <th className="py-3">Status</th>
              <th className="py-3">Joined</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <tr key={customer.name} className="border-b border-slate-900">
                <td className="py-3">{customer.name}</td>
                <td className="py-3">{customer.plan}</td>
                <td className="py-3">{customer.mrr}</td>
                <td className="py-3">{customer.calls}</td>
                <td className="py-3">
                  <span className="badge">{customer.status}</span>
                </td>
                <td className="py-3">{customer.joined}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
