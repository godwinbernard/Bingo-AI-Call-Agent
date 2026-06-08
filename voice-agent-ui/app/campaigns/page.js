'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import CampaignCard from '@/components/campaigns/CampaignCard';
import EmptyState from '@/components/shared/EmptyState';
import { MOCK_CAMPAIGNS } from '@/lib/mockData';

const FILTERS = ['All', 'Active', 'Completed', 'Paused'];

export default function CampaignsPage() {
  const [filter, setFilter] = useState('All');
  const [campaigns, setCampaigns] = useState(MOCK_CAMPAIGNS);

  const filtered = campaigns.filter(c =>
    filter === 'All' || c.status === filter.toLowerCase()
  );

  function handlePause(id) {
    setCampaigns(prev => prev.map(c => c.id === id ? { ...c, status: 'paused' } : c));
  }
  function handleResume(id) {
    setCampaigns(prev => prev.map(c => c.id === id ? { ...c, status: 'active' } : c));
  }
  function handleStop(id) {
    setCampaigns(prev => prev.map(c => c.id === id ? { ...c, status: 'completed' } : c));
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1 p-1 rounded-xl" style={{ background: '#1A1A2E', border: '1px solid #2A2A40' }}>
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="px-4 py-1.5 rounded-lg text-sm font-medium transition-all"
              style={{
                background: filter === f ? '#6366F1' : 'transparent',
                color: filter === f ? 'white' : '#9898B3',
              }}
            >
              {f}
              <span
                className="ml-1.5 text-xs px-1.5 py-0.5 rounded-full"
                style={{
                  background: filter === f ? 'rgba(255,255,255,0.2)' : '#2A2A40',
                  color: filter === f ? 'white' : '#5A5A7A',
                }}
              >
                {campaigns.filter(c => f === 'All' || c.status === f.toLowerCase()).length}
              </span>
            </button>
          ))}
        </div>

        <Link href="/campaigns/new">
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="btn-primary">
            <Plus size={16} />
            New Campaign
          </motion.button>
        </Link>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <EmptyState
          icon="📢"
          title="No campaigns yet"
          description="Launch your first campaign and start reaching your contacts automatically."
          ctaLabel="Create Campaign →"
          ctaHref="/campaigns/new"
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map((campaign, i) => (
            <motion.div key={campaign.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
              <CampaignCard
                campaign={campaign}
                onPause={handlePause}
                onStop={handleStop}
                onResume={handleResume}
              />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
