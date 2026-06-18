import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { BarChart3, BriefcaseBusiness, FileText, Globe2, LayoutDashboard, LogOut, MessageSquare, Save, Search, Settings, ShieldCheck, Star, Trash2 } from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';
import type React from 'react';
import { ImageUpload } from '../components/ImageUpload';
import { Logo } from '../components/Logo';
import { isAuthenticated, login, logout } from '../services/authService';
import { getContacts, getProjects, getServices, getSettings, getTestimonials, saveProjects, saveServices, saveSettings, saveTestimonials } from '../services/contentService';
import { slugify } from '../lib/utils';
import type { Project, Service, SiteSettings, Testimonial } from '../types';

type Tab = 'dashboard' | 'settings' | 'services' | 'projects' | 'testimonials' | 'contacts' | 'seo';

const nav: { id: Tab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'settings', label: 'Configurações', icon: Settings },
  { id: 'services', label: 'Serviços', icon: BriefcaseBusiness },
  { id: 'projects', label: 'Projetos', icon: FileText },
  { id: 'testimonials', label: 'Depoimentos', icon: Star },
  { id: 'contacts', label: 'Contatos', icon: MessageSquare },
  { id: 'seo', label: 'SEO', icon: Search },
];

export function AdminPage() {
  const [authenticated, setAuthenticated] = useState(isAuthenticated());

  if (!authenticated) return <Login onLogged={() => setAuthenticated(true)} />;
  return <AdminShell onLogout={() => setAuthenticated(false)} />;
}

function Login({ onLogged }: { onLogged: () => void }) {
  const [error, setError] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const ok = await login(String(form.get('username')), String(form.get('password')));
    if (ok) onLogged();
    else setError('Usuário ou senha inválidos.');
  }

  return (
    <main className="grid min-h-screen place-items-center bg-zinc-50 px-5">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-2xl bg-white p-8 shadow-soft">
        <Logo />
        <div className="mt-8 flex items-center gap-2 rounded-lg bg-zinc-50 p-3 text-sm text-zinc-600">
          <ShieldCheck className="h-5 w-5" /> Acesso administrativo protegido.
        </div>
        <input className="field mt-6" name="username" placeholder="Usuário" autoComplete="username" required />
        <input className="field mt-4" name="password" type="password" placeholder="Senha" autoComplete="current-password" required />
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        <button className="button-primary mt-6 w-full">Entrar</button>
      </form>
    </main>
  );
}

function AdminShell({ onLogout }: { onLogout: () => void }) {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<Tab>('dashboard');
  const settingsQuery = useQuery({ queryKey: ['settings'], queryFn: getSettings });
  const servicesQuery = useQuery({ queryKey: ['services'], queryFn: getServices });
  const projectsQuery = useQuery({ queryKey: ['projects'], queryFn: getProjects });
  const testimonialsQuery = useQuery({ queryKey: ['testimonials'], queryFn: getTestimonials });
  const contactsQuery = useQuery({ queryKey: ['contacts'], queryFn: getContacts });

  const settings = settingsQuery.data;
  const services = servicesQuery.data ?? [];
  const projects = projectsQuery.data ?? [];
  const testimonials = testimonialsQuery.data ?? [];
  const contacts = contactsQuery.data ?? [];

  function invalidate() {
    void queryClient.invalidateQueries();
  }

  if (!settings) return <div className="grid min-h-screen place-items-center text-sm text-zinc-500">Carregando admin...</div>;

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950 lg:grid lg:grid-cols-[280px_1fr]">
      <aside className="border-r border-zinc-200 bg-white p-5">
        <Logo logoUrl={settings.logoUrl} />
        <nav className="mt-8 grid gap-2">
          {nav.map((item) => {
            const Icon = item.icon;
            return (
              <button key={item.id} onClick={() => setTab(item.id)} className={`flex items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-medium transition ${tab === item.id ? 'bg-zinc-950 text-white' : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950'}`}>
                <Icon className="h-5 w-5" /> {item.label}
              </button>
            );
          })}
        </nav>
        <button
          className="mt-8 flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-zinc-600 hover:bg-zinc-100"
          onClick={() => {
            logout();
            onLogout();
          }}
        >
          <LogOut className="h-5 w-5" /> Sair
        </button>
      </aside>
      <main className="p-5 lg:p-8">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-500">Painel administrativo</p>
            <h1 className="mt-2 text-3xl font-light">{nav.find((item) => item.id === tab)?.label}</h1>
          </div>
          <a className="button-secondary" href="/" target="_blank" rel="noreferrer">
            <Globe2 className="h-5 w-5" /> Ver site
          </a>
        </div>

        {tab === 'dashboard' && <Dashboard services={services.length} projects={projects.length} testimonials={testimonials.length} contacts={contacts.length} />}
        {tab === 'settings' && <SettingsEditor settings={settings} onSaved={invalidate} />}
        {tab === 'services' && <ServicesEditor services={services} onSaved={invalidate} />}
        {tab === 'projects' && <ProjectsEditor projects={projects} onSaved={invalidate} />}
        {tab === 'testimonials' && <TestimonialsEditor testimonials={testimonials} onSaved={invalidate} />}
        {tab === 'contacts' && <ContactsView contacts={contacts} />}
        {tab === 'seo' && <SeoEditor settings={settings} onSaved={invalidate} />}
      </main>
    </div>
  );
}

