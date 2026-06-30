export type SiteSettings = {
  companyName: string;
  logoUrl: string;
  faviconUrl: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  instagram: string;
  facebook: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string;
  aboutEyebrow: string;
  aboutTitle: string;
  aboutImage: string;
  story: string;
  mission: string;
  vision: string;
  values: string;
  seoTitle: string;
  seoDescription: string;
  playlistEnabled: boolean;
  playlistTitle: string;
  playlistSubtitle: string;
  playlistDescription: string;
  playlistImage: string;
  playlistButtonText: string;
  playlistButtonLink: string;
};

export type Service = {
  id: string;
  title: string;
  description: string;
  image: string;
};

export type Project = {
  id: string;
  slug: string;
  title: string;
  category: string;
  location: string;
  date: string;
  coverImage: string;
  gallery: string[];
  shortDescription: string;
  fullDescription: string;
  services: string[];
  featured: boolean;
};

export type Testimonial = {
  id: string;
  name: string;
  city: string;
  comment: string;
  rating: number;
};

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  createdAt: string;
};

export type AdminUser = {
  id: string;
  username: string;
  passwordHash: string;
  role: 'admin';
};
