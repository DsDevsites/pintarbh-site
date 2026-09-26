import { supabase } from '../lib/supabase';

const AUTH_KEY = 'pintarbh:admin-session';

async function hasAdminAccess(userId: string) {
  if (!supabase) return false;
  const { data, error } = await supabase
    .from('admin_access')
    .select('user_id')
    .eq('user_id', userId)
    .maybeSingle();

  return !error && Boolean(data);
}

export async function isAuthenticated() {
  if (supabase) {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) return false;
    return hasAdminAccess(userData.user.id);
  }

  return localStorage.getItem(AUTH_KEY) === 'active';
}

export async function login(identifier: string, password: string) {
  if (supabase) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: identifier.trim(),
      password,
    });

    if (error || !data.user) return false;

    const allowed = await hasAdminAccess(data.user.id);
    if (!allowed) {
      await supabase.auth.signOut();
      return false;
    }

    return true;
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
