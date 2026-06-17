import { useEffect } from 'react';

type SeoProps = {
  title: string;
  description: string;
  image?: string;
};

export function Seo({ title, description, image }: SeoProps) {
  useEffect(() => {
    document.title = title;
    document.querySelector('meta[name="description"]')?.setAttribute('content', description);
    document.querySelector('meta[property="og:title"]')?.setAttribute('content', title);
    document.querySelector('meta[property="og:description"]')?.setAttribute('content', description);
    if (image) document.querySelector('meta[property="og:image"]')?.setAttribute('content', image);
  }, [description, image, title]);

  return null;
}