function Dashboard({ services, projects, testimonials, contacts }: { services: number; projects: number; testimonials: number; contacts: number }) {
  const items = [
    ['Serviços', services, BriefcaseBusiness],
    ['Projetos', projects, FileText],
    ['Depoimentos', testimonials, Star],
    ['Contatos', contacts, MessageSquare],
  ] as const;
  return (
    <div className="grid gap-5 md:grid-cols-4">
      {items.map(([label, value, Icon]) => (
        <div key={label} className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-200">
          <Icon className="h-6 w-6 text-zinc-500" />
          <p className="mt-6 text-3xl font-semibold">{value}</p>
          <p className="text-sm text-zinc-500">{label}</p>
        </div>
      ))}
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-200 md:col-span-4">
        <BarChart3 className="h-6 w-6 text-zinc-500" />
        <h2 className="mt-4 text-xl font-semibold">Estrutura preparada</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-600">
          O painel usa autenticação local provisória e serviços de dados isolados. Para migrar para Supabase Auth, troque a implementação em `authService` e mantenha as telas.
        </p>
      </div>
    </div>
  );
}

function SettingsEditor({ settings, onSaved }: { settings: SiteSettings; onSaved: () => void }) {
  const [draft, setDraft] = useState(settings);
  const mutation = useMutation({ mutationFn: saveSettings, onSuccess: onSaved });
  return (
    <PanelForm onSubmit={() => mutation.mutate(draft)} pending={mutation.isPending}>
      <div className="grid gap-5 md:grid-cols-2">
        <Text label="Nome da empresa" value={draft.companyName} onChange={(companyName) => setDraft({ ...draft, companyName })} />
        <Text label="Telefone" value={draft.phone} onChange={(phone) => setDraft({ ...draft, phone })} />
        <Text label="WhatsApp" value={draft.whatsapp} onChange={(whatsapp) => setDraft({ ...draft, whatsapp })} />
        <Text label="E-mail" value={draft.email} onChange={(email) => setDraft({ ...draft, email })} />
        <Text label="Endereço" value={draft.address} onChange={(address) => setDraft({ ...draft, address })} />
        <Text label="Instagram" value={draft.instagram} onChange={(instagram) => setDraft({ ...draft, instagram })} />
        <Text label="Facebook" value={draft.facebook} onChange={(facebook) => setDraft({ ...draft, facebook })} />
        <Text label="Favicon" value={draft.faviconUrl} onChange={(faviconUrl) => setDraft({ ...draft, faviconUrl })} />
      </div>
      <ImageUpload label="Logo" value={draft.logoUrl} onChange={(logoUrl) => setDraft({ ...draft, logoUrl })} />
      <ImageUpload label="Banner principal" value={draft.heroImage} onChange={(heroImage) => setDraft({ ...draft, heroImage })} />
      <Text label="Título do banner" value={draft.heroTitle} onChange={(heroTitle) => setDraft({ ...draft, heroTitle })} />
      <Area label="Subtítulo do banner" value={draft.heroSubtitle} onChange={(heroSubtitle) => setDraft({ ...draft, heroSubtitle })} />
      <section className="grid gap-5 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-200">
        <div>
          <h2 className="text-xl font-semibold">Sobre a empresa</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-500">
            Configure a foto, chamada, título e textos institucionais exibidos na seção Sobre do site.
          </p>
        </div>
        <ImageUpload label="Foto da seção Sobre" value={draft.aboutImage} onChange={(aboutImage) => setDraft({ ...draft, aboutImage })} />
        <div className="grid gap-5 md:grid-cols-2">
          <Text label="Chamada pequena" value={draft.aboutEyebrow} onChange={(aboutEyebrow) => setDraft({ ...draft, aboutEyebrow })} />
          <Text label="Título da seção" value={draft.aboutTitle} onChange={(aboutTitle) => setDraft({ ...draft, aboutTitle })} />
        </div>
        <Area label="História" value={draft.story} onChange={(story) => setDraft({ ...draft, story })} />
        <div className="grid gap-5 md:grid-cols-3">
          <Area label="Missão" value={draft.mission} onChange={(mission) => setDraft({ ...draft, mission })} />
          <Area label="Visão" value={draft.vision} onChange={(vision) => setDraft({ ...draft, vision })} />
          <Area label="Valores" value={draft.values} onChange={(values) => setDraft({ ...draft, values })} />
        </div>
      </section>
    </PanelForm>
  );
}

