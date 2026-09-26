import { FormEvent, useEffect, useState } from 'react';
import { Chrome, LogIn, MailCheck, UserPlus } from 'lucide-react';
import {
  completeCustomerProfile,
  customerLogin,
  customerLoginWithGoogle,
  customerSignUp,
  getAuthenticatedCustomerDraft,
  getCurrentCustomer,
  resendCustomerConfirmation,
  type CustomerProfile,
} from '../services/customerAuthService';

export function CustomerAccountGate({ onReady, initialMode = 'signup' }: { onReady: (profile: CustomerProfile) => void; initialMode?: 'signup' | 'login' }) {
  const [mode, setMode] = useState<'signup' | 'login' | 'google-complete'>(initialMode);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [pending, setPending] = useState(false);
  const [confirmationEmail, setConfirmationEmail] = useState('');
  const [googleName, setGoogleName] = useState('');
  const [googleEmail, setGoogleEmail] = useState('');

  useEffect(() => {
    let active = true;
    void getAuthenticatedCustomerDraft().then((draft) => {
      if (!active || !draft) return;
      setGoogleName(draft.name);
      setGoogleEmail(draft.email);
      setMode('google-complete');
      setMessage('Login com Google concluído. Informe seu WhatsApp para finalizar seu cadastro.');
    }).catch(() => undefined);
    return () => { active = false; };
  }, []);

  async function handleGoogleLogin() {
    setError('');
    setMessage('');
    setPending(true);
    try {
      await customerLoginWithGoogle();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível entrar com o Google.');
      setPending(false);
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setMessage('');
    setPending(true);
    const form = new FormData(event.currentTarget);
    try {
      if (mode === 'google-complete') {
        const profile = await completeCustomerProfile({
          name: String(form.get('name') ?? ''),
          phone: String(form.get('phone') ?? ''),
        });
        onReady(profile);
        return;
      }

      const email = String(form.get('email') ?? '').trim();
      const password = String(form.get('password') ?? '');
      if (mode === 'signup') {
        const name = String(form.get('name') ?? '').trim();
        const phone = String(form.get('phone') ?? '').trim();
        const confirm = String(form.get('confirm') ?? '');
        if (password.length < 6) throw new Error('A senha precisa ter pelo menos 6 caracteres.');
        if (password !== confirm) throw new Error('As senhas não conferem.');
        const result = await customerSignUp({ name, phone, email, password });
        if (!result.sessionCreated) {
          setConfirmationEmail(email);
          setMessage('Conta criada. Enviamos um e-mail de confirmação. Abra o link recebido para ativar sua conta e voltar ao orçamento.');
          setMode('login');
          return;
        }
        const profile = await getCurrentCustomer();
        if (!profile) throw new Error('Conta criada, mas não foi possível carregar seus dados.');
        onReady(profile);
      } else {
        onReady(await customerLogin(email, password));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível concluir o acesso.');
    } finally {
      setPending(false);
    }
  }

  if (mode === 'google-complete') {
    return (
      <div className="rounded-3xl bg-white p-6 shadow-soft md:p-8">
        <div className="flex items-start gap-4">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-zinc-950 text-white"><Chrome className="h-5 w-5" /></div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-500">Login com Google</p>
            <h2 className="mt-2 text-2xl font-semibold">Olá, {googleName.split(/\s+/)[0] || 'cliente'}</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-500">Login realizado com sucesso. Só falta seu WhatsApp para finalizar o cadastro e continuar o orçamento.</p>
          </div>
        </div>
        <form onSubmit={submit} className="mt-7 grid gap-4">
          <input className="field" name="name" value={googleName} onChange={(event) => setGoogleName(event.target.value)} placeholder="Nome completo" autoComplete="name" required />
          <input className="field bg-zinc-50" value={googleEmail} placeholder="E-mail" type="email" disabled />
          <input className="field" name="phone" placeholder="WhatsApp / telefone" type="tel" autoComplete="tel" required />
          {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700" role="alert">{error}</p>}
          {message && <p className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700" role="status">{message}</p>}
          <button className="button-primary w-full" disabled={pending}>{pending ? 'Salvando...' : 'Finalizar cadastro e continuar'}</button>
        </form>
      </div>
    );
  }

  return (
    <div className="rounded-3xl bg-white p-6 shadow-soft md:p-8">
      <div className="flex items-start gap-4">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-zinc-950 text-white">{mode === 'signup' ? <UserPlus className="h-5 w-5" /> : <LogIn className="h-5 w-5" />}</div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-500">Área do cliente</p>
          <h2 className="mt-2 text-2xl font-semibold">{mode === 'signup' ? 'Crie sua conta para continuar' : 'Entre na sua conta'}</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-500">{mode === 'signup' ? 'Nome, WhatsApp, e-mail e senha. Depois seus dados ficam preenchidos automaticamente.' : 'Acesse sua conta para continuar o orçamento.'}</p>
        </div>
      </div>

      <button type="button" className="mt-7 flex w-full items-center justify-center gap-3 rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-50" onClick={handleGoogleLogin} disabled={pending}>
        <span className="grid h-5 w-5 place-items-center rounded-full text-sm font-bold">G</span>
        {pending ? 'Aguarde...' : 'Continuar com Google'}
      </button>

      <div className="my-5 flex items-center gap-3 text-xs uppercase tracking-[0.16em] text-zinc-400">
        <span className="h-px flex-1 bg-zinc-200" />
        ou
        <span className="h-px flex-1 bg-zinc-200" />
      </div>

      <form onSubmit={submit} className="grid gap-4">
        {mode === 'signup' && <><input className="field" name="name" placeholder="Nome completo" autoComplete="name" required /><input className="field" name="phone" placeholder="WhatsApp / telefone" type="tel" autoComplete="tel" required /></>}
        <input className="field" name="email" placeholder="E-mail" type="email" autoComplete="email" required />
        <input className="field" name="password" placeholder="Senha" type="password" autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} minLength={6} required />
        {mode === 'signup' && <input className="field" name="confirm" placeholder="Confirmar senha" type="password" autoComplete="new-password" minLength={6} required />}
        {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700" role="alert">{error}</p>}
        {message && <p className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700" role="status">{message}</p>}
        <button className="button-primary w-full" disabled={pending}>{pending ? 'Aguarde...' : mode === 'signup' ? 'Criar minha conta' : 'Entrar e continuar'}</button>
      </form>

      {message && confirmationEmail && <button type="button" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-zinc-700 underline-offset-4 hover:underline" onClick={async () => {
        setError('');
        setPending(true);
        try {
          await resendCustomerConfirmation(confirmationEmail);
          setMessage('Novo e-mail de confirmação enviado. Verifique também a pasta de spam.');
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Não foi possível reenviar o e-mail.');
        } finally {
          setPending(false);
        }
      }} disabled={pending}><MailCheck className="h-4 w-4" /> Reenviar e-mail de confirmação</button>}

      <button type="button" className="mt-5 text-sm font-semibold text-zinc-700 underline-offset-4 hover:underline" onClick={() => {
        setMode(mode === 'signup' ? 'login' : 'signup');
        setError('');
        setMessage('');
      }}>{mode === 'signup' ? 'Já tenho uma conta' : 'Ainda não tenho uma conta'}</button>
    </div>
  );
}
