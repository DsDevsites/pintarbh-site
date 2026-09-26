import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getSettings } from '../services/contentService';

type SeoProps = {
  title: string;
  description: string;
  image?: string;
};

function setMeta(selector: string, content: string) {
  document.querySelector(selector)?.setAttribute('content', content);
}

function setFavicon(href?: string) {
  if (!href) return;
  const links = document.querySelectorAll<HTMLLinkElement>('link[rel="icon"], link[rel="shortcut icon"]');
  if (links.length) {
    links.forEach((link) => { link.href = href; });
    return;
  }
  const link = document.createElement('link');
  link.rel = 'icon';
  link.href = href;
  document.head.appendChild(link);
}

export function Seo({ title, description, image }: SeoProps) {
  const settingsQuery = useQuery({ queryKey: ['settings'], queryFn: getSettings, staleTime: 0 });
  const settings = settingsQuery.data;

  useEffect(() => {
    document.title = title;
    setMeta('meta[name="description"]', description);
    setMeta('meta[property="og:title"]', title);
    setMeta('meta[property="og:description"]', description);
    setMeta('meta[property="og:site_name"]', settings?.companyName || 'PintarBH');
    setMeta('meta[name="twitter:title"]', title);
    setMeta('meta[name="twitter:description"]', description);

    if (image) {
      setMeta('meta[property="og:image"]', image);
      setMeta('meta[name="twitter:image"]', image);
    }

    setFavicon(settings?.faviconUrl);

    const canonicalUrl = window.location.href.split('#')[0];
    const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (canonical) canonical.href = canonicalUrl;
    setMeta('meta[property="og:url"]', canonicalUrl);
  }, [description, image, settings?.companyName, settings?.faviconUrl, title]);

  return null;
}
