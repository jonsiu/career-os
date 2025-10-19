# Spec Requirements: Transition Type Identification & Planning

## Initial Description

**Feature Name**: Transition Type Identification & Planning

**Description**: Guided assessment to identify transition type (cross-role, cross-industry, cross-function) and create tailored roadmap. Generate realistic timeline based on skill gaps and development speed.

**Context from Roadmap**:
- This is a Phase 2 feature (Career Transition Intelligence - NEXT 3-6 MONTHS)
- Estimated effort: M (1 week)
- This is item #1 in the Transition-Specific Features section
- Priority: High - it's the foundation for all other transition features

## Requirements Discussion

### First Round Questions

**Q1: Integration Location** - I assume this feature should integrate into the existing Career Planning page (`/dashboard/plan`). Should we build this on top of the existing Plans and Skills infrastructure in Convex, or create a separate "Transition Planning" section?

**Answer:** Integrate into existing Career Planning page (`/dashboard/plan`). Build on existing Plans and Skills infrastructure.

**Q2: Transition Type Detection** - I'm thinking the system should support detecting multiple transition types simultaneously (e.g., someone could be doing cross-role AND cross-industry). Should we identify ALL applicable transition types and prioritize the primary challenge, or force users to pick one?

**Answer:** YES, support hybrid transitions. Real-world transitions are often combined (e.g., cross-role AND cross-industry). Identify ALL applicable types and prioritize the primary challenge.

**Q3: Roadmap Data Integration** - For the tailored roadmap generation, should we integrate with the existing Plans and Skills tables in Convex, or create new transition-specific data structures? I'm assuming we leverage existing structures but may need to add fields like `transitionType`, `bridgeRoles`, etc.

**Answer:** Integrate with existing Plans and Skills tables in Convex. Leverage existing structures, add new fields as needed (e.g., `transitionType`, `bridgeRoles`).

**Q4: Timeline Generation & Benchmarking** - For realistic timeline generation, should we use AI (Claude/GPT-4) to analyze the user's resume and skill gaps to estimate timelines? Should we also display benchmarking data like "Similar IC → Manager transitions take 8-12 months"?

**Answer:** YES to both. Use AI (Claude/GPT-4) to analyze resume and estimate timelines. Display benchmarking data like "Similar IC → Manager transitions take 8-12 months."

**Q5: Skill Taxonomy** - For cross-role/cross-industry transitions, should we use a predefined skill taxonomy (e.g., O*NET, LinkedIn Skills Graph) or dynamically identify required skills using AI? I'm thinking a hybrid approach: AI-dynamic for flexibility + predefined taxonomies for common transitions.

**Answer:** Start with AI-dynamic identification for flexibility. Add predefined taxonomies for common transitions over time. Use O*NET API for validation.

**Q6: User Experience Flow** - Should this be a one-time assessment (like onboarding) or allow users to revise and regenerate their transition plan anytime? Also, should users be able to create multiple transition plans simultaneously (e.g., "Plan A: IC → Manager", "Plan B: Engineer → PM")?

**Answer:** Users should be able to revise and regenerate anytime. Support multiple transition plans simultaneously (e.g., "Plan A: IC → Manager", "Plan B: Engineer → PM").

**Q7: Course Integration** - Given the affiliate revenue model (60-70% from course recommendations), should this feature prominently recommend courses/certifications for skill gaps and include affiliate links directly in the roadmap?

**Answer:** ABSOLUTELY YES - core to business model. 60-70% of revenue from affiliate marketing (Coursera, Udemy, LinkedIn Learning). Include course recommendations with affiliate links in roadmaps.

**Q8: Timeline Factors** - For timeline estimation, should we consider factors like: current skill level, learning velocity (fast learner vs. deliberate), skill complexity (management skills take longer than technical), and transition difficulty (IC → Manager easier than Finance → Tech PM)?

**Answer:** YES, consider all: current skill level, learning velocity, skill complexity, transition difficulty. Also add career capital assessment.

**Q9: Progress Tracking** - Should we track transition progress over time (e.g., "You've completed 40% of your IC → Manager transition plan")? This could integrate with the existing Skills Progress Tracking and Daily Career Journal features.

