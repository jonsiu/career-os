# Specification: Transition Type Identification & Planning

## Goal

Enable users to systematically identify their career transition type (cross-role, cross-industry, cross-function, or hybrid), receive AI-powered skill gap analysis, and generate personalized development roadmaps with realistic timelines, course recommendations, and progress tracking.

## User Stories

- As a career changer, I want to understand what type of transition I'm making so I can prepare appropriately for the unique challenges ahead
- As a user exploring multiple career paths, I want to create and compare multiple transition plans (Plan A, Plan B) so I can make an informed decision about my next move
- As someone new to a field, I want to see realistic timelines based on similar transitions so I have appropriate expectations about the journey
- As a skill developer, I want AI-powered identification of skill gaps so I know exactly what to learn
- As a lifelong learner, I want personalized course recommendations with affiliate links so I can find quality resources to close my skill gaps
- As a career planner, I want to track my transition progress over time so I stay motivated and accountable
- As a professional, I want to understand my unique career capital so I can leverage rare skill combinations for competitive advantage

## Core Requirements

### Functional Requirements

**Guided Transition Assessment**
- Multi-step flow to identify transition type (similar to onboarding pattern)
- Detect multiple simultaneous transition types (hybrid transitions)
- Prioritize the primary challenge when multiple types identified
- Support for cross-role, cross-industry, and cross-function transitions
- AI analysis of user's resume to identify current skills and experience level

**AI-Powered Roadmap Generation**
- Generate personalized transition roadmaps using Claude/GPT-4
- Realistic timeline estimation (6-18 months typical range) based on skill complexity, learning velocity, and transition difficulty
- Display benchmarking data from similar transitions (e.g., "Similar IC → Manager transitions take 8-12 months")
- Identify bridge roles for difficult transitions (e.g., Senior Engineer → Technical PM)
- Break roadmap into actionable milestones with target dates and effort estimates

**Skill Gap Analysis**
- AI-dynamic skill identification using LLMs for flexibility
- O*NET API integration for skill validation and importance ratings
- Identify critical vs. nice-to-have skills
- Highlight transferable skills from current role
- Estimate learning time per skill based on complexity

**Course Recommendations & Affiliate Revenue**
- Prominently display courses for each skill gap (Coursera, Udemy, LinkedIn Learning)
- Include affiliate links for all course recommendations (60-70% revenue driver)
- Track course completions and integrate with skill progress
- Curate resources specific to transition type
- Proper affiliate disclosure and compliance

**Multiple Transition Plans**
- Users can create multiple simultaneous plans (Plan A: IC → Manager, Plan B: Engineer → PM)
- Comparison view to evaluate different career paths side-by-side
- Each plan stored independently with unique transition metadata
- Support for revising and regenerating plans as skills develop

**Progress Tracking**
- Display completion percentage for overall transition plan
- Milestone tracking with completion states (pending, in-progress, completed)
- Skill development progress visualization
- Weekly check-in prompts (integrate with Daily Career Journal when available)
- Historical tracking of plan versions for comparison

**Career Capital Assessment**
- Identify user's unique skill combinations using AI
- Highlight rare and valuable career capital
- Recommend skill combinations that create competitive advantages
- Factor career capital into transition strategy and timeline

### Non-Functional Requirements

**Performance**
- Transition assessment completes in <5 seconds
- AI roadmap generation completes in <30 seconds
- Page load times <2 seconds
- Support for streaming AI responses during roadmap generation for better UX

**Cost Optimization**
- Cache AI analysis results using SHA-256 content hashing
- Target 60%+ cache hit rate to reduce API costs
- Average AI cost per transition plan: <$2
- O*NET API usage within free tier limits (1000 calls/day)

**Accessibility**
- WCAG 2.1 AA compliance
- Keyboard navigation for multi-step assessment
- Screen reader support for all components
- Focus management throughout flow
- Use Radix UI primitives for accessible components

