# Task Breakdown: Transition Type Identification & Planning

## Overview
Total Estimated Tasks: 52 tasks across 5 task groups
Effort: M-sized (1 week / 5-7 days)
Priority: High - Foundation for all Phase 2 transition features
Assigned roles: database-engineer, api-engineer, ui-designer, testing-engineer

## Task List

### Database Layer

#### Task Group 1: Database Schema Extensions & Convex Operations
**Assigned implementer:** database-engineer
**Dependencies:** None
**Estimated Effort:** 1-1.5 days

- [ ] 1.0 Complete database schema extensions and Convex operations
  - [ ] 1.1 Write 2-8 focused tests for schema extensions and Convex operations
    - Test plan extensions (transitionTypes, primaryTransitionType, bridgeRoles, estimatedTimeline, benchmarkData, careerCapitalAssessment, progressPercentage)
    - Test skills extensions (transitionPlanId, criticalityLevel, transferableFrom, onetCode, skillComplexity, estimatedLearningTime, affiliateCourses)
    - Test new indexes (by_transition_type, by_transition_plan, by_criticality)
    - Test transition queries (getTransitionPlans, getTransitionPlanById, getPlansByTransitionType)
    - Test backward compatibility (existing plans and skills continue to work without new fields)
    - Limit to 6-8 highly focused tests maximum
  - [ ] 1.2 Extend plans table schema in convex/schema.ts
    - Add optional transitionTypes field (array of cross-role, cross-industry, cross-function)
    - Add optional primaryTransitionType field (string)
    - Add optional currentRole and targetRole fields (strings)
    - Add optional currentIndustry and targetIndustry fields (strings)
    - Add optional bridgeRoles field (array of strings)
    - Add optional estimatedTimeline field (object with minMonths, maxMonths, factors array)
    - Add optional benchmarkData field (object with similarTransitions, averageTimeline, successRate)
    - Add optional progressPercentage field (number 0-100)
    - Add optional careerCapitalAssessment field (object with uniqueSkills, rareSkillCombinations, competitiveAdvantages)
    - Ensure all new fields are optional to maintain backward compatibility
    - Reference existing schema pattern from convex/schema.ts
  - [ ] 1.3 Add new index to plans table for transition type queries
    - Add index: by_transition_type on ["userId", "primaryTransitionType"]
    - Optimize for queries filtering by user and transition type
  - [ ] 1.4 Extend skills table schema in convex/schema.ts
    - Add optional transitionPlanId field (foreign key to plans table)
    - Add optional criticalityLevel field (union of critical, important, nice-to-have)
    - Add optional transferableFrom field (array of strings - current skills that transfer)
    - Add optional onetCode field (string - O*NET skill code for validation)
    - Add optional skillComplexity field (union of basic, intermediate, advanced)
    - Add optional estimatedLearningTime field (object with minWeeks, maxWeeks)
    - Add optional affiliateCourses field (array of objects with provider, title, url, affiliateLink, price)
    - Ensure all new fields are optional to maintain backward compatibility
  - [ ] 1.5 Add new indexes to skills table for transition plan queries
    - Add index: by_transition_plan on ["transitionPlanId"]
    - Add index: by_criticality on ["userId", "criticalityLevel"]
    - Optimize for queries filtering by plan and criticality
  - [ ] 1.6 Create new Convex operations file: convex/transitions.ts
    - Create query: getTransitionPlans(userId) - get all transition plans for user
    - Create query: getTransitionPlanById(planId) - get single transition plan with details
    - Create query: getPlansByTransitionType(userId, transitionType) - filter by type
    - Create mutation: createTransitionPlan(userId, planData) - create new transition plan
    - Create mutation: updateTransitionPlan(planId, updates) - update transition plan fields
    - Create mutation: updateTransitionProgress(planId, progressPercentage) - update progress
    - Create mutation: deleteTransitionPlan(planId) - delete transition plan
    - Follow existing Convex patterns from convex/plans.ts and convex/skills.ts
  - [ ] 1.7 Ensure database layer tests pass
    - Run ONLY the 6-8 tests written in 1.1
    - Verify schema extensions deploy successfully
    - Verify indexes are created correctly
    - Verify backward compatibility (existing plans/skills queries work)
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 6-8 tests written in 1.1 pass
- Plans table has all new transition fields (all optional)
- Skills table has all new transition fields (all optional)
- New indexes created: by_transition_type, by_transition_plan, by_criticality
- convex/transitions.ts has all required queries and mutations
- Existing plans and skills continue to work without new fields (backward compatible)
- No breaking changes to existing features

