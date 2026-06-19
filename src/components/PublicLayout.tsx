import { Link } from '@tanstack/react-router';
import { Facebook, Instagram, Mail, MapPin, Menu, Phone, X } from 'lucide-react';
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
        <Link to="/" aria-label="Página inicial" className="min-w-0">
          <Logo logoUrl={settings.logoUrl} compactMobile />
        </Link>
        <div className="hidden items-center gap-3 text-xs font-medium text-zinc-700 md:flex lg:gap-8 lg:text-sm">
          {links.map(([label, href]) => (
            <a key={href} href={href} className="transition hover:text-zinc-950">
              {label}
            </a>
          ))}
        </div>
        <a className="button-primary hidden shrink-0 whitespace-nowrap md:inline-flex md:px-4 md:text-xs lg:px-6 lg:text-sm" href="/#contato">
          Solicitar orçamento
        </a>
        <button className="ml-auto grid h-11 w-11 shrink-0 place-items-center rounded-full border border-zinc-200 md:hidden" onClick={() => setOpen(!open)} aria-label="Abrir menu" aria-expanded={open}>
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>
      {open && (
        <div className="border-t border-zinc-100 bg-white px-4 py-3 md:hidden">
          <div className="flex flex-col gap-2">
            {links.map(([label, href]) => (
              <a key={href} href={href} className="rounded-lg px-1 py-2.5 text-sm font-medium" onClick={() => setOpen(false)}>
                {label}
              </a>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}

export function Footer({ settings }: { settings: SiteSettings }) {
  return (
    <footer className="bg-zinc-950 text-white">
      <div className="rainbow-strip h-1.5 w-full" />
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 md:grid-cols-[1.3fr_1fr_1fr] lg:px-8">
        <div>
          <Logo logoUrl={settings.logoUrl} dark={false} />
          <p className="mt-5 max-w-sm text-sm leading-6 text-zinc-300">
            Pintura profissional, acabamentos e fachadas com atendimento cuidadoso em Belo Horizonte e região.
          </p>
        </div>
        <div>
          <h3 className="text-sm font-semibold">Links rápidos</h3>
          <div className="mt-4 grid gap-3 text-sm text-zinc-300">
            {links.map(([label, href]) => (
              <a key={href} href={href} className="hover:text-white">
                {label}
              </a>
            ))}
            <Link to="/admin" className="hover:text-white">
              Área administrativa
            </Link>
          </div>
        </div>
        <div>
          <h3 className="text-sm font-semibold">Contato</h3>
          <div className="mt-4 grid gap-3 text-sm text-zinc-300">
            <span className="flex items-center gap-2"><Phone className="h-4 w-4" />{settings.phone}</span>
            <span className="flex items-center gap-2"><Mail className="h-4 w-4" />{settings.email}</span>
            <span className="flex items-center gap-2"><MapPin className="h-4 w-4" />{settings.address}</span>
            <div className="flex gap-3 pt-2">
              <a href={settings.instagram} aria-label="Instagram"><Instagram className="h-5 w-5" /></a>
              <a href={settings.facebook} aria-label="Facebook"><Facebook className="h-5 w-5" /></a>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 px-5 py-5 text-center text-xs text-zinc-400">
        © {new Date().getFullYear()} PintarBH. Todos os direitos reservados.
      </div>
    </footer>
  );
}
