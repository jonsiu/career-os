# Task 5: Test Review, Gap Analysis & Documentation

## Overview
**Task Reference:** Task #5 from `agent-os/specs/2025-10-17-transition-type-identification-planning/tasks.md`
**Implemented By:** testing-engineer
**Date:** 2025-10-18
**Status:** ⚠️ Partial - Implementation dependencies not yet complete

### Task Description
Review existing tests from Task Groups 1-4, analyze coverage gaps specific to the Transition Type Identification & Planning feature, write up to 10 additional strategic tests, create test fixtures, and update comprehensive documentation in CLAUDE.md.

## Implementation Summary

### Current State Assessment

Upon beginning this task, I discovered that **Task Groups 1-4 have not been completed yet**. The following implementation components are missing:

- **Database Layer** (Task Group 1): `convex/transitions.ts` does not exist, schema extensions not yet applied
- **API Layer** (Task Group 2): `/api/transitions/*` routes do not exist
- **Frontend Components** (Task Group 3): Transition planning components not yet created
- **AI Provider** (Task Group 4): TransitionAnalysisProvider not yet implemented

As a result, I cannot execute the full test review and gap analysis workflow as specified in tasks 5.1-5.3, since there are no tests from previous task groups to review, and no implementation code to test against.

### Work Completed

Given this situation, I have **prepared the foundation** for testing and documentation work to be completed when the implementation is ready:

1. **Created comprehensive test fixtures** (Task 5.4) - Ready for use
2. **Documented test strategy** - Framework for gap analysis and test writing
3. **Prepared CLAUDE.md documentation updates** - Comprehensive feature documentation ready to merge
4. **Defined backward compatibility verification approach** (Task 5.7) - Test plan ready

This preparation work ensures that when Task Groups 1-4 are completed, I can immediately:
- Execute test review and gap analysis (5.1-5.2)
- Write strategic integration tests (5.3)
- Run feature-specific tests (5.5)
- Update documentation (5.6)
- Verify backward compatibility (5.7)

## Files Changed/Created

### New Files
- `src/__tests__/fixtures/transition-data.ts` - Comprehensive test fixtures for transition feature testing including sample resumes, transition plans, skill gaps, mock API responses, and benchmarking data

### Modified Files
(None yet - awaiting implementation completion)

### Planned Modifications
- `CLAUDE.md` - Will add comprehensive Transition Planning feature documentation (see section below)
- `agent-os/specs/2025-10-17-transition-type-identification-planning/tasks.md` - Will update task 5.0 and sub-tasks when implementation testing is complete

## Key Implementation Details

### Test Fixtures Created
**Location:** `src/__tests__/fixtures/transition-data.ts`

I've created a comprehensive set of test fixtures that cover all transition scenarios:

**1. Sample Resume Content:**
- `softwareEngineer` - For cross-role transitions (Engineer → Manager)
- `marketingManager` - For cross-function transitions (Marketing → PM)
- `teacher` - For cross-industry transitions (Education → Corporate)

Each resume includes realistic professional experience, skills, and career context.

**2. Sample Transition Plans:**
- `crossRole` - Senior Engineer → Engineering Manager
- `crossFunction` - Marketing Manager → Product Manager
- `crossIndustry` - Teacher → Corporate Trainer
- `hybrid` - Software Engineer (Tech) → Product Manager (Healthcare)

Each plan includes complete transition metadata:
- Transition types and primary challenge
- Current/target roles and industries
- Bridge roles
- Estimated timelines with factors
- Benchmarking data
- Progress tracking
- Career capital assessment

**3. Sample Skill Gaps:**
- `engineerToManager` - 5 skills covering critical, important, and nice-to-have
- Each skill includes:
  - Criticality level
  - Transferable from current skills
  - O*NET codes for validation
  - Complexity level
  - Learning time estimates
  - Affiliate course recommendations

**4. Mock API Responses:**
- `mockOnetApiResponses` - Skill validation and job-to-skills mapping
- `mockCourseApiResponses` - Coursera, Udemy, LinkedIn Learning responses
- `mockBenchmarkData` - Statistical data for common transition types
- `mockAiResponses` - AI provider responses for transition analysis, roadmap generation, career capital assessment

**Rationale:** These fixtures provide realistic, comprehensive test data that covers all transition scenarios defined in the spec. They enable thorough testing of transition type detection, roadmap generation, skill gap analysis, and course recommendations without requiring actual AI API calls or external service integrations.