**Security & Privacy**
- Transition plans are user-private (not shared publicly)
- Affiliate links include proper disclosure
- API keys stored securely in environment variables
- No PII in affiliate tracking parameters

## Visual Design

Follow existing CareerOS UI patterns:

**Layout**:
- Career Planning page (`/dashboard/plan`) integration
- Tab-based interface (existing: "Development Roadmap" and "Skills Tracking"; new: "Transition Planning")
- LinkedIn-style sidebar + preview layout for plan comparison

**Multi-Step Assessment Flow**:
- Similar to onboarding flow pattern
- Progress bar showing step X of Y
- Back/Next navigation
- Step indicators (dots)
- Card-based content layout

**Plan Display**:
- Grid of plan cards (similar to development-roadmap.tsx)
- Progress visualization with percentage and progress bars
- Quick stats cards showing key metrics (timeline, milestones, progress)
- Badge components for status, transition type, priority

**Responsive Design**:
- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Collapsible sidebar on mobile

## Reusable Components

### Existing Code to Leverage

**Onboarding Flow Pattern** (`src/components/onboarding/onboarding-flow.tsx`):
- Multi-step state management with currentStepIndex
- Progress calculation and visualization
- Step navigation (handleNext, handleBack)
- Loading states and error handling
- Data persistence between steps (onboardingData state)
- Exit/skip functionality
- Reuse: Step container, progress indicator, navigation buttons

**Development Roadmap** (`src/components/planning/development-roadmap.tsx`):
- Plan creation and editing forms
- Milestone management UI
- Goal tracking interface
- Progress calculation (calculateProgress function)
- Plan selection grid with cards
- Status badges and color coding
- Form validation and save handling
- Reuse: Form components, milestone cards, progress bars, plan grid

**Skills Tracking** (`src/components/planning/skills-tracking.tsx`):
- Skills display and management
- Resource curation interface
- Progress tracking per skill
- Priority and status indicators
- Reuse: Skill cards, progress indicators, resource lists

**AI Analysis Infrastructure** (`src/lib/abstractions/providers/anthropic-analysis.ts`):
- Provider abstraction pattern for multi-LLM support
- Prompt templates for structured analysis
- Error handling and graceful degradation
- API route integration pattern (fetch to `/api/analysis/`)
- Reuse: Analysis provider interface, caching pattern, error handling

**Convex Schema** (`convex/schema.ts`):
- Existing `plans` table with basic structure
- Existing `skills` table with progress tracking
- User association patterns (userId indexes)
- Timestamp patterns (createdAt, updatedAt)
- Reuse: Table structure, indexing strategy, schema validation

### New Components Required

**TransitionAssessmentFlow Component**:
- Cannot reuse onboarding-flow.tsx directly (different steps and data model)
- Need transition-specific questions and AI analysis integration
- Similar structure but customized for transition identification
- Location: `src/components/planning/transition-assessment-flow.tsx`

**TransitionPlanCard Component**:
- Extension of existing plan cards with transition-specific metadata
- Display transition type badges, bridge roles, benchmarking data
- Show career capital highlights
- Location: `src/components/planning/transition-plan-card.tsx`

**SkillGapAnalysis Component**:
- Display critical vs. nice-to-have skills
- Show transferable skills from current role
- Course recommendations with affiliate links
- O*NET validation indicators
- Location: `src/components/planning/skill-gap-analysis.tsx`

**BenchmarkingDisplay Component**:
- Show similar transition statistics
- Timeline ranges with confidence levels
- Success rate indicators
- Location: `src/components/planning/benchmarking-display.tsx`

**TransitionAnalysisProvider**:
- New provider for transition-specific AI analysis
- Extends AnalysisProvider interface with transition methods
- Implements caching for transition analysis results
- Location: `src/lib/abstractions/providers/transition-analysis.ts`

## Technical Approach

### Database

