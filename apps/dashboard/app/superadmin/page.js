'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldAlert, Users, DollarSign, Activity, TrendingUp, LogOut, Settings, BarChart3, Lock } from 'lucide-react';
import { apiFetch } from '@/lib/api';

const PLATFORM_METRICS = [
  { label: 'Total MRR', value: '—', Icon: DollarSign, color: '#22C55E' },
  { label: 'Total organizations', value: '—', Icon: Users, color: '#6366F1' },
  { label: 'Active trials', value: '—', Icon: Activity, color: '#F59E0B' },
  { label: 'Calls today', value: '—', Icon: BarChart3, color: '#818CF8' },
  { label: 'Churned this month', value: '—', Icon: TrendingUp, color: '#EF4444' },
];

const SUPERADMIN_TOOLS = [
  {
    title: 'Admin dashboard',
    desc: 'View and manage all organizations, plans, and revenue.',
    href: '/admin',
    Icon: Users,
    color: '#6366F1',
  },
  {
    title: 'Customer management',
    desc: 'Extend trials, change plans, impersonate accounts.',
    href: '/admin/customers',
    Icon: Settings,
    color: '#818CF8',
  },
  {
    title: 'Revenue analytics',
    desc: 'MRR breakdown, churn analysis, and payment history.',
    href: '/admin/revenue',
    Icon: BarChart3,
    color: '#22C55E',
  },
];

export default function SuperadminDashboardPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(null);
  const [metrics, setMetrics] = useState(PLATFORM_METRICS);

  useEffect(() => {
    async function check() {
      try {
        const data = await apiFetch('/api/superadmin/me');
        setAuthorized(true);
        if (data?.overview) {
          const o = data.overview;
          setMetrics([
            { label: 'Total MRR', value: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format((o.mrr || 0) / 100), Icon: DollarSign, color: '#22C55E' },
            { label: 'Total organizations', value: (o.totalOrganizations || 0).toLocaleString(), Icon: Users, color: '#6366F1' },
            { label: 'Active trials', value: (o.activeTrials || 0).toLocaleString(), Icon: Activity, color: '#F59E0B' },
            { label: 'Calls today', value: (o.totalCallsToday || 0).toLocaleString(), Icon: BarChart3, color: '#818CF8' },
            { label: 'Churned this month', value: (o.churnedThisMonth || 0).toLocaleString(), Icon: TrendingUp, color: '#EF4444' },
          ]);
        }
      } catch {
        setAuthorized(false);
      }
    }
    check();
  }, []);

  async function handleLogout() {
    await apiFetch('/api/superadmin/logout', { method: 'POST' }).catch(() => undefined);
    router.push('/superadmin/login');
  }

  if (authorized === null) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div
          style={{
            width: 28, height: 28, borderRadius: '50%',
            border: '2px solid #2A2A40',
            borderTopColor: '#6366F1',
            animation: 'spin 0.7s linear infinite',
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="max-w-md mx-auto mt-20 text-center">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
          style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}
        >
          <Lock size={24} style={{ color: '#EF4444' }} strokeWidth={1.75} />
        </div>
        <h1 className="text-xl font-bold mb-2" style={{ color: '#F1F1F5' }}>
          Superadmin access required
        </h1>
        <p className="text-sm mb-7" style={{ color: '#9898B3' }}>
          You must authenticate with a valid superadmin secret to view this area.
        </p>
        <Link
          href="/superadmin/login"
          className="btn-primary"
          style={{ borderRadius: 10, padding: '11px 24px', fontSize: 14 }}
        >
          Go to superadmin login
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}
          >
            <ShieldAlert size={22} style={{ color: '#EF4444' }} strokeWidth={1.75} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <h1 className="text-2xl font-bold" style={{ color: '#F1F1F5', letterSpacing: '-0.02em' }}>
                Superadmin portal
              </h1>
              <span
                className="text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.2)' }}
              >
                PRIVILEGED
              </span>
            </div>
            <p className="text-sm" style={{ color: '#9898B3' }}>
              Full platform access. All actions are audited.
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="btn-ghost flex items-center gap-2"
          style={{ fontSize: 13 }}
        >
          <LogOut size={14} />
          Lock session
        </button>
      </div>

      {/* Platform metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
        {metrics.map(({ label, value, Icon, color }) => (
          <div key={label} className="glass-card p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#5A5A7A' }}>
                {label}
              </p>
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: `${color}14` }}
              >
                <Icon size={13} style={{ color }} strokeWidth={2} />
              </div>
            </div>
            <p className="text-2xl font-bold" style={{ color: '#F1F1F5', letterSpacing: '-0.02em' }}>
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* Quick access tools */}
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: '#5A5A7A' }}>
          Admin tools
        </h2>
        <div className="grid md:grid-cols-3 gap-4">
          {SUPERADMIN_TOOLS.map(({ title, desc, href, Icon, color }) => (
            <Link
              key={title}
              href={href}
              className="glass-card glass-card-hover p-5 block"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                style={{ background: `${color}14`, border: `1px solid ${color}28` }}
              >
                <Icon size={18} style={{ color }} strokeWidth={1.75} />
              </div>
              <h3 className="text-sm font-semibold mb-1.5" style={{ color: '#F1F1F5' }}>
                {title}
              </h3>
              <p className="text-xs leading-relaxed" style={{ color: '#5A5A7A' }}>
                {desc}
              </p>
            </Link>
          ))}
        </div>
      </div>

      {/* Audit notice */}
      <div
        className="flex items-start gap-3 p-4 rounded-xl"
        style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.12)' }}
      >
        <ShieldAlert size={15} style={{ color: '#EF4444', flexShrink: 0, marginTop: 1 }} strokeWidth={1.75} />
        <p className="text-xs leading-relaxed" style={{ color: '#9898B3' }}>
          <strong style={{ color: '#F1F1F5' }}>Audit trail active.</strong> Every action performed in this portal is logged with your session timestamp and IP address. Superadmin sessions expire after 8 hours.
        </p>
      </div>
    </div>
  );
}
