'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { formatCurrency } from '@/lib/billing';

const defaultUsage = { used: 847, limit: 2000, remaining: 1153, percentage: 42, days_until_reset: 14 };

export default function BillingPage() {
  const [usage, setUsage] = useState(defaultUsage);
  const [plan] = useState({ tier: 'GROWTH', price: '$299/month', renews: 'July 7, 2026' });
  const [invoices, setInvoices] = useState([
    { date: 'Jun 7, 2026', amount: 29900, status: 'paid', period: 'May 7 - Jun 7', url: '#' },
  ]);

  useEffect(() => {
    apiFetch('/api/billing/usage')
      .then(setUsage)
      .catch(() => undefined);
  }, []);

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-6">
      <div className="glass-card p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-wide text-slate-400">Current Plan</p>
            <h1 className="text-2xl font-semibold">{plan.tier} Plan</h1>
            <p className="text-sm text-slate-400">{plan.price} • Renews {plan.renews}</p>
          </div>
          <button className="btn-primary">Manage Plan</button>
        </div>
        <div className="mt-6 space-y-2">
          <div className="flex items-center justify-between text-sm text-slate-300">
            <span>Calls this month</span>
            <span>{usage.used} / {usage.limit}</span>
          </div>
          <div className="h-3 rounded-full bg-slate-800 overflow-hidden">
            <div className="h-full bg-indigo-500" style={{ width: `${usage.percentage}%` }} />
          </div>
          <div className="flex items-center justify-between text-sm text-slate-400">
            <span>{usage.percentage}% used • {usage.remaining} remaining</span>
            <span>Resets in {usage.days_until_reset} days</span>
          </div>
        </div>
      </div>

      <div className="glass-card p-6 space-y-4">
        <p className="text-sm uppercase tracking-wide text-slate-400">Invoices</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-slate-400">
              <tr className="text-left border-b border-slate-800">
                <th className="py-3">Date</th>
                <th className="py-3">Amount</th>
                <th className="py-3">Status</th>
                <th className="py-3">Period</th>
                <th className="py-3">PDF</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => (
                <tr key={invoice.date} className="border-b border-slate-900">
                  <td className="py-3">{invoice.date}</td>
                  <td className="py-3">{formatCurrency(invoice.amount)}</td>
                  <td className="py-3"><span className="badge">{invoice.status}</span></td>
                  <td className="py-3">{invoice.period}</td>
                  <td className="py-3"><a href={invoice.url}>Download</a></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
