const AUTH_KEY = 'pintarbh:admin-session';

export function isAuthenticated() {
  return localStorage.getItem(AUTH_KEY) === 'active';
}

export async function login(username: string, password: string) {
  const valid = username.trim() === 'PintarBH' && password === 'pintarbh';
  if (valid) localStorage.setItem(AUTH_KEY, 'active');
  return valid;
}

export function logout() {
  localStorage.removeItem(AUTH_KEY);
}
