import { useEffect } from 'react';

type SeoProps = {
  title: string;
  description: string;
  image?: string;
};

function setMeta(selector: string, content: string) {
  document.querySelector(selector)?.setAttribute('content', content);
}

export function Seo({ title, description, image }: SeoProps) {
  useEffect(() => {
    document.title = title;

    setMeta('meta[name="description"]', description);
    setMeta('meta[property="og:title"]', title);
    setMeta('meta[property="og:description"]', description);
    setMeta('meta[name="twitter:title"]', title);
    setMeta('meta[name="twitter:description"]', description);

    if (image) {
      setMeta('meta[property="og:image"]', image);
      setMeta('meta[name="twitter:image"]', image);
    }

    const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (canonical) canonical.href = window.location.href.split('#')[0];
    setMeta('meta[property="og:url"]', window.location.href.split('#')[0]);
  }, [description, image, title]);

  return null;
}
