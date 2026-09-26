import { Link } from '@tanstack/react-router';
import { Facebook, Instagram, LogIn, Mail, MapPin, Menu, Phone, ShieldCheck, UserCircle, X } from 'lucide-react';
import { useState } from 'react';
import { Logo } from './Logo';
import type { SiteSettings } from '../types';

const links = [
  ['Sobre', '/#sobre'],
  ['Serviços', '/#servicos'],
  ['Portfólio', '/#portfolio'],
  ['Depoimentos', '/#depoimentos'],
  ['Contato', '/#contato'],
] as const;

export function PublicHeader({ settings }: { settings: SiteSettings }) {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-zinc-100 bg-white/90 backdrop-blur-xl">
      <div className="rainbow-strip h-1.5 w-full" />
      <nav className="mx-auto flex min-h-[72px] max-w-7xl items-center justify-between gap-3 px-4 py-2 md:min-h-[76px] md:px-8 lg:px-12">
        <Link to="/" aria-label="Página inicial" className="min-w-0" onClick={() => setOpen(false)}><Logo logoUrl={settings.logoUrl} companyName={settings.companyName} compactMobile /></Link>
        <div className="hidden items-center gap-3 text-xs font-medium text-zinc-700 md:flex lg:gap-8 lg:text-sm">
          {links.map(([label, href]) => <a key={href} href={href} className="transition hover:text-zinc-950">{label}</a>)}
        </div>
        
        <button type="button" className="ml-auto grid h-11 w-11 shrink-0 place-items-center rounded-full border border-zinc-200 md:hidden" onClick={() => setOpen(!open)} aria-label={open ? 'Fechar menu' : 'Abrir menu'} aria-expanded={open} aria-controls="mobile-navigation">{open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button>
      </nav>
      {open && <div id="mobile-navigation" className="border-t border-zinc-100 bg-white px-4 py-3 md:hidden">
        <div className="flex flex-col gap-2">
          {links.map(([label, href]) => <a key={href} href={href} className="rounded-lg px-1 py-2.5 text-sm font-medium" onClick={() => setOpen(false)}>{label}</a>)}
        </div>
        <div className="mt-3 grid gap-1 border-t border-zinc-100 pt-3">
          <a href="/orcamento?modo=login" className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold" onClick={() => setOpen(false)}>
            <LogIn className="h-5 w-5 text-zinc-500" /> Login
          </a>
          <a href="/perfil" className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold" onClick={() => setOpen(false)}>
            <UserCircle className="h-5 w-5 text-zinc-500" /> Meu perfil
          </a>
          <a href="/admin" className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold" onClick={() => setOpen(false)}>
            <ShieldCheck className="h-5 w-5 text-zinc-500" /> Área administrativa
          </a>
        </div>
      </div>}
    </header>
  );
}

export function Footer({ settings }: { settings: SiteSettings }) {
  return (
    <footer className="bg-zinc-950 text-white">
      <div className="rainbow-strip h-1.5 w-full" />
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 md:grid-cols-[1.3fr_1fr_1fr] lg:px-8">
        <div><Logo logoUrl={settings.logoUrl} companyName={settings.companyName} dark={false} /><p className="mt-5 max-w-sm text-sm leading-6 text-zinc-300">Pintura profissional, acabamentos e fachadas com atendimento cuidadoso em Belo Horizonte e região.</p></div>
        <div><h3 className="text-sm font-semibold">Links rápidos</h3><div className="mt-4 grid gap-3 text-sm text-zinc-300">{links.map(([label, href]) => <a key={href} href={href} className="hover:text-white">{label}</a>)}<Link to="/orcamento" className="hover:text-white">Solicitar orçamento</Link><Link to="/admin" className="hover:text-white">Área administrativa</Link></div></div>
        <div><h3 className="text-sm font-semibold">Contato</h3><div className="mt-4 grid gap-3 text-sm text-zinc-300"><a href={settings.phone ? `tel:${settings.phone.replace(/\\D/g, '')}` : '#'} className="flex items-center gap-2 hover:text-white"><Phone className="h-4 w-4" />{settings.phone}</a><a href={settings.email ? `mailto:${settings.email}` : '#'} className="flex items-center gap-2 hover:text-white"><Mail className="h-4 w-4" />{settings.email}</a><span className="flex items-center gap-2"><MapPin className="h-4 w-4" />{settings.address}</span><div className="flex gap-3 pt-2"><a href={settings.instagram} aria-label="Instagram" target="_blank" rel="noopener noreferrer"><Instagram className="h-5 w-5" /></a><a href={settings.facebook} aria-label="Facebook" target="_blank" rel="noopener noreferrer"><Facebook className="h-5 w-5" /></a></div></div></div>
      </div>
      <div className="border-t border-white/10 px-5 py-5 text-center text-xs text-zinc-400">© {new Date().getFullYear()} {settings.companyName}. Todos os direitos reservados.</div>
    </footer>
  );
}
