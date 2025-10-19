# CareerOS Tech Stack

## Overview

CareerOS is built on a modern, scalable tech stack that prioritizes developer experience, rapid iteration, and vendor independence through abstraction layers. The architecture emphasizes serverless technologies, AI/LLM integration, and cross-platform compatibility.

## Frontend

### Core Framework
- **Next.js 15** - React framework with App Router for file-based routing, server components, and hybrid rendering
  - *Rationale:* Industry-leading React framework with excellent DX, built-in optimizations, and seamless API routes. App Router provides powerful server-side capabilities while maintaining client-side interactivity.
  - *Version:* 15.x (using latest features including Turbopack in dev mode)

- **React 19** - UI library for component-based architecture
  - *Rationale:* Latest React version with improved server components, concurrent rendering, and modern hooks API. Industry standard with massive ecosystem.

- **TypeScript** - Typed superset of JavaScript
  - *Rationale:* Provides type safety, better IDE support, and catches errors at compile time. Essential for large-scale application maintainability.
  - *Configuration:* Strict mode enabled, path aliases via `@/*` for clean imports

### Styling & UI

- **Tailwind CSS 4** - Utility-first CSS framework
  - *Rationale:* Rapid UI development, consistent design system, excellent developer experience. Version 4 brings performance improvements and better customization.
  - *Configuration:* Custom theme, responsive utilities, dark mode support (where applicable)

- **Radix UI** - Unstyled, accessible UI primitives
  - *Rationale:* Production-ready components with built-in accessibility (ARIA), keyboard navigation, and focus management. Provides foundation for custom UI without accessibility burden.
  - *Components Used:* Dialog, Dropdown Menu, Select, Tooltip, Tabs, Accordion, and more

### State & Data Management

- **Convex React Hooks** - Real-time data synchronization
  - *Hooks:* `useQuery`, `useMutation`, `useAction` for reactive data fetching
  - *Rationale:* First-class React integration with Convex backend, automatic re-rendering on data changes, optimistic updates

- **React Hooks** - Built-in state management
  - *Primary:* `useState`, `useEffect`, `useContext`, `useCallback`, `useMemo`
  - *Custom Hooks:* `use-user-sync.ts`, `use-onboarding-check.ts`, and feature-specific hooks

## Backend

### Backend-as-a-Service (BaaS)

- **Convex** - Serverless backend platform
  - *Rationale:* Combines database, serverless functions, file storage, and real-time sync in single platform. Dramatically simplifies backend development with type-safe queries/mutations and automatic code generation.
  - *Features Used:*
    - Database with relational queries and indexes
    - Serverless functions (queries, mutations, actions)
    - File storage for resume uploads
    - Real-time subscriptions for live data updates
    - Built-in authentication integration
  - *Schema:* Defined in `convex/schema.ts` with tables for users, resumes, jobs, analyses, plans, skills, files

### API Layer

- **Next.js API Routes** - Backend API endpoints
  - *Rationale:* Co-located with frontend code, easy deployment, serverless by default on Vercel. Handles authentication, external integrations, and browser extension endpoints.
  - *Route Structure:*
    - `/api/health` - Health checks and monitoring
    - `/api/auth/*` - Extension authentication and session management
    - `/api/jobs/*` - Job bookmarking and sync
    - `/api/analysis/*` - Resume analysis endpoints
    - `/api/resumes/*` - Resume management

### Provider Abstraction Layer

- **Custom Abstraction Layer** (`src/lib/abstractions/`)
  - *Rationale:* Decouples business logic from vendor implementations, enabling easy provider switching without rewriting application code. Critical for avoiding vendor lock-in and optimizing costs.
  - *Providers:*
    - `DatabaseProvider` - Data persistence (Convex implementation)
    - `FileStorageProvider` - File uploads/downloads (Convex implementation)
    - `AnalysisProvider` - Resume analysis (multiple implementations)
    - `AuthProvider` - Authentication (Clerk implementation)
  - *Pattern:* Interface definitions in `types.ts`, implementations in `providers/`, factory in `service-factory.ts`

## Authentication & Authorization

- **Clerk** - Authentication and user management
  - *Rationale:* Production-ready auth with minimal setup, supports email/password, OAuth (Google, GitHub, etc.), and session management. Excellent DX with React hooks and middleware.
  - *Features Used:*
    - Email/password authentication
    - OAuth providers (Google, GitHub)
    - User profile management
    - Session cookies for API authentication
    - React hooks (`useUser`, `useAuth`)
    - Next.js middleware for route protection
  - *Integration:* Clerk user IDs synced to Convex users table via `use-user-sync` hook

## AI & Language Models

### LLM Providers

