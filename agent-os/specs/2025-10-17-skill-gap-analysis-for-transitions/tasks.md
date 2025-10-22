# Task Breakdown: Skill Gap Analysis for Transitions

## Overview
Total Tasks: 62 (distributed across 5 phases)
Estimated Effort: 1 week (M-sized feature)
Assigned Roles: database-engineer, api-engineer, ui-designer, testing-engineer

## Task List

### Phase 1: Database Foundation

#### Task Group 1.1: Schema Design & O*NET Cache
**Assigned implementer:** database-engineer
**Dependencies:** None
**Estimated Time:** 4-6 hours

- [x] 1.1.0 Complete database foundation layer
  - [x] 1.1.1 Write 2-8 focused tests for `onetCache` table operations
    - Test O*NET occupation data insertion with TTL
    - Test cache retrieval by occupation code
    - Test cache expiration logic (30-day TTL)
    - Verify cache cleanup of expired entries
    - Limit to critical CRUD operations only
  - [x] 1.1.2 Create `onetCache` table in Convex schema
    - Fields: occupationCode, occupationTitle, skills[], knowledgeAreas[], abilities[], laborMarketData, cacheVersion, createdAt, expiresAt
    - Follow pattern from: `convex/schema.ts` existing tables
    - Add indexes: by_occupation_code, by_expires_at
  - [x] 1.1.3 Create Convex operations file `convex/onetCache.ts`
    - Query: `getOccupation(code: string)`
    - Query: `searchOccupations(query: string)`
    - Query: `getValidCache(code: string)` - checks expiration
    - Mutation: `cacheOccupation(code: string, data: OccupationSkills)`
    - Mutation: `cleanupExpiredCache()` - removes expired entries
  - [x] 1.1.4 Ensure O*NET cache tests pass
    - Run ONLY the 2-8 tests written in 1.1.1
    - Verify cache TTL logic works correctly
    - Do NOT run entire test suite at this stage

**Acceptance Criteria:**
- The 2-8 tests written in 1.1.1 pass
- O*NET cache table created with proper indexes
- Cache expiration logic validates correctly
- 30-day TTL enforced on cache entries

#### Task Group 1.2: Skill Gap Analysis Schema
**Assigned implementer:** database-engineer
**Dependencies:** None (parallel with 1.1)
**Estimated Time:** 4-6 hours

- [x] 1.2.0 Complete skill gap analysis data model
  - [x] 1.2.1 Write 2-8 focused tests for `skillGapAnalyses` table operations
    - Test analysis creation with all required fields
    - Test retrieval by userId and resumeId
    - Test content hash-based cache lookup
    - Test progress update mutation
    - Limit to critical data integrity tests only
  - [x] 1.2.2 Create `skillGapAnalyses` table in Convex schema
    - Fields: userId, resumeId, targetRole, targetRoleONetCode, criticalGaps[], niceToHaveGaps[], transferableSkills[], prioritizedRoadmap[], userAvailability, transitionType, completionProgress, contentHash, analysisVersion, metadata, createdAt, updatedAt
    - Follow pattern from: `convex/schema.ts` analysisResults table
    - Add indexes: by_user_id, by_resume_id, by_target_role, by_content_hash, by_created_at
  - [x] 1.2.3 Create Convex operations file `convex/skillGapAnalyses.ts`
    - Query: `getById(analysisId: Id<"skillGapAnalyses">)`
    - Query: `getByUserId(userId: Id<"users">)`
    - Query: `getByResumeId(resumeId: Id<"resumes">)`
    - Query: `getHistoricalAnalyses(userId: Id<"users">, targetRole?: string)`
    - Query: `getByContentHash(resumeId: Id<"resumes">, contentHash: string, targetRole: string)`
    - Mutation: `create(analysisData: SkillGapAnalysisInput)`
    - Mutation: `update(analysisId: Id<"skillGapAnalyses">, updates: Partial<SkillGapAnalysis>)`
    - Mutation: `updateProgress(analysisId: Id<"skillGapAnalyses">, completionProgress: number)`
    - Mutation: `delete(analysisId: Id<"skillGapAnalyses">)`
  - [x] 1.2.4 Ensure skill gap analysis schema tests pass
    - Run ONLY the 2-8 tests written in 1.2.1
    - Verify content hash caching works
    - Do NOT run entire test suite at this stage

**Acceptance Criteria:**
- The 2-8 tests written in 1.2.1 pass
- Skill gap analysis table supports all required fields
- Content hash-based caching enabled
- Historical tracking supported via createdAt index

### Phase 2: Provider Abstractions & Core Logic

#### Task Group 2.1: O*NET Provider Abstraction
**Assigned implementer:** api-engineer
**Dependencies:** Task Group 1.1
**Estimated Time:** 6-8 hours