### Test Strategy Framework

**Test Review Process (Tasks 5.1-5.2):**

When implementation is complete, I will:

1. **Review tests from Task Group 1** (Database Layer):
   - Verify schema extension tests (plans and skills tables)
   - Verify index creation tests
   - Verify backward compatibility tests
   - Verify Convex operations tests (queries and mutations)
   - Expected: 6-8 tests

2. **Review tests from Task Group 2** (API Layer):
   - Verify API endpoint tests (5 routes: identify, roadmap, skills-gap, benchmarks, courses)
   - Verify authentication/authorization tests
   - Verify error handling tests
   - Verify O*NET and course provider integration tests (mocked)
   - Expected: 6-8 tests

3. **Review tests from Task Group 3** (UI Components):
   - Verify component rendering tests
   - Verify navigation flow tests (6-step assessment)
   - Verify form validation tests
   - Verify affiliate link rendering and disclosure tests
   - Expected: 6-8 tests

4. **Review tests from Task Group 4** (AI Provider):
   - Verify transition type detection tests
   - Verify roadmap generation tests
   - Verify caching tests
   - Verify multi-model approach tests
   - Expected: 6-8 tests

**Gap Analysis Criteria:**

I will identify gaps by assessing coverage of these critical user workflows:
1. **End-to-end transition assessment** - User completes all 6 steps and creates plan
2. **Multiple plan creation** - User creates Plan A and Plan B for comparison
3. **Plan revision** - User updates existing plan based on progress
4. **Progress tracking** - User updates milestones and skill completion
5. **Skill-course integration** - User views courses, clicks affiliate links, tracks completion
6. **Error scenarios** - API failures, invalid data, graceful degradation
7. **O*NET fallback** - O*NET API unavailable, AI-only skill identification
8. **Cache effectiveness** - Verify 60%+ cache hit rate

### Strategic Tests to Write (Task 5.3)

When gaps are identified, I will write **up to 10 additional strategic tests** focused on:

**Integration Tests** (6-8 tests):
1. **Complete transition assessment flow** - All 6 steps from start to plan creation
2. **Create plan and link skills** - Transition plan creation with skill gap analysis
3. **Update progress and milestones** - Progress tracking workflow
4. **Multiple plan comparison** - Create Plan A and Plan B, compare side-by-side
5. **Skill gap analysis with O*NET** - Validate skills against O*NET API (mocked)
6. **Course recommendations** - Generate affiliate links, verify tracking
7. **Plan revision workflow** - Update existing plan based on new goals
8. **Cache hit/miss scenarios** - Verify caching reduces AI costs

**End-to-End Tests** (1-2 tests):
9. **Full user journey** - User creates Plan A and Plan B, selects Plan A, tracks progress to 50% completion

**Error Handling Tests** (1 test):
10. **Graceful degradation** - Resume analysis fails, O*NET unavailable, course API errors

**Rationale:** These tests focus on integration points and end-to-end workflows rather than exhaustive unit testing. They ensure critical business workflows function correctly and the feature delivers value to users.

### Backward Compatibility Verification (Task 5.7)

**Test Plan:**

I will verify backward compatibility by:

1. **Existing Plans Schema:**
   - Create plan without transition fields
   - Verify plan loads and displays correctly
   - Verify plan can be updated without transition data
   - Verify existing plan queries continue to work

2. **Existing Skills Schema:**
   - Create skill without transition fields
   - Verify skill loads and displays correctly
   - Verify skill progress tracking works
   - Verify existing skill queries continue to work

3. **Existing Career Planning Page:**
   - Verify "Development Roadmap" tab still functions
   - Verify "Skills Tracking" tab still functions
   - Verify existing plan creation and editing works
   - Verify existing milestone management works

4. **No Breaking Changes:**
   - Run existing plan-related tests
   - Run existing skill-related tests
   - Verify no API contract changes for existing endpoints
   - Verify all optional fields default gracefully

**Test Approach:**
- Use existing test suite for plans and skills
- Create new tests that explicitly test backward compatibility scenarios
- Verify migration path from existing plans to transition plans (optional conversion)

## Database Changes

(None yet - awaiting Task Group 1 implementation)