---

### API Layer

#### Task Group 2: API Routes & External Integrations
**Assigned implementer:** api-engineer
**Dependencies:** Task Group 1
**Estimated Effort:** 1.5-2 days

- [ ] 2.0 Complete API routes and external integrations
  - [ ] 2.1 Write 2-8 focused tests for API endpoints
    - Test POST /api/transitions/identify (transition type detection from resume)
    - Test POST /api/transitions/roadmap (AI-powered roadmap generation)
    - Test POST /api/transitions/skills-gap (skill gap analysis with O*NET)
    - Test GET /api/transitions/benchmarks (benchmarking data retrieval)
    - Test POST /api/transitions/courses (course recommendations with affiliate links)
    - Test authentication/authorization on all routes
    - Test error handling (missing parameters, invalid data, API failures)
    - Limit to 6-8 highly focused tests maximum
  - [ ] 2.2 Create API route: POST /api/transitions/identify
    - Accept: userId, resumeId, targetRole, targetIndustry
    - Use AI provider (Claude/GPT-4) to analyze resume content
    - Detect transition types: cross-role, cross-industry, cross-function
    - Support hybrid transition detection (multiple types)
    - Identify primary transition type challenge
    - Return: transitionTypes array, primaryTransitionType, currentRole, targetRole
    - Follow existing AI analysis patterns from src/lib/abstractions/providers/
    - Include Clerk auth check
    - Handle errors with appropriate status codes (400, 401, 500)
  - [ ] 2.3 Create API route: POST /api/transitions/roadmap
    - Accept: userId, transitionData (types, roles, industries)
    - Use AI provider to generate personalized roadmap
    - Calculate estimated timeline (6-18 months typical range)
    - Factor in: skill complexity, learning velocity, transition difficulty
    - Identify bridge roles for difficult transitions
    - Generate milestones with target dates and effort estimates
    - Return: roadmap with timeline, milestones, bridgeRoles
    - Implement caching using SHA-256 content hashing (target 60%+ cache hit rate)
    - Follow existing analysis caching pattern from convex/analysisResults.ts
  - [ ] 2.4 Create API route: POST /api/transitions/skills-gap
    - Accept: userId, currentRole, targetRole, resumeId
    - Use AI provider to identify required skills for target role
    - Validate skills against O*NET API (https://services.onetcenter.org/ws/)
    - Categorize skills: critical, important, nice-to-have
    - Identify transferable skills from current role
    - Estimate learning time per skill (minWeeks, maxWeeks)
    - Return: skillGaps array with criticality, transferability, learning time
    - Handle O*NET API failures gracefully (fallback to AI-only analysis)
    - Stay within O*NET free tier limits (1000 calls/day)
  - [ ] 2.5 Create API route: GET /api/transitions/benchmarks
    - Accept: transitionType, currentRole, targetRole
    - Retrieve or generate benchmarking data for similar transitions
    - Return: similarTransitions, averageTimeline, successRate
    - Use AI-generated benchmarks initially (future: real user data)
    - Cache results for common transition combinations
  - [ ] 2.6 Create API route: POST /api/transitions/courses
    - Accept: skillName, criticalityLevel, targetRole
    - Integrate with course provider APIs (Coursera, Udemy, LinkedIn Learning)
    - Search for relevant courses for the skill
    - Generate affiliate links with proper tracking parameters
    - Return: courses array with provider, title, url, affiliateLink, price
    - Include affiliate disclosure in response metadata
    - Handle API failures gracefully (fallback to alternative providers)
    - Track which provider was used for revenue attribution
  - [ ] 2.7 Create O*NET API integration utility
    - Location: src/lib/integrations/onet-api.ts
    - Implement skill validation function
    - Implement skill importance retrieval
    - Implement skill level requirements lookup
    - Add error handling and retry logic
    - Add request caching to stay within free tier
    - Environment variable: ONET_API_KEY
  - [ ] 2.8 Create course provider integration utilities
    - Location: src/lib/integrations/course-providers.ts
    - Implement Coursera API integration (search, affiliate link generation)
    - Implement Udemy API integration (search, affiliate link generation)
    - Implement LinkedIn Learning API integration (search, affiliate link generation)
    - Add fallback logic if one provider fails
    - Add affiliate tracking UTM parameters
    - Environment variables: COURSERA_AFFILIATE_ID, UDEMY_AFFILIATE_ID, LINKEDIN_AFFILIATE_ID
  - [ ] 2.9 Ensure API layer tests pass
    - Run ONLY the 6-8 tests written in 2.1
    - Verify all API routes work correctly
    - Verify authentication is enforced
    - Verify external API integrations (mock in tests)
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 6-8 tests written in 2.1 pass
- All 5 API routes created and functional (identify, roadmap, skills-gap, benchmarks, courses)
- O*NET API integration working with graceful degradation
- Course provider APIs integrated with affiliate link generation
- Caching implemented for roadmap and skills-gap endpoints
- All routes require Clerk authentication
- Error handling with appropriate status codes
- Affiliate disclosure included in course responses

---

### Frontend Components

#### Task Group 3: UI Components & Transition Assessment Flow
**Assigned implementer:** ui-designer
**Dependencies:** Task Group 2
**Estimated Effort:** 2-2.5 days

- [ ] 3.0 Complete UI components and transition assessment flow
  - [ ] 3.1 Write 2-8 focused tests for UI components
    - Test TransitionAssessmentFlow navigation (step progression, back button)
    - Test TransitionPlanCard rendering (displays transition metadata correctly)
    - Test SkillGapAnalysis display (critical vs nice-to-have skills, course links)
    - Test BenchmarkingDisplay data visualization
    - Test form validation in assessment steps
    - Test affiliate link rendering and disclosure
    - Limit to 6-8 highly focused tests maximum
  - [ ] 3.2 Create TransitionAssessmentFlow component
    - Location: src/components/planning/transition-assessment-flow.tsx
    - Multi-step flow with 6 steps: CurrentRole, TargetRole, IndustryChanges, AIAnalysis, Results, PlanCustomization
    - Step state management (currentStepIndex, onboardingData pattern from onboarding-flow.tsx)
    - Progress bar showing step X of 6
    - Navigation: Back/Next buttons, step indicators (dots)
    - Loading states during AI analysis
    - Error handling for API failures
    - Data persistence between steps (local state)
    - Reuse patterns from src/components/onboarding/onboarding-flow.tsx
  - [ ] 3.3 Create individual step components for TransitionAssessmentFlow
    - CurrentRoleStep: Input current role title, industry, years of experience
    - TargetRoleStep: Input target role title, industry
    - IndustryChangesStep: Select if changing industry/function (checkboxes)
    - AIAnalysisStep: Loading state while AI analyzes (streaming response if possible)
    - ResultsStep: Display detected transition types, primary challenge, benchmarking data
    - PlanCustomizationStep: Adjust timeline, select skills to prioritize, name plan
    - All steps use existing UI components (Input, Label, Textarea, Card, Badge)
    - Follow accessibility patterns (Radix UI primitives, keyboard navigation)
  - [ ] 3.4 Create TransitionPlanCard component
    - Location: src/components/planning/transition-plan-card.tsx
    - Display plan title and description
    - Show transition type badges (cross-role, cross-industry, cross-function)
    - Display progress percentage with Progress bar
    - Show estimated timeline (e.g., "8-12 months")
    - Show bridge roles if applicable
    - Display benchmarking data ("Similar transitions take X months")
    - Quick stats cards: milestones count, skills count, progress percentage
    - Actions: View details, Edit, Delete
    - Follow card pattern from development-roadmap.tsx
    - Use existing Badge, Progress, Card components
  - [ ] 3.5 Create SkillGapAnalysis component
    - Location: src/components/planning/skill-gap-analysis.tsx
    - Group skills by criticality (critical, important, nice-to-have)
    - Display skill name, current level, target level
    - Show transferable skills with badge (e.g., "Transfers from Project Management")
    - Display estimated learning time per skill
    - Include CourseRecommendations sub-component for each skill
    - Progress tracking per skill (integrate with existing skills tracking)
    - O*NET validation indicator (checkmark if validated)
    - Reuse patterns from src/components/planning/skills-tracking.tsx
  - [ ] 3.6 Create CourseRecommendations sub-component
    - Location: src/components/planning/course-recommendations.tsx
    - Display 2-4 recommended courses per skill
    - Show course provider logo (Coursera, Udemy, LinkedIn Learning)
    - Display course title, price, affiliate link
    - Prominent affiliate disclosure (e.g., "Affiliate links - we may earn a commission")
    - Track clicks on affiliate links (analytics event)
    - Fallback UI if no courses found
    - Use existing Card, Badge components for layout
  - [ ] 3.7 Create BenchmarkingDisplay component
    - Location: src/components/planning/benchmarking-display.tsx
    - Display similar transition statistics
    - Show average timeline range with visual indicator (e.g., progress bar)
    - Display success rate if available (percentage badge)
    - Show confidence level for estimates
    - Visual comparison: user's timeline vs. average
    - Use existing BarChart or custom visualization
    - Follow existing UI patterns from dashboard components
  - [ ] 3.8 Create TransitionPlanningTab component (parent)
    - Location: src/components/planning/transition-planning-tab.tsx
    - Entry point for transition planning feature
    - Display grid of existing transition plans (TransitionPlanCard)
    - Button to start new transition assessment
    - Detailed plan view (selected plan)
    - Plan comparison view (side-by-side for Plan A vs Plan B)
    - Empty state if no plans yet (call-to-action to start assessment)
    - Use existing grid layout patterns from development-roadmap.tsx
  - [ ] 3.9 Integrate TransitionPlanningTab into Career Planning page
    - Location: src/app/dashboard/plan/page.tsx
    - Add new tab: "Transition Planning" alongside "Development Roadmap" and "Skills Tracking"
    - Tab navigation with active state
    - Lazy load TransitionPlanningTab component when tab selected
    - Maintain existing tabs functionality
    - Follow existing tab pattern from plan/page.tsx
  - [ ] 3.10 Add styling and responsive design
    - Mobile-first approach
    - Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
    - Collapsible sidebar on mobile for plan comparison
    - Touch-friendly buttons and interactions
    - Loading skeletons for async content
    - Error states with retry actions
    - Follow existing Tailwind CSS 4 patterns
  - [ ] 3.11 Implement streaming AI responses for roadmap generation
    - Use streaming response pattern from agent-os/standards/ai-integration/streaming-responses.md
    - Display progressive roadmap generation (milestones appear as generated)
    - Improve UX during 30-second roadmap generation
    - Loading indicators with progress updates
    - Handle stream errors gracefully
  - [ ] 3.12 Ensure UI component tests pass
    - Run ONLY the 6-8 tests written in 3.1
    - Verify critical component behaviors work
    - Verify navigation flows correctly
    - Verify affiliate links render with disclosure
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 6-8 tests written in 3.1 pass
- TransitionAssessmentFlow component works with 6 steps and navigation
- All step components functional with form validation
- TransitionPlanCard displays all transition metadata correctly
- SkillGapAnalysis shows skills grouped by criticality with course recommendations
- CourseRecommendations displays affiliate links with proper disclosure
- BenchmarkingDisplay visualizes timeline comparisons
- TransitionPlanningTab integrated into /dashboard/plan page as new tab
- Responsive design works on mobile, tablet, desktop
- Streaming AI responses implemented for better UX
- Accessibility: keyboard navigation, screen reader support, WCAG 2.1 AA compliance

---

### AI Analysis & Provider Integration

#### Task Group 4: Transition Analysis Provider & AI Prompts
**Assigned implementer:** api-engineer
**Dependencies:** Task Groups 1, 2
**Estimated Effort:** 1 day

- [ ] 4.0 Complete AI analysis provider and prompt management
  - [ ] 4.1 Write 2-8 focused tests for TransitionAnalysisProvider
    - Test transition type detection logic (cross-role, cross-industry, cross-function)
    - Test hybrid transition detection (multiple types simultaneously)
    - Test primary challenge prioritization
    - Test roadmap generation with timeline estimation
    - Test skill gap analysis with criticality assignment
    - Test career capital assessment
    - Test caching behavior (cache hit/miss scenarios)
    - Limit to 6-8 highly focused tests maximum
  - [ ] 4.2 Create TransitionAnalysisProvider
    - Location: src/lib/abstractions/providers/transition-analysis.ts
    - Extend AnalysisProvider interface with transition methods
    - Implement identifyTransitionType(resumeContent, currentRole, targetRole, targetIndustry)
    - Implement generateRoadmap(transitionData, resumeContent)
    - Implement analyzeSkillGaps(currentRole, targetRole, resumeContent)
    - Implement assessCareerCapital(resumeContent, currentRole)
    - Use multi-model approach: GPT-4 for structured analysis, Claude for narrative coaching
    - Implement caching using SHA-256 content hashing (target 60%+ cache hit rate)
    - Follow existing provider pattern from src/lib/abstractions/providers/anthropic-analysis.ts
  - [ ] 4.3 Create AI prompt templates for transition analysis
    - Location: src/lib/prompts/transition-prompts.ts
    - Prompt: detectTransitionTypePrompt (analyze resume and roles to identify transition types)
    - Prompt: generateRoadmapPrompt (create personalized roadmap with timeline and milestones)
    - Prompt: analyzeSkillGapsPrompt (identify required skills, transferable skills, learning time)
    - Prompt: identifyBridgeRolesPrompt (suggest intermediate roles for difficult transitions)
    - Prompt: assessCareerCapitalPrompt (identify unique skill combinations and competitive advantages)
    - Prompt: estimateTimelinePrompt (calculate realistic timeline based on factors)
    - Follow prompt management best practices from agent-os/standards/ai-integration/prompt-management.md
    - Use structured output (JSON mode) for consistent parsing
    - Version prompts for A/B testing and iteration
  - [ ] 4.4 Implement caching for transition analysis results
    - Extend analysisResults table pattern or create new transitionAnalysisCache table
    - Cache key: SHA-256 hash of (resumeContent + transitionData)
    - Cache transition type detection results
    - Cache roadmap generation results
    - Cache skill gap analysis results
    - Implement cache invalidation when resume or goals change
    - Target: 60%+ cache hit rate to reduce AI costs
    - Average AI cost per plan: <$2
  - [ ] 4.5 Update ServiceFactory to include TransitionAnalysisProvider
    - Location: src/lib/abstractions/service-factory.ts
    - Add transition analysis provider to factory
    - Configure with environment variables (OPENAI_API_KEY, ANTHROPIC_API_KEY)
    - Export configured instance
    - Update src/lib/abstractions/index.ts to export transition analysis
  - [ ] 4.6 Ensure AI analysis tests pass
    - Run ONLY the 6-8 tests written in 4.1
    - Verify transition type detection works correctly
    - Verify roadmap generation produces valid output
    - Verify caching reduces API calls
    - Mock AI provider responses in tests
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 6-8 tests written in 4.1 pass
- TransitionAnalysisProvider implements all required methods
- AI prompts follow structured output format (JSON mode)
- Caching implemented with 60%+ target cache hit rate
- Multi-model approach: GPT-4 + Claude
- Prompt versioning for iteration
- ServiceFactory exports transition analysis provider
- Average AI cost per plan: <$2

---

### Testing & Quality Assurance

#### Task Group 5: Test Review, Gap Analysis & Documentation
**Assigned implementer:** testing-engineer
**Dependencies:** Task Groups 1-4
**Estimated Effort:** 1 day

- [ ] 5.0 Review existing tests and fill critical gaps only
  - [ ] 5.1 Review tests from Task Groups 1-4
    - Review 6-8 tests written by database-engineer (Task 1.1)
    - Review 6-8 tests written by api-engineer (Task 2.1)
    - Review 6-8 tests written by ui-designer (Task 3.1)
    - Review 6-8 tests written by api-engineer (Task 4.1)
    - Total existing tests: approximately 24-32 tests
    - Verify test quality, coverage of critical paths, edge cases
  - [ ] 5.2 Analyze test coverage gaps for THIS feature only
    - Identify critical user workflows that lack test coverage
    - End-to-end transition assessment flow (create plan from start to finish)
    - Plan revision and regeneration workflow
    - Multiple plan creation and comparison workflow
    - Progress tracking updates and milestone completion
    - Affiliate link click tracking and course completion integration
    - Error handling: API failures, invalid data, missing resume
    - Focus ONLY on gaps related to this spec's feature requirements
    - Do NOT assess entire application test coverage
    - Prioritize end-to-end workflows over unit test gaps
  - [ ] 5.3 Write up to 10 additional strategic tests maximum
    - Integration test: Complete transition assessment flow (all 6 steps)
    - Integration test: Create transition plan and link skills to plan
    - Integration test: Update transition progress and verify milestone tracking
    - Integration test: Generate multiple plans and compare side-by-side
    - Integration test: Skill gap analysis with O*NET validation (mocked)
    - Integration test: Course recommendations with affiliate links
    - End-to-end test: User creates Plan A and Plan B, selects Plan A, tracks progress
    - Error handling test: Resume analysis fails, graceful degradation
    - Error handling test: O*NET API unavailable, fallback to AI-only
    - Performance test: Roadmap generation completes in <30 seconds
    - Add maximum of 10 new tests to fill identified critical gaps
    - Focus on integration points and end-to-end workflows
    - Do NOT write comprehensive coverage for all scenarios
    - Skip edge cases, performance tests, and accessibility tests unless business-critical
  - [ ] 5.4 Create test fixtures and mock data
    - Sample resume content for transition analysis
    - Sample transition plans (cross-role, cross-industry, hybrid)
    - Sample skill gaps with O*NET codes
    - Sample course recommendations with affiliate links
    - Sample benchmarking data
    - Mock O*NET API responses
    - Mock course provider API responses
    - Location: src/__tests__/fixtures/transition-data.ts
  - [ ] 5.5 Run feature-specific tests only
    - Run ONLY tests related to this spec's feature (tests from 1.1, 2.1, 3.1, 4.1, and 5.3)
    - Expected total: approximately 34-42 tests maximum
    - Do NOT run the entire application test suite
    - Verify critical workflows pass
    - Verify integration points work correctly
    - Generate coverage report for transition feature files only
  - [ ] 5.6 Update documentation for this feature
    - Update CLAUDE.md with new feature overview
    - Document new API routes (POST /api/transitions/identify, roadmap, skills-gap, benchmarks, courses)
    - Document new Convex operations (convex/transitions.ts)
    - Document new database fields (plans and skills table extensions)
    - Document new UI components and their locations
    - Document O*NET API integration and usage limits
    - Document course provider integrations and affiliate tracking
    - Document caching strategy for transition analysis
    - Add environment variables section (ONET_API_KEY, COURSERA_AFFILIATE_ID, etc.)
    - Add user flow documentation (transition assessment workflow)
    - Add troubleshooting section (common errors, API failures)
  - [ ] 5.7 Verify backward compatibility
    - Test that existing plans without transition fields still load and display
    - Test that existing skills without transition fields still work
    - Test that existing Career Planning page tabs (Development Roadmap, Skills Tracking) still function
    - Verify no breaking changes to Plans and Skills APIs
    - Run existing plan and skill tests to ensure no regressions

**Acceptance Criteria:**
- All feature-specific tests pass (approximately 34-42 tests total)
- Critical user workflows for this feature are covered
- No more than 10 additional tests added by testing-engineer
- Test fixtures created for transition data, API responses
- Testing focused exclusively on this spec's feature requirements
- CLAUDE.md updated with complete feature documentation
- API routes documented with request/response examples
- Backward compatibility verified (no breaking changes)
- Coverage report shows 80%+ for transition feature files

---

## Execution Order

Recommended implementation sequence:

**Phase 1 - Foundation (Days 1-2)**
1. Task Group 1: Database schema extensions and Convex operations
   - Extend plans and skills tables
   - Create new indexes
   - Create convex/transitions.ts operations
   - Ensure backward compatibility

**Phase 2 - Backend Integration (Days 2-4)**
2. Task Group 2: API routes and external integrations
   - Create 5 API routes (identify, roadmap, skills-gap, benchmarks, courses)
   - Integrate O*NET API
   - Integrate course provider APIs
   - Implement caching strategy
3. Task Group 4: AI analysis provider and prompts
   - Create TransitionAnalysisProvider
   - Write AI prompt templates
   - Implement caching for analysis results
   - Configure multi-model approach

**Phase 3 - Frontend Development (Days 4-6)**
4. Task Group 3: UI components and assessment flow
   - Create TransitionAssessmentFlow with 6 steps
   - Create TransitionPlanCard, SkillGapAnalysis, BenchmarkingDisplay
   - Create CourseRecommendations with affiliate links
   - Integrate into Career Planning page
   - Implement streaming AI responses
   - Apply responsive design and accessibility

**Phase 4 - Testing & Documentation (Day 7)**
5. Task Group 5: Test review, gap analysis, and documentation
   - Review all tests from previous task groups
   - Write up to 10 additional strategic tests
   - Create test fixtures
   - Update CLAUDE.md documentation
   - Verify backward compatibility

---

## Critical Success Factors

**Revenue Impact (60-70% of business model):**
- Affiliate course recommendations MUST be prominently displayed
- Affiliate links MUST be tracked for revenue attribution
- Conversion optimization: course placement, messaging, curation quality

**Performance Requirements:**
- Transition assessment: <5 seconds
- Roadmap generation: <30 seconds (with streaming for UX)
- Cache hit rate: 60%+ to control AI costs
- Average AI cost per plan: <$2

**User Experience:**
- Realistic timelines (not overpromising)
- Personalized to user's unique background
- Benchmarking data for context
- Support for multiple plans (Plan A, Plan B)
- Progress tracking and motivation

**Technical Integrity:**
- Backward compatibility (existing plans/skills continue to work)
- No breaking changes to existing features
- Graceful degradation (O*NET API, course APIs)
- Accessibility compliance (WCAG 2.1 AA)

**Anti-patterns to Avoid:**
- Transactional messaging ("Get hired in 30 days")
- One-size-fits-all roadmaps
- Unrealistic promises or timelines
- Ignoring the "why" of transitions
- Competitive scarcity mindset

---

## Environment Variables Required

Add to `.env.local`:

```bash
# O*NET API (free tier: 1000 calls/day)
ONET_API_KEY=your_onet_api_key

# Course Provider Affiliate IDs
COURSERA_AFFILIATE_ID=your_coursera_affiliate_id
UDEMY_AFFILIATE_ID=your_udemy_affiliate_id
LINKEDIN_AFFILIATE_ID=your_linkedin_affiliate_id

# Existing (already configured)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
CLERK_SECRET_KEY=...
NEXT_PUBLIC_CONVEX_URL=...
OPENAI_API_KEY=...
ANTHROPIC_API_KEY=...
```

---

## Risk Mitigation

**AI Cost Overruns:**
- Aggressive caching (60%+ target cache hit rate)
- Prompt optimization to reduce token usage
- Fallback to simpler analysis if budget exceeded
- Monitor costs per plan (<$2 target)

**O*NET API Limits:**
- Cache results aggressively
- Graceful degradation to AI-only skill identification
- Stay within free tier (1000 calls/day)

**Course API Changes:**
- Abstract course providers behind interface
- Easy to swap implementations
- Fallback to alternative providers

**Low Affiliate Conversion:**
- A/B test course placement and messaging
- Curate high-quality, relevant courses
- Optimize call-to-action language
- Track conversion funnel metrics

**Timeline Inaccuracy:**
- Collect user feedback on timeline realism
- Iterate based on actual completion data
- Display benchmarking with confidence levels
- Allow users to adjust timelines

---

## Standards Alignment

This feature aligns with CareerOS standards documented in `agent-os/standards/`:

**AI Integration:** Prompt management, cost optimization, streaming responses, multi-model approach
**Backend:** API routes, authentication, Convex patterns, error handling
**Frontend:** Component structure, state management, accessibility (Radix UI), forms
**Database:** Schema design, indexing, backward compatibility, performance
**Testing:** Unit tests, integration tests, 80%+ coverage, mocking strategy
**Global:** TypeScript strict mode, error handling, logging, feature flags

Refer to specific standard files for detailed guidance during implementation.