- [x] 2.1.0 Complete O*NET integration provider
  - [x] 2.1.1 Write 2-8 focused tests for O*NET provider
    - Test occupation search with valid query
    - Test occupation skills retrieval with caching
    - Test cache hit vs. cache miss scenarios
    - Test API rate limit handling
    - Limit to critical integration paths only
  - [x] 2.1.2 Add ONetProvider interface to `src/lib/abstractions/types.ts`
    - Methods: searchOccupations(query: string), getOccupationSkills(code: string), getSkillComplexity(skillCode: string), getCachedOccupation(code: string), cacheOccupation(code: string, data: OccupationSkills)
    - Follow pattern from: existing provider interfaces (AnalysisProvider, DatabaseProvider)
    - Include proper TypeScript types for O*NET data structures
  - [x] 2.1.3 Implement ONetProvider in `src/lib/abstractions/providers/onet-provider.ts`
    - Use O*NET Web Services API (https://services.onetcenter.org/)
    - Implement caching layer using `onetCache` Convex table from 1.1.3
    - Handle API rate limits (5 requests/second)
    - Fallback to cached data if API unavailable
    - Map O*NET skill levels (0-7 scale) to CareerOS scale (0-100)
  - [x] 2.1.4 Update ServiceFactory in `src/lib/abstractions/service-factory.ts`
    - Add createONetProvider(): ONetProvider method
    - Follow pattern from: existing provider factory methods
    - Export singleton instance
  - [x] 2.1.5 Update exports in `src/lib/abstractions/index.ts`
    - Export onet provider instance
    - Follow pattern from: database, analysis exports
  - [x] 2.1.6 Ensure O*NET provider tests pass
    - Run ONLY the 2-8 tests written in 2.1.1
    - Verify cache layer integration works
    - Do NOT run entire test suite at this stage

**Acceptance Criteria:**
- The 2-8 tests written in 2.1.1 pass
- O*NET API integration working with error handling
- Cache layer reduces redundant API calls
- Rate limiting respected (5 req/sec)

#### Task Group 2.2: Multi-Factor Prioritization Algorithm
**Assigned implementer:** api-engineer
**Dependencies:** Task Group 2.1
**Estimated Time:** 6-8 hours

- [x] 2.2.0 Complete skill gap prioritization logic
  - [x] 2.2.1 Write 2-8 focused tests for prioritization algorithm
    - Test priority score calculation with different weights
    - Test quick wins identification (high impact, low time)
    - Test learning velocity multiplier from Skills Tracker history
    - Test edge cases (no skills history, missing O*NET data)
    - Limit to algorithm logic verification only
  - [x] 2.2.2 Create SkillGapAnalyzer service class in `src/lib/services/skill-gap-analyzer.ts`
    - Method: analyzeGap(resumeSkills[], targetSkills[], userAvailability: number)
    - Method: prioritizeGaps(gaps[], learningVelocity: number) - implements multi-factor algorithm
    - Method: estimateTimeline(gap, userAvailability, learningVelocity)
    - Method: generateRoadmap(prioritizedGaps[], userAvailability)
    - Follow pattern from: existing service classes
  - [x] 2.2.3 Implement multi-factor prioritization algorithm
    - Formula: PriorityScore = (ImpactOnRoleReadiness * 0.30 + (1/TimeToAcquire_normalized) * 0.25 + MarketDemand * 0.20 + CareerCapital * 0.15 + LearningVelocity * 0.10) * 100
    - ImpactOnRoleReadiness: from O*NET importance rating (0-1)
    - TimeToAcquire: from O*NET complexity, normalized (0-1, inverse)
    - MarketDemand: from O*NET labor market data (0-1)
    - CareerCapital: calculated as (importance * rarity_inverse) (0-1)
    - LearningVelocity: from user's Skills Tracker historical velocity (0-1)
  - [x] 2.2.4 Implement timeline estimation algorithm
    - BaseComplexityHours: Basic (O*NET 0-3): 40-80h, Intermediate (4-5): 80-160h, Advanced (6-7): 160-400h
    - LearningVelocityMultiplier: Fast (>1.2): 0.8x, Average (0.8-1.2): 1.0x, Slow (<0.8): 1.3x
    - SkillLevelGapMultiplier: Gap 0-30%: 1.0x, 31-60%: 1.5x, 61-100%: 2.0x
    - EstimatedHours = BaseComplexityHours * LearningVelocityMultiplier * SkillLevelGapMultiplier
    - WeeksToComplete = EstimatedHours / UserAvailabilityHoursPerWeek
  - [x] 2.2.5 Calculate learning velocity from Skills Tracker history
    - Query user's skills via DatabaseProvider.getUserSkills()
    - Calculate velocity = average(timeSpent / estimatedTimeToTarget) across completed skills
    - Handle edge case: no skills history (default to 1.0 = average learner)
    - Reuse pattern from: convex/skills.ts
  - [x] 2.2.6 Ensure prioritization algorithm tests pass
    - Run ONLY the 2-8 tests written in 2.2.1
    - Verify weighted scoring produces expected rankings
    - Do NOT run entire test suite at this stage

**Acceptance Criteria:**
- The 2-8 tests written in 2.2.1 pass
- Multi-factor prioritization algorithm produces ranked gaps
- Timeline estimation incorporates user's learning velocity
- Quick wins (high impact, low time) surfaced correctly

#### Task Group 2.3: AI Transferable Skills Matcher
**Assigned implementer:** api-engineer
**Dependencies:** Task Group 2.1
**Estimated Time:** 6-8 hours

- [x] 2.3.0 Complete AI-powered transferable skills analysis
  - [x] 2.3.1 Write 2-8 focused tests for transferable skills matcher
    - Test AI prompt construction with resume/target skills
    - Test response parsing and validation
    - Test confidence scoring (0-1 scale)
    - Test fallback to O*NET baseline if AI fails
    - Limit to critical AI integration paths only
  - [x] 2.3.2 Create TransferableSkillsMatcher service in `src/lib/services/transferable-skills-matcher.ts`
    - Method: findTransferableSkills(currentSkills[], targetSkills[], currentRole: string, targetRole: string)
    - Method: explainTransfer(skillName: string, currentContext: string, targetContext: string)
    - Method: calculateTransferConfidence(skill, explanation) - returns 0-1 confidence score
    - Follow pattern from: src/lib/abstractions/providers/anthropic-analysis.ts
  - [x] 2.3.3 Implement AI prompt template for skill transfer analysis
    - System: "You are a career transition expert analyzing transferable skills."
    - User prompt includes: CURRENT ROLE SKILLS (from resume), TARGET ROLE REQUIREMENTS (from O*NET)
    - Prompt requests: (1) Direct skill overlap, (2) Adjacent skills, (3) Meta-skills, (4) Domain knowledge transfer
    - Expected JSON response: { transferableSkills: [{ skillName, currentLevel, applicabilityToTarget, transferRationale, confidence }], transferPatterns: [] }
    - Reuse pattern from: existing AI analysis prompts
  - [x] 2.3.4 Integrate with Anthropic Claude API (claude-3-5-sonnet model)
    - Server-side API call to avoid exposing API keys
    - Use streaming for real-time feedback (optional for MVP)
    - Implement proper error handling and timeout (30 sec max)
    - Cache AI responses by skill pair hash to reduce costs
  - [x] 2.3.5 Implement O*NET baseline skill overlap detection
    - Use O*NET skill codes to find exact matches
    - Calculate baseline transferability score without AI
    - Use as fallback if AI analysis fails or times out
  - [x] 2.3.6 Ensure transferable skills matcher tests pass
    - Run ONLY the 2-8 tests written in 2.3.1
    - Verify AI responses parsed correctly
    - Do NOT run entire test suite at this stage

**Acceptance Criteria:**
- The 2-8 tests written in 2.3.1 pass
- AI prompt generates valid skill transfer analysis
- Confidence scoring (0-1) implemented
- O*NET baseline fallback working

### Phase 3: API Integration Layer

#### Task Group 3.1: Skill Gap Analysis API Endpoints
**Assigned implementer:** api-engineer
**Dependencies:** Task Groups 2.1, 2.2, 2.3
**Estimated Time:** 6-8 hours

- [x] 3.1.0 Complete skill gap analysis API layer
  - [x] 3.1.1 Write 2-8 focused tests for analysis API endpoints
    - Test POST /api/skill-gap/analyze with valid inputs
    - Test authentication requirement (Clerk)
    - Test cache hit scenario (existing contentHash)
    - Test error handling (missing resume, invalid O*NET code)
    - Limit to critical API contract tests only
  - [x] 3.1.2 Create POST /api/skill-gap/analyze endpoint in `src/app/api/skill-gap/analyze/route.ts`
    - Input: { resumeId, targetRole, targetRoleONetCode?, userAvailability }
    - Validate Clerk authentication
    - Extract skills from resume using AnalysisProvider.parseResumeContent()
    - Calculate content hash using existing pattern from convex-analysis.ts
    - Check cache via skillGapAnalyses.getByContentHash()
    - If cache miss: fetch O*NET skills, run prioritization, run AI transferable skills
    - Save analysis to skillGapAnalyses table
    - Output: { analysisId, criticalGaps, niceToHaveGaps, transferableSkills, roadmap }
    - Follow pattern from: src/app/api/analysis/ existing routes
  - [x] 3.1.3 Create GET /api/skill-gap/[analysisId] endpoint
    - Retrieve analysis by ID via skillGapAnalyses.getById()
    - Validate user owns the analysis (security check)
    - Return full analysis data
  - [x] 3.1.4 Create GET /api/skill-gap/history endpoint
    - Query: userId from Clerk session
    - Retrieve via skillGapAnalyses.getByUserId()
    - Return array of historical analyses with metadata
    - Sort by createdAt descending
  - [x] 3.1.5 Create POST /api/skill-gap/progress endpoint
    - Input: { analysisId }
    - Calculate completionProgress from Skills Tracker
    - Query skills matching analysis gaps via DatabaseProvider.getUserSkillsByStatus()
    - Progress = (completedSkillsCount / totalGapsCount) * 100
    - Update via skillGapAnalyses.updateProgress()
  - [x] 3.1.6 Ensure skill gap API tests pass
    - Run ONLY the 2-8 tests written in 3.1.1
    - Verify authentication and authorization working
    - Do NOT run entire test suite at this stage

**Acceptance Criteria:**
- The 2-8 tests written in 3.1.1 pass
- POST /api/skill-gap/analyze returns analysis results
- Cache invalidation based on content hash working
- Progress tracking integrated with Skills Tracker

#### Task Group 3.2: O*NET Integration API Endpoints
**Assigned implementer:** api-engineer
**Dependencies:** Task Group 2.1
**Estimated Time:** 3-4 hours

- [x] 3.2.0 Complete O*NET API integration layer
  - [x] 3.2.1 Write 2-8 focused tests for O*NET API endpoints
    - Test GET /api/onet/search with query string
    - Test GET /api/onet/occupation/[code] with valid code
    - Test cache utilization (no redundant API calls)
    - Test error handling (invalid code, API timeout)
    - Limit to critical O*NET integration tests only
  - [x] 3.2.2 Create GET /api/onet/search endpoint in `src/app/api/onet/search/route.ts`
    - Query param: query (occupation name search string)
    - Call ONetProvider.searchOccupations(query)
    - Return: { occupations: [{ code, title, description }] }
    - Implement pagination (limit: 20 results)
  - [x] 3.2.3 Create GET /api/onet/occupation/[code] endpoint
    - Param: code (O*NET SOC code)
    - Call ONetProvider.getOccupationSkills(code)
    - Return full occupation details with skills, knowledge areas, abilities
    - Cache result via ONetProvider.cacheOccupation()
  - [x] 3.2.4 Create GET /api/onet/skills/[code] endpoint
    - Param: code (O*NET SOC code)
    - Return only skills array (subset of occupation details)
    - Optimized for skill gap analysis consumption
  - [x] 3.2.5 Ensure O*NET API tests pass
    - Run ONLY the 2-8 tests written in 3.2.1
    - Verify cache layer reduces API calls
    - Do NOT run entire test suite at this stage

**Acceptance Criteria:**
- The 2-8 tests written in 3.2.1 pass
- O*NET search returns relevant occupations
- Occupation details cached for 30 days
- API rate limiting handled gracefully

#### Task Group 3.3: Affiliate Recommendations API
**Assigned implementer:** api-engineer
**Dependencies:** Task Group 3.1
**Estimated Time:** 4-6 hours

- [x] 3.3.0 Complete affiliate course recommendations API
  - [x] 3.3.1 Write 2-8 focused tests for affiliate API endpoints
    - Test POST /api/recommendations/courses with skill gaps
    - Test affiliate link generation with tracking tags
    - Test prioritization (top 3 courses per skill)
    - Test click tracking (POST /api/recommendations/track-click)
    - Limit to critical revenue-related tests only
  - [x] 3.3.2 Create AffiliateRecommendationEngine service in `src/lib/services/affiliate-recommendations.ts`
    - Method: getCourseRecommendations(skillGaps[], userPreferences?)
    - Method: generateAffiliateLink(course, userId, analysisId, skillName)
    - Method: prioritizeCourses(courses[], gap) - prioritize by gap criticality, ratings
    - Method: trackAffiliateClic(analysisId, skillName, courseProvider)
    - Follow pattern from: existing service classes
  - [x] 3.3.3 Create POST /api/recommendations/courses endpoint in `src/app/api/recommendations/courses/route.ts`
    - Input: { analysisId, skillGaps[] }
    - For each skill gap, query affiliate partner APIs (Coursera, Udemy, LinkedIn Learning)
    - Generate affiliate links with unique tracking tags: careerosapp-{userId}-{analysisId}-{skillName}
    - Prioritize: top 3 courses per skill, sorted by ratings and relevance
    - Include free and paid options with clear labeling
    - Output: { recommendations: [{ skillName, courses: [{ title, provider, url, affiliateUrl, price, rating, estimatedHours }] }] }
  - [x] 3.3.4 Create POST /api/recommendations/track-click endpoint
    - Input: { analysisId, skillName, courseProvider, courseUrl }
    - Increment metadata.affiliateClickCount in skillGapAnalyses table
    - Log click event for analytics (timestamp, skill, provider)
    - Return: { success: true }
  - [x] 3.3.5 Implement affiliate partner API integrations
    - Coursera Partner API for course search and metadata
    - Udemy Affiliate API for course recommendations
    - LinkedIn Learning API (if available, or manual curation for MVP)
    - Handle API errors gracefully with fallback to cached data
  - [x] 3.3.6 Add affiliate disclosure per FTC guidelines
    - Return disclosure text with recommendations response
    - Text: "We may earn a commission from course purchases made through our links, at no additional cost to you."
    - Ensure disclosure is displayed in UI (handled in Phase 4)
  - [x] 3.3.7 Ensure affiliate recommendations API tests pass
    - Run ONLY the 2-8 tests written in 3.3.1
    - Verify tracking tags generated correctly
    - Do NOT run entire test suite at this stage

**Acceptance Criteria:**
- The 2-8 tests written in 3.3.1 pass
- Top 3 courses per skill gap returned
- Affiliate links with unique tracking tags
- Click-through tracking working (CRITICAL for revenue)

### Phase 4: Frontend UI Components

#### Task Group 4.1: Analysis Wizard Flow
**Assigned implementer:** ui-designer
**Dependencies:** Task Groups 3.1, 3.2
**Estimated Time:** 6-8 hours

- [x] 4.1.0 Complete skill gap analysis wizard UI
  - [x] 4.1.1 Write 2-8 focused tests for wizard components
    - Test wizard navigation (next/prev step)
    - Test form validation (target role required, availability > 0)
    - Test submission flow (API call, loading states)
    - Test error handling (API failure, network timeout)
    - Limit to critical user interaction tests only
  - [x] 4.1.2 Create SkillGapWizard component in `src/components/skill-gap/SkillGapWizard.tsx`
    - Multi-step wizard: (1) Select Target Role, (2) Configure Analysis, (3) View Results, (4) Take Action
    - Use Radix UI Dialog or Tabs for wizard container
    - State management: current step, form data, loading states
    - Follow pattern from: src/components/onboarding/ wizard flow
  - [x] 4.1.3 Create TargetRoleSelector component in `src/components/skill-gap/TargetRoleSelector.tsx`
    - Autocomplete search using Radix UI Combobox
    - Fetch occupations from GET /api/onet/search on user input (debounced)
    - Display: occupation title, O*NET code, brief description
    - Option to enter custom role (not in O*NET)
    - Reuse pattern from: existing autocomplete components
  - [x] 4.1.4 Create AnalysisConfiguration component in `src/components/skill-gap/AnalysisConfiguration.tsx`
    - Input: user availability (hours/week) - number input with validation (1-40 range)
    - Optional: focus areas (checkboxes for skill categories)
    - Optional: preferred learning formats (online courses, books, mentorship)
    - Use existing form components from src/components/ui/
  - [x] 4.1.5 Integrate wizard with analysis API
    - On wizard completion, POST to /api/skill-gap/analyze
    - Handle loading state with spinner/skeleton
    - Handle errors with toast notifications
    - On success, navigate to results view (step 3)
  - [x] 4.1.6 Ensure wizard component tests pass
    - Run ONLY the 2-8 tests written in 4.1.1
    - Verify form validation and submission working
    - Do NOT run entire test suite at this stage

**Acceptance Criteria:**
- The 2-8 tests written in 4.1.1 pass
- Wizard guides user through 4 steps smoothly
- O*NET autocomplete working with debounce
- Form validation prevents invalid submissions

#### Task Group 4.2: Visualization Components
**Assigned implementer:** ui-designer
**Dependencies:** Task Group 4.1
**Estimated Time:** 8-10 hours

- [ ] 4.2.0 Complete skill gap visualization UI
  - [ ] 4.2.1 Write 2-8 focused tests for visualization components
    - Test SkillsMatrix rendering with gap data
    - Test RadarChart data transformation and rendering
    - Test PrioritizedRoadmap sorting and filtering
    - Test responsive breakpoints (mobile, tablet, desktop)
    - Limit to critical rendering and interaction tests only
  - [ ] 4.2.2 Create SkillsMatrix component in `src/components/skill-gap/SkillsMatrix.tsx`
    - Grid layout: skill categories (rows) vs. proficiency levels (columns)
    - Color-coded cells: red (critical gap), yellow (nice-to-have), green (transferable)
    - Include icons for colorblind accessibility (circle, triangle, checkmark)
    - Responsive: desktop (full grid), tablet (scrollable), mobile (list view)
    - Use Tailwind CSS for styling, follow existing design system
  - [ ] 4.2.3 Create RadarChart component in `src/components/skill-gap/RadarChart.tsx`
    - Multi-dimensional chart comparing current vs. target skill profile
    - Use chart library: recharts or visx (already in dependencies?)
    - Dimensions: technical skills, soft skills, domain knowledge, leadership, tools
    - Two overlapping polygons: current (blue), target (green)
    - Accessible: provide data table alternative for screen readers
  - [ ] 4.2.4 Create PrioritizedRoadmap component in `src/components/skill-gap/PrioritizedRoadmap.tsx`
    - Vertical timeline layout with skill cards
    - Each card: skill name, priority score badge, time estimate, quick win indicator
    - Phases: 1 (immediate - 0-3 months), 2 (short-term - 3-6 months), 3 (long-term - 6-12 months)
    - Sorting: by priority score (default), by time estimate, by skill category
    - Filtering: by skill category, by priority level
    - Follow pattern from: Career Planning milestone timeline
  - [ ] 4.2.5 Create AnalysisResults container in `src/components/skill-gap/AnalysisResults.tsx`
    - Tabbed interface using Radix UI Tabs: Overview, Skills Matrix, Radar Chart, Roadmap, Resources
    - Overview tab: summary stats (X critical gaps, Y nice-to-have, Z transferable)
    - Integration with visualizations from 4.2.2, 4.2.3, 4.2.4
    - Share/export actions (copy link, download PDF - future enhancement, out of MVP scope)
  - [ ] 4.2.6 Implement responsive design for all visualizations
    - Desktop (1024px+): side-by-side skills matrix and roadmap
    - Tablet (768px-1023px): stacked layout, collapsible sections
    - Mobile (<768px): single column, progressive disclosure for details
    - Test on all breakpoints
  - [ ] 4.2.7 Ensure visualization component tests pass
    - Run ONLY the 2-8 tests written in 4.2.1
    - Verify responsive behavior at all breakpoints
    - Do NOT run entire test suite at this stage

**Acceptance Criteria:**
- The 2-8 tests written in 4.2.1 pass
- Skills matrix color-coded and accessible
- Radar chart renders current vs. target profile
- Roadmap timeline displays prioritized skills with phases

#### Task Group 4.3: Course Recommendations UI
**Assigned implementer:** ui-designer
**Dependencies:** Task Group 3.3
**Estimated Time:** 4-6 hours

- [x] 4.3.0 Complete course recommendations UI
  - [x] 4.3.1 Write 2-8 focused tests for recommendations components
    - Test course card rendering with affiliate links
    - Test click tracking (POST /api/recommendations/track-click)
    - Test free vs. paid course labeling
    - Test affiliate disclosure display
    - Limit to critical revenue interaction tests only
  - [x] 4.3.2 Create CourseRecommendations component in `src/components/skill-gap/CourseRecommendations.tsx`
    - Card-based layout: one card per skill gap
    - Each card shows top 3 courses with: title, provider logo, rating (stars), estimated hours, price (Free/Paid), affiliate link
    - Affiliate link onClick: track click via POST /api/recommendations/track-click, then open in new tab
    - Badge: "Quick Win" for high-priority, low-time courses
    - Lazy-load recommendations after initial analysis display (performance optimization)
  - [x] 4.3.3 Display affiliate disclosure per FTC guidelines
    - Prominent disclosure text above recommendations
    - Text: "We may earn a commission from course purchases made through our links, at no additional cost to you."
    - Use info icon with tooltip for detailed explanation
    - Ensure disclosure is visible before user clicks affiliate links
  - [x] 4.3.4 Implement course filtering and sorting
    - Filter: by provider (Coursera, Udemy, LinkedIn Learning), by price (Free, Paid), by duration (<10hrs, 10-40hrs, >40hrs)
    - Sort: by rating (default), by price (low to high), by duration (shortest first)
    - Persist filter/sort preferences in localStorage
  - [x] 4.3.5 Add course preview modal (optional enhancement)
    - On course card click (not affiliate link), show modal with: full description, syllabus, instructor info, reviews
    - Modal includes "Enroll Now" button with affiliate link
    - Use Radix UI Dialog for modal
  - [x] 4.3.6 Ensure course recommendations UI tests pass
    - Run ONLY the 2-8 tests written in 4.3.1
    - Verify click tracking fires on affiliate link clicks
    - Do NOT run entire test suite at this stage

**Acceptance Criteria:**
- The 2-8 tests written in 4.3.1 pass
- Top 3 courses displayed per skill gap
- Affiliate disclosure visible and compliant (FTC)
- Click tracking working (CRITICAL for revenue analytics)

#### Task Group 4.4: Progress Dashboard & Historical Tracking
**Assigned implementer:** ui-designer
**Dependencies:** Task Groups 4.1, 4.2
**Estimated Time:** 5-6 hours

- [x] 4.4.0 Complete progress tracking UI
  - [x] 4.4.1 Write 2-8 focused tests for progress components
    - Test progress calculation (closed gaps / total gaps)
    - Test historical analysis comparison (before/after)
    - Test gap closure trajectory chart rendering
    - Test re-run analysis flow
    - Limit to critical progress tracking tests only
  - [x] 4.4.2 Create ProgressDashboard component in `src/components/skill-gap/ProgressDashboard.tsx`
    - Summary metrics: "You've closed X of Y critical gaps since [date]"
    - Progress bar: visual representation of completion percentage
    - Gap closure trajectory: line chart showing progress over time (recharts/visx)
    - Milestone markers: link to Career Plan milestones created from roadmap
    - Motivational messaging: "Great progress!", "Keep learning!", "Almost there!"
  - [x] 4.4.3 Implement historical analysis comparison
    - Fetch historical analyses via GET /api/skill-gap/history
    - Display timeline of past analyses with target roles and dates
    - On selection, show before/after comparison: gaps closed, new gaps identified, skills improved
    - Use diff highlighting (green = closed, red = new, yellow = still open)
  - [x] 4.4.4 Implement re-run analysis flow
    - Button: "Re-run Analysis" to detect changes after resume updates
    - Check if resume content hash changed (indicates new resume version)
    - If changed, run new analysis; if unchanged, show cached result with message
    - Auto-calculate progress based on Skills Tracker status
  - [x] 4.4.5 Integrate with Skills Tracker for progress calculation
    - Query user's skills via GET from Skills Tracker
    - Match skill names to analysis gaps
    - Progress = (skills with status "mastered" or "practicing" / total gaps) * 100
    - Update analysis.completionProgress via POST /api/skill-gap/progress
  - [x] 4.4.6 Ensure progress dashboard tests pass
    - Run ONLY the 2-8 tests written in 4.4.1
    - Verify progress calculation accuracy
    - Do NOT run entire test suite at this stage

**Acceptance Criteria:**
- The 2-8 tests written in 4.4.1 pass
- Progress dashboard shows gap closure metrics
- Historical comparison highlights changes over time
- Re-run analysis detects resume updates via content hash

#### Task Group 4.5: Integration with Career Planning Page
**Assigned implementer:** ui-designer
**Dependencies:** Task Groups 4.1, 4.2, 4.3, 4.4
**Estimated Time:** 3-4 hours

- [ ] 4.5.0 Complete Career Planning page integration
  - [ ] 4.5.1 Write 2-8 focused tests for page integration
    - Test new "Skill Gap Analysis" tab navigation
    - Test analysis results display in context
    - Test one-click actions (add to Skills Tracker, create Career Plan)
    - Test page state persistence (tab selection, scroll position)
    - Limit to critical page integration tests only
  - [ ] 4.5.2 Add "Skill Gap Analysis" tab to Career Planning page
    - Location: `/dashboard/plan` (existing page from spec)
    - New tab alongside existing Career Plan tabs
    - Tab content: SkillGapWizard (if no analysis) or AnalysisResults (if analysis exists)
    - Use Radix UI Tabs component (consistent with existing tabs)
  - [ ] 4.5.3 Implement one-click "Add to Skills Tracker" action
    - From AnalysisResults, button: "Track All Gaps" or individual skill "Track This"
    - For each gap, create skill via POST to Skills Tracker API (reuse existing endpoint)
    - Pre-fill: name, category, currentLevel (beginner), targetLevel (from O*NET), status (not-started), estimatedTimeToTarget (from timeline)
    - Show success toast with link to Skills Tracker page
  - [ ] 4.5.4 Implement one-click "Create Career Plan" action
    - From AnalysisResults, button: "Create Plan from Roadmap"
    - Auto-generate plan via POST to Career Plans API (reuse existing endpoint)
    - Pre-fill: title ("Transition to [target role]"), goals (skill gaps), milestones (from prioritized roadmap phases)
    - Each milestone: title, description, targetDate (calculated from timeline), status (pending)
    - Show success toast with link to newly created plan
  - [ ] 4.5.5 Ensure page integration tests pass
    - Run ONLY the 2-8 tests written in 4.5.1
    - Verify one-click actions create resources correctly
    - Do NOT run entire test suite at this stage

**Acceptance Criteria:**
- The 2-8 tests written in 4.5.1 pass
- "Skill Gap Analysis" tab accessible from `/dashboard/plan`
- One-click actions auto-populate Skills Tracker and Career Plans
- Tight integration drives user engagement

### Phase 5: Testing, Integration & Polish

#### Task Group 5.1: End-to-End Integration Testing
**Assigned implementer:** testing-engineer
**Dependencies:** Task Groups 4.1-4.5
**Estimated Time:** 6-8 hours

- [ ] 5.1.0 Review existing tests and fill critical gaps only
  - [ ] 5.1.1 Review tests from Task Groups 1.1-4.5
    - Review database-engineer tests (1.1.1, 1.2.1): ~4-6 tests
    - Review api-engineer tests (2.1.1, 2.2.1, 2.3.1, 3.1.1, 3.2.1, 3.3.1): ~12-18 tests
    - Review ui-designer tests (4.1.1, 4.2.1, 4.3.1, 4.4.1, 4.5.1): ~10-15 tests
    - Total existing tests: approximately 26-39 tests
  - [ ] 5.1.2 Analyze test coverage gaps for THIS feature only
    - Identify critical user workflows that lack test coverage
    - Focus ONLY on skill gap analysis feature requirements from spec.md
    - DO NOT assess entire application test coverage
    - Prioritize end-to-end workflows over unit test gaps
    - Critical workflows: (1) Full analysis flow (select role → analyze → view results → track skills), (2) Cache invalidation (resume update → re-run), (3) Affiliate click-through tracking, (4) Historical comparison, (5) Skills Tracker auto-population
  - [ ] 5.1.3 Write up to 10 additional strategic tests maximum
    - E2E Test 1: Complete analysis workflow (wizard → API → results display)
    - E2E Test 2: Cache hit scenario (same resume + target role = cached result)
    - E2E Test 3: Resume update invalidates cache (new content hash triggers re-analysis)
    - E2E Test 4: Affiliate click tracking persists to database
    - E2E Test 5: Skills Tracker auto-population creates correct skill records
    - E2E Test 6: Career Plan auto-creation generates milestones from roadmap
    - E2E Test 7: Historical analysis comparison shows gap closure
    - E2E Test 8: O*NET API failure falls back to cache gracefully
    - E2E Test 9: AI transferable skills timeout falls back to O*NET baseline
    - E2E Test 10: Multi-factor prioritization produces expected ranking (test data validation)
    - Do NOT write comprehensive coverage for all scenarios
    - Skip edge cases, performance tests, accessibility tests unless business-critical
  - [ ] 5.1.4 Run feature-specific tests only
    - Run ONLY tests related to skill gap analysis feature (tests from 1.1.1-4.5.1 + 5.1.3)
    - Expected total: approximately 36-49 tests maximum
    - Do NOT run the entire application test suite
    - Verify critical workflows pass: full analysis flow, auto-population, cache invalidation

**Acceptance Criteria:**
- All feature-specific tests pass (approximately 36-49 tests total)
- Critical user workflows for skill gap analysis covered
- No more than 10 additional tests added by testing-engineer
- Testing focused exclusively on this spec's feature requirements

#### Task Group 5.2: Performance Optimization & Monitoring
**Assigned implementer:** api-engineer
**Dependencies:** Task Group 5.1
**Estimated Time:** 3-4 hours

- [x] 5.2.0 Optimize performance and add monitoring
  - [x] 5.2.1 Implement performance optimizations
    - Batch O*NET API requests where possible (multi-skill lookup)
    - Lazy-load course recommendations after initial analysis display (already in 4.3.2)
    - Implement pagination for large roadmaps (>20 skills)
    - Add database indexes for frequently queried fields (already in 1.1.2, 1.2.2)
    - Optimize AI prompt size (remove redundant context, compress skill lists)
  - [x] 5.2.2 Add performance monitoring
    - Track O*NET API response times and cache hit rate
    - Monitor AI analysis duration and timeout rate
    - Measure affiliate click-through rate (CTR) and conversion
    - Alert on analysis failures or API errors (>1% error rate)
    - Log to console for MVP (Sentry/DataDog integration out of scope)
  - [x] 5.2.3 Validate performance targets from spec
    - Initial analysis completes in <10 seconds (measure and verify)
    - AI transferable skills analysis completes in <30 seconds (measure and verify)
    - O*NET cache hit rate >85% after initial warmup (monitor over time)
    - Convex query response time <500ms (verify with Convex dashboard)
  - [x] 5.2.4 Add error tracking and recovery
    - Graceful degradation: if AI fails, fall back to O*NET baseline
    - If O*NET API unavailable, use cached data with warning
    - If affiliate API fails, show manual search option
    - User-facing error messages: clear, actionable, non-technical

**Acceptance Criteria:**
- Initial analysis completes in <10 seconds
- AI analysis completes in <30 seconds
- O*NET cache hit rate tracking implemented
- Graceful error handling for all external dependencies

#### Task Group 5.3: Revenue Analytics & Affiliate Tracking
**Assigned implementer:** api-engineer
**Dependencies:** Task Group 3.3, 4.3
**Estimated Time:** 2-3 hours

- [ ] 5.3.0 Implement revenue analytics and tracking
  - [ ] 5.3.1 Add affiliate analytics dashboard (admin view - future enhancement, out of MVP)
    - For MVP: log metrics to console and database metadata
    - Track: monthly affiliate clicks by partner, revenue per user (estimate), skill gap category with highest conversion, ROI of AI-powered vs. rule-based recommendations
  - [ ] 5.3.2 Implement A/B test framework for recommendations (future - out of MVP)
    - For MVP: baseline implementation with single recommendation algorithm
    - Future: test card vs. list layout, top 3 vs. top 5 courses, AI-curated vs. manual recommendations
  - [ ] 5.3.3 Add conversion tracking (if partner APIs support it)
    - Track affiliate click-through rate (CTR): clicks / impressions
    - If possible, track conversions (enrollments) via partner webhooks
    - Store in metadata.affiliateClickCount and future conversions table
  - [ ] 5.3.4 Validate revenue targets from spec
    - Affiliate click-through rate (CTR) target: 45%+ (measure and monitor)
    - Affiliate conversion rate target: 8-12% (measure if partner data available)
    - Revenue per analysis target: $3-5 (estimate based on CTR * conversion * avg commission)

**Acceptance Criteria:**
- Affiliate clicks tracked in database metadata
- Click-through rate (CTR) measurable
- Revenue tracking framework in place for future optimization

## Execution Order

**Recommended implementation sequence:**

1. **Phase 1: Database Foundation** (Task Groups 1.1, 1.2) - 8-12 hours
   - Parallel execution: 1.1 (O*NET cache) and 1.2 (skill gap analysis schema)
   - Critical path: must complete before Phase 2

2. **Phase 2: Provider Abstractions & Core Logic** (Task Groups 2.1, 2.2, 2.3) - 18-24 hours
   - Sequential: 2.1 (O*NET provider) → 2.2 (prioritization) + 2.3 (AI transferable skills)
   - 2.2 and 2.3 can run in parallel after 2.1 completes
   - Critical path: 2.1 → 2.2 for Phase 3

3. **Phase 3: API Integration Layer** (Task Groups 3.1, 3.2, 3.3) - 13-18 hours
   - Parallel: 3.2 (O*NET API) can start after 2.1
   - Sequential: 3.1 (analysis API) requires 2.1, 2.2, 2.3 complete
   - Sequential: 3.3 (affiliate API) requires 3.1 complete
   - Critical path: 3.1 → 3.3 for Phase 4

4. **Phase 4: Frontend UI Components** (Task Groups 4.1, 4.2, 4.3, 4.4, 4.5) - 26-34 hours
   - Sequential: 4.1 (wizard) → 4.2 (visualizations) → 4.3 (recommendations) → 4.4 (progress) → 4.5 (integration)
   - Some parallelization possible: 4.2 components can develop concurrently
   - Critical path: 4.1 → 4.5 for Phase 5

5. **Phase 5: Testing, Integration & Polish** (Task Groups 5.1, 5.2, 5.3) - 11-15 hours
   - Parallel: 5.2 (performance) and 5.3 (revenue analytics) can run concurrently
   - Sequential: 5.1 (integration testing) blocks 5.2 and 5.3
   - Critical path: 5.1 → 5.2 + 5.3

**Total Estimated Effort: 76-103 hours (~10-13 days at 8 hrs/day)**

**Note:** This exceeds the 1-week (M-sized) estimate from requirements. Recommended optimizations:
- Reduce visualization complexity in 4.2 (skip radar chart for MVP, focus on skills matrix and roadmap)
- Defer some one-click integration features in 4.5 (manual add to Skills Tracker acceptable for MVP)
- Limit affiliate partner integrations in 3.3 (start with Coursera only, add Udemy/LinkedIn later)
- With these optimizations, estimate reduces to ~60-75 hours (7.5-9 days at 8 hrs/day), closer to 1-week target

## Key Dependencies & Risk Mitigation

**High-Risk Items (Prioritize Early):**
1. **O*NET API Integration (Task Group 2.1)** - External dependency, potential for rate limiting or API changes
   - Mitigation: Implement robust caching layer early, test fallback to cached data
2. **AI Transferable Skills Analysis (Task Group 2.3)** - AI response quality and timing unpredictable
   - Mitigation: Implement O*NET baseline fallback, set 30-second timeout with graceful degradation
3. **Affiliate Partner APIs (Task Group 3.3)** - Critical for revenue, external API dependencies
   - Mitigation: Start with one partner (Coursera), manual curation fallback if API fails

**Cross-Cutting Concerns:**
- **Content Hashing for Cache Invalidation** - Reuse existing pattern from `convex-analysis.ts` calculateContentHash()
- **User Authentication** - All API endpoints require Clerk authentication (existing middleware)
- **Skills Tracker Integration** - Reuse existing Skills Tracker mutations and queries from `convex/skills.ts`
- **Career Planning Integration** - Reuse existing Career Plans mutations from `convex/plans.ts`

## Success Validation

**Feature complete when:**
- [ ] All 62 tasks completed and checked off
- [ ] Approximately 36-49 tests passing (2-8 per task group + up to 10 E2E tests)
- [ ] 80% test coverage threshold maintained (existing CareerOS standard)
- [ ] Performance targets met: <10s initial analysis, <30s AI analysis, >85% cache hit rate
- [ ] Revenue tracking: affiliate click-through measurable, tracking tags in URLs
- [ ] User workflows validated: full analysis flow, auto-population, historical comparison
- [ ] Integration points tested: Skills Tracker, Career Plans, O*NET, Affiliate partners
- [ ] Accessibility validated: color-blind friendly visualizations, screen reader support, keyboard navigation
