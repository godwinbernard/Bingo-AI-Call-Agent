'use client';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import MobileNav from './MobileNav';
import ToastProvider from '@/components/shared/ToastProvider';

export default function AppShell({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const authRoute = pathname.startsWith('/sign-in') || pathname.startsWith('/sign-up') || pathname.startsWith('/onboarding');
  const sidebarWidth = collapsed ? 64 : 240;

  if (authRoute) {
    return <ToastProvider>{children}</ToastProvider>;
  }

  return (
    <ToastProvider>
    <div className="min-h-screen" style={{ background: '#0F0F1A' }}>

      {/* Sidebar — hidden on mobile */}
      <div className="hidden md:block">
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} />
      </div>

      {/* Main content */}
      <motion.div
        animate={{ marginLeft: sidebarWidth }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        className="hidden md:block min-h-screen"
      >
        <TopBar />
        <main className="p-6">
          {children}
        </main>
      </motion.div>

      {/* Mobile layout */}
      <div className="md:hidden min-h-screen pb-20">
        <TopBar />
        <main className="p-4">{children}</main>
        <MobileNav />
      </div>
    </div>
    </ToastProvider>
  );
}