**Planned Changes:**
- Extension of `plans` table with optional transition fields
- Extension of `skills` table with optional transition fields
- New indexes: `by_transition_type`, `by_transition_plan`, `by_criticality`
- New Convex operations file: `convex/transitions.ts`

## Dependencies

(None yet - awaiting implementation)

**Planned Dependencies:**
- O*NET API integration
- Course provider APIs (Coursera, Udemy, LinkedIn Learning)
- AI providers (OpenAI, Anthropic) for transition analysis

## Testing

### Test Files Created/Updated

**Created:**
- `src/__tests__/fixtures/transition-data.ts` - Comprehensive test fixtures (685 lines)

**Planned (to be created in Task 5.3):**
- `src/app/api/transitions/__tests__/integration.test.ts` - Integration tests for API endpoints
- `src/components/planning/__tests__/transition-flow-integration.test.tsx` - UI flow integration tests
- `src/lib/abstractions/providers/__tests__/transition-e2e.test.ts` - End-to-end workflow tests

### Test Coverage

**Current Coverage:** N/A (implementation not complete)

**Target Coverage:** 80%+ for all transition feature files including:
- `convex/transitions.ts`
- `src/app/api/transitions/*`
- `src/components/planning/transition-*`
- `src/lib/abstractions/providers/transition-analysis.ts`

### Manual Testing Plan

When implementation is complete, I will perform manual testing:

1. **Transition Assessment Flow:**
   - Complete all 6 steps with different transition scenarios
   - Verify progress indicator updates correctly
   - Verify back/next navigation works
   - Verify AI analysis completes in <30 seconds
   - Verify results display correctly

2. **Plan Management:**
   - Create multiple plans (Plan A, Plan B)
   - Compare plans side-by-side
   - Edit existing plan
   - Delete plan
   - Verify progress updates

3. **Skill Gap Analysis:**
   - View skills grouped by criticality
   - Verify transferable skills highlighted
   - View course recommendations
   - Click affiliate links (verify tracking)
   - Update skill progress

4. **Responsive Design:**
   - Test on mobile (375px, 414px)
   - Test on tablet (768px, 1024px)
   - Test on desktop (1280px, 1920px)
   - Verify collapsible sidebar on mobile

5. **Accessibility:**
   - Keyboard navigation through assessment flow
   - Screen reader compatibility
   - Focus management
   - Color contrast (WCAG 2.1 AA)

## User Standards & Preferences Compliance

### Integration Testing Standards
**File Reference:** `agent-os/standards/testing/integration-testing.md`

**How Implementation Complies:**
- Test fixtures support testing real integrations (O*NET API, course APIs) with mock data
- API testing will verify status codes, response shape, and data correctness
- Authentication testing will cover protected transition endpoints
- External services (O*NET, course providers) will be mocked while testing integration points
- Error scenarios explicitly covered in test strategy
- Mock data factories created for consistent test data generation

**Deviations:** None - full compliance when tests are written

### Test Writing Standards
**File Reference:** `agent-os/standards/testing/test-writing.md`

**Compliance Notes:**
- Following existing test patterns from `src/app/api/health/__tests__/route.test.ts`
- Using React Testing Library patterns from `src/components/onboarding/__tests__/job-interests-step.test.tsx`
- Jest configuration already requires 80% coverage threshold
- Test fixtures are comprehensive and realistic
- Mocking strategy follows existing patterns (Clerk auth, external APIs)

**Deviations:** None

### Architecture Principles
**File Reference:** `agent-os/standards/global/architecture-principles.md`

**Test Strategy Alignment:**
- Testing focuses on integration points and critical workflows (not exhaustive unit testing)
- Strategic test limit (10 tests max) ensures focus on business-critical scenarios
- Test fixtures support modular, reusable test data
- Backward compatibility testing ensures system stability

### Error Handling
**File Reference:** `agent-os/standards/global/error-handling.md`

**Test Coverage:**
- Error handling tests planned for API failures
- Graceful degradation scenarios (O*NET unavailable, AI errors)
- Validation error testing for user inputs
- Appropriate status codes verified (400, 401, 404, 500)

### Accessibility
**File Reference:** `agent-os/standards/global/accessibility.md`

**Testing Plan:**
- Manual testing includes keyboard navigation verification
- Screen reader compatibility testing planned
- Focus management in multi-step flow
- WCAG 2.1 AA compliance verification

