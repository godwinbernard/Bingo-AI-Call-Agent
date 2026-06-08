import { proxyAdminRequest } from '@/lib/adminProxy';

export async function GET(request) {
  return proxyAdminRequest(request, '/api/admin/overview');
}