function ServicesEditor({ services, onSaved }: { services: Service[]; onSaved: () => void }) {
  const [items, setItems] = useState(services);
  const mutation = useMutation({ mutationFn: saveServices, onSuccess: onSaved });
  return (
    <PanelForm onSubmit={() => mutation.mutate(items)} pending={mutation.isPending}>
      <button type="button" className="button-secondary w-fit" onClick={() => setItems([{ id: crypto.randomUUID(), title: 'Novo serviço', description: '', image: '' }, ...items])}>Criar serviço</button>
      {items.map((service, index) => (
        <EditorCard key={service.id} onDelete={() => setItems(items.filter((item) => item.id !== service.id))}>
          <Text label="Título" value={service.title} onChange={(title) => setItems(update(items, index, { ...service, title }))} />
          <Area label="Descrição" value={service.description} onChange={(description) => setItems(update(items, index, { ...service, description }))} />
          <ImageUpload label="Imagem" value={service.image} onChange={(image) => setItems(update(items, index, { ...service, image }))} />
        </EditorCard>
      ))}
    </PanelForm>
  );
}

function ProjectsEditor({ projects, onSaved }: { projects: Project[]; onSaved: () => void }) {
  const [items, setItems] = useState(projects);
  const mutation = useMutation({ mutationFn: saveProjects, onSuccess: onSaved });
  return (
    <PanelForm onSubmit={() => mutation.mutate(items)} pending={mutation.isPending}>
      <button type="button" className="button-secondary w-fit" onClick={() => setItems([emptyProject(), ...items])}>Criar projeto</button>
      {items.map((project, index) => (
        <EditorCard key={project.id} onDelete={() => setItems(items.filter((item) => item.id !== project.id))}>
          <div className="grid gap-5 md:grid-cols-2">
            <Text label="Título" value={project.title} onChange={(title) => setItems(update(items, index, { ...project, title, slug: slugify(title) }))} />
            <Text label="Categoria" value={project.category} onChange={(category) => setItems(update(items, index, { ...project, category }))} />
            <Text label="Localização" value={project.location} onChange={(location) => setItems(update(items, index, { ...project, location }))} />
            <Text label="Data" type="date" value={project.date} onChange={(date) => setItems(update(items, index, { ...project, date }))} />
          </div>
          <label className="flex items-center gap-3 text-sm font-medium">
            <input type="checkbox" checked={project.featured} onChange={(event) => setItems(update(items, index, { ...project, featured: event.target.checked }))} />
            Destacar projeto
          </label>
          <Area label="Descrição curta" value={project.shortDescription} onChange={(shortDescription) => setItems(update(items, index, { ...project, shortDescription }))} />
          <Area label="Descrição completa" value={project.fullDescription} onChange={(fullDescription) => setItems(update(items, index, { ...project, fullDescription }))} />
          <Text label="Serviços executados (separados por vírgula)" value={project.services.join(', ')} onChange={(value) => setItems(update(items, index, { ...project, services: value.split(',').map((item) => item.trim()).filter(Boolean) }))} />
          <ImageUpload label="Imagem principal" value={project.coverImage} onChange={(coverImage) => setItems(update(items, index, { ...project, coverImage }))} />
          <ImageUpload label="Galeria" value="" multiple values={project.gallery} onChange={() => undefined} onChangeMany={(gallery) => setItems(update(items, index, { ...project, gallery }))} />
        </EditorCard>
      ))}
    </PanelForm>
  );
}