### Performance Basics
**File Reference:** `agent-os/standards/global/performance-basics.md`

**Performance Testing:**
- Roadmap generation performance test (<30 seconds requirement)
- Cache hit rate verification (60%+ target)
- AI cost monitoring (<$2 per plan target)
- Page load time verification (<2 seconds)

## Integration Points

### Planned API Endpoints

(Not yet implemented - documentation prepared)

**Transition Identification:**
- `POST /api/transitions/identify`
  - Request: `{ userId, resumeId, targetRole, targetIndustry }`
  - Response: `{ transitionTypes, primaryTransitionType, currentRole, targetRole, rationale }`
  - Auth: Required (Clerk)
  - Caching: Yes (by resume + target combination)

**Roadmap Generation:**
- `POST /api/transitions/roadmap`
  - Request: `{ userId, transitionData, resumeId }`
  - Response: `{ timeline, milestones, bridgeRoles, benchmarkData }`
  - Auth: Required (Clerk)
  - Caching: Yes (60%+ hit rate target)
  - Streaming: Yes (for better UX during 30s generation)

**Skill Gap Analysis:**
- `POST /api/transitions/skills-gap`
  - Request: `{ userId, currentRole, targetRole, resumeId }`
  - Response: `{ skillGaps[] with criticality, transferability, learning time, onetValidation }`
  - Auth: Required (Clerk)
  - Integration: O*NET API (with fallback to AI-only)

**Benchmarking Data:**
- `GET /api/transitions/benchmarks`
  - Query: `?transitionType=cross-role&currentRole=Engineer&targetRole=Manager`
  - Response: `{ similarTransitions, averageTimeline, successRate }`
  - Auth: Required (Clerk)
  - Caching: Aggressive (common transitions)

**Course Recommendations:**
- `POST /api/transitions/courses`
  - Request: `{ skillName, criticalityLevel, targetRole }`
  - Response: `{ courses[] with provider, title, url, affiliateLink, price, disclosure }`
  - Auth: Required (Clerk)
  - Integration: Coursera, Udemy, LinkedIn Learning APIs
  - Tracking: UTM parameters for revenue attribution

### External Services

**O*NET API** (`https://services.onetcenter.org/ws/`):
- Purpose: Skill validation and importance ratings
- Free tier: 1000 calls/day
- Fallback: AI-only skill identification if unavailable
- Test fixtures: `mockOnetApiResponses` ready for testing

**Course Provider APIs:**
- **Coursera API**: Course search and affiliate links
- **Udemy API**: Course search and affiliate links
- **LinkedIn Learning API**: Course search and affiliate links
- Fallback: Alternative providers if one fails
- Test fixtures: `mockCourseApiResponses` ready for testing

### Internal Dependencies

**Convex Operations:**
- `convex/transitions.ts` - Transition plan queries and mutations
- `convex/plans.ts` - Extended for transition metadata
- `convex/skills.ts` - Extended for transition plan linking

**Provider Abstractions:**
- `TransitionAnalysisProvider` - New provider for transition-specific AI analysis
- Extends existing `AnalysisProvider` interface
- Implements caching pattern from `analysisResults.ts`

**UI Components:**
- Reuses `onboarding-flow.tsx` patterns for multi-step assessment
- Reuses `development-roadmap.tsx` patterns for plan display
- Reuses `skills-tracking.tsx` patterns for skill management
- New components: `transition-assessment-flow.tsx`, `transition-plan-card.tsx`, `skill-gap-analysis.tsx`

## Known Issues & Limitations

### Issues

1. **Implementation Not Complete**
   - Description: Task Groups 1-4 have not been implemented yet
   - Impact: Cannot execute full test review and gap analysis (tasks 5.1-5.3)
   - Workaround: Created test fixtures and documentation framework; ready to proceed when implementation is complete
   - Tracking: Dependent on other engineers completing Task Groups 1-4

### Limitations

1. **Test Fixtures Only**
   - Description: Only test fixtures have been created; actual tests require implementation code
   - Reason: Dependencies not met (Task Groups 1-4 incomplete)
   - Future Consideration: Write 10 strategic tests immediately when implementation is ready

2. **Manual Testing Not Performed**
   - Description: Cannot perform manual testing without implemented features
   - Reason: No UI components or API routes exist yet
   - Future Consideration: Execute manual testing plan once features are deployed

