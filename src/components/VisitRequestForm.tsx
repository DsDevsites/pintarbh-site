import { useMutation } from '@tanstack/react-query';
import { CalendarDays, CheckCircle2, MessageCircle, Send } from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';
import { createVisitRequest } from '../services/contentService';
import { visitWhatsappMessage, whatsappUrl } from '../lib/utils';
import type { Service } from '../types';

type Props = { services: Service[]; whatsapp: string };

export function VisitRequestForm({ services, whatsapp }: Props) {
  const mutation = useMutation({ mutationFn: createVisitRequest });
  const [submitted, setSubmitted] = useState<{
    name: string;
    phone: string;
    serviceType: string;
    address: string;
    preferredDate: string;
    preferredPeriod: string;
  } | null>(null);

  const serviceOptions = useMemo(
    () => services.length ? services.map((service) => service.title) : ['Pintura residencial', 'Pintura comercial', 'Pintura externa', 'Acabamentos'],
    [services],
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const input = {
      name: String(form.get('name') ?? ''),
      phone: String(form.get('phone') ?? ''),
      serviceType: String(form.get('serviceType') ?? ''),
      address: String(form.get('address') ?? ''),
      preferredDate: String(form.get('preferredDate') ?? ''),
      preferredPeriod: String(form.get('preferredPeriod') ?? ''),
      observations: String(form.get('observations') ?? ''),
    };

    try {
      await mutation.mutateAsync(input);
      setSubmitted({
        name: input.name,
        phone: input.phone,
        serviceType: input.serviceType,
        address: input.address,
        preferredDate: input.preferredDate,
        preferredPeriod: input.preferredPeriod,
      });
      event.currentTarget.reset();
    } catch {
      // Error feedback is rendered below.
    }
  }

  const whatsappLink = submitted
    ? whatsappUrl(whatsapp, visitWhatsappMessage(submitted))
    : '';

  return (
    <div className="rounded-3xl bg-white p-6 shadow-soft ring-1 ring-zinc-200 md:p-8">
      <div className="flex items-start gap-4">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-zinc-950 text-white">
          <CalendarDays className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-500">Visita técnica</p>
          <h3 className="mt-2 text-2xl font-semibold">Vamos conhecer o local.</h3>
          <p className="mt-2 text-sm leading-6 text-zinc-500">Envie uma preferência de data e período. A equipe entra em contato para confirmar a visita.</p>
        </div>
      </div>

      {submitted ? (
        <div className="mt-7 rounded-2xl bg-emerald-50 p-5 text-emerald-800">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <p className="font-semibold">Solicitação enviada com sucesso!</p>
              <p className="mt-1 text-sm leading-6">Entraremos em contato para confirmar a visita.</p>
            </div>
          </div>
          <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="button-primary mt-5 w-full sm:w-auto">
            <MessageCircle className="h-5 w-5" /> Enviar pelo WhatsApp
          </a>
          <button type="button" className="button-secondary mt-3 w-full sm:w-auto" onClick={() => setSubmitted(null)}>Solicitar outra visita</button>
        </div>
      ) : (
        <form className="mt-7 grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium text-zinc-700">Nome<input className="field" name="name" placeholder="Seu nome" autoComplete="name" minLength={2} required /></label>
            <label className="grid gap-2 text-sm font-medium text-zinc-700">WhatsApp<label className="sr-only" htmlFor="visit-phone">WhatsApp</label><input id="visit-phone" className="field" name="phone" type="tel" inputMode="tel" placeholder="(31) 99999-9999" autoComplete="tel" minLength={8} required /></label>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium text-zinc-700">Tipo de serviço<select className="field" name="serviceType" defaultValue="" required><option value="" disabled>Selecione</option>{serviceOptions.map((service) => <option key={service}>{service}</option>)}</select></label>
            <label className="grid gap-2 text-sm font-medium text-zinc-700">Data preferencial<input className="field" name="preferredDate" type="date" min={new Date().toISOString().slice(0, 10)} required /></label>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium text-zinc-700">Período<select className="field" name="preferredPeriod" defaultValue="" required><option value="" disabled>Selecione</option><option>Manhã</option><option>Tarde</option><option>Horário comercial</option></select></label>
            <label className="grid gap-2 text-sm font-medium text-zinc-700">Bairro / endereço<input className="field" name="address" placeholder="Bairro e endereço" autoComplete="street-address" minLength={3} required /></label>
          </div>
          <label className="grid gap-2 text-sm font-medium text-zinc-700">Observações<textarea className="field min-h-28 resize-y" name="observations" placeholder="Alguma informação importante sobre o local ou serviço?" /></label>
          {mutation.isError && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700" role="alert">{mutation.error instanceof Error ? mutation.error.message : 'Não foi possível enviar a solicitação.'}</p>}
          <button type="submit" className="button-primary w-full sm:w-fit" disabled={mutation.isPending}>
            <Send className="h-5 w-5" /> {mutation.isPending ? 'Enviando...' : 'Solicitar visita'}
          </button>
        </form>
      )}
    </div>
  );
}
