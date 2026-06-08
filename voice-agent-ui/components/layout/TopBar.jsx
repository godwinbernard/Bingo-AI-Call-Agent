'use client';
import { usePathname } from 'next/navigation';
import { Bell, Search, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const PAGE_TITLES = {
  '/dashboard': 'Dashboard',
  '/campaigns': 'Campaigns',
  '/campaigns/new': 'New Campaign',
  '/calls': 'Call History',
  '/scripts': 'Scripts',
  '/scripts/new': 'Script Builder',
  '/contacts': 'Contacts',
  '/settings': 'Settings',
  '/billing': 'Billing',
  '/billing/upgrade': 'Upgrade Plan',
  '/billing/success': 'Billing Success',
  '/team': 'Team',
  '/admin': 'Admin',
};

export default function TopBar() {
  const pathname = usePathname();
  const [notifications] = useState(3);
  const [refreshing, setRefreshing] = useState(false);

  const title = PAGE_TITLES[pathname] ||
    (pathname.startsWith('/campaigns/') ? 'Campaign Detail' : 'Bingo AI Call Agent');

  function handleRefresh() {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }

  return (
    <header
      className="sticky top-0 z-20 flex items-center justify-between px-6 h-16"
      style={{ background: 'rgba(15,15,26,0.9)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #2A2A40' }}
    >
      <h1 className="text-lg font-semibold" style={{ color: '#F1F1F5' }}>{title}</h1>

      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative hidden md:flex items-center">
          <Search size={14} className="absolute left-3" style={{ color: '#5A5A7A' }} />
          <input
            className="pl-8 pr-4 py-2 text-sm rounded-lg outline-none w-48 transition-all focus:w-64"
            placeholder="Search..."
            style={{ background: '#1E1E35', border: '1px solid #2A2A40', color: '#F1F1F5' }}
            onFocus={e => e.target.style.borderColor = '#6366F1'}
            onBlur={e => e.target.style.borderColor = '#2A2A40'}
          />
        </div>

        {/* Refresh */}
        <motion.button
          onClick={handleRefresh}
          whileTap={{ scale: 0.9 }}
          className="p-2 rounded-lg transition-colors"
          style={{ background: '#1E1E35', border: '1px solid #2A2A40', color: '#9898B3' }}
        >
          <motion.div animate={{ rotate: refreshing ? 360 : 0 }} transition={{ duration: 0.6 }}>
            <RefreshCw size={15} />
          </motion.div>
        </motion.button>

        {/* Notifications */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          className="relative p-2 rounded-lg transition-colors"
          style={{ background: '#1E1E35', border: '1px solid #2A2A40', color: '#9898B3' }}
        >
          <Bell size={15} />
          {notifications > 0 && (
            <span
              className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center"
              style={{ background: '#6366F1', color: 'white' }}
            >
              {notifications}
            </span>
          )}
        </motion.button>

        {/* Avatar */}
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold cursor-pointer"
          style={{ background: 'linear-gradient(135deg, #6366F1, #818CF8)', color: 'white' }}
        >
          A
        </div>
      </div>
    </header>
  );
}
