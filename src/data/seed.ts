import type { Project, Service, SiteSettings, Testimonial } from '../types';

export const defaultSettings: SiteSettings = {
  companyName: 'PintarBH',
  logoUrl: '',
  faviconUrl: '/favicon.svg',
  phone: '(31) 99999-0000',
  whatsapp: '5531999990000',
  email: 'contato@pintarbh.com.br',
  address: 'Belo Horizonte, Minas Gerais',
  instagram: 'https://instagram.com/pintarbh',
  facebook: 'https://facebook.com/pintarbh',
  heroTitle: 'Pintura profissional com acabamento impecável em Belo Horizonte',
  heroSubtitle:
    'Projetos residenciais, comerciais e corporativos executados com planejamento, limpeza, pontualidade e sofisticação.',
  heroImage:
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1800&q=85',
  story:
    'A PintarBH nasceu para elevar o padrão dos serviços de pintura em Belo Horizonte, unindo técnica, curadoria de materiais e um atendimento próximo em cada etapa da obra.',
  mission:
    'Transformar ambientes com pintura de alta qualidade, reduzindo transtornos e entregando beleza duradoura.',
  vision:
    'Ser referência em pintura profissional, acabamentos e recuperação de fachadas em Minas Gerais.',
  values:
    'Transparência, capricho, segurança, pontualidade, respeito ao cliente e compromisso com cada detalhe.',
  seoTitle: 'PintarBH | Pintura profissional em Belo Horizonte',
  seoDescription:
    'Serviços de pintura residencial, comercial, industrial, texturas, acabamentos, fachadas e reformas em Belo Horizonte.',
};

export const defaultServices: Service[] = [
  {
    id: 'residencial',
    title: 'Pintura Residencial',
    description: 'Renovação de casas e apartamentos com proteção, limpeza e acabamento de alto padrão.',
    image: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'comercial',
    title: 'Pintura Comercial',
    description: 'Lojas, escritórios e clínicas preparados para receber clientes com uma imagem impecável.',
    image: 'https://images.unsplash.com/photo-1604014237800-1c9102c219da?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'industrial',
    title: 'Pintura Industrial',
    description: 'Aplicações técnicas para galpões, estruturas metálicas, pisos e ambientes de alta demanda.',
    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'texturas',
    title: 'Texturas',
    description: 'Efeitos decorativos, textura projetada e soluções para valorizar paredes internas e externas.',
    image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'acabamentos',
    title: 'Acabamentos',
    description: 'Correções finas, massa corrida, esmaltação, verniz e pintura especial para detalhes.',
    image: 'https://images.unsplash.com/photo-1574362848149-11496d93a7c7?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'fachadas',
    title: 'Fachadas',
    description: 'Restauração e pintura de fachadas com preparação, impermeabilização e durabilidade.',
    image: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'reformas',
    title: 'Reformas',
    description: 'Pequenos reparos, preparação de superfície e integração com serviços de revitalização.',
    image: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=900&q=80',
  },
];

export const defaultProjects: Project[] = [
  {
    id: 'apartamento-lourdes',
    slug: 'apartamento-lourdes',
    title: 'Apartamento Lourdes',
    category: 'Residencial',
    location: 'Lourdes, Belo Horizonte',
    date: '2026-03-18',
    coverImage: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1400&q=85',
    gallery: [
      'https://images.unsplash.com/photo-1600210492493-0946911123ea?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1600607687644-c7171b42498f?auto=format&fit=crop&w=1200&q=85',
    ],
    shortDescription: 'Pintura completa de apartamento com paleta neutra e acabamento acetinado.',
    fullDescription:
      'O projeto recebeu tratamento de fissuras, correção de superfícies, aplicação de massa fina e pintura em tons neutros para ampliar a iluminação natural. A execução foi planejada por ambientes, preservando marcenaria, pisos e metais.',
    services: ['Pintura Residencial', 'Acabamentos', 'Correção de superfícies'],
    featured: true,
  },
  {
    id: 'fachada-savassi',
    slug: 'fachada-comercial-savassi',
    title: 'Fachada Comercial Savassi',
    category: 'Comercial',
    location: 'Savassi, Belo Horizonte',
    date: '2026-01-27',
    coverImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1400&q=85',
    gallery: [
      'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=85',
    ],
    shortDescription: 'Revitalização de fachada com impermeabilização e nova identidade visual.',
    fullDescription:
      'A fachada passou por lavagem técnica, reparos localizados, selagem, impermeabilização e pintura final. A nova composição cromática fortaleceu a presença da marca e melhorou a conservação externa do imóvel.',
    services: ['Fachadas', 'Pintura Comercial', 'Impermeabilização'],
    featured: true,
  },
  {
    id: 'casa-pampulha',
    slug: 'casa-pampulha',
    title: 'Casa Pampulha',
    category: 'Residencial',
    location: 'Pampulha, Belo Horizonte',
    date: '2025-11-08',
    coverImage: 'https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=1400&q=85',
    gallery: [
      'https://images.unsplash.com/photo-1600566753104-685f4f24cb4d?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1600566753151-384129cf4e3e?auto=format&fit=crop&w=1200&q=85',
    ],
    shortDescription: 'Pintura interna e externa com destaque para textura mineral na área social.',
    fullDescription:
      'A residência recebeu pintura externa resistente às intempéries, textura decorativa em pontos estratégicos e acabamento interno lavável. O cronograma foi organizado para manter a casa funcional durante a execução.',
    services: ['Pintura Residencial', 'Texturas', 'Fachadas'],
    featured: false,
  },
];

export const defaultTestimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Mariana Costa',
    city: 'Belo Horizonte',
    comment: 'Equipe cuidadosa, prazo cumprido e acabamento muito acima do que eu esperava.',
    rating: 5,
  },
  {
    id: '2',
    name: 'Rafael Mendes',
    city: 'Nova Lima',
    comment: 'A loja ficou elegante e o processo foi bem organizado do orçamento à entrega.',
    rating: 5,
  },
  {
    id: '3',
    name: 'Claudia Reis',
    city: 'Contagem',
    comment: 'Gostei da limpeza durante a obra e da orientação na escolha das cores.',
    rating: 5,
  },
];
