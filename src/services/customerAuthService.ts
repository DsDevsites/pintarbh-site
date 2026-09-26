import { supabase } from '../lib/supabase';

export type CustomerProfile = {
  id: string;
  name: string;
  phone: string;
  email: string;
};

export type AuthenticatedCustomerDraft = {
  id: string;
  name: string;
  email: string;
};

function getAuthRedirectUrl() {
  if (typeof window === 'undefined') return undefined;
  return `${window.location.origin}/`;
}

export async function getAuthenticatedCustomerDraft(): Promise<AuthenticatedCustomerDraft | null> {
  if (!supabase) return null;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  return {
    id: user.id,
    name: String(user.user_metadata?.full_name ?? user.user_metadata?.name ?? ''),
    email: user.email ?? '',
  };
}

export async function getCurrentCustomer(): Promise<CustomerProfile | null> {
  if (!supabase) return null;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data, error } = await supabase.from('customer_profiles').select('id,name,phone,email').eq('id', user.id).maybeSingle();
  if (error) throw new Error(error.message);
  if (data) return data as CustomerProfile;
  const fallback = { id: user.id, name: String(user.user_metadata?.name ?? user.user_metadata?.full_name ?? ''), phone: String(user.user_metadata?.phone ?? ''), email: user.email ?? '' };
  return fallback.name && fallback.phone ? fallback : null;
}

export async function customerSignUp(input: { name: string; phone: string; email: string; password: string }) {
  if (!supabase) throw new Error('Sistema de cadastro indisponível.');
  const { data, error } = await supabase.auth.signUp({
    email: input.email.trim().toLowerCase(),
    password: input.password,
    options: {
      data: { name: input.name.trim(), phone: input.phone.trim() },
      emailRedirectTo: getAuthRedirectUrl(),
    },
  });
  if (error) throw new Error(error.message);
  if (!data.user) throw new Error('Não foi possível criar a conta.');
  if (data.session) {
    const { error: profileError } = await supabase.from('customer_profiles').upsert({
      id: data.user.id,
      name: input.name.trim(),
      phone: input.phone.trim(),
      email: input.email.trim().toLowerCase(),
      updated_at: new Date().toISOString(),
    });
    if (profileError) throw new Error(profileError.message);
  }
  return { sessionCreated: Boolean(data.session), userId: data.user.id };
}

export async function resendCustomerConfirmation(email: string) {
  if (!supabase) throw new Error('Sistema de cadastro indisponível.');
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email: email.trim().toLowerCase(),
    options: { emailRedirectTo: getAuthRedirectUrl() },
  });
  if (error) throw new Error(error.message);
}

export async function customerLogin(email: string, password: string) {
  if (!supabase) throw new Error('Sistema de login indisponível.');
  const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
  if (error || !data.user) throw new Error('E-mail ou senha inválidos.');
  const profile = await getCurrentCustomer();
  if (profile) return profile;
  const user = data.user;
  const fallback = {
    id: user.id,
    name: String(user.user_metadata?.name ?? user.user_metadata?.full_name ?? ''),
    phone: String(user.user_metadata?.phone ?? ''),
    email: user.email ?? email.trim().toLowerCase(),
  };
  if (!fallback.name || !fallback.phone) throw new Error('Cadastro do cliente não encontrado.');
  const { error: profileError } = await supabase.from('customer_profiles').upsert({
    ...fallback,
    updated_at: new Date().toISOString(),
  });
  if (profileError) throw new Error(profileError.message);
  return fallback;
}

export async function customerLoginWithGoogle() {
  if (!supabase) throw new Error('Sistema de login indisponível.');
  if (typeof window !== 'undefined') window.sessionStorage.setItem('pintarbh_oauth_pending', '1');
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: getAuthRedirectUrl() },
  });
  if (error) throw new Error(error.message);
}

export async function completeCustomerProfile(input: { name: string; phone: string }) {
  if (!supabase) throw new Error('Sistema de cadastro indisponível.');
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Sua sessão expirou. Entre novamente para continuar.');
  const name = input.name.trim();
  const phone = input.phone.trim();
  if (!name) throw new Error('Informe seu nome completo.');
  if (!phone) throw new Error('Informe seu WhatsApp ou telefone.');

  const profile = {
    id: user.id,
    name,
    phone,
    email: user.email ?? '',
    updated_at: new Date().toISOString(),
  };
  const { error } = await supabase.from('customer_profiles').upsert(profile);
  if (error) throw new Error(error.message);
  return profile as CustomerProfile;
}

export async function customerLogout() {
  if (supabase) await supabase.auth.signOut();
}
