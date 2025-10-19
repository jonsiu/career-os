# Spec Requirements: Skill Gap Analysis for Transitions

## Initial Description

**Feature Name**: Skill Gap Analysis for Transitions

**Description**: Compare current skills (from resume) to target role requirements. Identify critical gaps, nice-to-have skills, and transferable strengths. Prioritize skill development by impact and timeline. Research-backed skill taxonomies.

**Context from Roadmap**:
- This is a Phase 2 feature (Career Transition Intelligence - NEXT 3-6 MONTHS)
- Estimated effort: M (1 week)
- This is item #3 in the Transition-Specific Features section
- Priority: High - Research-backed, concrete value that feeds into multiple other features

## Requirements Discussion

### First Round Questions

**Q1: Analysis Input & Comparison Method**
I assume the skill gap analysis will compare skills extracted from the user's resume against target role requirements sourced from O*NET (occupational database). For skills categorization, should we use: (1) Critical gaps (must-have for role), (2) Nice-to-have gaps (beneficial but not required), (3) Transferable skills (already possessed, applicable to new role). Is this the right approach, or should we use a different taxonomy?

**Answer**: YES, the approach is correct. Use resume-extracted skills compared to O*NET target role requirements. Also allow manual input for roles not in O*NET or specific company requirements. Categorization (Critical, Nice-to-have, Transferable) is approved.

**Q2: Prioritization Algorithm**
I'm thinking the prioritization of skill gaps should factor in: (a) Impact on role readiness (how critical to getting the job), (b) Time to acquire (complexity of skill), (c) Market demand (how in-demand the skill is), (d) Career capital (Cal Newport's concept - rare/valuable skills). Should we use all these factors or a subset? Any other factors to consider?

**Answer**: YES, use ALL factors: Impact on role readiness, Time to acquire (skill complexity), Market demand (O*NET data), Career capital (rare skill value per Cal Newport), Learning velocity (from skills tracking history). Aligns with Career Capital Theory and Deliberate Practice principles.

**Q3: Skills Taxonomy Integration**
I assume we'll integrate with O*NET for the MVP (well-researched occupational data), but should we also plan for future expansion to other taxonomies like LinkedIn Skills Graph, ESCO (European Skills/Competences), or industry-specific frameworks? Or keep it O*NET-only initially?

**Answer**: Start with O*NET for MVP (sufficient). Plan for future expansion to LinkedIn Skills Graph and ESCO. Keep architecture flexible using provider abstraction pattern.

**Q4: UI Presentation & Flow**
I'm thinking this feature should live as a new section within the existing Career Planning page (`/dashboard/plan`). The flow would be: (1) User selects target role (from transition identification or manual input), (2) System analyzes their resume, (3) Display visual gap analysis (skills matrix/radar chart), (4) Show prioritized learning roadmap, (5) One-click add to Career Plans and Skills Tracker. Does this flow work, or should it be a standalone page?

**Answer**: Integrate into existing Career Planning page (`/dashboard/plan`). Flow: (1) Select target role from transition identification, (2) Analyze resume, (3) Visual gap analysis (skills matrix/radar), (4) Prioritized roadmap, (5) One-click add to Career Plans and Skills Tracker.

**Q5: Connection to Existing Features**
Should the skill gap analysis automatically generate course/resource recommendations (pulling from affiliate partners like Coursera, Udemy) and auto-populate the Skills Tracking System with identified gaps? Or should users manually add gaps to their tracking?

**Answer**: YES, generate course recommendations directly from gap analysis. This is CRITICAL - 60-70% revenue from affiliate marketing. Auto-populate Skills Tracking System, auto-create Career Plan milestones. Tight integration drives engagement AND revenue.

**Q6: Timeline Estimation**
For estimating "time to acquire" each skill, should we use: (a) O*NET complexity ratings, (b) User's available time commitment (hours/week), (c) Pre-defined benchmarks (e.g., "Python basics: 2-3 months at 10 hrs/week"), (d) AI estimation based on skill complexity and user background? Or a combination?

**Answer**: Use combination of ALL: (a) O*NET complexity ratings, (b) User availability (hours/week - ask during assessment), (c) Pre-defined benchmarks, (d) AI estimation using GPT-4/Claude. Example: "Based on 10 hrs/week, leadership fundamentals: 8-12 weeks."