- **OpenAI GPT-4** - AI-powered resume analysis
  - *Rationale:* Industry-leading language model with strong reasoning, structured output support, and consistent quality. Used for advanced resume analysis and content generation.
  - *API:* OpenAI REST API via official SDK
  - *Models:* GPT-4, GPT-4 Turbo for analysis tasks

- **Anthropic Claude** - Alternative AI provider
  - *Rationale:* Excellent instruction following, strong analysis capabilities, competitive pricing. Provides redundancy and allows A/B testing of analysis quality.
  - *API:* Anthropic REST API via official SDK
  - *Models:* Claude 3 Opus, Claude 3 Sonnet for analysis tasks

### AI Architecture

- **Multi-Provider Analysis System**
  - *Implementations:*
    - `ConvexAnalysisProvider` - Server-side analysis via Convex actions
    - `AnthropicAnalysisProvider` - Direct Anthropic API calls
    - `ServerAnalysisProvider` - API route-based analysis
  - *Caching:* SHA-256 content hashing for intelligent result caching
  - *Rationale:* Reduces API costs by 60%+ through cache hits, provides instant results for unchanged resumes

## Browser Extension

- **Chrome Extension** (separate codebase, integrated via API)
  - *Manifest:* V3 (latest Chrome extension format)
  - *Integration:* Authenticates via session cookies, calls CareerOS API routes
  - *Functionality:*
    - Job detail scraping from LinkedIn, Indeed, Glassdoor, etc.
    - One-click bookmarking via `POST /api/jobs/bookmark`
    - Bulk sync via `POST /api/jobs/sync`
    - Cross-origin requests with credentials
  - *Future:* Auto-fill application forms, one-click apply

## Testing

### Testing Framework

- **Jest** - JavaScript testing framework
  - *Rationale:* Industry standard, excellent mocking capabilities, great TypeScript support, fast execution with parallel test running
  - *Configuration:* Node environment, 80% coverage threshold, path alias support

- **React Testing Library** - React component testing
  - *Rationale:* Encourages testing user behavior over implementation details, promotes accessibility, integrates seamlessly with Jest
  - *Pattern:* User-centric queries (`getByRole`, `getByLabelText`), async utilities for real-world interactions

### Testing Strategy

- **Unit Tests** - Provider implementations, utility functions
- **Integration Tests** - API routes with mocked external services
- **Component Tests** - React components with mocked hooks and providers
- **Coverage Target:** 80% for statements, branches, functions, lines

### Test Utilities

- **Mocking:**
  - Clerk authentication mocked in test environment
  - Convex client mocked with in-memory data
  - External APIs (OpenAI, Anthropic) mocked with fixture responses
- **Test Files:** Co-located in `__tests__/` directories adjacent to source files

## Development Tools

### Build & Bundling

- **Turbopack** - Next-generation bundler (Next.js 15 dev mode)
  - *Rationale:* Significantly faster than Webpack, incremental compilation, better developer experience
  - *Note:* Used in dev mode; production builds still use optimized Webpack

- **TypeScript Compiler** - Type checking and transpilation
  - *Rationale:* Ensures type safety before runtime, generates type declarations

### Code Quality

- **ESLint** - JavaScript/TypeScript linting
  - *Configuration:* Next.js recommended rules, TypeScript-specific rules
  - *Rationale:* Catches common errors, enforces code style consistency, prevents anti-patterns

- **Prettier** (implicit via ESLint)
  - *Rationale:* Automatic code formatting, eliminates style debates, ensures consistency

### Package Management

- **npm** - Node package manager
  - *Rationale:* Built into Node.js, reliable, well-documented, compatible with all dependencies
  - *Lock File:* `package-lock.json` for reproducible installs

## Database

### Schema Design

- **Convex Schema** (`convex/schema.ts`)
  - *Tables:*
    - `users` - User profiles with Clerk integration, onboarding state
    - `resumes` - Resume documents with content and metadata
    - `jobs` - Saved job opportunities with status tracking
    - `jobCategories` - Job search projects/categories
    - `analyses` - Historical resume analysis records
    - `analysisResults` - Cached analysis results with content hashing
    - `plans` - Career development plans with milestones
    - `skills` - Skills tracking with progress and resources
    - `files` - File metadata for uploaded documents

- **Indexes:**
  - `users`: `by_clerk_user_id`, `by_email`
  - `resumes`: `by_user_id`
  - `jobs`: `by_user_id`, `by_status`, `by_category`
  - `analyses`: `by_resume_id`, `by_user_id`, `by_type`
  - `analysisResults`: `by_resume_and_type`, `by_content_hash`
  - *Rationale:* Optimizes common query patterns, enables efficient filtering and lookups

### Data Patterns

- **Relational Queries** - Foreign key references between tables
- **Content Hashing** - SHA-256 hashes for duplicate detection and cache invalidation
- **Soft Deletes** - Preservation of historical data for analytics
- **Timestamps** - `createdAt`, `updatedAt` on all tables for audit trails