3. **Coverage Metrics Unavailable**
   - Description: Cannot generate coverage report without implementation
   - Reason: No source code to measure coverage against
   - Future Consideration: Run coverage analysis after test writing is complete

## Performance Considerations

**Planned Performance Tests:**

1. **Transition Assessment Speed:**
   - Target: <5 seconds for type detection
   - Test: Measure API response time for `POST /api/transitions/identify`

2. **Roadmap Generation Speed:**
   - Target: <30 seconds for complete roadmap
   - Test: Measure API response time for `POST /api/transitions/roadmap`
   - Note: Streaming responses improve perceived performance

3. **Cache Hit Rate:**
   - Target: 60%+ cache hit rate
   - Test: Simulate 100 transition analyses with 60% repeat resume+target combinations
   - Verify cache reduces AI API calls and costs

4. **AI Cost per Plan:**
   - Target: <$2 per transition plan
   - Test: Track OpenAI/Anthropic API costs during test runs
   - Verify prompt optimization and caching effectiveness

## Security Considerations

**Security Testing Plan:**

1. **Authentication Enforcement:**
   - Verify all `/api/transitions/*` routes require Clerk authentication
   - Test unauthorized access returns 401
   - Test with invalid/expired tokens

2. **Authorization:**
   - Verify users can only access their own transition plans
   - Test cross-user access attempts return 403
   - Verify userId validation in all endpoints

3. **Affiliate Link Safety:**
   - Verify affiliate links include proper disclosure
   - Verify no PII in tracking parameters
   - Verify affiliate IDs stored securely in environment variables

4. **Input Validation:**
   - Test SQL/NoSQL injection attempts
   - Test XSS in user-provided text (role names, descriptions)
   - Verify input sanitization for AI prompts

5. **API Key Protection:**
   - Verify O*NET API key not exposed in client code
   - Verify course provider affiliate IDs not exposed
   - Verify AI provider keys server-side only

## Dependencies for Other Tasks

This task (Task Group 5) **depends on completion** of:
- Task Group 1: Database Schema Extensions & Convex Operations
- Task Group 2: API Routes & External Integrations
- Task Group 3: UI Components & Transition Assessment Flow
- Task Group 4: Transition Analysis Provider & AI Prompts

**No other tasks depend on Task Group 5** - this is the final task in the implementation sequence.

## Notes

### Implementation Status

As of 2025-10-18, the Transition Type Identification & Planning feature has **not yet been implemented**. This documentation represents preparatory work to enable rapid test development and documentation updates once the implementation is complete.

### Preparatory Work Completed

1. **Comprehensive test fixtures created** - 685 lines covering all transition scenarios, mock API responses, and realistic test data
2. **Test strategy documented** - Framework for reviewing tests, identifying gaps, and writing strategic tests
3. **CLAUDE.md updates prepared** - Comprehensive documentation ready to merge (see section below)
4. **Backward compatibility plan created** - Clear verification approach

### Next Steps

When Task Groups 1-4 are complete:

1. **Execute Task 5.1** - Review 24-32 tests written by other engineers
2. **Execute Task 5.2** - Analyze coverage gaps for critical workflows
3. **Execute Task 5.3** - Write up to 10 strategic integration/e2e tests
4. **Execute Task 5.5** - Run feature-specific tests, verify 80%+ coverage
5. **Execute Task 5.6** - Merge CLAUDE.md documentation updates
6. **Execute Task 5.7** - Run backward compatibility verification tests
7. **Update tasks.md** - Check off task 5.0 and all sub-tasks (5.1-5.7)

### Estimated Time to Complete (When Dependencies Met)

- Test review: 1 hour
- Gap analysis: 1 hour
- Writing 10 strategic tests: 3-4 hours
- Running tests and fixing issues: 2 hours
- Documentation merge: 30 minutes
- Backward compatibility verification: 1 hour

**Total:** ~8-9 hours (1 day)

---

## CLAUDE.md Documentation Updates (Prepared)

The following documentation is prepared and ready to merge into `CLAUDE.md` when the implementation is complete.

### Section to Add After "3. Onboarding Flow"

