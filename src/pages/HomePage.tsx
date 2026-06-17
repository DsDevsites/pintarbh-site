import { useMutation, useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, MapPin, MessageCircle, Paintbrush, Send, Star } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { getProjects, getServices, getSettings, getTestimonials, sendContactMessage } from '../services/contentService';
import { Footer, PublicHeader } from '../components/PublicLayout';
import { Seo } from '../components/Seo';
import { whatsappUrl } from '../lib/utils';

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.55, ease: 'easeOut' },
};

export function HomePage() {
  const settingsQuery = useQuery({ queryKey: ['settings'], queryFn: getSettings });
  const servicesQuery = useQuery({ queryKey: ['services'], queryFn: getServices });
  const projectsQuery = useQuery({ queryKey: ['projects'], queryFn: getProjects });
  const testimonialsQuery = useQuery({ queryKey: ['testimonials'], queryFn: getTestimonials });
  const [sent, setSent] = useState(false);
  const contactMutation = useMutation({ mutationFn: sendContactMessage, onSuccess: () => setSent(true) });

  const settings = settingsQuery.data;
  const services = servicesQuery.data ?? [];
  const projects = projectsQuery.data ?? [];
  const testimonials = testimonialsQuery.data ?? [];

  if (!settings) return <div className="grid min-h-screen place-items-center text-sm text-zinc-500">Carregando PintarBH...</div>;

  function handleContact(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    contactMutation.mutate({
      name: String(form.get('name') ?? ''),
      email: String(form.get('email') ?? ''),
      phone: String(form.get('phone') ?? ''),
      message: String(form.get('message') ?? ''),
    });
    event.currentTarget.reset();
  }

  return (
    <div className="bg-white text-zinc-950">
      <Seo title={settings.seoTitle} description={settings.seoDescription} image={settings.heroImage} />
      <PublicHeader settings={settings} />

      <main>
        <section className="relative overflow-hidden">
          <div className="rainbow-arc mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 md:py-24 lg:grid-cols-[0.95fr_1.05fr] lg:px-8">
            <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <span className="inline-flex rounded-full border border-zinc-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-600">
                Pintura e acabamentos em BH
              </span>
              <h1 className="mt-6 max-w-3xl text-4xl font-light leading-tight tracking-normal text-zinc-950 md:text-6xl">
                {settings.heroTitle}
              </h1>
              <p className="mt-6 max-w-2xl text-lg font-light leading-8 text-zinc-600">{settings.heroSubtitle}</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a className="button-primary" href={whatsappUrl(settings.whatsapp)}>
                  <MessageCircle className="h-5 w-5" /> WhatsApp
                </a>
                <a className="button-secondary" href="#contato">
                  Solicitar Orçamento <ArrowRight className="h-5 w-5" />
                </a>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.1 }} className="relative">
              <img src={settings.heroImage} alt="Ambiente pintado pela PintarBH" className="aspect-[4/5] w-full rounded-[28px] object-cover shadow-soft md:aspect-[5/4]" />
              <div className="absolute -bottom-6 left-6 right-6 rounded-2xl bg-white/92 p-5 shadow-soft backdrop-blur">
                <div className="grid grid-cols-3 gap-4 text-center">
                  {['Orçamento claro', 'Obra limpa', 'Entrega técnica'].map((item) => (
                    <div key={item} className="text-xs font-semibold text-zinc-700">
                      <CheckCircle2 className="mx-auto mb-2 h-5 w-5 text-emerald-500" /> {item}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section id="sobre" className="border-y border-zinc-100 py-20">
          <div className="mx-auto grid max-w-7xl gap-12 px-5 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
            <motion.img {...fadeUp} src="https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=1200&q=85" alt="Profissional preparando pintura" className="h-full min-h-[420px] rounded-3xl object-cover" />
            <motion.div {...fadeUp}>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-500">Sobre a empresa</p>
              <h2 className="mt-4 text-3xl font-light leading-tight md:text-5xl">História construída no detalhe.</h2>
              <p className="mt-6 text-base leading-8 text-zinc-600">{settings.story}</p>
              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                {[
                  ['Missão', settings.mission],
                  ['Visão', settings.vision],
                  ['Valores', settings.values],
                ].map(([title, text]) => (
                  <div key={title} className="rounded-2xl border border-zinc-200 p-5">
                    <h3 className="text-sm font-semibold">{title}</h3>
                    <p className="mt-3 text-sm leading-6 text-zinc-600">{text}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        <section id="servicos" className="py-20">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <motion.div {...fadeUp} className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-500">Serviços</p>
              <h2 className="mt-4 text-3xl font-light md:text-5xl">Soluções completas para transformar ambientes.</h2>
            </motion.div>
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((service) => (
                <motion.article {...fadeUp} key={service.id} className="overflow-hidden rounded-2xl border border-zinc-200 bg-white transition hover:-translate-y-1 hover:shadow-soft">
                  <img src={service.image} alt={service.title} className="h-56 w-full object-cover" />
                  <div className="p-6">
                    <Paintbrush className="mb-4 h-6 w-6 text-zinc-500" />
                    <h3 className="text-xl font-semibold">{service.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-zinc-600">{service.description}</p>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        <section id="portfolio" className="rainbow-arc bg-zinc-50 py-20">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <motion.div {...fadeUp} className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-500">Portfólio</p>
                <h2 className="mt-4 text-3xl font-light md:text-5xl">Trabalhos realizados com padrão profissional.</h2>
              </div>
            </motion.div>
            <div className="mt-10 grid gap-6 lg:grid-cols-3">
              {projects.map((project) => (
                <motion.article {...fadeUp} key={project.id} className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-zinc-200">
                  <img src={project.coverImage} alt={project.title} className="h-72 w-full object-cover" />
                  <div className="p-6">
                    <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.12em] text-zinc-500">
                      <MapPin className="h-4 w-4" /> {project.location}
                    </div>
                    <h3 className="mt-3 text-2xl font-semibold">{project.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-zinc-600">{project.shortDescription}</p>
                    <Link to="/projeto/$slug" params={{ slug: project.slug }} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold">
                      Ver detalhes <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        <section id="depoimentos" className="py-20">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <motion.div {...fadeUp} className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-500">Depoimentos</p>
              <h2 className="mt-4 text-3xl font-light md:text-5xl">Clientes que confiaram no processo.</h2>
            </motion.div>
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {testimonials.map((testimonial) => (
                <motion.article {...fadeUp} key={testimonial.id} className="rounded-2xl border border-zinc-200 p-6">
                  <div className="flex gap-1 text-amber-400">
                    {Array.from({ length: testimonial.rating }).map((_, index) => <Star key={index} className="h-4 w-4 fill-current" />)}
                  </div>
                  <p className="mt-5 text-sm leading-7 text-zinc-600">“{testimonial.comment}”</p>
                  <p className="mt-5 font-semibold">{testimonial.name}</p>
                  <p className="text-sm text-zinc-500">{testimonial.city}</p>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        <section id="contato" className="bg-zinc-950 py-20 text-white">
          <div className="mx-auto grid max-w-7xl gap-10 px-5 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
            <motion.div {...fadeUp}>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-400">Contato</p>
              <h2 className="mt-4 text-3xl font-light md:text-5xl">Vamos planejar sua próxima pintura.</h2>
              <div className="mt-8 grid gap-4 text-sm text-zinc-300">
                <a href={whatsappUrl(settings.whatsapp)} className="flex items-center gap-3"><MessageCircle className="h-5 w-5" /> WhatsApp: {settings.phone}</a>
                <span>{settings.email}</span>
                <span>{settings.address}</span>
              </div>
            </motion.div>
            <motion.form {...fadeUp} onSubmit={handleContact} className="rounded-2xl bg-white p-6 text-zinc-950 md:p-8">
              <div className="grid gap-4 sm:grid-cols-2">
                <input className="field" name="name" placeholder="Nome" minLength={2} required />
                <input className="field" name="phone" placeholder="Telefone" required />
              </div>
              <input className="field mt-4" name="email" type="email" placeholder="E-mail" required />
              <textarea className="field mt-4 min-h-36 resize-y" name="message" placeholder="Conte sobre o seu projeto" minLength={10} required />
              <button className="button-primary mt-5 w-full" disabled={contactMutation.isPending}>
                <Send className="h-5 w-5" /> {contactMutation.isPending ? 'Enviando...' : 'Enviar mensagem'}
              </button>
              {sent && <p className="mt-4 text-sm font-medium text-emerald-600">Mensagem registrada com sucesso.</p>}
            </motion.form>
          </div>
        </section>
      </main>
      <Footer settings={settings} />
    </div>
  );
}
