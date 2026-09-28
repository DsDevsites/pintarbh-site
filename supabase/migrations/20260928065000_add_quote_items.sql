alter table public.quotes
  add column if not exists service_items jsonb not null default '[]'::jsonb,
  add column if not exists material_items jsonb not null default '[]'::jsonb;

comment on column public.quotes.service_items is 'Itens detalhados de mão de obra/serviços do orçamento.';
comment on column public.quotes.material_items is 'Itens detalhados de tintas e materiais do orçamento.';
