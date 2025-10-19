# Specification: Skill Gap Analysis for Transitions

## Goal

Enable users to identify and prioritize skill gaps when transitioning between career roles by comparing their current skills (extracted from resume) against target role requirements (from O*NET), using AI-powered transferable skills analysis and multi-factor prioritization to generate actionable learning roadmaps that integrate with existing Skills Tracking and Career Planning systems.

## User Stories

- As a career changer, I want to compare my current skills to my target role requirements so that I know exactly what I need to learn
- As a user, I want to see which of my existing skills transfer to my target role so that I can highlight them in applications
- As a user planning a transition, I want to get a prioritized learning roadmap so that I can focus on the most impactful skills first
- As a user, I want realistic timeline estimates for skill acquisition so that I can plan my transition effectively
- As a user, I want curated course recommendations so that I can start learning immediately
- As a user tracking my progress, I want to see how many gaps I've closed over time so that I stay motivated

## Core Requirements

### Functional Requirements

**Skill Extraction and Comparison**
- Extract skills from user's resume using existing resume analysis system
- Retrieve target role skill requirements from O*NET occupational database
- Support manual input for non-standard roles or company-specific requirements
- Categorize skills into: Critical gaps (must-have), Nice-to-have gaps (beneficial), Transferable skills (already possessed)
- Cache O*NET data to avoid repeated API calls for same roles

**Intelligent Prioritization Algorithm**
- Calculate priority score using: Impact on role readiness (weight: 30%), Time to acquire from O*NET complexity (weight: 25%), Market demand from O*NET labor data (weight: 20%), Career capital/rare skill value (weight: 15%), Learning velocity from user's Skills Tracker history (weight: 10%)
- Generate prioritized learning roadmap ranked by composite score
- Surface quick wins (high impact, low time) and long-term investments (high career capital)

**AI-Powered Transferable Skills Analysis**
- Use Claude/GPT-4 to identify non-obvious skill transfers between domains
- Find creative connections (e.g., "Teaching → Leadership" via classroom management)
- Use O*NET skill overlap as baseline, AI for advanced pattern matching
- Explain transfer rationale to build user confidence

**Timeline Estimation**
- Combine O*NET skill complexity ratings with user's available hours per week (collected during analysis)
- Use pre-defined benchmarks for common skills (e.g., "Python basics: 80-120 hours")
- Apply AI estimation for novel skill combinations based on user background
- Present realistic ranges (e.g., "8-12 weeks at 10 hrs/week") not false precision

**Course and Resource Recommendations**
- Auto-generate course recommendations from affiliate partners (Coursera, Udemy, LinkedIn Learning)
- Link recommendations directly to specific skill gaps
- Prioritize by gap criticality, user preferences, and course ratings
- Track affiliate click-throughs for revenue optimization

**Integration with Existing Features**
- Auto-populate Skills Tracking System with identified gaps (status: not-started)
- Auto-create Career Plan milestones from prioritized roadmap
- Enable one-click addition of gaps to personal tracking
- Support re-running analysis after resume updates to track progress

**Progress Tracking and Historical Analysis**
- Store complete analysis snapshots with timestamp and resume hash
- Show progress over time (e.g., "You've closed 5 of 12 critical gaps since March")
- Display gap closure trajectory for motivation
- Support comparison between current and historical analyses

**Visual Presentation**
- Skills matrix showing current vs. target skill levels
- Radar chart comparing skill profiles
- Color-coded gap severity (red: critical, yellow: nice-to-have, green: transferable)
- Interactive roadmap timeline with milestones
- Progress indicators for historical tracking

### Non-Functional Requirements

**Performance**
- O*NET API responses cached with 30-day TTL
- Analysis results cached using SHA-256 content hashing
- Initial analysis completes in under 10 seconds
- AI transferable skills analysis completes in under 30 seconds
- Support concurrent analyses for multiple users

**Accessibility**
- All visualizations have text alternatives
- Color-coded elements include icons for colorblind users
- Keyboard navigation for interactive elements
- Screen reader support for analysis results

**Security and Privacy**
- Resume content never sent directly to third parties
- O*NET queries do not include PII
- Affiliate links properly disclosed per FTC guidelines
- User can delete analysis history at any time

## Visual Design

### Layout and Navigation
- Analysis feature lives within existing Career Planning page (`/dashboard/plan`)
- New tab: "Skill Gap Analysis" alongside existing Career Plan tabs
- Multi-step wizard flow: (1) Select Target Role → (2) Configure Analysis → (3) View Results → (4) Take Action

