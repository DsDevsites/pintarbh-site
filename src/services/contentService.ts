import { defaultProjects, defaultServices, defaultSettings, defaultTestimonials } from '../data/seed';
import { sanitizeText, slugify } from '../lib/utils';
import { supabase } from '../lib/supabase';
import type { ContactMessage, Project, Service, SiteSettings, Testimonial } from '../types';

type DbProject = {
  id: string;
  slug: string;
  title: string;
  category: string;
  location: string;
  date: string;
  cover_image: string;
  short_description: string;
  full_description: string;
  services: string[];
  featured: boolean;
  project_images?: { image_url: string }[];
};

type DbContact = {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  created_at: string;
};

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

export async function getSettings(): Promise<SiteSettings> {
  if (supabase) {
    const { data } = await supabase.from('site_settings').select('*').limit(1).maybeSingle();
    if (data?.content) return data.content as SiteSettings;
  }
  return readLocal(keys.settings, defaultSettings);
}

export async function saveSettings(settings: SiteSettings) {
  if (supabase) {
    await supabase.from('site_settings').upsert({ id: 'default', content: settings, updated_at: new Date().toISOString() });
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
  return writeLocal(keys.services, services);
}

export async function getProjects(): Promise<Project[]> {
  if (supabase) {
    const { data } = await supabase.from('projects').select('*, project_images(image_url)').order('date', { ascending: false });
    if (data?.length) {
      return (data as DbProject[]).map((project) => ({
        ...project,
        coverImage: project.cover_image,
        shortDescription: project.short_description,
        fullDescription: project.full_description,
        gallery: project.project_images?.map((image: { image_url: string }) => image.image_url) ?? [],
      }));
    }
  }
  return readLocal(keys.projects, defaultProjects);
}

export async function saveProjects(projects: Project[]) {
  return writeLocal(keys.projects, projects.map((project) => ({ ...project, slug: project.slug || slugify(project.title) })));
}

export async function getTestimonials(): Promise<Testimonial[]> {
  if (supabase) {
    const { data } = await supabase.from('testimonials').select('*').order('created_at');
    if (data?.length) return data as Testimonial[];
  }
  return readLocal(keys.testimonials, defaultTestimonials);
}

export async function saveTestimonials(testimonials: Testimonial[]) {
  return writeLocal(keys.testimonials, testimonials);
}

export async function sendContactMessage(message: Omit<ContactMessage, 'id' | 'createdAt'>) {
  const cleanMessage: ContactMessage = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    name: sanitizeText(message.name),
    email: sanitizeText(message.email),
    phone: sanitizeText(message.phone),
    message: sanitizeText(message.message),
  };

  if (supabase) {
    await supabase.from('contacts').insert({
      id: cleanMessage.id,
      name: cleanMessage.name,
      email: cleanMessage.email,
      phone: cleanMessage.phone,
      message: cleanMessage.message,
      created_at: cleanMessage.createdAt,
    });
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
