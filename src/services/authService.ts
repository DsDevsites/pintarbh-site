import { supabase } from '../lib/supabase';

const AUTH_KEY = 'pintarbh:admin-session';

export async function isAuthenticated() {
  if (supabase) {
    const { data } = await supabase.auth.getSession();
    return Boolean(data.session);
  }

  return localStorage.getItem(AUTH_KEY) === 'active';
}

export async function login(identifier: string, password: string) {
  if (supabase) {
    const { error } = await supabase.auth.signInWithPassword({
      email: identifier.trim(),
      password,
    });

    return !error;
  }

  const valid = identifier.trim() === 'PintarBH' && password === 'pintarbh';
  if (valid) localStorage.setItem(AUTH_KEY, 'active');
  return valid;
}

export async function logout() {
  if (supabase) {
    await supabase.auth.signOut();
    return;
  }

  localStorage.removeItem(AUTH_KEY);
}
