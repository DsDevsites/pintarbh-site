# PintarBH

Site profissional para a PintarBH, desenvolvido com React, TypeScript, Vite, TanStack Router, TanStack Query, Supabase, TailwindCSS e Framer Motion.

## Rodar localmente

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Admin

Rota: `/admin`

Credenciais iniciais:

- Usuário: `PintarBH`
- Senha: `pintarbh`

A autenticação provisória fica isolada em `src/services/authService.ts`, facilitando a troca por Supabase Auth.

## Supabase

1. Crie um projeto no Supabase.
2. Rode o SQL em `supabase/schema.sql`.
3. Copie `.env.example` para `.env`.
4. Preencha `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.

Sem variáveis Supabase, a aplicação usa dados iniciais e persistência local no navegador para facilitar edição e demonstração.
