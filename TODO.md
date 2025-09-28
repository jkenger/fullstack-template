# Development Setup TODO

## Priority 1: Core Setup

- [x] **Set up Shadcn UI components**
  - Initialize: `pnpx shadcn@latest init`
  - Add core components: button, input, card, form
  - Configure theme and styling
  - Set up component library structure

## Priority 2: Authentication & Frontend

- [ ] **Set up Better Auth authentication**
  - Configure auth providers (GitHub, Google)
  - Set up auth routes and middleware
  - Implement session management
  - Add login/logout UI components

- [ ] **Configure frontend API client with type safety**
  - Set up Hono RPC client with AppType
  - Configure TanStack Query hooks
  - Implement type-safe API calls
  - Add error handling for API requests

## Priority 3: Development Experience

- [ ] **Set up development workflow scripts**
  - Database seeding scripts
  - Hot reload configuration
  - Development environment validation
  - Add useful npm scripts

- [ ] **Configure error handling and logging**
  - Set up error boundaries in React
  - Configure structured logging
  - Add development debugging tools
  - Implement error monitoring

## Additional Features (Future)

- [ ] **Testing setup**
  - Unit tests for services
  - Integration tests for APIs
  - End-to-end testing
  - Test database setup

- [ ] **Performance optimization**
  - Bundle analysis
  - Code splitting
  - API response caching
  - Database query optimization

- [ ] **Deployment pipeline**
  - CI/CD setup
  - Environment-specific deployments
  - Database migrations in production
  - Monitoring and alerting

## Notes

- Current setup uses Vite plugin + Wrangler for D1
- Environment variables managed via `.dev.vars`
- Database schema managed with Drizzle ORM
- Frontend built with React 19 + TanStack Router + TanStack Query
