import { assertSuperadminRequest } from '@/lib/superadminAuth';

const MOCK = {
  ec2: { status: 'healthy', uptime: '14d 6h 22m', cpu: 23, memory: 41, memoryTotal: 1024, disk: 58, diskTotal: 20 },
  rds: { status: 'healthy', connections: 4, maxConnections: 100, latencyMs: 3.2, storageUsed: 6.1, storageTotal: 20 },
  redis: { status: 'healthy', connectedClients: 2, usedMemoryMb: 12, maxMemoryMb: 256, hitRate: 98.4, opsPerSec: 142 },
  queue: { status: 'healthy', activeCalls: 0, pendingJobs: 0, failedJobs: 0, processedToday: 847 },
  socketIo: { status: 'healthy', connectedSockets: 0, rooms: 0, transport: 'websocket' },
};

export async function GET(request) {
  const unauthorized = assertSuperadminRequest(request);
  if (unauthorized) return unauthorized;

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL;

  if (backendUrl) {
    try {
      const res = await fetch(`${backendUrl}/api/admin/health`, {
        headers: { 'x-admin-secret': process.env.ADMIN_SECRET || '' },
        signal: AbortSignal.timeout(5000),
      });
      if (res.ok) {
        const data = await res.json();
        return Response.json(data);
      }
    } catch { /* fall through to mock */ }
  }

  return Response.json(MOCK);
}