**Extend Existing Plans Table** (`convex/schema.ts`):
```typescript
plans: defineTable({
  // ... existing fields (userId, title, description, goals, timeline, milestones, status)

  // NEW transition-specific fields
  transitionTypes: v.optional(v.array(v.union(
    v.literal("cross-role"),
    v.literal("cross-industry"),
    v.literal("cross-function")
  ))),
  primaryTransitionType: v.optional(v.string()),
  currentRole: v.optional(v.string()),
  targetRole: v.optional(v.string()),
  currentIndustry: v.optional(v.string()),
  targetIndustry: v.optional(v.string()),
  bridgeRoles: v.optional(v.array(v.string())),
  estimatedTimeline: v.optional(v.object({
    minMonths: v.number(),
    maxMonths: v.number(),
    factors: v.array(v.string()),
  })),
  benchmarkData: v.optional(v.object({
    similarTransitions: v.string(),
    averageTimeline: v.string(),
    successRate: v.optional(v.number()),
  })),
  progressPercentage: v.optional(v.number()),
  careerCapitalAssessment: v.optional(v.object({
    uniqueSkills: v.array(v.string()),
    rareSkillCombinations: v.array(v.string()),
    competitiveAdvantages: v.array(v.string()),
  })),
})
.index("by_transition_type", ["userId", "primaryTransitionType"])
```

**Extend Existing Skills Table** (`convex/schema.ts`):
```typescript
skills: defineTable({
  // ... existing fields (userId, name, category, currentLevel, targetLevel, progress, etc.)

  // NEW transition-specific fields
  transitionPlanId: v.optional(v.id("plans")),
  criticalityLevel: v.optional(v.union(
    v.literal("critical"),
    v.literal("important"),
    v.literal("nice-to-have")
  )),
  transferableFrom: v.optional(v.array(v.string())),
  onetCode: v.optional(v.string()),
  skillComplexity: v.optional(v.union(
    v.literal("basic"),
    v.literal("intermediate"),
    v.literal("advanced")
  )),
  estimatedLearningTime: v.optional(v.object({
    minWeeks: v.number(),
    maxWeeks: v.number(),
  })),
  affiliateCourses: v.optional(v.array(v.object({
    provider: v.string(),
    title: v.string(),
    url: v.string(),
    affiliateLink: v.string(),
    price: v.optional(v.number()),
  }))),
})
.index("by_transition_plan", ["transitionPlanId"])
.index("by_criticality", ["userId", "criticalityLevel"])
```

**New Convex Operations**:
- `convex/transitions.ts`: Transition-specific queries and mutations
  - `identifyTransitionType(userId, resumeId, targetRole)`
  - `generateTransitionRoadmap(userId, transitionData)`
  - `getTransitionPlans(userId)`
  - `updateTransitionProgress(planId, progress)`

### API

**New API Routes**:
- `POST /api/transitions/identify` - Identify transition type from resume and target role
- `POST /api/transitions/roadmap` - Generate AI-powered transition roadmap
- `POST /api/transitions/skills-gap` - Analyze skill gaps with O*NET validation
- `GET /api/transitions/benchmarks` - Get benchmarking data for transition types
- `POST /api/transitions/courses` - Get course recommendations with affiliate links

**External API Integrations**:
- **O*NET API** (`https://services.onetcenter.org/ws/`): Skill validation and job-to-skill mappings
- **Coursera API**: Course search and affiliate links
- **Udemy API**: Course search and affiliate links
- **LinkedIn Learning API**: Course search and affiliate links

### Frontend

**New Pages/Routes**:
- Integrate into existing `/dashboard/plan` page as new tab
- New tab: "Transition Planning" alongside "Development Roadmap" and "Skills Tracking"