**Q7: Transferable Skills Intelligence**
For identifying transferable skills, should we use AI (Claude/GPT-4) to find non-obvious skill transfers (e.g., "Teaching → Leadership" via classroom management)? Or stick to rule-based matching from O*NET skill overlap? The AI approach could be a unique differentiator for "experience translation."

**Answer**: Use AI (Claude/GPT-4) for non-obvious transfers. This is a KEY competitive advantage. O*NET overlap is baseline, AI finds creative connections (e.g., "Teaching → Leadership" via classroom management skills). Experience translation is unique differentiator.

**Q8: Refresh & Update Mechanism**
Should users be able to re-run the skill gap analysis after updating their resume or changing target roles? And should we track historical analyses to show progress over time (e.g., "You've closed 5 out of 12 critical gaps since March")?

**Answer**: YES to both. Users can re-run after resume/role changes. Track historical analyses to show progress ("You've closed 5 out of 12 critical gaps since March"). Aligns with growth mindset, long-term engagement, and Daily Career Journal integration.

**Q9: Data Storage**
I assume we'll need a new Convex table `skillGapAnalyses` to store: `userId`, `resumeId`, `targetRole`, `criticalGaps[]`, `niceToHaveGaps[]`, `transferableSkills[]`, `prioritizedRoadmap[]`, `createdAt`, and possibly a snapshot of the resume content hash (for cache invalidation). Should we also cache O*NET API responses to avoid repeated lookups for the same role?

**Answer**: YES, create `skillGapAnalyses` table with: `userId`, `resumeId`, `targetRole`, `criticalGaps[]`, `niceToHaveGaps[]`, `transferableSkills[]`, `prioritizedRoadmap[]`, `createdAt`, `transitionType`, `completionProgress`. Cache O*NET responses in separate table for reuse across users.

**Q10: Scope Boundaries - What Should We EXCLUDE from MVP?**
To keep this to the estimated 1-week effort, what should we explicitly exclude from the MVP? For example: custom skill taxonomies, collaborative gap analysis with mentors, external learning platform integration beyond affiliate links, AI-generated learning content, skills assessments/tests, skill endorsements from peers?

**Answer**: EXCLUDE for MVP: Custom skill taxonomies, collaborative gap analysis with mentors, external learning platform integration beyond affiliate links, AI-generated learning content, skills assessments/tests, skill endorsements. INCLUDE: Basic visualization, O*NET integration, AI transferable skills, course recommendations.

### Existing Code to Reference

**Similar Features Identified:**

- **Skills Tracking System**
  - Path: `src/components/planning/`, `convex/skills.ts`
  - Components to potentially reuse: Skills display components, progress tracking UI, skill addition/editing forms
  - Backend logic to reference: Skills CRUD operations, progress tracking, resource linking

- **Multi-Step Analysis Flow**
  - Path: `src/components/analysis/`, `src/app/api/analysis/`
  - Components to potentially reuse: Analysis presentation patterns, multi-step wizards, results visualization
  - Backend logic to reference: Analysis caching patterns, content hashing, result storage

- **Provider Abstraction Pattern**
  - Path: `src/lib/abstractions/providers/`
  - Components to potentially reuse: Provider interface patterns, service factory setup
  - Backend logic to reference: External API integration patterns, fallback handling, error management

- **Career Planning System**
  - Path: `convex/plans.ts`, milestone UI components
  - Components to potentially reuse: Milestone creation/editing, plan visualization, progress tracking
  - Backend logic to reference: Plan CRUD operations, milestone management, goal tracking

- **AI Analysis Patterns**
  - Path: `src/lib/abstractions/providers/anthropic-analysis.ts`
  - Components to potentially reuse: AI prompt templates, response parsing, error handling
  - Backend logic to reference: Claude/GPT-4 integration, prompt engineering, streaming responses

- **Caching Strategy**
  - Path: `analysisResults` table pattern
  - Backend logic to reference: Content hash-based caching, cache invalidation, result reuse across users

### Follow-up Questions

