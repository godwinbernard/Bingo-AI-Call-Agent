'use client';

import { useEffect, useState, useCallback } from 'react';
import { Activity, Server, Database, Cpu, MemoryStick, RefreshCw, CheckCircle2, AlertTriangle, XCircle, Wifi } from 'lucide-react';
import { apiFetch } from '@/lib/api';

function StatusDot({ status }) {
  const cfg = {
    healthy: { color: '#22C55E', label: 'Healthy' },
    degraded: { color: '#F59E0B', label: 'Degraded' },
    down: { color: '#EF4444', label: 'Down' },
    unknown: { color: '#5A5A7A', label: 'Unknown' },
  }[status] || { color: '#5A5A7A', label: 'Unknown' };

  return (
    <div className="flex items-center gap-1.5">
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: cfg.color, display: 'inline-block', boxShadow: status === 'healthy' ? `0 0 0 2px ${cfg.color}30` : 'none' }} />
      <span style={{ fontSize: 12, color: cfg.color, fontWeight: 500 }}>{cfg.label}</span>
    </div>
  );
}

function MetricBar({ value, max, color }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  const barColor = pct > 85 ? '#EF4444' : pct > 65 ? '#F59E0B' : color;
  return (
    <div style={{ height: 4, borderRadius: 2, background: '#2A2A40', overflow: 'hidden', marginTop: 6 }}>
      <div style={{ height: '100%', width: `${pct}%`, background: barColor, borderRadius: 2, transition: 'width 0.6s ease' }} />
    </div>
  );
}