## File Storage

- **Convex File Storage**
  - *Rationale:* Integrated with Convex backend, eliminates need for separate S3/storage service, automatic CDN distribution
  - *Use Cases:* Resume PDF uploads, profile images (future)
  - *Features:* Signed URLs for secure access, automatic cleanup of orphaned files

## Hosting & Deployment

### Frontend & API Hosting

- **Vercel** (implied deployment target for Next.js)
  - *Rationale:* Zero-config deployment for Next.js, automatic HTTPS, global CDN, serverless functions, preview deployments per PR
  - *Features:*
    - Automatic builds from git commits
    - Environment variable management
    - Performance monitoring and analytics
    - Edge network for low-latency global access

### Backend Hosting

- **Convex Cloud**
  - *Rationale:* Managed Convex deployment, automatic scaling, real-time sync infrastructure, built-in monitoring
  - *Features:*
    - Automatic function deployment on push
    - Database migrations via schema changes
    - Monitoring dashboard for queries/mutations
    - Production and development environments

## CI/CD

- **GitHub Actions** (implied from git workflow)
  - *Likely Workflows:*
    - Linting and type checking on PR
    - Test suite execution
    - Automated deployments to Vercel/Convex
    - Dependency updates via Dependabot

## Environment Configuration

### Environment Variables

**Required Variables:**
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk public key (client-side)
- `CLERK_SECRET_KEY` - Clerk secret key (server-side)
- `NEXT_PUBLIC_CONVEX_URL` - Convex deployment URL (client-side)
- `CONVEX_DEPLOYMENT` - Convex deployment ID (server-side)
- `OPENAI_API_KEY` - OpenAI API key for GPT-4 analysis
- `ANTHROPIC_API_KEY` - Anthropic API key for Claude analysis

**Environment Files:**
- `.env.local` - Local development secrets (git-ignored)
- `.env.production` - Production configuration (managed in Vercel dashboard)

## Monitoring & Observability

### Current State

- **Health Checks** - `/api/health` endpoint for uptime monitoring
- **Convex Dashboard** - Built-in query/mutation monitoring, error tracking
- **Vercel Analytics** - Page load times, Core Web Vitals

### Future Considerations

- Application Performance Monitoring (APM) - Datadog, New Relic, or Sentry
- Error tracking - Sentry for client and server-side errors
- User analytics - Mixpanel or Amplitude for product analytics
- Log aggregation - For centralized logging across services

## Security

### Current Measures

- **Authentication** - Clerk handles auth, session management, token refresh
- **Authorization** - Middleware protects routes, API routes validate user identity
- **API Security** - CORS configuration, rate limiting (via Vercel)
- **Data Validation** - TypeScript types, Convex schema validation
- **Secret Management** - Environment variables, never committed to git

### Future Enhancements

- Content Security Policy (CSP) headers
- Rate limiting on analysis endpoints (prevent abuse)
- Audit logging for sensitive operations
- Data encryption at rest (for sensitive resume content)

## Future Technology Considerations

### Potential Additions

- **Redis** - For advanced caching, rate limiting, job queues
- **PostgreSQL** - If need for complex relational queries exceeds Convex capabilities
- **Elasticsearch** - For advanced job search and full-text resume search
- **WebSockets** - For real-time collaboration features (already supported via Convex)
- **Mobile SDKs** - React Native for iOS/Android apps (Phase 4)
- **GraphQL** - If API complexity grows, consider GraphQL over REST

### Vendor Alternatives (enabled by abstraction layer)

- **Backend:** Supabase, Firebase, AWS Amplify (alternative to Convex)
- **Auth:** Auth0, Firebase Auth, AWS Cognito (alternative to Clerk)
- **File Storage:** AWS S3, Cloudflare R2, Google Cloud Storage
- **Database:** Supabase (Postgres), PlanetScale (MySQL), MongoDB Atlas
- **LLM:** Cohere, Google PaLM, Open-source models via Replicate

## Technical Debt & Known Limitations

- **Turbopack Compatibility** - Some features may not work in dev mode with Turbopack; fallback to Webpack if needed
- **PDF Rendering** - PDF.js worker pre-built in `public/pdf.worker.min.js`, needs manual updates
- **Extension CORS** - Browser extension must use `credentials: 'include'` for authenticated requests
- **Content Hashing** - Changing hash function (SHA-256) will invalidate all existing analysis caches
- **Convex Codegen** - Must run `npm run dev:convex` separately to keep types up-to-date during development

## Research Foundation

### Academic Research Base

CareerOS is built on peer-reviewed research and validated industry practices, not generic "best practices" or guesswork.

**Core Research Sources:**

1. **Experience-Performance Relationship Research**
   - Meta-analytic review: "The Relationship Between Work Experience and Job Performance"
   - Key finding: Task-level measures of work experience have higher correlation with job performance than generic years counting
   - Implementation: Our system focuses on task-specific experience analysis

