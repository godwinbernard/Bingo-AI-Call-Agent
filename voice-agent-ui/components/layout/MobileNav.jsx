'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Megaphone, Phone, FileText, Users } from 'lucide-react';
import { motion } from 'framer-motion';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/campaigns', label: 'Campaigns', icon: Megaphone },
  { href: '/calls', label: 'Calls', icon: Phone },
  { href: '/scripts', label: 'Scripts', icon: FileText },
  { href: '/contacts', label: 'Contacts', icon: Users },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-30 flex items-center justify-around px-2 py-2 md:hidden"
      style={{ background: '#12121F', borderTop: '1px solid #2A2A40' }}
    >
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
        return (
          <Link key={href} href={href} className="flex flex-col items-center gap-1 flex-1 py-1">
            <motion.div
              whileTap={{ scale: 0.85 }}
              className="flex flex-col items-center gap-1"
            >
              <div
                className="p-1.5 rounded-lg"
                style={{ background: active ? 'rgba(99,102,241,0.15)' : 'transparent' }}
              >
                <Icon size={18} style={{ color: active ? '#6366F1' : '#5A5A7A' }} />
              </div>
              <span className="text-[10px] font-medium" style={{ color: active ? '#6366F1' : '#5A5A7A' }}>
                {label}
              </span>
            </motion.div>
          </Link>
        );
      })}
    </nav>
  );
}
