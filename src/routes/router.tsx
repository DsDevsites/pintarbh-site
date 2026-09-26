import { createRootRoute, createRoute, createRouter, Outlet } from '@tanstack/react-router';
import { AdminPage } from '../admin/AdminPage';
import { HomePage } from '../pages/HomePage';
import { ProjectPage } from '../pages/ProjectPage';
import { QuotePage } from '../pages/QuotePage';
import { AuthCallbackPage } from '../pages/AuthCallbackPage';

const rootRoute = createRootRoute({ component: () => <Outlet /> });

const indexRoute = createRoute({ getParentRoute: () => rootRoute, path: '/', component: HomePage });
const projectRoute = createRoute({ getParentRoute: () => rootRoute, path: '/projeto/$slug', component: ProjectPage });
const quoteRoute = createRoute({ getParentRoute: () => rootRoute, path: '/orcamento', component: QuotePage });
const authCallbackRoute = createRoute({ getParentRoute: () => rootRoute, path: '/auth/callback', component: AuthCallbackPage });
const adminRoute = createRoute({ getParentRoute: () => rootRoute, path: '/admin', component: AdminPage });

const routeTree = rootRoute.addChildren([indexRoute, projectRoute, quoteRoute, authCallbackRoute, adminRoute]);

export const router = createRouter({ routeTree, defaultPreloadStaleTime: 30_000 });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