**Component Architecture**:
```
TransitionPlanningTab (parent component)
├── TransitionAssessmentFlow (multi-step assessment)
│   ├── CurrentRoleStep
│   ├── TargetRoleStep
│   ├── IndustryChangesStep
│   ├── AIAnalysisStep
│   └── ResultsStep
├── TransitionPlansList (grid of plan cards)
├── TransitionPlanViewer (detailed plan view)
│   ├── PlanOverview (stats, progress)
│   ├── BenchmarkingDisplay
│   ├── SkillGapAnalysis
│   │   └── CourseRecommendations
│   ├── TimelineVisualization
│   └── MilestonesTracker
└── PlanComparisonView (side-by-side comparison)
```

**State Management**:
- Use React hooks (useState, useEffect) for local component state
- Convex real-time queries for plan data (`useQuery(api.transitions.getTransitionPlans)`)
- Convex mutations for updates (`useMutation(api.transitions.updateTransitionProgress)`)
- Form state with validation (similar to development-roadmap.tsx)

### Testing

**Unit Tests**:
- TransitionAnalysisProvider methods (mock AI responses)
- Transition type detection logic
- Skill gap analysis calculations
- Timeline estimation algorithms
- Cache hit/miss scenarios

**Integration Tests**:
- End-to-end transition assessment flow
- Plan creation with transition metadata
- Skill linking to transition plans
- O*NET API integration (mock in tests)
- Course recommendation generation

**Component Tests**:
- TransitionAssessmentFlow navigation
- SkillGapAnalysis display and interactions
- CourseRecommendations affiliate link rendering
- Progress tracking updates
- Plan comparison view

**Test Coverage Target**: 80%+ (consistent with project standards)

## Out of Scope

**Not in This Feature**:
- Daily Career Journal implementation (separate feature, but integration hooks provided)
- Bridge role job matching (covered by AI Job Matching feature)
- Interview preparation for transitions (separate feature)
- Resume tailoring for career changers (separate feature)
- Mentor matching for transitions (Phase 3)
- Transition success stories and templates (Phase 3)
- Community-driven transition data (Phase 3+)
- Salary intelligence for career changers (Phase 3)

**Future Enhancements**:
- Video course integration (beyond text courses)
- Live cohort-based learning
- Peer accountability groups
- Automated weekly check-ins via email/Slack
- Integration with learning management systems (LMS)
- Certificate verification and credentialing

## Success Criteria

### User Outcomes

**Adoption Metrics**:
- 70%+ of users complete transition type assessment within first month
- 50%+ generate at least one transition roadmap
- 30%+ create multiple transition plans (Plan A, Plan B)
- 60%+ identify hybrid transitions (multiple types)

**Engagement Metrics**:
- 80%+ report assessment accurately captured their transition challenge
- 85%+ report timelines feel realistic (not overpromising)
- 75%+ find benchmarking data helpful
- 60%+ take action on skill gap recommendations within 2 weeks

**Revenue Metrics** (Critical - 60-70% of business model):
- 40%+ click through to course recommendations
- 10-15% course purchase conversion (on clicks)
- Average 1.5 course enrollments per active transition planner per year
- $10K+/month from affiliate commissions by end of Phase 2

**Progress Tracking**:
- 50%+ actively track transition progress
- 40%+ complete weekly check-ins
- 30%+ integrate with Daily Career Journal (when available)

### Technical Metrics

**Performance**:
- Transition assessment: <5 seconds
- Roadmap generation: <30 seconds
- Cache hit rate: 60%+
- Average AI cost per plan: <$2

**Quality**:
- AI-identified skills validated by O*NET: 85%+ accuracy
- Timeline estimates within 20% of actual completions (over time)
- 90%+ uptime for transition assessment flow

**Integration Health**:
- Schema extensions deploy without breaking existing features
- Backward compatibility maintained for Plans and Skills tables
- O*NET API stays within free tier limits

## Implementation Considerations

### Phase 1 - Foundation (Week 1, Days 1-2)
- Extend Convex schema (plans and skills tables)
- Create transition-specific queries and mutations
- Set up provider abstraction for transition analysis
- Basic transition type detection logic

### Phase 2 - Assessment Flow (Week 1, Days 3-4)
- Build TransitionAssessmentFlow component
- Implement multi-step navigation and state management
- Integrate with AI providers for transition type identification
- Create TransitionPlanCard component

