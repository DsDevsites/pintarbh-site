import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { ArrowLeft, LogOut, Save, UserCircle } from 'lucide-react';
import { useState } from 'react';
import { CustomerAccountGate } from '../components/CustomerAccountGate';
import { Footer, PublicHeader } from '../components/PublicLayout';
import { Seo } from '../components/Seo';
import { getSettings } from '../services/contentService';
import { customerLogout, getCurrentCustomer, updateCustomerProfile, type CustomerProfile } from '../services/customerAuthService';

export function ProfilePage() {
  const queryClient = useQueryClient();
  const settingsQuery = useQuery({ queryKey: ['settings'], queryFn: getSettings, staleTime: 5 * 60 * 1000 });
  const profileQuery = useQuery({ queryKey: ['customer-profile'], queryFn: getCurrentCustomer, staleTime: 0 });
  const [profileOverride, setProfileOverride] = useState<CustomerProfile | null>(null);

  const settings = settingsQuery.data;
  const profile = profileOverride ?? profileQuery.data;

  if (settingsQuery.isError) {
    return <div className="grid min-h-screen place-items-center px-5 text-center text-sm text-zinc-600">Não foi possível carregar seu perfil. Atualize a página e tente novamente.</div>;
  }

  if (!settings || profileQuery.isLoading) {
    return <div className="grid min-h-screen place-items-center text-sm text-zinc-500">Carregando perfil...</div>;
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950">
      <Seo title="Meu perfil | PintarBH" description="Gerencie seus dados de acesso e contato na PintarBH." image={settings.heroImage} />
      <PublicHeader settings={settings} />
      <main className="py-10 md:py-16">
        <div className="mx-auto max-w-3xl px-5 md:px-8">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 transition hover:text-zinc-950">
            <ArrowLeft className="h-4 w-4" /> Voltar para o site
          </Link>

          {profile ? (
            <ProfileEditor
              profile={profile}
              onSaved={(next) => {
                setProfileOverride(next);
                queryClient.setQueryData(['customer-profile'], next);
              }}
              onLogout={async () => {
                await customerLogout();
                queryClient.removeQueries({ queryKey: ['customer-profile'] });
                window.location.replace('/');
              }}
            />
          ) : (
            <div className="mt-8">
              <CustomerAccountGate onReady={setProfileOverride} initialMode="login" />
            </div>
          )}
        </div>
      </main>
      <Footer settings={settings} />
    </div>
  );
}

function ProfileEditor({
  profile,
  onSaved,
  onLogout,
}: {
  profile: CustomerProfile;
  onSaved: (profile: CustomerProfile) => void;
  onLogout: () => Promise<void>;
}) {
  const [name, setName] = useState(profile.name);
  const [phone, setPhone] = useState(profile.phone);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const mutation = useMutation({
    mutationFn: () => updateCustomerProfile({ name, phone }),
    onSuccess: (next) => {
      onSaved(next);
      setMessage('Dados atualizados com sucesso.');
      setError('');
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : 'Não foi possível atualizar seus dados.');
      setMessage('');
    },
  });

  return (
    <section className="mt-8 rounded-3xl bg-white p-6 shadow-soft ring-1 ring-zinc-200 md:p-8">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-zinc-950 text-white">
            <UserCircle className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-500">Meu perfil</p>
            <h1 className="mt-2 text-2xl font-semibold">Seus dados</h1>
            <p className="mt-2 text-sm leading-6 text-zinc-500">Mantenha seu nome e WhatsApp atualizados para facilitar seus próximos orçamentos.</p>
          </div>
        </div>
      </div>

      <div className="mt-7 grid gap-4">
        <label className="grid gap-2 text-sm font-medium">
          Nome completo
          <input className="field" value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" />
        </label>
        <label className="grid gap-2 text-sm font-medium">
          WhatsApp / telefone
          <input className="field" value={phone} onChange={(event) => setPhone(event.target.value)} autoComplete="tel" />
        </label>
        <label className="grid gap-2 text-sm font-medium">
          E-mail
          <input className="field bg-zinc-50" value={profile.email} disabled />
        </label>
      </div>

      {error && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700" role="alert">{error}</p>}
      {message && <p className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700" role="status">{message}</p>}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button type="button" className="button-primary" onClick={() => mutation.mutate()} disabled={mutation.isPending}>
          <Save className="h-5 w-5" /> {mutation.isPending ? 'Salvando...' : 'Salvar alterações'}
        </button>
        <button type="button" className="button-secondary" onClick={() => void onLogout()} disabled={mutation.isPending}>
          <LogOut className="h-5 w-5" /> Sair da conta
        </button>
      </div>
    </section>
  );
}
