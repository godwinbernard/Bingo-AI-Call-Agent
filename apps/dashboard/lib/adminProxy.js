const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

async function proxyAdminRequest(request, path, { method = 'GET', body } = {}) {
  const headers = new Headers();
  const cookie = request.headers.get('cookie');
  if (cookie) {
    headers.set('cookie', cookie);
  }

  const adminSecret = request.headers.get('x-admin-secret');
  if (adminSecret) {
    headers.set('x-admin-secret', adminSecret);
  }

  if (body !== undefined) {
    headers.set('content-type', 'application/json');
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const contentType = response.headers.get('content-type') || 'application/json';
  const responseBody = await response.text();

  return new Response(responseBody, {
    status: response.status,
    headers: {
      'content-type': contentType,
    },
  });
}

export { proxyAdminRequest };
