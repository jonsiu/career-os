# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CareerOS is a comprehensive career management platform built with Next.js 15, React 19, Convex (backend), Clerk (authentication), and AI-powered resume analysis. The platform helps users manage their job search, analyze resumes, track career development, and synchronize job opportunities through a browser extension.

## Development Commands

### Starting Development

```bash
# Start Next.js dev server (with Turbopack)
npm run dev

# Start Convex backend
npm run dev:convex

# Start both Next.js and Convex together
npm run dev:full
```

### Building and Production

```bash
# Build for production
npm run build

# Start production server
npm start
```

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- src/app/api/health/__tests__/route.test.ts
```

### Code Quality

```bash
# Run linter
npm run lint

# Fix linting issues
npm run lint:fix
```

## Architecture Overview

### Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Backend**: Convex (serverless backend-as-a-service)
- **Authentication**: Clerk
- **Styling**: Tailwind CSS 4
- **AI/LLM**: OpenAI, Anthropic Claude
- **Testing**: Jest, React Testing Library
- **UI Components**: Radix UI primitives, custom components

### Application Structure

```
src/
├── app/                          # Next.js App Router pages and API routes
│   ├── (auth)/                   # Authentication pages (sign-in, sign-up)
│   ├── dashboard/                # Main application pages
│   │   ├── page.tsx              # Dashboard home
│   │   ├── jobs/page.tsx         # Job tracker
│   │   ├── resume/page.tsx       # Resume manager
│   │   ├── analysis/page.tsx     # Resume analysis
│   │   └── plan/page.tsx         # Career planning
│   ├── onboarding/               # User onboarding flow
│   ├── auth/extension/           # Browser extension auth
│   └── api/                      # API routes (see API Routes section)
├── components/                   # React components
│   ├── analysis/                 # Resume analysis components
│   ├── jobs/                     # Job tracking components
│   ├── resume/                   # Resume management components
│   ├── planning/                 # Career planning components
│   ├── onboarding/               # Onboarding flow components
│   ├── ui/                       # Reusable UI components (Radix-based)
│   └── layout/                   # Layout components
├── lib/                          # Utility libraries and abstractions
│   ├── abstractions/             # Provider abstraction layer (see below)
│   ├── hooks/                    # Custom React hooks
│   ├── utils/                    # Utility functions
│   ├── convex-client.ts          # Convex client setup
│   ├── clerk-provider.tsx        # Clerk auth provider
│   └── convex-provider.tsx       # Convex provider
└── middleware.ts                 # Clerk authentication middleware

convex/                           # Convex backend functions
├── schema.ts                     # Database schema definition
├── users.ts                      # User queries and mutations
├── resumes.ts                    # Resume operations
├── jobs.ts                       # Job tracking operations
├── jobCategories.ts              # Job category management
├── analyses.ts                   # Resume analysis operations
├── analysisResults.ts            # Analysis result caching
├── plans.ts                      # Career planning operations
├── skills.ts                     # Skills tracking operations
└── files.ts                      # File storage operations
```

### Provider Abstraction Layer

**Location**: `src/lib/abstractions/`

The codebase uses a **provider abstraction pattern** to decouple business logic from vendor-specific implementations. This allows easy switching between different service providers.

**Key Files**:
- `types.ts` - Interface definitions for all providers
- `service-factory.ts` - Factory for creating provider instances
- `index.ts` - Exports configured service instances

**Providers**:
- `DatabaseProvider` - Data persistence (Convex implementation)
- `FileStorageProvider` - File uploads/downloads (Convex implementation)
- `AnalysisProvider` - Resume analysis (multiple implementations):
  - `ConvexAnalysisProvider` - Server-side analysis
  - `AnthropicAnalysisProvider` - AI-powered analysis using Claude
  - `ServerAnalysisProvider` - API-based analysis
- `AuthProvider` - Authentication (Clerk implementation)

**Usage Pattern**:
```typescript
import { database, analysis } from '@/lib/abstractions';