**Answer:** YES - track transition progress over time with completion percentages, milestone tracking, skill development. Integrate with Daily Career Journal for reflection.

**Q10: Anti-patterns to Avoid** - Based on the product mission's emphasis on growth vs. transactional approaches, are there specific anti-patterns to avoid? (e.g., don't promise "get hired in 30 days", don't make transitions sound easy, don't ignore the "why" of transitions)

**Answer:** Avoid transactional "get hired faster" messaging, one-size-fits-all advice, auto-renewal traps, resume-only focus, and ignoring the "why" of transitions.

### Existing Code to Reference

**Similar Features Identified:**

- **Onboarding Flow Pattern**: `src/app/onboarding/` and `src/components/onboarding/`
  - Multi-step guided flow with state tracking
  - Step navigation and progress indicators
  - Completion tracking and user preferences
  - Reusable pattern for guided assessment

- **Career Planning Infrastructure**: `src/app/dashboard/plan/page.tsx` and `src/components/planning/`
  - Plans and milestones UI components
  - Existing Plans table in Convex schema
  - Progress tracking visualization
  - Goal-setting and completion tracking

- **Skills Tracking**: `src/components/planning/`
  - Skills management components
  - Existing Skills table in Convex schema
  - Progress tracking per skill
  - Resource curation for skills

- **Resume Analysis AI Patterns**: `src/components/analysis/` and `src/lib/abstractions/providers/`
  - Multi-provider AI analysis (OpenAI GPT-4 + Anthropic Claude)
  - Provider abstraction pattern for LLM calls
  - Analysis caching with content hashing
  - Structured analysis output format

- **Database Schema**: `convex/schema.ts`
  - Existing `plans` table structure
  - Existing `skills` table structure
  - User onboarding state patterns
  - Relational queries and indexes

### Follow-up Questions

None - all clarifications have been provided.

## Visual Assets

### Files Provided:

No visual files found.

### Visual Insights:

No visual assets provided. User indicated to follow existing UI patterns:
- LinkedIn-style sidebar + preview layout
- Multi-step flow patterns from onboarding
- Progress visualization from career planning
- Existing dashboard design system

## Requirements Summary

### Functional Requirements

**Core Functionality:**

1. **Transition Type Identification**
   - Detect multiple simultaneous transition types (cross-role, cross-industry, cross-function)
   - Support hybrid transitions (e.g., cross-role AND cross-industry)
   - Identify ALL applicable transition types
   - Prioritize the primary challenge
   - AI-powered analysis using user's resume and career goals

2. **Tailored Roadmap Generation**
   - Create customized roadmaps for identified transition type(s)
   - Generate realistic timelines based on:
     - Current skill level
     - Learning velocity (fast vs. deliberate learner)
     - Skill complexity (management skills vs. technical skills)
     - Transition difficulty (IC → Manager vs. Finance → Tech PM)
     - Career capital assessment
   - Display benchmarking data from similar transitions
   - Identify "bridge roles" that facilitate difficult transitions
   - Break roadmap into actionable milestones

3. **AI-Powered Timeline Estimation**
   - Use Claude/GPT-4 to analyze resume and skill gaps
   - Estimate realistic transition timelines
   - Show benchmarking: "Similar IC → Manager transitions take 8-12 months"
   - Adjust timelines based on user's learning velocity and commitment level
   - Factor in career capital development time

4. **Skill Gap Analysis**
   - AI-dynamic skill identification for flexibility
   - Use predefined taxonomies for common transitions
   - Integrate with O*NET API for skill validation
   - Identify critical gaps vs. nice-to-have skills
   - Highlight transferable strengths from current role
   - Prioritize skill development by impact and timeline

5. **Course & Resource Recommendations**
   - Prominently recommend courses/certifications for skill gaps
   - Include affiliate links (Coursera, Udemy, LinkedIn Learning)
   - CORE to business model (60-70% revenue source)
   - Curate resources specific to transition type
   - Track course completions and integrate with skill progress

6. **Multiple Transition Plans**
   - Support simultaneous transition plans (Plan A, Plan B, Plan C)
   - Examples: "Plan A: IC → Manager", "Plan B: Engineer → PM"
   - Allow comparison between different transition paths
   - Enable users to explore abundance of career options