function TestimonialsEditor({ testimonials, onSaved }: { testimonials: Testimonial[]; onSaved: () => void }) {
  const [items, setItems] = useState(testimonials);
  const mutation = useMutation({ mutationFn: saveTestimonials, onSuccess: onSaved });
  return (
    <PanelForm onSubmit={() => mutation.mutate(items)} pending={mutation.isPending}>
      <button type="button" className="button-secondary w-fit" onClick={() => setItems([{ id: crypto.randomUUID(), name: 'Novo cliente', city: '', comment: '', rating: 5 }, ...items])}>Criar depoimento</button>
      {items.map((testimonial, index) => (
        <EditorCard key={testimonial.id} onDelete={() => setItems(items.filter((item) => item.id !== testimonial.id))}>
          <div className="grid gap-5 md:grid-cols-3">
            <Text label="Nome" value={testimonial.name} onChange={(name) => setItems(update(items, index, { ...testimonial, name }))} />
            <Text label="Cidade" value={testimonial.city} onChange={(city) => setItems(update(items, index, { ...testimonial, city }))} />
            <Text label="Nota" type="number" value={String(testimonial.rating)} onChange={(rating) => setItems(update(items, index, { ...testimonial, rating: Number(rating) }))} />
          </div>
          <Area label="Comentário" value={testimonial.comment} onChange={(comment) => setItems(update(items, index, { ...testimonial, comment }))} />
        </EditorCard>
      ))}
    </PanelForm>
  );
}

function ContactsView({ contacts }: { contacts: Awaited<ReturnType<typeof getContacts>> }) {
  if (!contacts.length) return <div className="rounded-2xl bg-white p-8 text-sm text-zinc-500 ring-1 ring-zinc-200">Nenhum contato recebido ainda.</div>;
  return (
    <div className="grid gap-4">
      {contacts.map((contact) => (
        <article key={contact.id} className="rounded-2xl bg-white p-6 ring-1 ring-zinc-200">
          <div className="flex flex-col justify-between gap-2 md:flex-row">
            <div>
              <h2 className="text-lg font-semibold">{contact.name}</h2>
              <p className="text-sm text-zinc-500">{contact.email} · {contact.phone}</p>
            </div>
            <span className="text-xs text-zinc-500">{new Date(contact.createdAt).toLocaleString('pt-BR')}</span>
          </div>
          <p className="mt-4 text-sm leading-6 text-zinc-600">{contact.message}</p>
        </article>
      ))}
    </div>
  );
}

function SeoEditor({ settings, onSaved }: { settings: SiteSettings; onSaved: () => void }) {
  const [draft, setDraft] = useState(settings);
  const mutation = useMutation({ mutationFn: saveSettings, onSuccess: onSaved });
  const score = useMemo(() => Math.min(100, Math.round(((draft.seoTitle.length > 20 ? 40 : 15) + (draft.seoDescription.length > 80 ? 40 : 15) + 20))), [draft]);
  return (
    <PanelForm onSubmit={() => mutation.mutate(draft)} pending={mutation.isPending}>
      <div className="rounded-2xl bg-white p-6 ring-1 ring-zinc-200">
        <p className="text-sm text-zinc-500">Pontuação editorial</p>
        <p className="mt-2 text-4xl font-semibold">{score}%</p>
      </div>
      <Text label="Meta title" value={draft.seoTitle} onChange={(seoTitle) => setDraft({ ...draft, seoTitle })} />
      <Area label="Meta description" value={draft.seoDescription} onChange={(seoDescription) => setDraft({ ...draft, seoDescription })} />
    </PanelForm>
  );
}

function PanelForm({ children, onSubmit, pending }: { children: React.ReactNode; onSubmit: () => void; pending: boolean }) {
  return (
    <form
      className="grid gap-5"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      {children}
      <button className="button-primary w-fit" disabled={pending}>
        <Save className="h-5 w-5" /> {pending ? 'Salvando...' : 'Salvar alterações'}
      </button>
    </form>
  );
}

function EditorCard({ children, onDelete }: { children: React.ReactNode; onDelete: () => void }) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-200">
      <div className="mb-5 flex justify-end">
        <button type="button" onClick={onDelete} className="grid h-10 w-10 place-items-center rounded-full border border-zinc-200 text-red-600" title="Excluir">
          <Trash2 className="h-5 w-5" />
        </button>
      </div>
      <div className="grid gap-5">{children}</div>
    </div>
  );
}

function Text({ label, value, onChange, type = 'text' }: { label: string; value: string; onChange: (value: string) => void; type?: string }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-zinc-700">{label}</span>
      <input className="field" type={type} value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function Area({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-zinc-700">{label}</span>
      <textarea className="field min-h-28 resize-y" value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function update<T>(items: T[], index: number, item: T) {
  return items.map((current, itemIndex) => (itemIndex === index ? item : current));
}

function emptyProject(): Project {
  const title = 'Novo projeto';
  return {
    id: crypto.randomUUID(),
    slug: slugify(title),
    title,
    category: '',
    location: '',
    date: new Date().toISOString().slice(0, 10),
    coverImage: '',
    gallery: [],
    shortDescription: '',
    fullDescription: '',
    services: [],
    featured: false,
  };
}