```markdown
### 5. Transition Type Identification & Planning

**Overview:**
The Transition Planning feature helps users systematically identify their career transition type (cross-role, cross-industry, cross-function, or hybrid), receive AI-powered skill gap analysis, and generate personalized development roadmaps with realistic timelines and course recommendations.

**Transition Types:**
- **Cross-Role**: Same industry, different role (e.g., Senior Engineer → Engineering Manager)
- **Cross-Function**: Same industry, different function (e.g., Marketing → Product Management)
- **Cross-Industry**: Same role type, different industry (e.g., Teacher → Corporate Trainer)
- **Hybrid**: Multiple simultaneous transitions (e.g., Engineer (Tech) → PM (Healthcare))

**Location:** `/dashboard/plan` page, "Transition Planning" tab

#### Transition Assessment Flow

**6-Step Assessment:**
1. **Current Role** - Input current role title, industry, years of experience
2. **Target Role** - Input target role title, industry
3. **Industry Changes** - Select if changing industry/function
4. **AI Analysis** - AI analyzes resume and identifies transition types (streaming response)
5. **Results** - Display detected transition types, primary challenge, benchmarking data
6. **Plan Customization** - Adjust timeline, prioritize skills, name plan

**Components:**
- `TransitionAssessmentFlow` - Main multi-step flow component
- Individual step components (CurrentRoleStep, TargetRoleStep, etc.)
- Progress indicator and navigation (Back/Next buttons)
- Loading states during AI analysis
- Error handling for API failures

**Pattern:** Reuses onboarding flow pattern from `src/components/onboarding/onboarding-flow.tsx`

#### Transition Plans

**Plan Data Structure:**
- Transition types (array) and primary type
- Current/target roles and industries
- Bridge roles (intermediate roles for difficult transitions)
- Estimated timeline (min/max months, factors)
- Benchmarking data (similar transitions, average timeline, success rate)
- Progress percentage (0-100)
- Career capital assessment (unique skills, rare combinations, competitive advantages)

**Features:**
- Multiple simultaneous plans (Plan A, Plan B comparison)
- Side-by-side plan comparison view
- Progress tracking with milestones
- Plan revision and regeneration
- Historical plan versions

**Components:**
- `TransitionPlanCard` - Plan card with transition metadata
- `TransitionPlanningTab` - Parent component with plan grid
- Plan comparison view for evaluating multiple paths

**Convex Operations:**
- `convex/transitions.ts` - Transition-specific queries and mutations
- `getTransitionPlans(userId)` - Get all plans
- `getTransitionPlanById(planId)` - Get single plan
- `createTransitionPlan(userId, planData)` - Create new plan
- `updateTransitionProgress(planId, progressPercentage)` - Update progress

#### Skill Gap Analysis

**AI-Powered Skill Identification:**
- Uses LLMs (GPT-4, Claude) for dynamic skill detection
- O*NET API integration for skill validation and importance ratings
- Fallback to AI-only if O*NET unavailable

**Skill Categorization:**
- **Critical** - Must-have skills for target role
- **Important** - Valuable but not essential
- **Nice-to-have** - Beneficial but optional

**Skill Data:**
- Transferable skills from current role
- O*NET validation codes
- Skill complexity (basic, intermediate, advanced)
- Estimated learning time (min/max weeks)
- Affiliate course recommendations

**Components:**
- `SkillGapAnalysis` - Skills grouped by criticality
- `CourseRecommendations` - Course cards with affiliate links
- Transferable skills highlighted with badges
- O*NET validation indicators

**Convex Schema Extensions:**
```typescript
skills: {
  // Existing fields...
  transitionPlanId: v.optional(v.id("plans")),
  criticalityLevel: v.optional(v.union("critical", "important", "nice-to-have")),
  transferableFrom: v.optional(v.array(v.string())),
  onetCode: v.optional(v.string()),
  skillComplexity: v.optional(v.union("basic", "intermediate", "advanced")),
  estimatedLearningTime: v.optional(v.object({ minWeeks, maxWeeks })),
  affiliateCourses: v.optional(v.array(v.object({...}))),
}
```

#### Course Recommendations & Affiliate Revenue

**IMPORTANT - REVENUE DRIVER (60-70% of business model):**

Course recommendations are prominently displayed for each skill gap with affiliate links to:
- **Coursera** - Specializations and professional certificates
- **Udemy** - Skill-specific courses
- **LinkedIn Learning** - Professional development courses

**Affiliate Link Tracking:**
- UTM parameters for revenue attribution
- Provider tracking (which provider generated revenue)
- Click tracking (analytics events)
- Course completion integration with skill progress

**Compliance:**
- Affiliate disclosure prominently displayed
- No PII in tracking parameters
- Affiliate IDs stored securely in environment variables

**API Route:**
- `POST /api/transitions/courses` - Get course recommendations with affiliate links

#### Roadmap Generation & Timeline Estimation

**AI-Powered Roadmap:**
- Personalized to user's current skills and learning velocity
- Realistic timeline estimation (6-18 months typical)
- Factors: skill complexity, transition difficulty, user experience level
- Milestones with target dates and effort estimates
- Bridge roles for difficult transitions

**Benchmarking Data:**
- Statistics from similar transitions
- Average timeline ranges (p50, p75, p90)
- Success rates
- Common challenges
- Confidence levels for estimates

**Streaming Response:**
- Progressive roadmap generation for better UX during 30-second generation
- Milestones appear as they're generated
- Loading indicators with progress updates

**Components:**
- `BenchmarkingDisplay` - Timeline comparisons and statistics
- Timeline visualization with progress bars
- Milestone tracker with completion states

#### Career Capital Assessment

**AI Analysis:**
- Identifies unique skill combinations
- Highlights rare and valuable career capital
- Recommends skill combinations for competitive advantage
- Factors career capital into transition strategy

**Display:**
- Unique skills list
- Rare skill combinations
- Competitive advantages
- Recommendations for leveraging career capital

#### Progress Tracking

**Features:**
- Overall transition plan completion percentage
- Milestone tracking (pending, in-progress, completed)
- Skill development progress visualization
- Weekly check-in prompts
- Historical tracking of plan versions

**Integration Points:**
- Daily Career Journal integration (when available)
- Skill completion triggers milestone updates
- Progress updates recalculate timeline estimates

#### Caching Strategy

**SHA-256 Content Hashing:**
- Cache key: Hash of (resume content + transition data)
- Caches transition type detection results
- Caches roadmap generation results
- Caches skill gap analysis results
- Cache invalidation on resume or goal changes

**Performance Targets:**
- 60%+ cache hit rate
- <$2 average AI cost per transition plan
- <5 seconds for transition assessment
- <30 seconds for roadmap generation (with streaming)

**Implementation:**
- Extends `analysisResults` caching pattern
- Provider: `TransitionAnalysisProvider`

#### External Integrations

**O*NET API** (`https://services.onetcenter.org/ws/`):
- Free tier: 1000 calls/day
- Skill validation and importance ratings
- Job-to-skills mapping
- Graceful degradation if unavailable
- Environment variable: `ONET_API_KEY`

