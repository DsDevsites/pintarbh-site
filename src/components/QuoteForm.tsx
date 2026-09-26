import { ChangeEvent, FormEvent, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Camera, CheckCircle2, FileText, ImagePlus, MessageCircle, Send, X } from 'lucide-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { createQuote } from '../services/quoteService';
import type { QuoteDraft, Service } from '../types';
import { quoteWhatsappMessage, whatsappUrl } from '../lib/utils';
import { getSettings } from '../services/contentService';
import type { CustomerProfile } from '../services/customerAuthService';

type Props = { services: Service[] };
type ImagePayload = { name: string; type: string; data: string };

function readAsDataUrl(file: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Não foi possível ler a imagem.'));
    reader.readAsDataURL(file);
  });
}

async function compressImage(file: File): Promise<ImagePayload> {
  const bitmap = await createImageBitmap(file);
  const max = 1400;
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Não foi possível preparar a imagem.');
  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const firstBlob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.78));
  if (!firstBlob) throw new Error('Não foi possível preparar a imagem.');
  let blob: Blob = firstBlob;
  if (blob.size > 700_000) {
    const smallerBlob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.62));
    if (!smallerBlob) throw new Error('Não foi possível preparar a imagem.');
    blob = smallerBlob;
  }
  if (blob.size > 700_000) throw new Error('Uma das fotos ficou muito grande. Escolha uma foto menor.');
  return { name: file.name.replace(/\.[^.]+$/, '.jpg'), type: 'image/jpeg', data: await readAsDataUrl(blob) };
}

