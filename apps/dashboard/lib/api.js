const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

export function apiUrl(path) {
  if (path.startsWith('http')) return path;
  return `${API_BASE_URL}${path}`;
}

export async function apiFetch(path, options = {}) {
  const impersonationToken = typeof window !== 'undefined'
    ? window.localStorage.getItem('voiceagent_impersonation_token')
    : null;

  const response = await fetch(apiUrl(path), {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(impersonationToken ? { 'x-impersonation-token': impersonationToken } : {}),
      ...(options.headers || {}),
    },
    credentials: 'include',
  });

  const contentType = response.headers.get('content-type') || '';
  const body = contentType.includes('application/json') ? await response.json() : await response.text();

  if (!response.ok) {
    const error = new Error(body?.error || body || 'Request failed');
    error.status = response.status;
    error.body = body;
    throw error;
  }

  return body;
}
