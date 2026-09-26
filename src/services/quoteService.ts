import { supabase } from '../lib/supabase';
import type { Quote, QuoteDraft, QuoteImage } from '../types';

type DbQuote = {
  id: string;
  quote_number: string;
  name: string;
  email: string;
  phone: string;
  property_type: string;
  city: string;
  neighborhood: string | null;
  address: string | null;
  service_types: string[];
  environments: number | null;
  area: number | null;
  color: string | null;
  finish: string | null;
  desired_start_date: string | null;
  urgency: string | null;
  budget_range: string | null;
  description: string;
  status: Quote['status'];
  labor_amount: number | null;
  materials_amount: number | null;
  other_amount: number | null;
  discount_amount: number | null;
  total_amount: number | null;
  duration: string | null;
  payment_terms: string | null;
  admin_notes: string | null;
  request_pdf_path: string | null;
  final_pdf_path: string | null;
  email_status: Quote['emailStatus'];
  client_id: string | null;
  created_at: string;
  updated_at: string;
  quote_images?: Array<{ id: string; image_path: string; sort_order: number }>;
};

function mapQuote(row: DbQuote): Quote {
  return {
    id: row.id,
    clientId: row.client_id,
    quoteNumber: row.quote_number,
    name: row.name,
    email: row.email,
    phone: row.phone,
    propertyType: row.property_type,
    city: row.city,
    neighborhood: row.neighborhood ?? '',
    address: row.address ?? '',
    serviceTypes: row.service_types ?? [],
    environments: row.environments,
    area: row.area,
    color: row.color ?? '',
    finish: row.finish ?? '',
    desiredStartDate: row.desired_start_date ?? '',
    urgency: row.urgency ?? '',
    budgetRange: row.budget_range ?? '',
    description: row.description,
    status: row.status,
    laborAmount: row.labor_amount,
    materialsAmount: row.materials_amount,
    otherAmount: row.other_amount,
    discountAmount: row.discount_amount,
    totalAmount: row.total_amount,
    duration: row.duration ?? '',
    paymentTerms: row.payment_terms ?? '',
    adminNotes: row.admin_notes ?? '',
    requestPdfPath: row.request_pdf_path,
    finalPdfPath: row.final_pdf_path,
    emailStatus: row.email_status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    images: (row.quote_images ?? []).map((image) => ({
      id: image.id,
      quoteId: row.id,
      imagePath: image.image_path,
      sortOrder: image.sort_order,
    })),
  };
}

export async function createQuote(draft: QuoteDraft & { images: Array<{ name: string; type: string; data: string }> }) {
  if (!supabase) throw new Error('Supabase não configurado.');
  const { data, error } = await supabase.functions.invoke('create-quote', {
    body: {
      ...draft,
      images: draft.images,
      website: '',
    },
  });
  if (error) throw error;
  if (!data?.quoteNumber) throw new Error(data?.error ?? 'Não foi possível registrar o orçamento.');
  return data as { id: string; quoteNumber: string };
}

export async function getQuotes(): Promise<Quote[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('quotes')
    .select('*, quote_images(id, image_path, sort_order)')
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data as DbQuote[]).map(mapQuote);
}

export async function updateQuote(quote: Quote) {
  if (!supabase) throw new Error('Supabase não configurado.');
  const { error } = await supabase.from('quotes').update({
    status: quote.status,
    labor_amount: quote.laborAmount,
    materials_amount: quote.materialsAmount,
    other_amount: quote.otherAmount,
    discount_amount: quote.discountAmount,
    duration: quote.duration,
    payment_terms: quote.paymentTerms,
    admin_notes: quote.adminNotes,
    updated_at: new Date().toISOString(),
  }).eq('id', quote.id);
  if (error) throw new Error(error.message);
}

export async function generateFinalQuote(quote: Quote) {
  if (!supabase) throw new Error('Supabase não configurado.');
  const { data, error } = await supabase.functions.invoke('generate-quote-pdf', {
    body: {
      quoteId: quote.id,
      laborAmount: quote.laborAmount ?? 0,
      materialsAmount: quote.materialsAmount ?? 0,
      otherAmount: quote.otherAmount ?? 0,
      discountAmount: quote.discountAmount ?? 0,
      duration: quote.duration,
      paymentTerms: quote.paymentTerms,
      adminNotes: quote.adminNotes,
    },
  });
  if (error) throw error;
  if (!data?.ok) throw new Error(data?.error ?? 'Não foi possível gerar o orçamento.');
  return data as { ok: true; total: number; path: string };
}

export async function getQuoteFileUrl(path: string) {
  if (!supabase) return null;
  const { data, error } = await supabase.storage.from('pintarbh-quotes').createSignedUrl(path, 24 * 60 * 60);
  if (error) throw new Error(error.message);
  return data.signedUrl;
}

export async function getQuoteImageUrl(imagePath: string) {
  return getQuoteFileUrl(imagePath);
}


export async function getCustomerQuotes(): Promise<Quote[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('quotes')
    .select('*, quote_images(id, image_path, sort_order)')
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data as DbQuote[]).map(mapQuote);
}
