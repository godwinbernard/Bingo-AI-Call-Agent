'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ShieldAlert, LayoutDashboard, Activity, Users,
  Flag, DollarSign, ScrollText, LogOut, ChevronRight,
} from 'lucide-react';
import { apiFetch } from '@/lib/api';

const NAV = [
  { label: 'Overview', href: '/superadmin', Icon: LayoutDashboard },
  { label: 'Platform Health', href: '/superadmin/health', Icon: Activity },
  { label: 'Impersonation', href: '/superadmin/impersonation', Icon: Users },
  { label: 'Feature Flags', href: '/superadmin/flags', Icon: Flag },
  { label: 'Billing Overrides', href: '/superadmin/billing', Icon: DollarSign },
  { label: 'Audit Log', href: '/superadmin/audit', Icon: ScrollText },
];

export default function SuperadminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [authorized, setAuthorized] = useState(null);

  useEffect(() => {
    if (pathname === '/superadmin/login') { setAuthorized(true); return; }
    apiFetch('/api/superadmin/me')
      .then(() => setAuthorized(true))
      .catch(() => { setAuthorized(false); router.replace('/superadmin/login'); });
  }, [pathname, router]);

  if (pathname === '/superadmin/login') return children;
  if (authorized === null) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div style={{ width: 28, height: 28, borderRadius: '50%', border: '2px solid #2A2A40', borderTopColor: '#EF4444', animation: 'spin 0.7s linear infinite' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  async function handleLogout() {
    await apiFetch('/api/superadmin/logout', { method: 'POST' }).catch(() => undefined);
    router.push('/superadmin/login');
  }

  return (
    <div className="flex gap-0" style={{ minHeight: 'calc(100vh - 80px)' }}>
      {/* Sidebar */}
      <aside style={{ width: 220, flexShrink: 0, borderRight: '1px solid #2A2A40', paddingTop: 8 }}>
        {/* Brand */}
        <div className="flex items-center gap-2 px-4 pb-4 mb-2" style={{ borderBottom: '1px solid #2A2A40' }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldAlert size={14} style={{ color: '#EF4444' }} strokeWidth={1.75} />
          </div>
          <div>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#F1F1F5' }}>Superadmin</p>
            <p style={{ fontSize: 10, color: '#EF4444' }}>PRIVILEGED</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="px-2 space-y-0.5">
          {NAV.map(({ label, href, Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '7px 10px', borderRadius: 8, fontSize: 13,
                  color: active ? '#F1F1F5' : '#9898B3',
                  background: active ? 'rgba(239,68,68,0.08)' : 'transparent',
                  fontWeight: active ? 600 : 400,
                  transition: 'all 0.15s',
                  textDecoration: 'none',
                }}
              >
                <Icon size={14} strokeWidth={active ? 2 : 1.75} style={{ color: active ? '#EF4444' : '#5A5A7A', flexShrink: 0 }} />
                {label}
                {active && <ChevronRight size={12} style={{ color: '#EF4444', marginLeft: 'auto' }} />}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="absolute bottom-4 px-2" style={{ width: 220 }}>
          <button
            onClick={handleLogout}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', borderRadius: 8, fontSize: 13, color: '#5A5A7A', background: 'none', border: 'none', cursor: 'pointer', width: '100%', transition: 'color 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.color = '#EF4444'}
            onMouseLeave={e => e.currentTarget.style.color = '#5A5A7A'}
          >
            <LogOut size={14} strokeWidth={1.75} />
            Lock session
          </button>
        </div>
      </aside>

      {/* Content */}
      <main style={{ flex: 1, padding: '24px 28px', minWidth: 0, overflowY: 'auto' }}>
        {children}
      </main>
    </div>
  );
}
