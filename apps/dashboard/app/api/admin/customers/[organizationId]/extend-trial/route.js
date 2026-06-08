import { proxyAdminRequest } from '@/lib/adminProxy';

export async function POST(request, { params }) {
  const body = await request.json().catch(() => ({}));
  return proxyAdminRequest(request, `/api/admin/customers/${params.organizationId}/extend-trial`, {
    method: 'POST',
    body,
  });
}
