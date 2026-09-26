import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, MapPin, MessageCircle, Paintbrush, Star } from 'lucide-react';
import { getProjects, getServices, getSettings, getTestimonials } from '../services/contentService';
import { Footer, PublicHeader } from '../components/PublicLayout';
import { Seo } from '../components/Seo';
import { PaintDecorations } from '../components/PaintDecorations';
import { whatsappUrl } from '../lib/utils';

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.55, ease: 'easeOut' },
};

export function HomePage() {
  const settingsQuery = useQuery({ queryKey: ['settings'], queryFn: getSettings, staleTime: 5 * 60 * 1000 });
  const servicesQuery = useQuery({ queryKey: ['services'], queryFn: getServices, staleTime: 5 * 60 * 1000 });
  const projectsQuery = useQuery({ queryKey: ['projects'], queryFn: getProjects, staleTime: 5 * 60 * 1000 });
  const testimonialsQuery = useQuery({ queryKey: ['testimonials'], queryFn: getTestimonials, staleTime: 5 * 60 * 1000 });
  const settings = settingsQuery.data;
  const services = servicesQuery.data ?? [];
  const projects = projectsQuery.data ?? [];
  const testimonials = testimonialsQuery.data ?? [];

  if (settingsQuery.isError) {
    return <div className="grid min-h-screen place-items-center bg-white px-5 text-center text-sm text-zinc-600">Não foi possível carregar o conteúdo do site. Atualize a página e tente novamente.</div>;
  }

  if (!settings) return <div className="grid min-h-screen place-items-center text-sm text-zinc-500">Carregando PintarBH...</div>;

  return (
    <div className="bg-white text-zinc-950">
      <Seo title={settings.seoTitle} description={settings.seoDescription} image={settings.heroImage} />
      <PublicHeader settings={settings} />

      <main>
        <section className="relative overflow-hidden">
          <div className="rainbow-arc mx-auto grid max-w-7xl items-center gap-4 px-5 pb-12 pt-8 md:gap-6 md:px-8 md:py-20 lg:grid-cols-[0.95fr_1.05fr] lg:gap-8 lg:px-12 lg:py-24">
            <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center lg:text-left">
              <span className="mx-auto inline-flex max-w-full rounded-full border border-zinc-200 px-4 py-2 text-center text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-600 lg:mx-0">Pintura e acabamentos em BH</span>
              <h1 className="hero-title mx-auto mt-5 max-w-3xl text-4xl font-light leading-tight tracking-normal text-zinc-950 md:text-6xl md:leading-tight lg:mx-0 lg:text-7xl">{settings.heroTitle}</h1>
              <p className="mx-auto mt-5 max-w-2xl text-lg font-light leading-7 text-zinc-600 md:leading-8 lg:mx-0">{settings.heroSubtitle}</p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row lg:mt-8">
                <a className="button-primary h-11 w-full sm:w-auto" href={whatsappUrl(settings.whatsapp)}><MessageCircle className="h-5 w-5" /> WhatsApp</a>
                <Link to="/orcamento" className="button-secondary h-11 w-full sm:w-auto"><ArrowRight className="h-5 w-5" /> Solicitar orçamento</Link>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.1 }} className="relative">
              <div className="paint-image-frame paint-image-frame--hero rounded-[28px]"><img src={settings.heroImage} alt="Ambiente pintado pela PintarBH" width="1200" height="900" fetchPriority="high" decoding="async" className="aspect-[4/3] w-full max-w-full rounded-[27px] object-cover md:aspect-[5/4]" /></div>
              <div className="absolute -bottom-4 left-4 right-4 rounded-2xl bg-white/92 p-4 shadow-soft backdrop-blur md:-bottom-6 md:left-6 md:right-6 md:p-5">
                <div className="grid grid-cols-3 gap-2 text-center md:gap-4">
                  {['Orçamento claro', 'Obra limpa', 'Entrega técnica'].map((item) => <div key={item} className="text-[10px] font-semibold leading-tight text-zinc-700 md:text-xs"><CheckCircle2 className="mx-auto mb-1.5 h-4 w-4 text-emerald-500 md:mb-2 md:h-5 md:w-5" /> {item}</div>)}
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section id="sobre" className="relative overflow-hidden border-y border-zinc-100 py-14 md:py-20 scroll-mt-24">
          <PaintDecorations can className="paint-decor-top-right" />
          <div className="mx-auto grid max-w-7xl gap-6 px-5 md:gap-8 md:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:px-12">
            <motion.div {...fadeUp} className="paint-image-frame paint-image-frame--soft h-full min-h-[320px] rounded-3xl md:min-h-[420px]"><img src={settings.aboutImage} alt={settings.aboutTitle} loading="lazy" decoding="async" className="h-full min-h-[318px] w-full max-w-full rounded-[23px] object-cover md:min-h-[418px]" /></motion.div>
            <motion.div {...fadeUp}>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-500">{settings.aboutEyebrow}</p>
              <h2 className="mt-4 text-3xl font-light leading-tight md:text-5xl">{settings.aboutTitle}</h2>
              <p className="mt-6 text-base leading-8 text-zinc-600">{settings.story}</p>
              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                {[['Missão', settings.mission], ['Visão', settings.vision], ['Valores', settings.values]].map(([title, text]) => (
                  <div key={title} className="rounded-2xl border border-zinc-200 p-5"><h3 className="text-sm font-semibold">{title}</h3><p className="mt-3 text-sm leading-6 text-zinc-600">{text}</p></div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        <section id="servicos" className="relative overflow-hidden py-14 md:py-20 scroll-mt-24">
          <PaintDecorations roller className="paint-decor-bottom-left" />
          <div className="mx-auto max-w-7xl px-5 md:px-8 lg:px-12">
            <motion.div {...fadeUp} className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-500">Serviços</p>
              <h2 className="mt-4 text-3xl font-light md:text-5xl">Soluções completas para transformar ambientes.</h2>
            </motion.div>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3 lg:gap-8">
              {services.length ? services.map((service, index) => (
                <motion.article {...fadeUp} transition={{ duration: 0.55, delay: index * 0.06, ease: 'easeOut' }} key={service.id} className="overflow-hidden rounded-2xl border border-zinc-200 bg-white transition hover:-translate-y-1 hover:shadow-soft">
                  <div className="paint-image-frame rounded-t-[15px]"><img src={service.image} alt={service.title} loading="lazy" decoding="async" className="h-56 w-full rounded-t-[14px] object-cover" /></div>
                  <div className="p-6"><Paintbrush className="mb-4 h-6 w-6 text-zinc-500" /><h3 className="text-xl font-semibold">{service.title}</h3><p className="mt-3 text-sm leading-6 text-zinc-600">{service.description}</p></div>
                </motion.article>
              )) : <div className="rounded-2xl border border-dashed border-zinc-300 p-8 text-sm text-zinc-500 sm:col-span-2 lg:col-span-3">Os serviços serão apresentados aqui em breve.</div>}
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden bg-gradient-to-b from-white to-zinc-50 py-20">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mb-12 text-center">
              <span className="inline-flex rounded-full border border-zinc-200 bg-white px-5 py-2 text-sm font-semibold uppercase tracking-[0.25em] text-zinc-600 shadow-sm">Playlist Oficial</span>
              <h2 className="mt-6 text-4xl font-bold tracking-tight text-zinc-900 md:text-5xl">{settings.playlistTitle || 'Conheça nossos projetos'}<br />{settings.playlistSubtitle || 'ao som da PintarBH.'}</h2>
              <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-zinc-600">{settings.playlistDescription || 'Enquanto você navega pelos nossos trabalhos, aproveite uma seleção de músicas preparada para acompanhar cada pintura, reforma e acabamento.'}</p>
            </div>
            <div className="grid items-center gap-10 lg:grid-cols-2">
              <div className="space-y-8"><div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-xl">
                <div className="mb-6 flex items-center justify-between gap-4"><div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#1DB954]"><svg viewBox="0 0 168 168" className="h-8 w-8 fill-white"><path d="M84 0a84 84 0 100 168 84 84 0 000-168zm38.5 121.4a5.2 5.2 0 01-7.2 1.7c-19.7-12-44.6-14.7-74-8a5.2 5.2 0 11-2.3-10.2c32.2-7.2 59.8-4.1 81.7 9.2a5.2 5.2 0 011.8 7.3zm10.3-22.8a6.5 6.5 0 01-8.9 2.1c-22.5-13.8-56.8-17.8-83.4-9.7a6.5 6.5 0 11-3.8-12.4c30.7-9.4 68.8-4.8 94 10.7a6.5 6.5 0 012.1 9.3zm.9-23.7C107.6 59.7 64.8 58 39.4 65.8a7.8 7.8 0 11-4.5-15c29.3-8.8 77.8-7.1 107 10.6a7.8 7.8 0 11-8.2 13.5z"/></svg></div>
                  <div><h3 className="text-2xl font-bold">{settings.playlistTitle || 'Playlist Oficial'}</h3><p className="text-zinc-500">{settings.playlistSubtitle || 'O ritmo da PintarBH'}</p></div>
                </div>
                <a href={settings.playlistButtonLink || 'https://open.spotify.com/playlist/1rAlWRRPcJfU2bUuESTlUQ'} target="_blank" rel="noopener noreferrer" className="hidden rounded-full border border-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:border-zinc-950 hover:text-zinc-950 sm:inline-flex">{settings.playlistButtonText || 'Ouvir no Spotify'}</a></div>
                <ul className="space-y-4 text-zinc-600"><li>Ambiente agradável durante o trabalho.</li><li>Clássicos, pop, rock e MPB.</li><li>Atualizada constantemente.</li><li>Ouça enquanto conhece nossos projetos.</li></ul>
              </div></div>
              <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white p-3 shadow-2xl">
                <iframe title="Playlist oficial da PintarBH no Spotify" style={{ borderRadius: '20px' }} src="https://open.spotify.com/embed/playlist/1rAlWRRPcJfU2bUuESTlUQ?utm_source=generator" width="100%" height="480" frameBorder="0" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy" />
                <a href={settings.playlistButtonLink || 'https://open.spotify.com/playlist/1rAlWRRPcJfU2bUuESTlUQ'} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex w-full items-center justify-center rounded-full border border-zinc-200 px-5 py-3 text-sm font-semibold text-zinc-800 transition hover:border-zinc-950 hover:text-zinc-950 sm:hidden">{settings.playlistButtonText || 'Ouvir no Spotify'}</a>
              </div>
            </div>
          </div>
        </section>

        <section id="portfolio" className="rainbow-arc relative overflow-hidden bg-zinc-50 py-14 md:py-20 scroll-mt-24">
          <PaintDecorations can canClassName="paint-decor-mid-right" />
          <PaintDecorations roller rollerClassName="paint-decor-mid-left" />
          <div className="mx-auto max-w-7xl px-5 md:px-8 lg:px-12">
            <motion.div {...fadeUp} className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-500">Portfólio</p><h2 className="mt-4 text-3xl font-light md:text-5xl">Projetos realizados pela PintarBH.</h2><p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-600">Veja alguns trabalhos e conheça os detalhes de cada projeto.</p></div></motion.div>
            <div className="mt-8 grid gap-4 md:gap-6 lg:grid-cols-3 lg:gap-8">
              {projects.length ? projects.map((project) => (
                <motion.article {...fadeUp} key={project.id} className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-zinc-200"><div className="paint-image-frame rounded-t-[15px]"><img src={project.coverImage} alt={project.title} loading="lazy" decoding="async" className="h-72 w-full rounded-t-[14px] object-cover" /></div><div className="p-6"><div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.12em] text-zinc-500"><MapPin className="h-4 w-4" /> {project.location}</div><h3 className="mt-3 text-2xl font-semibold">{project.title}</h3><p className="mt-3 text-sm leading-6 text-zinc-600">{project.shortDescription}</p><Link to="/projeto/$slug" params={{ slug: project.slug }} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold">Ver detalhes <ArrowRight className="h-4 w-4" /></Link></div></motion.article>
              )) : <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-8 text-sm text-zinc-500 md:col-span-2 lg:col-span-3">Os projetos serão apresentados aqui em breve.</div>}
            </div>
          </div>
        </section>

        <section id="depoimentos" className="relative overflow-hidden py-14 md:py-20 scroll-mt-24">
          <PaintDecorations roller className="paint-decor-top-right" />
          <div className="mx-auto max-w-7xl px-5 md:px-8 lg:px-12">
            <motion.div {...fadeUp} className="max-w-2xl"><p className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-500">Depoimentos</p><h2 className="mt-4 text-3xl font-light md:text-5xl">Clientes que confiaram no processo.</h2></motion.div>
            <div className="mt-8 grid gap-4 md:grid-cols-3 md:gap-6 lg:gap-8">
              {testimonials.length ? testimonials.map((testimonial) => <motion.article {...fadeUp} key={testimonial.id} className="rounded-2xl border border-zinc-200 p-6"><div className="flex gap-1 text-amber-400">{Array.from({ length: testimonial.rating }).map((_, index) => <Star key={index} className="h-4 w-4 fill-current" />)}</div><p className="mt-5 text-sm leading-7 text-zinc-600">“{testimonial.comment}”</p><p className="mt-5 font-semibold">{testimonial.name}</p><p className="text-sm text-zinc-500">{testimonial.city}</p></motion.article>) : <div className="rounded-2xl border border-dashed border-zinc-300 p-8 text-sm text-zinc-500 md:col-span-3">Os depoimentos serão apresentados aqui em breve.</div>}
            </div>
          </div>
        </section>

        <section id="contato" className="bg-zinc-950 py-14 text-white md:py-20 scroll-mt-24">
          <div className="mx-auto max-w-7xl px-5 md:px-8 lg:px-12">
            <motion.div {...fadeUp}>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-400">Contato</p>
              <h2 className="mt-4 max-w-3xl text-3xl font-light md:text-5xl">Vamos planejar sua próxima pintura.</h2>
              <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-300">Escolha a forma mais prática de falar com a PintarBH ou envie uma solicitação completa do seu projeto.</p>
            </motion.div>

            <div className="mt-9 grid gap-5 md:grid-cols-2 md:gap-6">
              <motion.div {...fadeUp} className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 md:p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">Fale conosco</p>
                <h3 className="mt-3 text-2xl font-semibold">Contatos</h3>
                <div className="mt-6 grid gap-3 text-sm text-zinc-300">
                  <a href={whatsappUrl(settings.whatsapp)} className="flex items-center gap-3 rounded-2xl border border-white/10 px-4 py-3 transition hover:border-white/30 hover:text-white">
                    <MessageCircle className="h-5 w-5 shrink-0" /> <span>WhatsApp: {settings.phone}</span>
                  </a>
                  <a href={settings.email ? `mailto:${settings.email}` : '#'} className="rounded-2xl border border-white/10 px-4 py-3 transition hover:border-white/30 hover:text-white">
                    {settings.email}
                  </a>
                  <div className="rounded-2xl border border-white/10 px-4 py-3">{settings.address}</div>
                </div>
              </motion.div>

              <motion.div {...fadeUp} className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 md:p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">Orçamento</p>
                <h3 className="mt-3 text-2xl font-semibold">Solicite uma análise do seu projeto.</h3>
                <p className="mt-4 text-sm leading-7 text-zinc-300">Envie seus dados, detalhes do serviço e fotos. A solicitação fica organizada para a equipe analisar antes de preparar o orçamento.</p>
                <Link to="/orcamento" className="button-primary mt-7 bg-white text-zinc-950 hover:bg-zinc-200"><ArrowRight className="h-5 w-5" /> Abrir orçamento</Link>
              </motion.div>
            </div>
          </div>
        </section>
      </main>
      <Footer settings={settings} />
    </div>
  );
}