7. **Revision & Regeneration**
   - Users can revise and regenerate transition plans anytime
   - Update plans as skills develop and goals evolve
   - Maintain history of plan versions for comparison
   - Allow adjustments to timeline, priorities, and goals

8. **Progress Tracking**
   - Track transition progress over time
   - Display completion percentages (e.g., "40% complete")
   - Milestone tracking with completion states
   - Skill development progress visualization
   - Integration with Daily Career Journal for reflection
   - Weekly/monthly progress check-ins

9. **Career Capital Integration**
   - Assess user's unique skill combinations
   - Identify rare and valuable career capital
   - Highlight which skills are common vs. differentiated
   - Recommend skill combinations that create competitive advantages
   - Factor career capital into transition timeline and strategy

### Reusability Opportunities

**Components to Potentially Reuse:**

1. **Onboarding Flow Pattern**
   - Multi-step guided assessment flow
   - Step navigation components
   - Progress indicators
   - State management for multi-step forms
   - Files: `src/components/onboarding/`

2. **Career Planning UI**
   - Plans and milestones display components
   - Progress visualization (progress bars, charts)
   - Goal-setting interfaces
   - Completion tracking UI
   - Files: `src/components/planning/`

3. **Skills Management**
   - Skill gap display components
   - Resource curation interface
   - Progress tracking per skill
   - Skill tagging and categorization
   - Files: `src/components/planning/`

4. **AI Analysis Infrastructure**
   - Provider abstraction layer for multi-LLM support
   - Analysis caching with SHA-256 content hashing
   - Structured output parsing
   - Error handling and retry logic
   - Files: `src/lib/abstractions/providers/`

5. **Database Patterns**
   - Existing `plans` table schema
   - Existing `skills` table schema
   - Relational query patterns
   - Indexing strategies
   - File: `convex/schema.ts`

### Scope Boundaries

**In Scope:**

- Transition type identification (cross-role, cross-industry, cross-function)
- Hybrid transition detection and prioritization
- AI-powered roadmap generation with realistic timelines
- Skill gap analysis with AI-dynamic and predefined taxonomies
- Course recommendations with affiliate links (CORE revenue driver)
- Multiple simultaneous transition plans (Plan A, Plan B, etc.)
- Revision and regeneration capabilities
- Progress tracking with completion percentages
- Career capital assessment integration
- Benchmarking data display ("Similar transitions take 8-12 months")
- Bridge role identification for difficult transitions
- Integration with existing Plans and Skills tables
- Integration with Daily Career Journal for reflection
- O*NET API integration for skill validation

**Out of Scope:**

- Actual implementation of Daily Career Journal feature (separate spec)
- Bridge role job matching (covered by AI Job Matching feature in roadmap)
- Interview prep for career transitions (separate feature in roadmap)
- Resume tailoring for career changers (separate feature in roadmap)
- Mentor matching for transitions (Phase 3 feature)
- Transition success stories and templates (Phase 3 feature)
- Transition accountability groups (Phase 3 feature)
- Salary intelligence for career changers (Phase 3 feature)
- Community-driven transition data (Phase 3+)

### Technical Considerations

**Integration Points:**

1. **Convex Database**
   - Extend existing `plans` table with transition-specific fields:
     - `transitionType`: array of transition types (cross-role, cross-industry, cross-function)
     - `primaryTransitionType`: primary challenge
     - `bridgeRoles`: array of intermediate role recommendations
     - `estimatedTimeline`: object with min/max months
     - `benchmarkData`: object with similar transition statistics
   - Extend existing `skills` table with:
     - `transitionPlanId`: link skills to specific transition plans
     - `criticalityLevel`: critical vs. nice-to-have
     - `transferableFrom`: what current skills transfer to this
   - Add indexes for efficient querying by transition type

2. **AI/LLM Integration**
   - Use existing provider abstraction layer (`src/lib/abstractions/providers/`)
   - Multi-model approach: GPT-4 for structured analysis + Claude for narrative coaching
   - Leverage existing analysis caching infrastructure
   - New analysis types: transition type detection, skill gap analysis, timeline estimation
   - Content hashing for transition plan caching

