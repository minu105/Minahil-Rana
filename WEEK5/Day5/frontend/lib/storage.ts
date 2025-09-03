export function saveToken(token: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('jwt', token);
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('jwt');
}

export function clearToken() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('jwt');
}
