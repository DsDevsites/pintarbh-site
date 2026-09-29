import { ArrowRight } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import type { PreQuoteDraft, Service } from '../types';

export const PRE_QUOTE_STORAGE_KEY = 'pintarbh:prequote';

type Props = {
  services: Service[];
};

const fallbackServices = ['Pintura interna', 'Pintura externa', 'Textura', 'Acabamento'];

export function PreQuoteForm({ services }: Props) {
  const navigate = useNavigate();
  const [area, setArea] = useState('');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const draft: PreQuoteDraft = {
      name: String(form.get('name') ?? '').trim(),
      phone: String(form.get('phone') ?? '').trim(),
      city: String(form.get('city') ?? '').trim(),
      propertyType: String(form.get('propertyType') ?? '').trim(),
      serviceType: String(form.get('serviceType') ?? '').trim(),
      neighborhood: String(form.get('neighborhood') ?? '').trim(),
      area: Number(area) || null,
    };

    sessionStorage.setItem(PRE_QUOTE_STORAGE_KEY, JSON.stringify(draft));
    void navigate({ to: '/orcamento' });
  }

  const serviceOptions = services.length ? services.map((service) => service.title) : fallbackServices;

  return (
    <form onSubmit={handleSubmit} className="rounded-3xl bg-white p-5 shadow-soft ring-1 ring-zinc-200 md:p-6">
      <div className="grid gap-3 md:grid-cols-2">
        <div className="md:col-span-2">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-500">Pré-orçamento</p>
          <h3 className="mt-2 text-2xl font-semibold md:text-3xl">Comece com algumas informações.</h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
            Preencha o básico agora e continue para a etapa completa, onde você poderá informar todos os detalhes e enviar fotos do projeto.
          </p>
        </div>

        <input className="field" name="name" placeholder="Seu nome" autoComplete="name" minLength={2} required />
        <input className="field" name="phone" type="tel" inputMode="tel" placeholder="WhatsApp / telefone" autoComplete="tel" required />
        <input className="field" name="city" placeholder="Cidade" defaultValue="Belo Horizonte" required />
        <input className="field" name="neighborhood" placeholder="Bairro" />
        <select className="field" name="propertyType" defaultValue="" required>
          <option value="" disabled>Tipo de imóvel</option>
          <option>Casa</option>
          <option>Apartamento</option>
          <option>Comércio</option>
          <option>Escritório</option>
          <option>Condomínio</option>
          <option>Outro</option>
        </select>
        <select className="field" name="serviceType" defaultValue="" required>
          <option value="" disabled>Serviço desejado</option>
          {serviceOptions.map((service) => <option key={service}>{service}</option>)}
        </select>
        <input
          className="field md:col-span-2"
          name="area"
          type="number"
          min="1"
          step="0.01"
          placeholder="Área aproximada em m² (opcional)"
          value={area}
          onChange={(event) => setArea(event.target.value)}
        />

        <button type="submit" className="button-primary mt-2 w-full md:col-span-2">
          <ArrowRight className="h-5 w-5" /> Continuar para o orçamento completo
        </button>
      </div>
    </form>
  );
}
