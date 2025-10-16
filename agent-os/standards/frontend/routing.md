## Routing patterns and conventions

- **File-Based Routing**: Leverage framework's file-based routing (Next.js app/pages directory, etc.) for automatic route generation
- **Route Organization**: Group related routes in folders; use route groups (parentheses) to organize without affecting URL structure
- **Dynamic Routes**: Use dynamic segments [id] for variable routes; validate params server-side before rendering
- **Nested Layouts**: Use nested layout files to share UI across route segments and avoid prop drilling
- **Loading and Error States**: Provide loading.tsx and error.tsx files at appropriate levels for better UX during transitions and errors
- **Route Handlers**: Use route handlers (route.ts) for API endpoints co-located with frontend code in full-stack applications
- **Parallel Routes**: Use parallel routes (@slot) for rendering multiple pages in the same layout simultaneously (modals, dashboards)
- **Intercepting Routes**: Leverage intercepting routes (..) for modal-like patterns while preserving shareable URLs
- **Middleware**: Implement authentication, redirects, and header modifications in middleware for edge execution
- **Programmatic Navigation**: Use router.push/replace for client-side navigation; avoid window.location for SPA experience
- **Prefetching**: Enable automatic prefetching for visible links to improve perceived performance
- **Protected Routes**: Implement authentication checks in middleware or layouts; redirect unauthorized users consistently
