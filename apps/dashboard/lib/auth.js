export function getAdminSecretHeader() {
  if (typeof window === 'undefined') return {};
  const secret = window.sessionStorage.getItem('admin_secret');
  return secret ? { 'x-admin-secret': secret } : {};
}

export function saveAdminSecret(secret) {
  if (typeof window === 'undefined') return;
  window.sessionStorage.setItem('admin_secret', secret);
}