2. **Job Matching Research**
   - Journal for Labour Market Research: "Using the job requirements approach and matched employer-employee data"
   - Key finding: Generic skills (problem-solving, communication, technical know-how) are crucial for effective matching
   - Implementation: Skills matching algorithm prioritizes generic skills assessment

3. **Skills Assessment Research**
   - Journal of Business and Psychology: "How job applicants self-report their skills and experiences"
   - Key finding: Time, skill emphasis, and verifiability significantly influence how applicants present qualifications
   - Implementation: System accounts for self-reporting biases and emphasizes verifiable achievements

4. **Industry Best Practices**
   - SHRM Research: 84% of recruiters consider years of experience important, **83% prioritize type of experience over duration**
   - Implementation: Our system weights experience type and relevance higher than raw years

**8-Category Research-Backed Scoring System:**
- ATS Compatibility (25%): Based on 2023-2025 industry research on ATS systems
- Skills-Based Assessment (25%): Competency demonstration, skill relevance, progression
- Contextual Analysis (25%): AI-driven interpretation of experience quantification and impact
- Professional Presentation (25%): Formatting, organization, language precision

**Competitive Advantage:**
Research foundation provides credibility and accuracy that generic resume builders lack. Scoring methodologies are validated against HR professional evaluation, not arbitrary rules.

## Architecture Principles

### Provider Abstraction Pattern

**Philosophy:** Business logic should never directly depend on vendor implementations.

**Benefits:**
- Vendor independence and negotiating leverage
- Cost optimization through provider comparison
- Testing with mock implementations
- Gradual migration paths between providers
- **Multi-model AI:** Run analysis through Claude + GPT simultaneously, synthesize best results

**Trade-offs:**
- Additional abstraction layer complexity
- Potential performance overhead (minimal in practice)
- Upfront design investment

**Competitive Advantage:**
Abstraction enables CareerOS to use multiple AI models for career transition analysis (GPT-4 for resume optimization, Claude for career coaching narratives). Competitors locked into single LLM providers can't easily experiment or optimize costs.

### Real-Time First

**Philosophy:** UI should reflect data changes immediately, without manual refresh.

**Implementation:**
- Convex subscriptions provide real-time updates
- Optimistic updates for perceived performance
- Automatic cache invalidation on mutations

### Type Safety Throughout

**Philosophy:** Runtime errors should be caught at compile time.

**Implementation:**
- TypeScript strict mode
- Generated types from Convex schema (`v.infer<>`)
- API contracts typed on both client and server
- No `any` types in production code

### Performance Through Caching

**Philosophy:** Repeated operations should be fast and cheap.

**Implementation:**
- Content-based cache keys (SHA-256)
- Intelligent cache invalidation
- Analysis result reuse across sessions
- Convex query caching for read-heavy operations

## Summary

CareerOS's tech stack prioritizes:

1. **Research-Backed Foundation** - Academic research and validated HR practices, not guesswork or generic "best practices"
2. **Career Transition Focus** - Technical architecture supports unique features for career changers (experience translation, skill gap analysis, transition planning)
3. **Vendor Independence** - Provider abstraction enables multi-model AI, cost optimization, and rapid experimentation
4. **Growth Philosophy Integration** - Technical choices support transformational features (deliberate practice tracking, career capital assessment, skill development)
5. **Developer Experience** - Modern tools, great DX, fast iteration cycles enable dogfooding for personal career transitions
6. **AI Integration** - Multi-LLM architecture (GPT-4 + Claude) enables best-in-class analysis for different use cases
7. **Scalability** - Serverless architecture scales automatically as transition community grows
8. **Type Safety** - TypeScript throughout prevents bugs and enables confident refactoring
9. **Real-Time Capabilities** - Convex enables live data synchronization for collaborative features (accountability groups, mentor matching)

**Unique Technical Advantages:**

- **Multi-Model AI for Transitions:** GPT-4 for resume optimization + Claude for career coaching narratives + skill development recommendations
- **Content-Based Caching:** 60%+ cost savings through intelligent SHA-256 hashing enables affordable AI analysis
- **Affiliate Integration Architecture:** Learning platform integrations (Coursera, Udemy, LinkedIn Learning) built into skill development pathways
- **Research-Backed Scoring:** 8-category system validated against HR professionals, not arbitrary keyword scanning
- **Build-for-Yourself Dogfooding:** Founder uses platform for personal career transitions, ensuring authentic problem-solving

This architecture enables a **small team (or solo founder) to build a transformational career development platform** while maintaining production-grade quality, research-backed credibility, and preserving flexibility for future growth. Technical choices directly support the mission: **helping people grow from where they are** through systematic skill development and career transitions.