3. **O*NET API Integration**
   - Validate AI-identified skills against O*NET taxonomy
   - Retrieve skill importance ratings for target roles
   - Identify skill level requirements (basic, intermediate, advanced)
   - API endpoint: https://services.onetcenter.org/

4. **Affiliate Course Integration**
   - Coursera API for course recommendations
   - Udemy API for course recommendations
   - LinkedIn Learning API for course recommendations
   - Affiliate link generation and tracking
   - Revenue attribution per recommendation

5. **Daily Career Journal Integration**
   - Create journal prompts specific to transition progress
   - Templates: "Transition Progress Check-in", "Skill Development Reflection"
   - Link journal entries to specific milestones
   - Surface journal insights in progress tracking

**Existing System Constraints:**

1. **Convex Backend**
   - Serverless function execution limits
   - Real-time subscription patterns
   - Schema migration patterns
   - File storage for transition plan exports (future)

2. **Authentication**
   - Clerk user ID as primary user identifier
   - User sync pattern from `src/lib/hooks/use-user-sync.ts`
   - Route protection via middleware

3. **Provider Abstraction**
   - Must maintain vendor-agnostic interfaces
   - Support for multiple AI providers (OpenAI, Anthropic)
   - Graceful degradation if provider unavailable

4. **Caching Strategy**
   - Content-based caching with SHA-256
   - Cache invalidation on resume/goal updates
   - Cost optimization through cache hit rate (target: 60%+)

**Technology Preferences:**

1. **Frontend**
   - Next.js 15 with App Router
   - React 19 components
   - TypeScript strict mode
   - Tailwind CSS 4 for styling
   - Radix UI primitives for accessibility

2. **Backend**
   - Convex queries and mutations
   - Serverless actions for AI calls
   - Schema-driven type generation

3. **AI/LLM**
   - Multi-model: GPT-4 + Claude
   - Structured output via JSON mode
   - Prompt management best practices from standards

4. **Testing**
   - Jest for unit tests
   - React Testing Library for components
   - Mock AI providers in tests
   - 80%+ coverage target

**Similar Code Patterns to Follow:**

1. **Multi-Step Flow Pattern** (from onboarding)
   - Step state management
   - Navigation with back/next
   - Progress indicators
   - Completion tracking

2. **AI Analysis Pattern** (from resume analysis)
   - Provider abstraction
   - Content hashing for caching
   - Structured prompt templates
   - Error handling and retries
   - Cost optimization through caching

3. **Plan Management Pattern** (from career planning)
   - Create, read, update, delete plans
   - Milestone tracking
   - Progress visualization
   - Goal-setting interfaces

4. **Skills Tracking Pattern** (from skills feature)
   - Skill gap identification
   - Progress tracking per skill
   - Resource curation
   - Learning path recommendations

### Anti-patterns to Avoid

**Based on Product Mission:**

1. **Transactional Messaging**
   - AVOID: "Get hired faster", "Land your dream job in 30 days"
   - INSTEAD: "Grow into your target role through systematic skill development"
   - Focus on transformational growth, not quick wins

2. **One-Size-Fits-All Advice**
   - AVOID: Generic roadmaps that ignore user's unique background
   - INSTEAD: Personalized plans based on current skills, learning velocity, career capital
   - Acknowledge that transitions are journeys with individual timelines

3. **Auto-Renewal Traps**
   - AVOID: Subscription dark patterns or pressure tactics
   - INSTEAD: Transparent value delivery, align success with user success
   - Revenue from affiliate courses (when users succeed), not subscriptions

4. **Resume-Only Focus**
   - AVOID: Treating transitions as just "optimizing your resume"
   - INSTEAD: Holistic skill development, experience translation, credibility building
   - Connect resume optimization to actual skill growth

5. **Ignoring the "Why"**
   - AVOID: Focusing only on "how" without addressing "why transition"
   - INSTEAD: Help users articulate motivation, values alignment, career capital goals
   - Support reflective practice through journaling integration