export function QuoteForm({ services, profile }: Props & { profile: CustomerProfile }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState(1);
  const [files, setFiles] = useState<File[]>([]);
  const [sentNumber, setSentNumber] = useState('');
  const [submittedDetails, setSubmittedDetails] = useState<{ serviceTypes: string[]; propertyType: string; neighborhood: string; address: string; area: number | null; city: string } | null>(null);
  const settingsQuery = useQuery({ queryKey: ['settings'], queryFn: getSettings, staleTime: 5 * 60 * 1000 });
  const mutation = useMutation({ mutationFn: createQuote });

  function addFiles(event: ChangeEvent<HTMLInputElement>) {
    const incoming = Array.from(event.target.files ?? []);
    setFiles((current) => [...current, ...incoming].slice(0, 5));
    event.target.value = '';
  }

  function removeFile(index: number) {
    setFiles((current) => current.filter((_, i) => i !== index));
  }

  function continueToDetails(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!event.currentTarget.reportValidity()) return;
    setStep(2);
    window.setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 0);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSentNumber('');
    const form = new FormData(event.currentTarget);
    const selectedServices = form.getAll('serviceTypes').map(String);

    try {
      if (!selectedServices.length) throw new Error('Selecione pelo menos um serviço.');
      const images = await Promise.all(files.map(compressImage));
      const draft: QuoteDraft = {
        clientId: profile.id,
        name: String(form.get('name') ?? ''),
        email: String(form.get('email') ?? ''),
        phone: String(form.get('phone') ?? ''),
        propertyType: String(form.get('propertyType') ?? ''),
        city: String(form.get('city') ?? ''),
        neighborhood: String(form.get('neighborhood') ?? ''),
        address: String(form.get('address') ?? ''),
        serviceTypes: selectedServices,
        environments: Number(form.get('environments')) || null,
        area: Number(form.get('area')) || null,
        color: String(form.get('color') ?? ''),
        finish: String(form.get('finish') ?? ''),
        desiredStartDate: String(form.get('desiredStartDate') ?? ''),
        urgency: String(form.get('urgency') ?? ''),
        budgetRange: String(form.get('budgetRange') ?? ''),
        description: String(form.get('description') ?? ''),
        status: 'new',
        laborAmount: null,
        materialsAmount: null,
        otherAmount: null,
        discountAmount: null,
        duration: '',
        paymentTerms: '',
        adminNotes: '',
      };
      const result = await mutation.mutateAsync({ ...draft, images });
      setSentNumber(result.quoteNumber);
      setSubmittedDetails({
        serviceTypes: selectedServices,
        propertyType: draft.propertyType,
        neighborhood: draft.neighborhood,
        address: draft.address,
        area: draft.area,
        city: draft.city,
      });
      event.currentTarget.reset();
      setFiles([]);
      setStep(1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      // mutation displays the error state below.
    }
  }

  const progress = step === 1 ? 50 : 100;

  return (
    <form onSubmit={step === 1 ? continueToDetails : handleSubmit} className="rounded-3xl bg-white p-6 text-zinc-950 shadow-soft md:p-8">
      <div className="mb-7">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-500">Solicitar orçamento</p>
            <h2 className="mt-2 text-2xl font-semibold md:text-3xl">{step === 1 ? 'Comece pelos seus dados' : 'Agora conte sobre o projeto'}</h2>
          </div>
          <span className="shrink-0 text-sm font-semibold text-zinc-500">Etapa {step} de 2</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-zinc-100" aria-label={`Progresso: ${progress}%`}>
          <div className="h-full rounded-full bg-zinc-950 transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
        <p className="mt-3 text-sm leading-6 text-zinc-500">{step === 1 ? 'É rápido. Informe como podemos falar com você para iniciar a solicitação.' : 'Esses detalhes ajudam a equipe a entender o serviço antes de analisar sua solicitação.'}</p>
      </div>

      <div className={step === 1 ? 'grid gap-4 sm:grid-cols-2' : 'hidden'} aria-hidden={step !== 1}>
        <input className="field" name="name" placeholder="Nome" autoComplete="name" minLength={2} required defaultValue={profile.name} />
        <input className="field" name="phone" type="tel" inputMode="tel" placeholder="Telefone / WhatsApp" autoComplete="tel" required defaultValue={profile.phone} />
        <input className="field sm:col-span-2" name="email" type="email" inputMode="email" autoComplete="email" placeholder="E-mail para contato" required defaultValue={profile.email} />
        <input className="field sm:col-span-2" name="city" placeholder="Cidade" defaultValue="Belo Horizonte" required />
      </div>

      <div className={step === 2 ? 'block' : 'hidden'} aria-hidden={step !== 2}>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block"><span className="mb-2 block text-sm font-medium text-zinc-700">Tipo de imóvel</span><select className="field" name="propertyType" required disabled={step !== 2} defaultValue=""><option value="" disabled>Selecione</option><option>Casa</option><option>Apartamento</option><option>Comércio</option><option>Escritório</option><option>Condomínio</option><option>Outro</option></select></label>
          <input className="field sm:mt-7" name="neighborhood" placeholder="Bairro" disabled={step !== 2} />
          <input className="field" name="address" placeholder="Endereço (opcional)" autoComplete="street-address" disabled={step !== 2} />
          <input className="field" name="environments" type="number" min="1" max="100" placeholder="Quantidade de ambientes" disabled={step !== 2} />
          <input className="field" name="area" type="number" min="1" step="0.01" placeholder="Área aproximada em m²" disabled={step !== 2} />
        </div>

        <div className="mt-6">
          <span className="mb-3 block text-sm font-medium text-zinc-700">Serviços desejados</span>
          <div className="grid gap-2 sm:grid-cols-2">
            {(services.length ? services.map((service) => service.title) : ['Pintura interna', 'Pintura externa', 'Textura', 'Acabamento']).map((service) => (
              <label key={service} className="flex items-center gap-3 rounded-xl border border-zinc-200 px-4 py-3 text-sm transition hover:border-zinc-400"><input type="checkbox" name="serviceTypes" value={service} disabled={step !== 2} /><span>{service}</span></label>
            ))}
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <input className="field" name="color" placeholder="Cor desejada (se já souber)" disabled={step !== 2} />
          <select className="field" name="finish" disabled={step !== 2} defaultValue=""><option value="">Tipo de acabamento</option><option>Fosco</option><option>Acetinado</option><option>Semi-brilho</option><option>Texturizado</option><option>Não sei ainda</option></select>
          <label className="block"><span className="mb-2 block text-sm font-medium text-zinc-700">Data desejada para início</span><input className="field" name="desiredStartDate" type="date" disabled={step !== 2} /></label>
          <select className="field" name="urgency" disabled={step !== 2} defaultValue=""><option value="">Quando pretende realizar?</option><option>O quanto antes</option><option>Nos próximos 30 dias</option><option>Nos próximos 60 dias</option><option>Estou apenas planejando</option></select>
          <select className="field sm:col-span-2" name="budgetRange" disabled={step !== 2} defaultValue=""><option value="">Faixa de investimento (opcional)</option><option>Até R$ 2.000</option><option>R$ 2.000 a R$ 5.000</option><option>R$ 5.000 a R$ 10.000</option><option>Acima de R$ 10.000</option><option>Ainda não sei</option></select>
        </div>

        <textarea className="field mt-6 min-h-36 resize-y" name="description" placeholder="Descreva o serviço, o estado atual das paredes, o que deseja mudar e qualquer outra informação importante." minLength={10} required disabled={step !== 2} />

        <div className="mt-6 rounded-2xl border border-dashed border-zinc-300 p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-semibold">Fotos e referências</p><p className="mt-1 text-xs leading-5 text-zinc-500">Envie até 5 fotos do local ou referências do resultado desejado.</p></div><button type="button" className="button-secondary" onClick={() => inputRef.current?.click()}><ImagePlus className="h-5 w-5" /> Adicionar fotos</button></div>
          <input ref={inputRef} className="hidden" type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={addFiles} />
          {files.length ? <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">{files.map((file, index) => <div key={`${file.name}-${index}`} className="relative overflow-hidden rounded-xl border border-zinc-200"><img src={URL.createObjectURL(file)} alt={file.name} className="aspect-square w-full object-cover" /><button type="button" onClick={() => removeFile(index)} className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-white/95 text-zinc-800 shadow" aria-label={`Remover ${file.name}`}><X className="h-4 w-4" /></button></div>)}</div> : <div className="mt-4 flex items-center gap-3 rounded-xl bg-zinc-50 p-4 text-sm text-zinc-500"><Camera className="h-5 w-5" /> Nenhuma foto selecionada.</div>}
        </div>
      </div>

      {step === 1 ? (
        <button type="submit" className="button-primary mt-7 w-full"><ArrowRight className="h-5 w-5" /> Continuar orçamento</button>
      ) : (
        <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row">
          <button type="button" className="button-secondary flex-1" onClick={() => setStep(1)}><ArrowLeft className="h-5 w-5" /> Voltar</button>
          <button type="submit" className="button-primary flex-1" disabled={mutation.isPending}><Send className="h-5 w-5" /> {mutation.isPending ? 'Enviando solicitação...' : 'Finalizar orçamento'}</button>
        </div>
      )}

      {sentNumber && <div className="mt-4 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-700" role="status">
        <div className="flex items-start gap-3"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" /><span>Orçamento criado com sucesso. Protocolo <strong>{sentNumber}</strong>. Sua solicitação foi registrada e já está disponível para nossa equipe analisar.</span></div>
        {submittedDetails && settingsQuery.data?.whatsapp && (
          <a
            className="button-primary mt-4 w-full sm:w-fit"
            href={whatsappUrl(settingsQuery.data.whatsapp, quoteWhatsappMessage(submittedDetails))}
            target="_blank"
            rel="noopener noreferrer"
          >
            <MessageCircle className="h-5 w-5" /> Enviar resumo pelo WhatsApp
          </a>
        )}
      </div>}
      {mutation.isError && <div className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-700" role="alert">Não foi possível enviar a solicitação. Confira os dados e tente novamente.</div>}
      <p className="mt-4 flex items-center gap-2 text-xs leading-5 text-zinc-500"><FileText className="h-4 w-4 shrink-0" /> Seus dados serão usados para analisar e responder à solicitação de orçamento.</p>
    </form>
  );
}
