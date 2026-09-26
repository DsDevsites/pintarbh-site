import { useEffect, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { CheckCircle2, LoaderCircle, XCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

export function AuthCallbackPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    async function confirm() {
      try {
        if (!supabase) throw new Error('Sistema de autenticação indisponível.');

        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        const tokenHash = params.get('token_hash');
        const type = params.get('type');

        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) throw exchangeError;
        } else if (tokenHash) {
          const { error: verifyError } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: (type || 'email') as 'email',
          });
          if (verifyError) throw verifyError;
        }

        const { data, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        if (!data.session) throw new Error('Não foi possível concluir a autenticação. Tente novamente.');

        if (active) setStatus('success');
        window.history.replaceState({}, document.title, '/auth/callback');
        window.setTimeout(() => window.location.replace('/orcamento?auth=success'), 700);
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'Não foi possível concluir a autenticação.');
        setStatus('error');
      }
    }

    void confirm();
    return () => { active = false; };
  }, []);

  return (
    <main className="grid min-h-screen place-items-center bg-zinc-50 px-5 py-10">
      <section className="w-full max-w-md rounded-3xl bg-white p-7 text-center shadow-soft ring-1 ring-zinc-200 md:p-9">
        {status === 'loading' && <><LoaderCircle className="mx-auto h-10 w-10 animate-spin text-zinc-500" /><h1 className="mt-5 text-2xl font-semibold">Conectando sua conta</h1><p className="mt-3 text-sm leading-6 text-zinc-500">Só um instante. Estamos finalizando seu acesso com segurança.</p></>}
        {status === 'success' && <><CheckCircle2 className="mx-auto h-11 w-11 text-emerald-500" /><h1 className="mt-5 text-2xl font-semibold">Login concluído</h1><p className="mt-3 text-sm leading-6 text-zinc-500">Seu acesso foi confirmado. Vamos voltar para o orçamento.</p></>}
        {status === 'error' && <><XCircle className="mx-auto h-11 w-11 text-red-500" /><h1 className="mt-5 text-2xl font-semibold">Não foi possível entrar</h1><p className="mt-3 text-sm leading-6 text-red-600">{error}</p><Link to="/orcamento" className="button-primary mt-6 w-full">Voltar ao orçamento</Link></>}
      </section>
    </main>
  );
}
