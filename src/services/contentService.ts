import { defaultProjects, defaultServices, defaultSettings, defaultTestimonials } from '../data/seed';
import { sanitizeText, slugify } from '../lib/utils';
import { supabase } from '../lib/supabase';
import type { ContactMessage, Project, Service, SiteSettings, Testimonial } from '../types';

type DbProject = {
  id: string; slug: string; title: string; category: string; location: string; date: string;
  cover_image: string; short_description: string; full_description: string; services: string[];
  featured: boolean; project_images?: { image_url: string; sort_order?: number }[];
};

type DbContact = { id: string; name: string; email: string; phone: string; message: string; created_at: string };

const keys = {
  settings: 'pintarbh:settings',
  services: 'pintarbh:services',
  projects: 'pintarbh:projects',
  testimonials: 'pintarbh:testimonials',
  contacts: 'pintarbh:contacts',
};

function readLocal<T>(key: string, fallback: T): T {
  const stored = localStorage.getItem(key);
  return stored ? (JSON.parse(stored) as T) : fallback;
}

function writeLocal<T>(key: string, value: T): T {
  localStorage.setItem(key, JSON.stringify(value));
  return value;
}

function ensureUuid(value: string) {
  const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuid.test(value) ? value : crypto.randomUUID();
}

async function assertSupabase<T>(result: { data: T | null; error: { message: string } | null }) {
  if (result.error) throw new Error(result.error.message);
  return result.data;
}

function toInFilter(ids: string[]) {
  return '(' + ids.join(',') + ')';
}

export async function getSettings(): Promise<SiteSettings> {
  if (supabase) {
    const { data } = await supabase.from('site_settings').select('*').limit(1).maybeSingle();
    if (data?.content) return { ...defaultSettings, ...(data.content as Partial<SiteSettings>) };
  }
  return { ...defaultSettings, ...readLocal(keys.settings, defaultSettings) };
}

export async function saveSettings(settings: SiteSettings) {
  if (supabase) {
    await assertSupabase(await supabase.from('site_settings').upsert({
      id: 'default', content: settings, updated_at: new Date().toISOString(),
    }));
    return settings;
  }
  return writeLocal(keys.settings, settings);
}

export async function getServices(): Promise<Service[]> {
  if (supabase) {
    const { data } = await supabase.from('services').select('*').order('created_at');
    if (data?.length) return data as Service[];
  }
  return readLocal(keys.services, defaultServices);
}

export async function saveServices(services: Service[]) {
  const normalized = services.map((service) => ({ ...service, id: ensureUuid(service.id) }));

  if (supabase) {
    if (normalized.length) {
      await assertSupabase(await supabase.from('services').upsert(normalized, { onConflict: 'id' }));
      await assertSupabase(await supabase.from('services').delete().not('id', 'in', toInFilter(normalized.map((service) => service.id))));
    } else {
      await assertSupabase(await supabase.from('services').delete().not('id', 'is', null));
    }
    return normalized;
  }

  return writeLocal(keys.services, normalized);
}

export async function getProjects(): Promise<Project[]> {
  if (supabase) {
    const { data } = await supabase.from('projects')
      .select('*, project_images(image_url, sort_order)')
      .order('date', { ascending: false });

    if (data?.length) {
      return (data as DbProject[]).map((project) => ({
        ...project,
        coverImage: project.cover_image,
        shortDescription: project.short_description,
        fullDescription: project.full_description,
        gallery: project.project_images
          ?.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
          .map((image) => image.image_url) ?? [],
      }));
    }
  }
  return readLocal(keys.projects, defaultProjects);
}

export async function saveProjects(projects: Project[]) {
  const normalized = projects.map((project) => ({
    ...project, id: ensureUuid(project.id), slug: project.slug || slugify(project.title),
  }));

  if (supabase) {
    if (normalized.length) {
      await assertSupabase(await supabase.from('projects').upsert(
        normalized.map((project) => ({
          id: project.id, slug: project.slug, title: project.title, category: project.category,
          location: project.location, date: project.date, cover_image: project.coverImage,
          short_description: project.shortDescription, full_description: project.fullDescription,
          services: project.services, featured: project.featured,
        })),
        { onConflict: 'id' }
      ));

      const projectIds = normalized.map((project) => project.id);
      await assertSupabase(await supabase.from('projects').delete().not('id', 'in', toInFilter(projectIds)));

      for (const project of normalized) {
        await assertSupabase(await supabase.from('project_images').delete().eq('project_id', project.id));
        const galleryRows = project.gallery.map((imageUrl, sortOrder) => ({
          project_id: project.id, image_url: imageUrl, sort_order: sortOrder,
        }));
        if (galleryRows.length) {
          await assertSupabase(await supabase.from('project_images').insert(galleryRows));
        }
      }

      await assertSupabase(await supabase.from('project_images').delete().not('project_id', 'in', toInFilter(projectIds)));
    } else {
      await assertSupabase(await supabase.from('project_images').delete().not('id', 'is', null));
      await assertSupabase(await supabase.from('projects').delete().not('id', 'is', null));
    }
    return normalized;
  }

  return writeLocal(keys.projects, normalized);
}

export async function getTestimonials(): Promise<Testimonial[]> {
  if (supabase) {
    const { data } = await supabase.from('testimonials').select('*').order('created_at');
    if (data?.length) return data as Testimonial[];
  }
  return readLocal(keys.testimonials, defaultTestimonials);
}

export async function saveTestimonials(testimonials: Testimonial[]) {
  const normalized = testimonials.map((testimonial) => ({ ...testimonial, id: ensureUuid(testimonial.id) }));

  if (supabase) {
    if (normalized.length) {
      await assertSupabase(await supabase.from('testimonials').upsert(normalized, { onConflict: 'id' }));
      await assertSupabase(await supabase.from('testimonials').delete().not('id', 'in', toInFilter(normalized.map((testimonial) => testimonial.id))));
    } else {
      await assertSupabase(await supabase.from('testimonials').delete().not('id', 'is', null));
    }
    return normalized;
  }

  return writeLocal(keys.testimonials, normalized);
}

export async function sendContactMessage(message: Omit<ContactMessage, 'id' | 'createdAt'>) {
  const cleanMessage: ContactMessage = {
    id: crypto.randomUUID(), createdAt: new Date().toISOString(),
    name: sanitizeText(message.name), email: sanitizeText(message.email),
    phone: sanitizeText(message.phone), message: sanitizeText(message.message),
  };

  if (supabase) {
    await assertSupabase(await supabase.from('contacts').insert({
      id: cleanMessage.id, name: cleanMessage.name, email: cleanMessage.email,
      phone: cleanMessage.phone, message: cleanMessage.message, created_at: cleanMessage.createdAt,
    }));
    return cleanMessage;
  }

  const current = readLocal<ContactMessage[]>(keys.contacts, []);
  writeLocal(keys.contacts, [cleanMessage, ...current]);
  return cleanMessage;
}

export async function getContacts(): Promise<ContactMessage[]> {
  if (supabase) {
    const { data } = await supabase.from('contacts').select('*').order('created_at', { ascending: false });
    if (data?.length) return (data as DbContact[]).map((item) => ({ ...item, createdAt: item.created_at }));
  }
  return readLocal(keys.contacts, []);
}