**Course Provider APIs:**
- **Coursera API**: Course search, affiliate links
- **Udemy API**: Course search, affiliate links
- **LinkedIn Learning API**: Course search, affiliate links
- Fallback to alternative providers if one fails
- Environment variables: `COURSERA_AFFILIATE_ID`, `UDEMY_AFFILIATE_ID`, `LINKEDIN_AFFILIATE_ID`

**API Integration Utilities:**
- `src/lib/integrations/onet-api.ts` - O*NET integration
- `src/lib/integrations/course-providers.ts` - Course provider integrations
```

### API Routes Section - Add to Existing API Routes List

```markdown
**Transition Planning**:
- `POST /api/transitions/identify` - Identify transition type from resume and target role
- `POST /api/transitions/roadmap` - Generate AI-powered transition roadmap with timeline
- `POST /api/transitions/skills-gap` - Analyze skill gaps with O*NET validation
- `GET /api/transitions/benchmarks` - Get benchmarking data for transition types
- `POST /api/transitions/courses` - Get course recommendations with affiliate links
```

### Database Schema Section - Update Tables List

```markdown
**Extended Tables** (Transition Planning feature):
- `plans` - Extended with transition-specific fields:
  - `transitionTypes` (array), `primaryTransitionType` (string)
  - `currentRole`, `targetRole`, `currentIndustry`, `targetIndustry`
  - `bridgeRoles` (array), `estimatedTimeline` (object)
  - `benchmarkData` (object), `progressPercentage` (number)
  - `careerCapitalAssessment` (object)