No follow-up questions needed. All requirements are clear and comprehensive.

## Visual Assets

### Files Provided:
No visual assets provided.

### Visual Insights:
No visual files were found in the visuals folder. The implementation should follow existing CareerOS design patterns:
- Career Planning page layout (`/dashboard/plan`)
- Skills tracking UI components
- Multi-step analysis presentation
- Progress visualization patterns from existing features

## Requirements Summary

### Functional Requirements

**Core Functionality:**
1. **Skill Extraction & Comparison**
   - Extract skills from user's resume using existing resume analysis system
   - Compare extracted skills against O*NET target role requirements
   - Support manual input for roles not in O*NET or specific company requirements
   - Categorize skills into: Critical gaps, Nice-to-have gaps, Transferable skills

2. **Intelligent Prioritization**
   - Use multi-factor algorithm incorporating:
     - Impact on role readiness (criticality to getting the job)
     - Time to acquire (skill complexity from O*NET)
     - Market demand (O*NET labor market data)
     - Career capital (rare/valuable skill combination per Cal Newport)
     - Learning velocity (historical data from Skills Tracking System)
   - Generate prioritized learning roadmap based on algorithm

3. **AI-Powered Transferable Skills Analysis**
   - Use AI (Claude/GPT-4) to identify non-obvious skill transfers
   - Find creative connections between experience domains (e.g., "Teaching → Leadership")
   - Baseline: O*NET skill overlap detection
   - Advanced: AI-driven experience translation (competitive differentiator)

4. **Timeline Estimation**
   - Combine multiple data sources for accurate estimates:
     - O*NET skill complexity ratings
     - User availability (hours/week input during assessment)
     - Pre-defined benchmarks for common skills
     - AI estimation based on skill complexity and user background
   - Present realistic timelines (e.g., "Based on 10 hrs/week: 8-12 weeks")

5. **Course & Resource Recommendations**
   - Auto-generate course recommendations from affiliate partners (Coursera, Udemy, etc.)
   - CRITICAL for revenue: 60-70% from affiliate marketing
   - Link recommendations directly to identified skill gaps
   - Prioritize recommendations by gap criticality and user preferences

6. **Integration with Existing Features**
   - Auto-populate Skills Tracking System with identified gaps
   - Auto-create Career Plan milestones from prioritized roadmap
   - Enable one-click addition of gaps to personal tracking
   - Connect to Daily Career Journal for progress reflection

7. **Progress Tracking & Historical Analysis**
   - Allow users to re-run analysis after resume/role changes
   - Track historical analyses in timeline view
   - Show progress over time (e.g., "You've closed 5 out of 12 critical gaps since March")
   - Visualize gap closure trajectory for motivation

8. **Visual Presentation**
   - Skills matrix or radar chart showing current vs. target profile
   - Color-coded gap severity (critical/nice-to-have/transferable)
   - Interactive roadmap timeline
   - Progress indicators for historical tracking

**User Actions Enabled:**
- Select target role from transition identification or manual input
- View comprehensive skill gap analysis with visual presentation
- Understand prioritized learning roadmap with timeline estimates
- Add skill gaps to Skills Tracking System with one click
- Generate Career Plan milestones from analysis results
- Access curated course recommendations with affiliate links
- Re-run analysis after updates to track progress
- Compare current analysis to historical snapshots

**Data to be Managed:**
- Skill gap analyses (new `skillGapAnalyses` table)
- O*NET role data (cached in separate table for reuse)
- User skill profiles (extracted from resumes)
- Learning roadmaps (prioritized skill development paths)
- Progress snapshots (historical analysis records)
- Course recommendations (linked to skill gaps)
- User availability preferences (hours/week commitment)

### Reusability Opportunities

**Components that might exist already:**
- Skills display and editing components from Skills Tracking System
- Multi-step analysis wizard from Resume Analysis feature
- Progress tracking visualizations from Career Planning
- Milestone creation/editing forms from Career Plans
- AI integration patterns from existing analysis providers

**Backend patterns to investigate:**
- Content hash-based caching from `analysisResults` table
- Provider abstraction pattern for O*NET integration
- AI provider patterns from Anthropic/OpenAI analysis
- CRUD operations from Skills and Plans tables
- User preference storage and retrieval