### Phase 3 - Roadmap Generation (Week 1, Days 5-6)
- AI-powered roadmap generation with timeline estimation
- Skill gap analysis with O*NET integration
- Benchmarking data display
- Bridge role identification

### Phase 4 - Course Integration & Revenue (Week 1, Day 7)
- Course recommendation API integrations (Coursera, Udemy, LinkedIn Learning)
- Affiliate link generation and tracking
- Compliance and disclosure implementation
- Revenue attribution setup

### Phase 5 - Polish & Testing (Week 2, Days 1-2)
- Progress tracking implementation
- Plan comparison view
- Error handling and edge cases
- Unit and integration tests
- Performance optimization and caching

### Phase 6 - Documentation & Deployment (Week 2, Day 3)
- Update CLAUDE.md with new features
- API documentation
- User-facing help content
- Deployment to production

### Migration Strategy
- Schema changes deployed with backward compatibility
- Existing plans continue to work without transition metadata
- Users can optionally convert existing plans to transition plans
- No breaking changes to existing Features

### Monitoring & Iteration
- Track cache hit rates and adjust caching strategy
- Monitor AI costs and optimize prompts
- A/B test course recommendation placements for conversion
- Collect user feedback on timeline realism
- Iterate on benchmarking data based on actual user completions

### Risk Mitigation
- **AI Cost Overruns**: Aggressive caching, prompt optimization, fallback to simpler analysis if budget exceeded
- **O*NET API Limits**: Cache results aggressively, implement graceful degradation if API unavailable
- **Course API Changes**: Abstract course providers, easy to swap implementations
- **Low Conversion Rates**: A/B test placement, messaging, and course curation quality
- **Timeline Inaccuracy**: Collect feedback loops, adjust ML models over time based on actual completions

### Standards Alignment

This feature aligns with CareerOS standards:

**AI Integration** (`agent-os/standards/ai-integration/`):
- Follow prompt management best practices (versioning, testing)
- Implement cost optimization through caching (target 60%+ cache hit rate)
- Use streaming responses for better UX during roadmap generation
- Multi-model approach (GPT-4 for structured analysis, Claude for narrative coaching)

**Backend** (`agent-os/standards/backend/`):
- API routes follow RESTful conventions
- Proper authentication/authorization on all routes
- Convex queries and mutations follow schema-driven patterns
- Error handling with appropriate status codes

**Frontend** (`agent-os/standards/frontend/`):
- Component structure follows existing patterns
- State management with Convex real-time queries
- Form validation and error handling
- Accessibility with Radix UI primitives

**Database** (`agent-os/standards/database/`):
- Schema extensions maintain backward compatibility
- Appropriate indexes for query performance
- Relational integrity with foreign keys (plan-to-skills)

**Global** (`agent-os/standards/global/`):
- TypeScript strict mode compliance
- Comprehensive error handling
- Logging for debugging and monitoring
- Feature flags for gradual rollout

### Anti-patterns to Avoid

**Transactional Messaging**:
- AVOID: "Get hired faster", "Land your dream job in 30 days"
- INSTEAD: "Grow into your target role through systematic skill development"

**One-Size-Fits-All Advice**:
- AVOID: Generic roadmaps that ignore user's unique background
- INSTEAD: Personalized plans based on current skills, learning velocity, career capital

**Unrealistic Promises**:
- AVOID: Guaranteeing outcomes or oversimplifying transition difficulty
- INSTEAD: Realistic timelines with benchmarking data, acknowledge challenges

**Ignoring the "Why"**:
- AVOID: Focusing only on "how" without addressing "why transition"
- INSTEAD: Help users articulate motivation, values alignment, career capital goals

**Competitive Scarcity Mindset**:
- AVOID: "Beat other candidates", "Stand out in ATS"
- INSTEAD: "Explore abundance of career options", "Build rare skill combinations"