### Key UI Components
- **Target Role Selector**: Autocomplete search for O*NET roles, option to enter custom role
- **Analysis Configuration**: User availability input (hours/week), optional focus areas
- **Skills Matrix**: Grid showing skill categories (rows) vs. proficiency levels (columns)
- **Radar Chart**: Multi-dimensional skill profile comparison (current vs. target)
- **Prioritized Roadmap**: Vertical timeline with skill cards, priority indicators, time estimates
- **Course Recommendations Panel**: Card-based layout with affiliate badges, ratings, estimated hours
- **Progress Dashboard**: Historical comparison chart, gap closure metrics, milestone tracker

### Responsive Breakpoints
- Desktop (1024px+): Side-by-side skills matrix and roadmap
- Tablet (768px-1023px): Stacked layout, collapsible sections
- Mobile (<768px): Single column, progressive disclosure for details

### Design Patterns to Follow
- Use existing Radix UI components (Dialog, Tabs, Select, Progress)
- Follow CareerOS color palette from Tailwind config
- Match Career Planning page styling for consistency
- Use lucide-react icons for skill categories and actions

## Reusable Components

### Existing Code to Leverage

**Skills Tracking System** (`convex/skills.ts`, `src/components/planning/`)
- Reuse: `createSkill`, `updateSkillProgress`, `addSkillResource` mutations
- Reuse: Skill display cards, progress bars, resource linking UI
- Pattern: Skills CRUD operations, category management

**Resume Analysis System** (`src/lib/abstractions/providers/convex-analysis.ts`)
- Reuse: `parseResumeContent` for skill extraction
- Reuse: SHA-256 content hashing from `calculateContentHash`
- Reuse: `checkAnalysisCache` and `saveAnalysisResult` caching patterns
- Pattern: Cache invalidation based on content hash

**AI Provider Pattern** (`src/lib/abstractions/providers/anthropic-analysis.ts`)
- Reuse: Anthropic API integration structure
- Reuse: Prompt templates and response parsing
- Pattern: Server-side API routes for AI calls (`/api/analysis/ai-powered`)

**Career Planning System** (`convex/plans.ts`)
- Reuse: `create` and `update` plan mutations
- Reuse: Milestone data structure (id, title, description, targetDate, status)
- Pattern: Plan status management (draft, active, completed)

**Database Provider Abstraction** (`src/lib/abstractions/types.ts`, `service-factory.ts`)
- Follow: Provider interface pattern for O*NET integration
- Follow: Service factory creation pattern
- Pattern: Decoupling business logic from vendor implementation

### New Components Required

**ONetProvider** (New abstraction)
- Interfaces: `getOccupationSkills`, `getSkillComplexity`, `searchOccupations`, `getCachedONetData`
- Implementation: O*NET Web Services API integration
- Reason: No existing provider for occupational data; needed for role requirements

**SkillGapAnalyzer** (New service class)
- Methods: `analyzeGap`, `prioritizeGaps`, `estimateTimeline`, `generateRoadmap`
- Reason: Complex multi-factor prioritization algorithm not covered by existing analysis providers

**TransferableSkillsMatcher** (New AI service)
- Methods: `findTransferableSkills`, `explainTransfer`, `calculateTransferConfidence`
- Reason: Unique AI-powered skill transfer detection requires specialized prompting logic

**AffiliateRecommendationEngine** (New service)
- Methods: `getCourseRecommendations`, `trackAffiliateClic`, `optimizeRecommendations`
- Reason: Affiliate marketing integration critical for revenue; not part of existing analysis system

**SkillGapVisualization** (New React components)
- Components: `SkillsMatrix`, `RadarChart`, `PrioritizedRoadmap`, `ProgressDashboard`
- Reason: Specialized visualizations for gap analysis not present in existing UI library

## Technical Approach

### Database Schema