**Similar features to model after:**
- Resume Analysis System (multi-level analysis, caching, visualization)
- Skills Tracking System (progress tracking, resource linking)
- Career Planning (milestone management, goal visualization)
- Onboarding Flow (multi-step user guidance)

### Scope Boundaries

**In Scope (MVP):**
- O*NET skills taxonomy integration
- Basic visual gap analysis (skills matrix/radar chart)
- Multi-factor prioritization algorithm
- AI-powered transferable skills identification (Claude/GPT-4)
- Course recommendations from affiliate partners
- Auto-population of Skills Tracker and Career Plans
- Progress tracking with historical comparison
- Timeline estimation combining multiple data sources
- Re-run capability after resume/role updates
- Caching of O*NET data for performance

**Out of Scope (MVP):**
- Custom skill taxonomies (beyond O*NET)
- LinkedIn Skills Graph or ESCO integration (future Phase)
- Collaborative gap analysis with mentors
- External learning platform integration beyond affiliate links
- AI-generated learning content (courses/materials)
- Skills assessments or competency tests
- Skill endorsements from peers
- Gamification elements (badges, leaderboards)
- Mobile-specific optimizations
- Export to external formats (PDF, LinkedIn profile)

**Future Enhancements Mentioned:**
- Integration with LinkedIn Skills Graph and ESCO taxonomies
- Collaborative features (mentor reviews, peer endorsements)
- Deep integration with learning platforms (progress sync)
- AI-generated custom learning content
- Skills assessments and certification tracking
- Advanced gamification for skill development
- Mobile app optimization
- Public profile/portfolio generation

### Technical Considerations

**Integration Points:**
- O*NET API/database for occupational skill requirements
- Existing Resume Analysis System for skill extraction
- Skills Tracking System for auto-population
- Career Planning System for milestone generation
- AI providers (Claude/GPT-4) for transferable skills analysis
- Affiliate partner APIs (Coursera, Udemy) for course recommendations
- Content hashing system for analysis caching

**Existing System Constraints:**
- Must follow provider abstraction pattern (`src/lib/abstractions/`)
- Must use Convex for data persistence
- Must integrate with Clerk authentication
- Must support existing Career Planning page layout
- Must align with current UI/UX patterns (Radix UI, Tailwind CSS)
- Must maintain 80% test coverage threshold

**Technology Preferences Stated:**
- Use Convex for new `skillGapAnalyses` table
- Use provider abstraction for O*NET integration (future-proof for other taxonomies)
- Use Claude/GPT-4 for AI transferable skills analysis
- Follow existing caching patterns from `analysisResults` table
- Reuse existing analysis presentation components
- Use existing skills and planning UI components where applicable

**Similar Code Patterns to Follow:**
- Analysis caching: SHA-256 content hashing pattern from `convex-analysis.ts`
- Provider abstraction: Interface + implementation pattern from `src/lib/abstractions/`
- Multi-step flow: Analysis wizard pattern from `src/components/analysis/`
- Progress tracking: Skills tracking pattern from `src/components/planning/`
- AI integration: Anthropic provider pattern from `anthropic-analysis.ts`
- Milestone creation: Career plans pattern from `convex/plans.ts`

**Performance Considerations:**
- Cache O*NET data in separate table to avoid repeated API calls
- Reuse O*NET responses across users for same target roles
- Use content hashing to detect resume changes and invalidate cache
- Lazy-load course recommendations after initial gap analysis
- Optimize AI calls by batching transferable skills analysis

**Revenue Integration:**
- Course recommendations are CRITICAL (60-70% revenue from affiliate marketing)
- Prioritize affiliate link placement in gap analysis results
- Track click-through and conversion for revenue analytics
- Support multiple affiliate partners (Coursera, Udemy, future expansion)

**Alignment with Product Principles:**
- Career Capital Theory: Prioritize rare/valuable skill combinations
- Deliberate Practice: Focus on targeted skill development with clear goals
- Growth Mindset: Show progress over time to reinforce development
- Research-Backed: Use O*NET occupational data and AI for credibility
- Long-Term Engagement: Historical tracking and milestone integration
