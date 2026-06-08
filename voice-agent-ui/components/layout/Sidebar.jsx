'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Megaphone, Phone, FileText,
  Users, Settings, ChevronLeft, ChevronRight, CreditCard,
} from 'lucide-react';
import { useState, useEffect } from 'react';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/campaigns', label: 'Campaigns', icon: Megaphone },
  { href: '/calls', label: 'Calls', icon: Phone },
  { href: '/scripts', label: 'Scripts', icon: FileText },
  { href: '/contacts', label: 'Contacts', icon: Users },
  { href: '/billing', label: 'Billing', icon: CreditCard },
  { href: '/team', label: 'Team', icon: Users },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ collapsed, onToggle }) {
  const pathname = usePathname();
  const [apiStatus, setApiStatus] = useState('live');

  useEffect(() => {
    const interval = setInterval(() => {
      setApiStatus(Math.random() > 0.05 ? 'live' : 'offline');
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 240 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      className="fixed left-0 top-0 h-screen flex flex-col z-30 overflow-hidden"
      style={{ background: '#12121F', borderRight: '1px solid #2A2A40' }}
    >
      {/* Logo */}
      <div className="flex items-center h-16 px-4 gap-3 flex-shrink-0" style={{ borderBottom: '1px solid #2A2A40' }}>
        <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-lg"
          style={{ background: 'linear-gradient(135deg, #6366F1, #818CF8)' }}>
          🤖
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.15 }}
              className="font-bold text-base whitespace-nowrap"
              style={{ color: '#F1F1F5' }}
            >
              Bingo AI
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-2 overflow-y-auto overflow-x-hidden">
        <div className="flex flex-col gap-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
            return (
              <Link key={href} href={href}>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors relative overflow-hidden"
                  style={{
                    background: active ? 'rgba(99,102,241,0.15)' : 'transparent',
                    color: active ? '#6366F1' : '#9898B3',
                  }}
                >
                  {active && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute inset-0 rounded-lg"
                      style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)' }}
                    />
                  )}
                  <Icon size={18} className="flex-shrink-0 relative z-10" />
                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.1 }}
                        className="text-sm font-medium whitespace-nowrap relative z-10"
                      >
                        {label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.div>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Bottom: status + collapse */}
      <div className="px-2 pb-4 flex flex-col gap-2 flex-shrink-0" style={{ borderTop: '1px solid #2A2A40', paddingTop: '12px' }}>
        {/* API Status */}
        <div className="flex items-center gap-2.5 px-3 py-2">
          <div className="flex-shrink-0">
            {apiStatus === 'live' ? (
              <span className="status-dot-live" />
            ) : (
              <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
            )}
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-xs whitespace-nowrap"
                style={{ color: apiStatus === 'live' ? '#22C55E' : '#EF4444' }}
              >
                {apiStatus === 'live' ? 'All systems live' : 'Disconnected'}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Collapse toggle */}
        <button
          onClick={onToggle}
          className="flex items-center gap-2 px-3 py-2 rounded-lg w-full transition-colors"
          style={{ color: '#5A5A7A', background: 'transparent' }}
          onMouseEnter={e => e.currentTarget.style.background = '#1E1E35'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <div className="flex-shrink-0">
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-xs whitespace-nowrap"
              >
                Collapse
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.aside>
  );
}