**New Table: `skillGapAnalyses`**
```typescript
{
  userId: Id<"users">,
  resumeId: Id<"resumes">,
  targetRole: string,
  targetRoleONetCode: string | undefined, // O*NET SOC code
  criticalGaps: Array<{
    skillName: string,
    onetCode: string | undefined,
    importance: number, // 1-100
    currentLevel: number, // 0-100
    targetLevel: number, // 0-100
    priorityScore: number, // composite score
    timeEstimate: number, // hours
    marketDemand: number // 1-100 from O*NET
  }>,
  niceToHaveGaps: Array<{
    skillName: string,
    onetCode: string | undefined,
    importance: number,
    currentLevel: number,
    targetLevel: number,
    priorityScore: number,
    timeEstimate: number
  }>,
  transferableSkills: Array<{
    skillName: string,
    currentLevel: number,
    applicability: number, // 1-100
    transferExplanation: string, // AI-generated
    confidence: number // 0-1
  }>,
  prioritizedRoadmap: Array<{
    phase: number, // 1, 2, 3 for learning sequence
    skills: string[],
    estimatedDuration: number, // weeks
    milestoneTitle: string
  }>,
  userAvailability: number, // hours per week
  transitionType: string, // "lateral", "upward", "career-change"
  completionProgress: number, // 0-100, calculated from Skills Tracker
  contentHash: string, // SHA-256 of resume content
  analysisVersion: string, // "1.0" for versioning algorithm changes
  metadata: {
    onetDataVersion: string,
    aiModel: string, // "claude-3-5-sonnet" or "gpt-4"
    affiliateClickCount: number,
    lastProgressUpdate: number
  },
  createdAt: number,
  updatedAt: number
}

Indexes:
- by_user_id: [userId]
- by_resume_id: [resumeId]
- by_target_role: [targetRole]
- by_content_hash: [contentHash]
- by_created_at: [createdAt]
```

**New Table: `onetCache`**
```typescript
{
  occupationCode: string, // O*NET SOC code
  occupationTitle: string,
  skills: Array<{
    skillName: string,
    skillCode: string,
    importance: number, // 1-100
    level: number, // 0-7 scale from O*NET
    category: string // "Basic Skills", "Technical Skills", etc.
  }>,
  knowledgeAreas: Array<{
    name: string,
    level: number,
    importance: number
  }>,
  abilities: Array<{
    name: string,
    level: number,
    importance: number
  }>,
  laborMarketData: {
    employmentOutlook: string,
    medianSalary: number | undefined,
    growthRate: number | undefined
  },
  cacheVersion: string, // O*NET database version
  createdAt: number,
  expiresAt: number // 30-day TTL
}

Indexes:
- by_occupation_code: [occupationCode]
- by_expires_at: [expiresAt] // for cache cleanup
```

### API Endpoints

**Skill Gap Analysis**
- `POST /api/skill-gap/analyze` - Trigger new analysis
  - Input: `{ resumeId, targetRole, targetRoleONetCode?, userAvailability }`
  - Output: `{ analysisId, criticalGaps, niceToHaveGaps, transferableSkills, roadmap }`
- `GET /api/skill-gap/[analysisId]` - Retrieve analysis by ID
- `GET /api/skill-gap/history` - Get user's historical analyses
- `POST /api/skill-gap/progress` - Update completion progress from Skills Tracker

**O*NET Integration**
- `GET /api/onet/search?query={query}` - Search occupations
- `GET /api/onet/occupation/[code]` - Get occupation details
- `GET /api/onet/skills/[code]` - Get occupation skill requirements

**Affiliate Recommendations**
- `POST /api/recommendations/courses` - Get course recommendations for skill gaps
  - Input: `{ analysisId, skillGaps[] }`
  - Output: `{ recommendations: [{ skillName, courses[] }] }`
- `POST /api/recommendations/track-click` - Track affiliate link click for analytics

### Provider Architecture

**ONetProvider Interface** (`src/lib/abstractions/types.ts`)
```typescript
export interface ONetProvider {
  searchOccupations(query: string): Promise<OccupationSearchResult[]>;
  getOccupationSkills(code: string): Promise<OccupationSkills>;
  getSkillComplexity(skillCode: string): Promise<number>;
  getCachedOccupation(code: string): Promise<OccupationSkills | null>;
  cacheOccupation(code: string, data: OccupationSkills): Promise<void>;
}
```

