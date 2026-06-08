'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import StatCard from '@/components/shared/StatCard';
import LiveCallsPanel from '@/components/dashboard/LiveCallsPanel';
import CallOutcomeChart from '@/components/dashboard/CallOutcomeChart';
import HourlyChart from '@/components/dashboard/HourlyChart';
import RecentCallsTable from '@/components/dashboard/RecentCallsTable';
import CallDetailDrawer from '@/components/calls/CallDetailDrawer';
import { MOCK_STATS } from '@/lib/mockData';

export default function DashboardPage() {
  const [selectedCall, setSelectedCall] = useState(null);

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon="📞"
          label="Total Calls"
          value={MOCK_STATS.total_calls}
          delta={MOCK_STATS.calls_today}
          deltaLabel=" today"
          accentColor="#6366F1"
        />
        <StatCard
          icon="✅"
          label="Success Rate"
          value={MOCK_STATS.success_rate}
          suffix="%"
          delta={MOCK_STATS.success_rate_delta}
          deltaLabel="%"
          accentColor="#22C55E"
        />
        <StatCard
          icon="🔴"
          label="Active Calls"
          value={MOCK_STATS.active_calls}
          isLive={true}
          accentColor="#EF4444"
        />
        <StatCard
          icon="⏱"
          label="Avg Duration"
          value={Math.floor(MOCK_STATS.avg_duration / 60)}
          suffix={`m ${MOCK_STATS.avg_duration % 60}s`}
          accentColor="#F59E0B"
        />
      </div>

      {/* Middle row: Live calls + Outcome chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <LiveCallsPanel />
        <CallOutcomeChart />
      </div>

      {/* Hourly chart */}
      <HourlyChart />

      {/* Recent calls */}
      <RecentCallsTable onSelectCall={setSelectedCall} />

      {/* Call detail drawer */}
      <CallDetailDrawer call={selectedCall} onClose={() => setSelectedCall(null)} />
    </div>
  );
}