6. **Unrealistic Promises**
   - AVOID: Guaranteeing outcomes or oversimplifying transition difficulty
   - INSTEAD: Realistic timelines with benchmarking data, acknowledge challenges
   - Emphasize growth mindset: skills are built through deliberate practice

7. **Competitive Scarcity Mindset**
   - AVOID: "Beat other candidates", "Stand out in ATS"
   - INSTEAD: "Explore abundance of career options", "Build rare skill combinations"
   - Focus on career capital building, not zero-sum competition

### Success Criteria

**User Outcomes:**

1. **Transition Type Identification**
   - 70%+ of users complete transition type assessment
   - 60%+ identify multiple transition types (hybrid transitions)
   - 90%+ report assessment accurately captured their career change challenge

2. **Roadmap Adoption**
   - 50%+ of users generate at least one transition roadmap
   - 30%+ create multiple transition plans (Plan A, Plan B)
   - 80%+ report roadmap feels personalized and actionable

3. **Timeline Realism**
   - 85%+ report timelines feel realistic (not overpromising)
   - Benchmarking data cited as "helpful" by 75%+ of users
   - Average timeline estimates align with actual transition completions (within 20%)

4. **Skill Development Engagement**
   - 60%+ of users take action on skill gap recommendations
   - 40%+ click through to course recommendations (affiliate revenue driver)
   - 15%+ purchase recommended courses (5% conversion on clicks)

5. **Progress Tracking**
   - 50%+ of users actively track transition progress
   - Weekly check-ins completed by 40%+ of active transition planners
   - Integration with Daily Career Journal used by 30%+ of users

**Business Metrics:**

1. **Affiliate Revenue** (CORE to business model)
   - 60-70% of revenue from course recommendations
   - $10K+/month from affiliate commissions by end of Phase 2
   - Average 1.5 course enrollments per active transition planner per year
   - $30-50 average commission per course

2. **User Engagement**
   - 80%+ monthly active users are career transitioners (not just job searchers)
   - Transition plan creation is top 3 features by usage
   - 70%+ retention for users who complete transition assessment

3. **Cost Optimization**
   - AI analysis cache hit rate: 60%+ (reduce API costs)
   - Average AI cost per transition plan: <$2
   - O*NET API usage within free tier limits

**Platform Health:**

1. **Performance**
   - Transition type assessment completes in <5 seconds
   - Roadmap generation completes in <30 seconds
   - Page load times <2 seconds (existing standard)

2. **Accuracy**
   - AI-identified skills validated by O*NET: 85%+ accuracy
   - Timeline estimates within 20% of actual completions
   - Skill gap analysis identifies gaps users weren't aware of: 80%+

3. **Integration Quality**
   - Plans table extensions deploy without breaking existing features
   - Skills table extensions maintain backward compatibility
   - Daily Career Journal integration works seamlessly (when available)

### User Flow Summary

**Guided Assessment Flow:**

1. **Entry Point**: From Career Planning page (`/dashboard/plan`)
2. **Step 1**: Transition Context Questions
   - What role are you in now?
   - What role are you targeting?
   - What industry/function changes (if any)?
3. **Step 2**: AI Analysis
   - Analyze resume for current skills
   - Identify transition type(s)
   - Detect hybrid transitions
4. **Step 3**: Transition Type Results
   - Display identified transition types
   - Highlight primary challenge
   - Show benchmarking data
5. **Step 4**: Roadmap Generation
   - AI-powered skill gap analysis
   - Timeline estimation with factors
   - Bridge role identification
   - Course recommendations with affiliate links
6. **Step 5**: Plan Customization
   - Adjust timeline preferences
   - Prioritize skills
   - Select courses to pursue
   - Name plan (e.g., "Plan A: IC → Manager")
7. **Step 6**: Save & Track
   - Save to Plans table with transition metadata
   - Begin progress tracking
   - Integration with Skills tracking
   - Journal prompts for reflection

**Ongoing Usage:**

- View transition plans on Career Planning page
- Track progress with completion percentages
- Revise and regenerate plans as skills develop
- Create additional plans (Plan B, Plan C)
- Weekly check-ins via Daily Career Journal
- Course completion tracking
- Milestone celebrations

### Data Model Extensions

**Plans Table Extensions:**