**Implementation** (`src/lib/abstractions/providers/onet-provider.ts`)
- Use O*NET Web Services API (https://services.onetcenter.org/)
- Implement caching layer using `onetCache` Convex table
- Handle API rate limits (5 requests/second)
- Fallback to cached data if API unavailable

**Service Factory Update** (`service-factory.ts`)
```typescript
createONetProvider(): ONetProvider {
  return new ONetProviderImpl();
}
```

### Algorithms

**Multi-Factor Prioritization**
```
PriorityScore = (
  ImpactOnRoleReadiness * 0.30 +
  (1 / TimeToAcquire_normalized) * 0.25 +
  MarketDemand * 0.20 +
  CareerCapital * 0.15 +
  LearningVelocity * 0.10
) * 100

Where:
- ImpactOnRoleReadiness: 0-1 from O*NET importance rating
- TimeToAcquire_normalized: 0-1 inverse of O*NET complexity (1 = quick, 0 = years)
- MarketDemand: 0-1 from O*NET labor market data
- CareerCapital: 0-1 calculated as (importance * rarity_inverse)
- LearningVelocity: 0-1 from user's historical time_spent/estimated_time in Skills Tracker
```

**Transferable Skills AI Prompt**
```
System: You are a career transition expert analyzing transferable skills.

User: Analyze transferable skills from the current role to the target role.

CURRENT ROLE SKILLS:
{extracted_skills_from_resume}

TARGET ROLE REQUIREMENTS:
{onet_skills_for_target_role}

For each current skill, determine if it transfers to the target role. Consider:
1. Direct skill overlap (same skill, different context)
2. Adjacent skills (e.g., Python → JavaScript for developers)
3. Meta-skills (e.g., Project Management → Leadership)
4. Domain knowledge transfer (e.g., Finance domain → FinTech roles)

Return JSON:
{
  "transferableSkills": [
    {
      "skillName": "string",
      "currentLevel": 0-100,
      "applicabilityToTarget": 0-100,
      "transferRationale": "explanation",
      "confidence": 0-1
    }
  ],
  "transferPatterns": ["pattern1", "pattern2"]
}
```

**Timeline Estimation Algorithm**
```
EstimatedHours = BaseComplexityHours * LearningVelocityMultiplier * SkillLevelGapMultiplier

BaseComplexityHours:
- Basic skills (O*NET level 0-3): 40-80 hours
- Intermediate skills (O*NET level 4-5): 80-160 hours
- Advanced skills (O*NET level 6-7): 160-400 hours

LearningVelocityMultiplier:
- Fast learner (historical velocity > 1.2): 0.8x
- Average learner (velocity 0.8-1.2): 1.0x
- Slower learner (velocity < 0.8): 1.3x

SkillLevelGapMultiplier:
- Gap 0-30%: 1.0x
- Gap 31-60%: 1.5x
- Gap 61-100%: 2.0x

WeeksToComplete = EstimatedHours / UserAvailabilityHoursPerWeek
```

### Component Architecture

**Analysis Flow Components** (`src/components/skill-gap/`)
- `SkillGapWizard.tsx` - Multi-step wizard container
- `TargetRoleSelector.tsx` - O*NET occupation search and selection
- `AnalysisConfiguration.tsx` - User availability and preferences input
- `AnalysisResults.tsx` - Results presentation with tabs
- `SkillsMatrix.tsx` - Grid visualization of skill gaps
- `RadarChart.tsx` - Skill profile comparison chart
- `PrioritizedRoadmap.tsx` - Timeline with prioritized skill cards
- `CourseRecommendations.tsx` - Affiliate course cards
- `ProgressDashboard.tsx` - Historical progress tracking

**Convex Functions** (`convex/skillGapAnalyses.ts`)
- Queries: `getById`, `getByUserId`, `getByResumeId`, `getHistoricalAnalyses`
- Mutations: `create`, `update`, `updateProgress`, `delete`

**Convex Functions** (`convex/onetCache.ts`)
- Queries: `getOccupation`, `searchOccupations`, `getValidCache`
- Mutations: `cacheOccupation`, `cleanupExpiredCache`

### Integration Points

**Resume Analysis System**
- Call `parseResumeContent` to extract skills
- Reuse `calculateContentHash` for cache invalidation
- Store analysis results in `skillGapAnalyses` table

**Skills Tracking System**
- Auto-create skill records using `createSkill` mutation
- Set initial status to "not-started" for identified gaps
- Link skill resources from course recommendations
- Update progress tracking when users mark skills complete

**Career Planning System**
- Auto-create plan using `create` mutation from roadmap
- Generate milestones for each roadmap phase
- Link milestones to specific skill acquisition
- Update plan status based on gap closure progress

**AI Provider (Claude/Anthropic)**
- Server-side API route: `POST /api/skill-gap/transferable-skills`
- Use `claude-3-5-sonnet` model for analysis
- Implement streaming for real-time feedback
- Cache AI responses by skill pair (current → target)

**Affiliate Partners**
- Coursera Partner API for course search and metadata
- Udemy Affiliate API for course recommendations
- Track click-through with unique affiliate tags
- Store click analytics in analysis metadata

## Testing Strategy

**Unit Tests**
- `prioritizeGaps()` function with different input scenarios
- `estimateTimeline()` with various O*NET complexity levels
- `findTransferableSkills()` AI prompt construction
- O*NET cache TTL and expiration logic
- Content hash calculation and cache invalidation

**Integration Tests**
- End-to-end analysis flow: resume → O*NET → AI → roadmap
- Skills Tracker auto-population from analysis
- Career Plan milestone creation from roadmap
- Affiliate recommendation retrieval and tracking

**Component Tests**
- `SkillGapWizard` navigation and state management
- `SkillsMatrix` rendering with various data sizes
- `RadarChart` data transformation and visualization
- `PrioritizedRoadmap` sorting and filtering

**API Tests**
- `/api/skill-gap/analyze` with valid/invalid inputs
- `/api/onet/search` pagination and filtering
- `/api/recommendations/courses` affiliate link generation
- Rate limiting and error handling for O*NET API

**Test Coverage Target**: 80% (matching existing CareerOS standard)

## Performance Considerations

**Caching Strategy**
- O*NET occupation data cached for 30 days in `onetCache` table
- Analysis results cached by `contentHash` to detect resume changes
- AI transferable skills responses cached by skill pair hash
- Course recommendations cached by skill name for 7 days

**Optimization**
- Batch O*NET API requests where possible (multi-skill lookup)
- Lazy-load course recommendations after initial analysis display
- Use Convex indexes for fast historical analysis queries
- Implement pagination for large roadmaps (>20 skills)

**Monitoring**
- Track O*NET API response times and cache hit rate
- Monitor AI analysis duration and timeout rate
- Measure affiliate click-through and conversion rates
- Alert on analysis failures or API errors

## Revenue Integration

**Affiliate Marketing Strategy** (CRITICAL - 60-70% revenue)

**Implementation Requirements**
- Integrate Coursera, Udemy, LinkedIn Learning affiliate APIs
- Generate affiliate links with unique tracking tags: `careerosapp-{userId}-{analysisId}-{skillName}`
- Display affiliate disclosure per FTC guidelines
- Track click-through rate (CTR) and conversion metrics

**Recommendation Prioritization**
- Show top 3 courses per skill gap with highest ratings
- Prioritize partners with best conversion rates
- Include free and paid options with clear labeling
- Surface "quick wins" (short courses for high-priority gaps)

**Analytics and Optimization**
- Store click events in `metadata.affiliateClickCount`
- A/B test recommendation display (card vs. list layout)
- Track which skill gaps drive most affiliate revenue
- Optimize for partner mix based on conversion data

**Revenue Tracking**
- Monthly affiliate revenue by partner
- Revenue per user by analysis feature usage
- Skill gap category with highest conversion
- ROI of AI-powered vs. rule-based recommendations

## Success Metrics

**User Engagement**
- % of users who complete skill gap analysis within 7 days of signup
- Average number of analyses per user per month
- % of users who re-run analysis after 30 days (progress tracking)

**Feature Adoption**
- % of analyses that auto-populate Skills Tracker (target: 80%+)
- % of analyses that create Career Plan milestones (target: 70%+)
- % of users who click at least one course recommendation (target: 60%+)

**Learning Outcomes**
- Average gap closure rate after 90 days (target: 30% of critical gaps)
- % of users who mark skills complete after analysis (target: 40%+)
- Time to first skill completion after analysis (target: <14 days)

**Business Metrics**
- Affiliate click-through rate (target: 45%+)
- Affiliate conversion rate (target: 8-12%)
- Revenue per analysis (target: $3-5)
- Monthly recurring revenue from this feature

**Technical Performance**
- Analysis completion time (target: <10 seconds for initial, <30 seconds for AI)
- O*NET cache hit rate (target: 85%+)
- API error rate (target: <1%)
- Convex query response time (target: <500ms)

## Out of Scope

**Excluded from MVP**
- Custom skill taxonomies beyond O*NET
- LinkedIn Skills Graph or ESCO integration (future phase)
- Collaborative gap analysis with mentors or coaches
- External learning platform integration beyond affiliate links
- AI-generated custom learning content (courses, tutorials)
- Skills assessments or competency tests
- Skill endorsements from peers or colleagues
- Gamification elements (badges, leaderboards, streaks)
- Mobile-specific optimizations or native app
- Export to external formats (PDF, LinkedIn profile)
- Real-time collaborative roadmap editing
- Integration with applicant tracking systems (ATS)

**Future Enhancements**
- LinkedIn Skills Graph integration for market trends
- ESCO (European Skills/Competences) taxonomy support
- Mentor-guided gap analysis and reviews
- Deep integration with learning platforms (Coursera, Udemy progress sync)
- AI-generated personalized learning content
- Skills assessments with certification tracking
- Peer endorsements and skill verification
- Advanced gamification (XP, levels, achievements)
- Mobile app with offline access to roadmaps
- Public skill portfolio and transition story sharing
- Company-specific skill benchmarking
- Integration with job application tracking for gap prioritization
