import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import { ArrowLeft, MessageCircle, ShieldCheck } from 'lucide-react';
import { QuoteForm } from '../components/QuoteForm';
import { CustomerAccountGate } from '../components/CustomerAccountGate';
import { useState } from 'react';
import { getCurrentCustomer, type CustomerProfile } from '../services/customerAuthService';
import { Footer, PublicHeader } from '../components/PublicLayout';
import { Seo } from '../components/Seo';
import { getServices, getSettings } from '../services/contentService';
import { whatsappUrl } from '../lib/utils';
import { getCustomerQuotes, getQuoteFileUrl } from '../services/quoteService';

function CustomerQuotes({ profile }: { profile: CustomerProfile }) {
  const customerQuotesKey = ['customer-quotes', profile.id] as const;
  const quotesQuery = useQuery({
    queryKey: customerQuotesKey,
    queryFn: getCustomerQuotes,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });
  const quotes = quotesQuery.data ?? [];
  const hasQuotes = quotes.length > 0;

  return (
    <div className="mt-6 rounded-3xl bg-white p-6 shadow-soft md:p-8">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-500">Área do cliente</p>
      <h2 className="mt-2 text-2xl font-semibold">Meus orçamentos</h2>
      <div className="mt-5 grid gap-3">
        {hasQuotes ? (
          quotes.map((quote) => (
            <article key={quote.id} className="rounded-2xl border border-zinc-200 p-4">
              <div className="flex flex-col justify-between gap-2 sm:flex-row">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500">{quote.quoteNumber}</p>
                  <p className="mt-1 font-semibold">{quote.serviceTypes.join(', ') || quote.propertyType}</p>
                </div>
                <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold">
                  {quote.status === 'sent'
                    ? 'Orçamento disponível'
                    : quote.status === 'in_review'
                      ? 'Em análise'
                      : quote.status === 'new'
                        ? 'Solicitação recebida'
                        : quote.status}
                </span>
              </div>
              {quote.status === 'sent' && quote.finalPdfPath && <CustomerPdf path={quote.finalPdfPath} />}
            </article>
          ))
        ) : (
          <p className="rounded-2xl bg-zinc-50 p-5 text-sm text-zinc-500">
            Seus orçamentos aparecerão aqui após o primeiro envio.
          </p>
        )}
      </div>
    </div>
  );
}

function CustomerPdf({ path }: { path: string }) { return <button type="button" className="button-secondary mt-4" onClick={async () => { const signed = await getQuoteFileUrl(path); if (signed) window.open(signed, '_blank', 'noopener,noreferrer'); }}>Baixar orçamento em PDF</button>; }

export function QuotePage() {
  const customerQuery = useQuery({ queryKey: ['customer-profile'], queryFn: getCurrentCustomer, staleTime: 0 });
  const [profileOverride, setProfileOverride] = useState<CustomerProfile | null>(null);
  const settingsQuery = useQuery({ queryKey: ['settings'], queryFn: getSettings, staleTime: 0 });
  const servicesQuery = useQuery({ queryKey: ['services'], queryFn: getServices, staleTime: 0 });
  const settings = settingsQuery.data;
  const services = servicesQuery.data ?? [];
  const profile = profileOverride ?? customerQuery.data;
  const firstName = profile?.name.trim().split(/\s+/)[0] || '';
  const initialLogin = typeof window !== 'undefined' && (window.location.pathname === '/login' || new URLSearchParams(window.location.search).get('modo') === 'login');

  if (settingsQuery.isError) return <div className="grid min-h-screen place-items-center px-5 text-center text-sm text-zinc-600">Não foi possível carregar a página de orçamento. Atualize a página e tente novamente.</div>;
  if (!settings || customerQuery.isLoading) return <div className="grid min-h-screen place-items-center text-sm text-zinc-500">Carregando orçamento...</div>;

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950">
      <Seo title="Solicitar orçamento | PintarBH" description="Envie os detalhes do seu projeto para solicitar um orçamento da PintarBH." image={settings.heroImage} />
      <PublicHeader settings={settings} />
      <main>
        <section className="relative overflow-hidden border-b border-zinc-200 bg-white">
          <div className="rainbow-arc mx-auto max-w-7xl px-5 pb-10 pt-10 md:px-8 md:pb-14 md:pt-14 lg:px-12">
            <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 transition hover:text-zinc-950"><ArrowLeft className="h-4 w-4" /> Voltar para o site</Link>
            <div className="mt-8 grid items-end gap-8 lg:grid-cols-[1fr_auto]">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-500">PintarBH • Orçamento</p>
                <h1 className="mt-4 max-w-3xl text-4xl font-light leading-tight md:text-6xl">Vamos entender o seu projeto.</h1>
                <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-600 md:text-lg">Comece com seus dados e, na próxima etapa, conte os detalhes da pintura, reforma ou acabamento que você deseja realizar.</p>
              </motion.div>
              <a href={whatsappUrl(settings.whatsapp)} className="button-secondary w-full sm:w-auto"><MessageCircle className="h-5 w-5" /> Falar pelo WhatsApp</a>
            </div>
          </div>
        </section>

        <section className="py-10 md:py-16">
          <div className="mx-auto grid max-w-7xl gap-8 px-5 md:px-8 lg:grid-cols-[minmax(0,1fr)_280px] lg:px-12">
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.08 }}>
              {profile ? <>
                <div className="mb-6 rounded-3xl bg-white p-6 shadow-soft ring-1 ring-zinc-200 md:p-7">
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-500">Área do cliente</p>
                  <h2 className="mt-2 text-2xl font-semibold">Olá, {firstName}!</h2>
                  <p className="mt-2 text-sm leading-6 text-zinc-500">Seu acesso está ativo. Vamos continuar com os detalhes do seu orçamento.</p>
                </div>
                <QuoteForm services={services} profile={profile} />
                <CustomerQuotes profile={profile} />
              </> : <CustomerAccountGate onReady={setProfileOverride} initialMode={initialLogin ? 'login' : 'signup'} />}
            </motion.div>
            <motion.aside initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.55, delay: 0.15 }} className="h-fit rounded-2xl border border-zinc-200 bg-white p-6 lg:sticky lg:top-28">
              <ShieldCheck className="h-6 w-6 text-zinc-700" />
              <h2 className="mt-4 text-lg font-semibold">Solicitação organizada</h2>
              <p className="mt-3 text-sm leading-6 text-zinc-600">As informações e fotos ficam registradas para a equipe analisar o projeto com mais contexto.</p>
              <div className="mt-5 grid gap-3 text-sm text-zinc-600"><div><strong className="text-zinc-900">1.</strong> Seus dados</div><div><strong className="text-zinc-900">2.</strong> Detalhes do projeto</div><div><strong className="text-zinc-900">3.</strong> Fotos e referências</div><div><strong className="text-zinc-900">4.</strong> Envio da solicitação</div></div>
            </motion.aside>
          </div>
        </section>
      </main>
      <Footer settings={settings} />
    </div>
  );
}