```typescript
// Extend existing plans table in convex/schema.ts
plans: defineTable({
  // Existing fields...
  userId: v.id("users"),
  title: v.string(),
  description: v.string(),
  milestones: v.array(v.object({...})),
  createdAt: v.number(),
  updatedAt: v.number(),

  // NEW FIELDS for Transition Planning
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
    factors: v.array(v.string()), // ["skill_complexity", "learning_velocity"]
  })),
  benchmarkData: v.optional(v.object({
    similarTransitions: v.string(), // e.g., "IC → Manager"
    averageTimeline: v.string(), // e.g., "8-12 months"
    successRate: v.optional(v.number()), // percentage
  })),
  progressPercentage: v.optional(v.number()),
  careerCapitalAssessment: v.optional(v.object({
    uniqueSkills: v.array(v.string()),
    rareSkillCombinations: v.array(v.string()),
    competitiveAdvantages: v.array(v.string()),
  })),
})
.index("by_user_id", ["userId"])
.index("by_transition_type", ["userId", "primaryTransitionType"])
```

**Skills Table Extensions:**

```typescript
// Extend existing skills table in convex/schema.ts
skills: defineTable({
  // Existing fields...
  userId: v.id("users"),
  name: v.string(),
  progress: v.number(),
  resources: v.array(v.string()),
  createdAt: v.number(),
  updatedAt: v.number(),

  // NEW FIELDS for Transition Planning
  transitionPlanId: v.optional(v.id("plans")),
  criticalityLevel: v.optional(v.union(
    v.literal("critical"),
    v.literal("important"),
    v.literal("nice-to-have")
  )),
  transferableFrom: v.optional(v.array(v.string())), // Current skills that transfer
  onetCode: v.optional(v.string()), // O*NET skill code for validation
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
    provider: v.string(), // "Coursera", "Udemy", "LinkedIn Learning"
    title: v.string(),
    url: v.string(),
    affiliateLink: v.string(),
    price: v.optional(v.number()),
  }))),
})
.index("by_user_id", ["userId"])
.index("by_transition_plan", ["transitionPlanId"])
.index("by_criticality", ["userId", "criticalityLevel"])
```

### Integration Requirements

**O*NET API Integration:**

- Endpoint: `https://services.onetcenter.org/ws/`
- Authentication: API key (free tier: 1000 calls/day)
- Use cases:
  - Skill validation
  - Skill importance ratings
  - Skill level requirements
  - Job-to-skill mappings
- Error handling: Graceful degradation if API unavailable

**Affiliate Course APIs:**

- Coursera API: Course search, affiliate links
- Udemy API: Course search, affiliate links
- LinkedIn Learning API: Course search, affiliate links
- Revenue tracking: UTM parameters, conversion tracking
- Compliance: Affiliate disclosure requirements

**AI/LLM Prompts:**

- Transition type detection prompt
- Skill gap analysis prompt
- Timeline estimation prompt
- Bridge role identification prompt
- Career capital assessment prompt
- Follow prompt management standards from `agent-os/standards/ai-integration/prompt-management.md`

### Compliance & Standards

**Align with User Standards:**

- AI Integration: Follow `agent-os/standards/ai-integration/` guidelines
  - Prompt management best practices
  - Cost optimization through caching
  - User-facing AI patterns
  - Streaming responses (for roadmap generation UX)
- Backend: Follow `agent-os/standards/backend/` guidelines
  - API routes patterns
  - Queries and mutations
  - Authentication/authorization
- Frontend: Follow `agent-os/standards/frontend/` guidelines
  - Component structure
  - State management
  - Forms and validation
  - Accessibility (Radix UI primitives)
- Database: Follow `agent-os/standards/database/` guidelines
  - Schema design
  - Indexing strategies
  - Performance considerations

**Accessibility:**

- WCAG 2.1 AA compliance
- Keyboard navigation for multi-step flow
- Screen reader support
- Focus management
- Radix UI primitives for accessible components

**Privacy & Security:**

- Transition plans are user-private (not shared publicly)
- Affiliate links include proper disclosure
- API keys stored securely in environment variables
- No PII in affiliate tracking parameters