// Use abstracted interfaces instead of direct vendor calls
const user = await database.getUserByClerkId(clerkUserId);
const analysisResult = await analysis.analyzeResume(resume, job);
```

### Database Schema (Convex)

**Tables**:
- `users` - User profiles with Clerk integration and onboarding state
- `resumes` - Resume documents with content and metadata
- `jobs` - Saved job opportunities with status tracking
- `jobCategories` - Job search projects/categories
- `analyses` - Historical resume analysis records
- `analysisResults` - Cached analysis results with content hashing
- `plans` - Career development plans with milestones
- `skills` - Skills tracking with progress and resources
- `files` - File metadata for uploaded documents

**Key Indexes**:
- Users: `by_clerk_user_id`, `by_email`
- Resumes: `by_user_id`
- Jobs: `by_user_id`, `by_status`, `by_category`
- Analyses: `by_resume_id`, `by_user_id`, `by_type`
- Analysis Results: `by_resume_and_type`, `by_content_hash`

### API Routes

**Health & Monitoring**:
- `GET /api/health` - System health check (no auth required)

**Authentication** (for browser extension):
- `GET /api/auth/extension` - Extension authentication
- `GET /api/auth/extension/health` - Extension auth health check
- `GET /api/auth/me` - Current user info
- `GET /api/auth/session` - Session validation
- `POST /api/auth/token` - Token management
- `GET /api/auth/validate` - Token validation

**Job Management**:
- `POST /api/jobs/bookmark` - Save single job from extension
- `POST /api/jobs/sync` - Bulk sync jobs from extension
- `GET /api/jobs/sync` - Get job sync statistics

**Resume Analysis**:
- `POST /api/analysis/basic` - Basic resume analysis
- `POST /api/analysis/advanced` - Advanced resume analysis
- `POST /api/analysis/ai-powered` - AI-powered analysis using LLMs
- `GET /api/analysis/cache` - Check analysis cache
- `POST /api/analysis/save` - Save analysis results
- `GET /api/analysis/history` - Get analysis history
- `GET /api/analysis/stats` - Get analysis statistics

**Resume Management**:
- `GET /api/resumes/[id]` - Get resume by ID

## Key Features & Implementation Patterns

### 1. Resume Analysis System

**Three Analysis Levels**:
1. **Basic** - Fast, rule-based analysis
2. **Advanced** - Comprehensive heuristic analysis
3. **AI-Powered** - LLM-based deep analysis (OpenAI/Anthropic)

**Caching Strategy**:
- Uses SHA-256 content hashing to detect resume changes
- Caches results in `analysisResults` table by `resumeId`, `analysisType`, and `contentHash`
- Automatically invalidates cache when resume content changes
- See: `src/lib/abstractions/providers/convex-analysis.ts`

### 2. Job Tracking & Browser Extension Integration

**Job Statuses**: `saved`, `applied`, `interviewing`, `offered`, `rejected`

**Extension Integration**:
- Browser extension bookmarks jobs while browsing (LinkedIn, Indeed, etc.)
- Extension authenticates via Clerk session cookies
- Single job bookmark: `POST /api/jobs/bookmark`
- Bulk sync: `POST /api/jobs/sync`
- Duplicate detection based on URL and title+company combination

**Job Categories**:
- Users can organize jobs into projects/categories
- Categories track target roles, companies, and locations
- Managed via `jobCategories` table and Convex operations

### 3. Onboarding Flow

**Steps**:
1. Welcome - Introduction to CareerOS
2. Resume Upload - Upload first resume
3. Job Interests - Select target roles and industries
4. Browser Extension - Install extension (optional)
5. Completion - Onboarding summary

**State Management**:
- Onboarding state stored in `users.onboardingState`
- Tracks current step, completed steps, and user preferences
- Hook: `src/lib/hooks/use-onboarding-check.ts`
- Components: `src/components/onboarding/`

### 4. Authentication & Authorization

**Clerk Integration**:
- Middleware: `src/middleware.ts` applies Clerk auth to all routes
- User sync: `src/lib/hooks/use-user-sync.ts` syncs Clerk users to Convex
- Extension auth: Uses session cookies for cross-origin requests
- API protection: All API routes (except `/api/health`) require authentication

**User Flow**:
1. User signs up via Clerk
2. `use-user-sync` hook creates Convex user record
3. User completes onboarding
4. User can access dashboard and features

## Testing Strategy

**Test Configuration**: `jest.config.js`
- Environment: Node.js
- Coverage threshold: 80% for all metrics
- Path mapping: `@/*` → `src/*`

**Test Locations**:
- API tests: `src/app/api/**/__tests__/`
- Component tests: `src/components/**/__tests__/`
- Provider tests: `src/lib/abstractions/providers/__tests__/`

**Mocking Strategy**:
- Clerk auth is mocked in tests
- Convex client is mocked with in-memory data
- External API calls (OpenAI, Anthropic) are mocked

**Running Tests** (see Development Commands section above)

## Important Patterns & Conventions

### Path Aliases

Use `@/*` imports for all local modules:
```typescript
import { database } from '@/lib/abstractions';
import { Button } from '@/components/ui/button';
```

### Convex Operations

Always use generated API from `convex/_generated/api`:
```typescript
import { api } from '@/convex/_generated/api';
import { useQuery, useMutation } from 'convex/react';

const user = useQuery(api.users.getByClerkUserId, { clerkUserId });
const createResume = useMutation(api.resumes.create);
```

### Error Handling

API routes should return appropriate status codes:
- `400` - Bad request (validation errors)
- `401` - Unauthorized (missing/invalid auth)
- `404` - Not found (resource doesn't exist)
- `500` - Internal server error (unexpected errors)

### TypeScript

- Strict mode enabled
- All new code must be typed
- Prefer interfaces over types for objects
- Use `v.infer<>` for Convex schema types

### Styling

- Use Tailwind utility classes
- Follow existing component patterns from `src/components/ui/`
- Responsive by default (mobile-first)
- Dark mode support (where applicable)

## Browser Extension Integration

**Authentication Flow**:
1. Extension checks health: `GET /api/health`
2. User authenticates in main app
3. Extension uses session cookie for API calls
4. Extension page: `/auth/extension` for explicit auth

**Job Bookmarking**:
- Extension scrapes job data from job boards
- Sends to `POST /api/jobs/bookmark` or `POST /api/jobs/sync`
- CareerOS saves jobs with proper user association
- Jobs appear in Job Tracker dashboard

**See**: `API_TESTING.md` and `TEST_SUMMARY.md` for detailed API documentation

## Environment Variables

Required variables (see `.env.local`):
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk public key
- `CLERK_SECRET_KEY` - Clerk secret key
- `NEXT_PUBLIC_CONVEX_URL` - Convex deployment URL
- `CONVEX_DEPLOYMENT` - Convex deployment ID
- `OPENAI_API_KEY` - OpenAI API key (for AI analysis)
- `ANTHROPIC_API_KEY` - Anthropic API key (for AI analysis)

## Common Development Tasks

### Adding a New API Route

1. Create route file in `src/app/api/[route-name]/route.ts`
2. Implement HTTP method handlers (`GET`, `POST`, etc.)
3. Add Clerk auth check (if needed)
4. Use provider abstractions for data operations
5. Write tests in `__tests__/route.test.ts`
6. Update this documentation

### Adding a New Convex Table

1. Define schema in `convex/schema.ts`
2. Create operations file: `convex/[table-name].ts`
3. Define queries and mutations using `v.infer<>`
4. Update provider interfaces in `src/lib/abstractions/types.ts`
5. Update provider implementations
6. Run `npm run dev:convex` to regenerate types

### Adding a New Page

1. Create page in `src/app/dashboard/[page-name]/page.tsx`
2. Add to navigation in `src/components/layout/main-nav.tsx`
3. Create supporting components in `src/components/[feature]/`
4. Use existing hooks and abstractions
5. Test with different auth states

### Adding a New Provider Implementation

1. Define interface in `src/lib/abstractions/types.ts`
2. Create implementation in `src/lib/abstractions/providers/[name].ts`
3. Update `ServiceFactory` in `service-factory.ts`
4. Write unit tests in `__tests__/[name].test.ts`
5. Update exports in `index.ts`

## Known Issues & Gotchas

- **Turbopack**: Some features may not work in dev mode with Turbopack; use `npm run dev` without `--turbopack` if needed
- **Convex Codegen**: Run `npm run dev:convex` in a separate terminal to keep types up-to-date
- **Clerk Middleware**: Middleware runs on ALL routes matching the config; use public routes carefully
- **PDF Rendering**: PDF.js worker is pre-built in `public/pdf.worker.min.js`
- **Content Hashing**: Resume analysis cache uses SHA-256; changing hash function will invalidate all caches
- **Extension CORS**: Browser extension must use `credentials: 'include'` for authenticated requests

## Additional Documentation

- `API_TESTING.md` - Comprehensive API testing guide with examples
- `TEST_SUMMARY.md` - Test status and coverage summary
- `README.md` - Basic Next.js setup instructions
