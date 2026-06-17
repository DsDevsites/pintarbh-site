import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from '@tanstack/react-router';
import { ArrowLeft, CheckCircle2, MessageCircle } from 'lucide-react';
import { Footer, PublicHeader } from '../components/PublicLayout';
import { Seo } from '../components/Seo';
import { whatsappUrl } from '../lib/utils';
import { getProjects, getSettings } from '../services/contentService';

export function ProjectPage() {
  const { slug } = useParams({ from: '/projeto/$slug' });
  const settingsQuery = useQuery({ queryKey: ['settings'], queryFn: getSettings });
  const projectsQuery = useQuery({ queryKey: ['projects'], queryFn: getProjects });

  const settings = settingsQuery.data;
  const project = projectsQuery.data?.find((item) => item.slug === slug);

  if (!settings) return <div className="grid min-h-screen place-items-center text-sm text-zinc-500">Carregando...</div>;
  if (!project) {
    return (
      <div>
        <PublicHeader settings={settings} />
        <main className="mx-auto max-w-3xl px-5 py-24 text-center">
          <h1 className="text-3xl font-light">Projeto não encontrado</h1>
          <Link to="/" className="button-primary mt-8">Voltar para a home</Link>
        </main>
        <Footer settings={settings} />
      </div>
    );
  }

  return (
    <div className="bg-white text-zinc-950">
      <Seo title={`${project.title} | PintarBH`} description={project.shortDescription} image={project.coverImage} />
      <PublicHeader settings={settings} />
      <main>
        <section className="mx-auto max-w-7xl px-5 py-10 lg:px-8">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-600 hover:text-zinc-950">
            <ArrowLeft className="h-4 w-4" /> Voltar
          </Link>
          <div className="mt-8 grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-500">{project.category}</p>
              <h1 className="mt-4 text-4xl font-light leading-tight md:text-6xl">{project.title}</h1>
              <p className="mt-5 text-lg leading-8 text-zinc-600">{project.fullDescription}</p>
              <div className="mt-8 grid gap-3 text-sm text-zinc-600">
                <span>Localização: {project.location}</span>
                <span>Data: {new Date(project.date).toLocaleDateString('pt-BR')}</span>
              </div>
              <div className="mt-8">
                <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-zinc-500">Serviços executados</h2>
                <div className="mt-4 grid gap-3">
                  {project.services.map((service) => (
                    <span key={service} className="flex items-center gap-3 text-sm font-medium">
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" /> {service}
                    </span>
                  ))}
                </div>
              </div>
              <a className="button-primary mt-8" href={whatsappUrl(settings.whatsapp, `Olá, gostaria de falar sobre um projeto parecido com ${project.title}.`)}>
                <MessageCircle className="h-5 w-5" /> Falar no WhatsApp
              </a>
            </div>
            <div>
              <img src={project.coverImage} alt={project.title} className="aspect-[4/3] w-full rounded-3xl object-cover shadow-soft" />
              <div className="mt-4 grid grid-cols-2 gap-4">
                {project.gallery.map((image) => (
                  <img key={image} src={image} alt="" className="aspect-square rounded-2xl object-cover" />
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer settings={settings} />
    </div>
  );
}
