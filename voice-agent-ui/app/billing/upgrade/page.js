'use client';

import { useState } from 'react';
import { PLAN_LABELS } from '@/lib/billing';

const plans = [
  { tier: 'STARTER', price: '$99/mo', featured: false, calls: '500', cta: 'Start Free Trial' },
  { tier: 'GROWTH', price: '$299/mo', featured: true, calls: '2,000', cta: 'Upgrade Now' },
  { tier: 'ENTERPRISE', price: '$999/mo', featured: false, calls: 'Unlimited', cta: 'Contact Sales' },
  { tier: 'PAY_AS_YOU_GO', price: '$0/mo', featured: false, calls: 'Metered', cta: 'Start PAYG' },
];

export default function UpgradePage() {
  const [annual, setAnnual] = useState(false);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Upgrade Plan</h1>
          <p className="text-slate-400">Pick the billing tier that matches your calling volume.</p>
        </div>
        <button className="btn-secondary" onClick={() => setAnnual((value) => !value)}>
          {annual ? 'Monthly billing' : 'Annual billing (20% off)'}
        </button>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
        {plans.map((plan) => (
          <div key={plan.tier} className="glass-card p-5 border border-slate-800 relative">
            {plan.featured && <span className="absolute -top-3 left-4 badge bg-indigo-500 text-white">Most Popular</span>}
            <h2 className="text-xl font-semibold">{PLAN_LABELS[plan.tier]}</h2>
            <p className="text-3xl font-bold mt-2">{annual && plan.price !== '$0/mo' ? plan.price.replace('/mo', '/yr') : plan.price}</p>
            <p className="text-sm text-slate-400 mt-2">{plan.calls} calls / month</p>
            <button className={`btn-${plan.featured ? 'primary' : 'secondary'} mt-4 w-full`}>{plan.cta}</button>
          </div>
        ))}
      </div>
    </div>
  );
}
