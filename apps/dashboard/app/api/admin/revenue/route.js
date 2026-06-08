import adminAuth from '@/lib/adminAuth';
import adminData from '@/lib/adminData';

const { assertAdminRequest } = adminAuth;
const { buildAdminRevenueSummary } = adminData;

export async function GET(request) {
  const unauthorized = assertAdminRequest(request);
  if (unauthorized) {
    return unauthorized;
  }

  return Response.json(buildAdminRevenueSummary());
}
