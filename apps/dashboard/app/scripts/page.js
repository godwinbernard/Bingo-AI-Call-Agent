'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Plus, FileText, Target, MessageSquare, Edit2 } from 'lucide-react';
import { MOCK_SCRIPTS } from '@/lib/mockData';
import EmptyState from '@/components/shared/EmptyState';
import { formatDate } from '@/lib/utils';

function ScriptCard({ script }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -2 }}
      className="glass-card p-5 relative overflow-hidden"
    >
      <div
        className="absolute top-0 right-0 w-20 h-20 rounded-full opacity-5 -translate-y-4 translate-x-4"
        style={{ background: '#6366F1', filter: 'blur(20px)' }}
      />

      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.2)' }}>
          <FileText size={18} style={{ color: '#6366F1' }} />
        </div>
        <Link href={`/scripts/new?edit=${script.id}`}>
          <button className="p-1.5 rounded-lg" style={{ background: '#1E1E35', color: '#9898B3' }}>
            <Edit2 size={13} />
          </button>
        </Link>
      </div>

      <h3 className="font-semibold text-base mb-1" style={{ color: '#F1F1F5' }}>{script.name}</h3>

      <div className="flex items-center gap-1.5 mb-3">
        <Target size={12} style={{ color: '#5A5A7A' }} />
        <span className="text-xs" style={{ color: '#9898B3' }}>{script.goal}</span>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <span className="text-xs px-2 py-1 rounded-lg" style={{ background: '#1E1E35', color: '#9898B3' }}>
          Agent: {script.agent_name}
        </span>
        <span className="text-xs px-2 py-1 rounded-lg flex items-center gap-1" style={{ background: '#1E1E35', color: '#9898B3' }}>
          <MessageSquare size={11} />
          {Object.keys(script.objection_responses || {}).length} objections
        </span>
      </div>

      <div className="p-3 rounded-xl mb-4" style={{ background: '#1E1E35', border: '1px solid #2A2A40' }}>
        <p className="text-xs italic truncate" style={{ color: '#5A5A7A' }}>&quot;{script.opening}&quot;</p>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs" style={{ color: '#5A5A7A' }}>Created {formatDate(script.created_at)}</span>
        <Link href={`/scripts/new?edit=${script.id}`}>
          <span className="text-xs font-medium" style={{ color: '#6366F1' }}>Edit script →</span>
        </Link>
      </div>
    </motion.div>
  );
}

export default function ScriptsPage() {
  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <p className="text-sm" style={{ color: '#9898B3' }}>{MOCK_SCRIPTS.length} scripts in library</p>
        <Link href="/scripts/new">
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="btn-primary">
            <Plus size={16} />
            New Script
          </motion.button>
        </Link>
      </div>

      {MOCK_SCRIPTS.length === 0 ? (
        <EmptyState
          icon="📝"
          title="No scripts yet"
          description="Create your first conversation script to power your AI agent."
          ctaLabel="Create Script →"
          ctaHref="/scripts/new"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {MOCK_SCRIPTS.map((script, i) => (
            <motion.div key={script.id} transition={{ delay: i * 0.1 }}>
              <ScriptCard script={script} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
