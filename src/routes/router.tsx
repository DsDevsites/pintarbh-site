import { createRootRoute, createRoute, createRouter, Outlet } from '@tanstack/react-router';
import { AdminPage } from '../admin/AdminPage';
import { HomePage } from '../pages/HomePage';
import { ProjectPage } from '../pages/ProjectPage';
import { QuotePage } from '../pages/QuotePage';
import { ProfilePage } from '../pages/ProfilePage';
import { AuthCallbackPage } from '../pages/AuthCallbackPage';

function RouterError({ reset }: { reset: () => void }) {
  return (
    <main className="grid min-h-screen place-items-center bg-zinc-50 px-5 py-12">
      <section className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-soft ring-1 ring-zinc-200">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-500">PintarBH</p>
        <h1 className="mt-3 text-3xl font-light">Não foi possível carregar esta página.</h1>
        <p className="mt-3 text-sm leading-6 text-zinc-500">Tente novamente. Se o problema continuar, volte para a página inicial.</p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <button type="button" className="button-primary" onClick={reset}>Tentar novamente</button>
          <a href="/" className="button-secondary">Ir para o início</a>
        </div>
      </section>
    </main>
  );
}

function RouterNotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-zinc-50 px-5 py-12">
      <section className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-soft ring-1 ring-zinc-200">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-500">PintarBH</p>
        <h1 className="mt-3 text-3xl font-light">Página não encontrada.</h1>
        <p className="mt-3 text-sm leading-6 text-zinc-500">O endereço acessado não existe ou foi alterado.</p>
        <a href="/" className="button-primary mt-6">Voltar para o site</a>
      </section>
    </main>
  );
}

const rootRoute = createRootRoute({
  component: () => <Outlet />,
  errorComponent: RouterError,
  notFoundComponent: RouterNotFound,
});

const indexRoute = createRoute({ getParentRoute: () => rootRoute, path: '/', component: HomePage });
const projectRoute = createRoute({ getParentRoute: () => rootRoute, path: '/projeto/$slug', component: ProjectPage });
const quoteRoute = createRoute({ getParentRoute: () => rootRoute, path: '/orcamento', component: QuotePage });
const profileRoute = createRoute({ getParentRoute: () => rootRoute, path: '/perfil', component: ProfilePage });
const authCallbackRoute = createRoute({ getParentRoute: () => rootRoute, path: '/auth/callback', component: AuthCallbackPage });
const adminRoute = createRoute({ getParentRoute: () => rootRoute, path: '/admin', component: AdminPage });

const routeTree = rootRoute.addChildren([indexRoute, projectRoute, quoteRoute, profileRoute, authCallbackRoute, adminRoute]);

export const router = createRouter({ routeTree, defaultPreloadStaleTime: 30_000 });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