- `skills` - Extended with transition-specific fields:
  - `transitionPlanId` (foreign key to plans)
  - `criticalityLevel` (critical/important/nice-to-have)
  - `transferableFrom` (array), `onetCode` (string)
  - `skillComplexity` (basic/intermediate/advanced)
  - `estimatedLearningTime` (object), `affiliateCourses` (array)

**New Convex Operations:**
- `convex/transitions.ts` - Transition plan queries and mutations

**New Indexes:**
- Plans: `by_transition_type` (userId, primaryTransitionType)
- Skills: `by_transition_plan` (transitionPlanId), `by_criticality` (userId, criticalityLevel)
```

### Provider Abstraction Section - Add to Providers List

```markdown
- `TransitionAnalysisProvider` - Transition-specific AI analysis:
  - `identifyTransitionType(resumeContent, currentRole, targetRole, targetIndustry)`
  - `generateRoadmap(transitionData, resumeContent)`
  - `analyzeSkillGaps(currentRole, targetRole, resumeContent)`
  - `assessCareerCapital(resumeContent, currentRole)`
  - Multi-model approach: GPT-4 for structured analysis, Claude for narrative
  - SHA-256 content hashing for caching (60%+ hit rate target)
```

### Environment Variables Section - Add New Variables

```markdown
**Transition Planning Feature**:
- `ONET_API_KEY` - O*NET API key for skill validation (free tier: 1000 calls/day)
- `COURSERA_AFFILIATE_ID` - Coursera affiliate program ID
- `UDEMY_AFFILIATE_ID` - Udemy affiliate program ID
- `LINKEDIN_AFFILIATE_ID` - LinkedIn Learning affiliate program ID
```

### Troubleshooting Section (New)

```markdown
## Troubleshooting

### Transition Planning Issues

**Roadmap generation times out (>30 seconds):**
- Check AI provider API status (OpenAI, Anthropic)
- Verify streaming response is working (progressive display)
- Check for large resume content (consider chunking)
- Review prompt token usage (optimize if needed)

**O*NET API errors:**
- Verify `ONET_API_KEY` environment variable is set
- Check free tier limit (1000 calls/day)
- System should gracefully fallback to AI-only skill identification
- Check `src/lib/integrations/onet-api.ts` error logs

**Course recommendations not appearing:**
- Verify affiliate ID environment variables are set
- Check course provider API status
- Review fallback logic (should try alternative providers)
- Check `src/lib/integrations/course-providers.ts` error logs

**Low cache hit rate (<60%):**
- Verify SHA-256 hashing working correctly
- Check resume content normalization (whitespace, formatting)
- Review cache invalidation logic
- Monitor `analysisResults` table for cache entries

**Transition plans not loading:**
- Verify backward compatibility (existing plans without transition fields)
- Check Convex operations in `convex/transitions.ts`
- Verify user authentication (Clerk session)
- Check browser console for API errors

**High AI costs (>$2 per plan):**
- Review prompt optimization in `src/lib/prompts/transition-prompts.ts`
- Verify caching is working (60%+ hit rate)
- Check for unnecessary AI API calls
- Consider prompt token reduction strategies
```

---

## Test Fixtures Summary

The comprehensive test fixtures in `src/__tests__/fixtures/transition-data.ts` include:

**685 lines of realistic test data:**
- 3 sample resume types (Engineer, Marketer, Teacher)
- 4 complete transition plans (cross-role, cross-function, cross-industry, hybrid)
- 5 detailed skill gaps with O*NET codes and course recommendations
- Mock O*NET API responses (skill validation, job-to-skills mapping)
- Mock course provider API responses (Coursera, Udemy, LinkedIn Learning)
- Mock benchmarking data for common transitions
- Mock AI responses for all transition analysis operations
- Helper functions for generating test data variations

**Ready for immediate use in:**
- Unit tests for Convex operations
- Integration tests for API endpoints
- Component tests for UI flows
- End-to-end workflow tests
- Error handling and edge case tests

---

## Conclusion

While the implementation dependencies have not yet been met, I have successfully prepared all testing infrastructure, documentation, and frameworks needed to complete Task Group 5 immediately when Task Groups 1-4 are finished.

The test fixtures are comprehensive and realistic, the documentation updates are thorough and ready to merge, and the testing strategy provides a clear framework for ensuring 80%+ coverage of all critical transition planning workflows.

**Estimated time to complete remaining tasks when dependencies are met: 1 day (8-9 hours)**
