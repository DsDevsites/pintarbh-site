import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function slugify(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function whatsappUrl(phone: string, message = 'Olá, gostaria de solicitar um orçamento com a PintarBH.') {
  const number = phone.replace(/\D/g, '');
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

function optionalLine(label: string, value: unknown) {
  const text = String(value ?? '').trim();
  return text ? `\\n${label}: ${text}` : '';
}

export function quoteWhatsappMessage(input: {
  serviceTypes?: string[];
  propertyType?: string;
  neighborhood?: string;
  address?: string;
  area?: number | string | null;
  city?: string;
}) {
  const services = (input.serviceTypes ?? []).filter(Boolean).join(', ');
  return [
    'Olá! Vim pelo site PintarBH e gostaria de solicitar um orçamento.',
    optionalLine('Serviço', services),
    optionalLine('Tipo de imóvel', input.propertyType),
    optionalLine('Bairro', input.neighborhood),
    optionalLine('Endereço', input.address),
    optionalLine('Cidade', input.city),
    optionalLine('Área aproximada', input.area ? `${input.area} m²` : ''),
    '',
    'Gostaria de mais informações.',
  ].join('').trim();
}

export function visitWhatsappMessage(input: {
  name?: string;
  serviceType?: string;
  address?: string;
  preferredDate?: string;
  preferredPeriod?: string;
}) {
  return [
    'Olá! Vim pelo site PintarBH e gostaria de solicitar uma visita técnica.',
    optionalLine('Nome', input.name),
    optionalLine('Serviço', input.serviceType),
    optionalLine('Endereço/Bairro', input.address),
    optionalLine('Data preferencial', input.preferredDate),
    optionalLine('Período', input.preferredPeriod),
    '',
    'Aguardo confirmação.',
  ].join('').trim();
}

export function sanitizeText(value: string) {
  return value.replace(/[<>]/g, '').trim();
}
