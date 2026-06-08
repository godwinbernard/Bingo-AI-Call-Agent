'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function EmptyState({ icon = '📭', title, description, ctaLabel, ctaHref, onCta }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 px-6 text-center"
    >
      <div
        className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl mb-6"
        style={{ background: '#1E1E35', border: '1px solid #2A2A40' }}
      >
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2" style={{ color: '#F1F1F5' }}>{title}</h3>
      {description && (
        <p className="text-sm max-w-md mb-6" style={{ color: '#9898B3', lineHeight: '1.6' }}>
          {description}
        </p>
      )}
      {(ctaLabel && ctaHref) && (
        <Link href={ctaHref}>
          <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} className="btn-primary">
            {ctaLabel}
          </motion.button>
        </Link>
      )}
      {(ctaLabel && onCta) && (
        <motion.button onClick={onCta} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} className="btn-primary">
          {ctaLabel}
        </motion.button>
      )}
    </motion.div>
  );
}