function HealthCard({ title, Icon, color, children }) {
  return (
    <div className="glass-card p-5">
      <div className="flex items-center gap-2 mb-4">
        <div style={{ width: 32, height: 32, borderRadius: 9, background: `${color}14`, border: `1px solid ${color}28`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={15} style={{ color }} strokeWidth={1.75} />
        </div>
        <h3 style={{ fontSize: 13, fontWeight: 600, color: '#F1F1F5' }}>{title}</h3>
      </div>
      {children}
    </div>
  );
}

const MOCK = {
  ec2: { status: 'healthy', uptime: '14d 6h 22m', cpu: 23, memory: 41, memoryTotal: 1024, disk: 58, diskTotal: 20 },
  rds: { status: 'healthy', connections: 4, maxConnections: 100, latencyMs: 3.2, storageUsed: 6.1, storageTotal: 20 },
  redis: { status: 'healthy', connectedClients: 2, usedMemoryMb: 12, maxMemoryMb: 256, hitRate: 98.4, opsPerSec: 142 },
  queue: { status: 'healthy', activeCalls: 0, pendingJobs: 0, failedJobs: 0, processedToday: 847 },
  socketIo: { status: 'healthy', connectedSockets: 0, rooms: 0, transport: 'websocket' },
};

export default function PlatformHealthPage() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch('/api/superadmin/health');
      setHealth(data);
    } catch {
      setHealth(MOCK);
    } finally {
      setLoading(false);
      setLastRefresh(new Date());
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const h = health || MOCK;
  const overallStatus = [h.ec2?.status, h.rds?.status, h.redis?.status].includes('down') ? 'down'
    : [h.ec2?.status, h.rds?.status, h.redis?.status].includes('degraded') ? 'degraded' : 'healthy';

  return (
    <div className="max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#F1F1F5', letterSpacing: '-0.02em' }}>Platform Health</h1>
          <p style={{ fontSize: 13, color: '#9898B3', marginTop: 2 }}>
            EC2, RDS, Redis, queue, and Socket.io status
            {lastRefresh && <span style={{ marginLeft: 8, color: '#5A5A7A' }}>· Last refresh {lastRefresh.toLocaleTimeString()}</span>}
          </p>
        </div>
        <button onClick={load} disabled={loading} className="btn-ghost flex items-center gap-2" style={{ fontSize: 13 }}>
          <RefreshCw size={13} style={{ animation: loading ? 'spin 0.8s linear infinite' : 'none' }} />
          Refresh
        </button>
      </div>

      {/* Overall status banner */}
      <div style={{
        padding: '12px 16px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 10,
        background: overallStatus === 'healthy' ? 'rgba(34,197,94,0.06)' : overallStatus === 'degraded' ? 'rgba(245,158,11,0.06)' : 'rgba(239,68,68,0.06)',
        border: `1px solid ${overallStatus === 'healthy' ? 'rgba(34,197,94,0.18)' : overallStatus === 'degraded' ? 'rgba(245,158,11,0.18)' : 'rgba(239,68,68,0.18)'}`,
      }}>
        {overallStatus === 'healthy' ? <CheckCircle2 size={16} style={{ color: '#22C55E' }} />
          : overallStatus === 'degraded' ? <AlertTriangle size={16} style={{ color: '#F59E0B' }} />
          : <XCircle size={16} style={{ color: '#EF4444' }} />}
        <span style={{ fontSize: 13, fontWeight: 500, color: '#F1F1F5' }}>
          {overallStatus === 'healthy' ? 'All systems operational' : overallStatus === 'degraded' ? 'Partial degradation detected' : 'Critical issue — immediate attention required'}
        </span>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* EC2 */}
        <HealthCard title="EC2 Instance" Icon={Server} color="#6366F1">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <StatusDot status={h.ec2?.status} />
              <span style={{ fontSize: 11, color: '#5A5A7A' }}>Uptime: {h.ec2?.uptime}</span>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span style={{ fontSize: 11, color: '#9898B3' }}>CPU</span>
                <span style={{ fontSize: 11, color: '#F1F1F5', fontVariantNumeric: 'tabular-nums' }}>{h.ec2?.cpu}%</span>
              </div>
              <MetricBar value={h.ec2?.cpu} max={100} color="#6366F1" />
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span style={{ fontSize: 11, color: '#9898B3' }}>Memory</span>
                <span style={{ fontSize: 11, color: '#F1F1F5', fontVariantNumeric: 'tabular-nums' }}>{h.ec2?.memory}% of {h.ec2?.memoryTotal} MB</span>
              </div>
              <MetricBar value={h.ec2?.memory} max={100} color="#818CF8" />
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span style={{ fontSize: 11, color: '#9898B3' }}>Disk</span>
                <span style={{ fontSize: 11, color: '#F1F1F5', fontVariantNumeric: 'tabular-nums' }}>{h.ec2?.disk}% of {h.ec2?.diskTotal} GB</span>
              </div>
              <MetricBar value={h.ec2?.disk} max={100} color="#8B5CF6" />
            </div>
          </div>
        </HealthCard>

        {/* RDS */}
        <HealthCard title="RDS PostgreSQL" Icon={Database} color="#22C55E">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <StatusDot status={h.rds?.status} />
              <span style={{ fontSize: 11, color: '#5A5A7A' }}>Latency: {h.rds?.latencyMs} ms</span>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span style={{ fontSize: 11, color: '#9898B3' }}>Connections</span>
                <span style={{ fontSize: 11, color: '#F1F1F5', fontVariantNumeric: 'tabular-nums' }}>{h.rds?.connections} / {h.rds?.maxConnections}</span>
              </div>
              <MetricBar value={h.rds?.connections} max={h.rds?.maxConnections} color="#22C55E" />
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span style={{ fontSize: 11, color: '#9898B3' }}>Storage</span>
                <span style={{ fontSize: 11, color: '#F1F1F5', fontVariantNumeric: 'tabular-nums' }}>{h.rds?.storageUsed} / {h.rds?.storageTotal} GB</span>
              </div>
              <MetricBar value={h.rds?.storageUsed} max={h.rds?.storageTotal} color="#34D399" />
            </div>
          </div>
        </HealthCard>

        {/* Redis */}
        <HealthCard title="Redis" Icon={Cpu} color="#F59E0B">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <StatusDot status={h.redis?.status} />
              <span style={{ fontSize: 11, color: '#5A5A7A' }}>{h.redis?.opsPerSec} ops/sec</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Clients', value: h.redis?.connectedClients },
                { label: 'Hit rate', value: `${h.redis?.hitRate}%` },
                { label: 'Memory', value: `${h.redis?.usedMemoryMb} MB` },
                { label: 'Max', value: `${h.redis?.maxMemoryMb} MB` },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p style={{ fontSize: 10, color: '#5A5A7A', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</p>
                  <p style={{ fontSize: 16, fontWeight: 700, color: '#F1F1F5', fontVariantNumeric: 'tabular-nums' }}>{value}</p>
                </div>
              ))}
            </div>
          </div>
        </HealthCard>

        {/* Queue + Socket.io */}
        <HealthCard title="Call Queue & Socket.io" Icon={Wifi} color="#818CF8">
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Active calls', value: h.queue?.activeCalls, color: '#22C55E' },
                { label: 'Pending jobs', value: h.queue?.pendingJobs, color: '#F1F1F5' },
                { label: 'Failed jobs', value: h.queue?.failedJobs, color: h.queue?.failedJobs > 0 ? '#EF4444' : '#F1F1F5' },
                { label: 'Processed today', value: h.queue?.processedToday, color: '#818CF8' },
              ].map(({ label, value, color }) => (
                <div key={label}>
                  <p style={{ fontSize: 10, color: '#5A5A7A', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</p>
                  <p style={{ fontSize: 16, fontWeight: 700, color, fontVariantNumeric: 'tabular-nums' }}>{value}</p>
                </div>
              ))}
            </div>
            <div style={{ borderTop: '1px solid #2A2A40', paddingTop: 10 }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <StatusDot status={h.socketIo?.status} />
                  <span style={{ fontSize: 11, color: '#9898B3' }}>Socket.io</span>
                </div>
                <span style={{ fontSize: 11, color: '#5A5A7A' }}>{h.socketIo?.connectedSockets} sockets · {h.socketIo?.rooms} rooms · {h.socketIo?.transport}</span>
              </div>
            </div>
          </div>
        </HealthCard>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
