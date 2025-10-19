# Spec Requirements: Daily Career Journal & Reflection System

## Initial Description
Guided journaling templates for daily growth tracking, transition reflections, skill development insights, and interview debriefs. Templates include: Daily Growth Log, Transition Progress Check-in, Career Capital Builder, Experience Translation Journal, Application & Interview Journal. Research shows 22.8% workplace performance boost from structured journaling. Integrates with deliberate practice tracker and skill development pathways.

**Context from Roadmap**:
- This is a Phase 2 feature (Career Transition Intelligence - NEXT 3-6 MONTHS)
- Item #11 in the Intelligence & Automation section
- Estimated effort: M (1 week)
- Priority: High - Research-backed (22.8% workplace performance boost)
- Integrates with deliberate practice tracker and skill development pathways
- Success metrics: 40%+ of active users journal at least 3x/week, 50%+ of journal insights lead to skill development actions

## Requirements Discussion

### First Round Questions

**Q1: Page Location & Navigation - Where should the journal feature live?**
**Answer:** Dedicated page at `/dashboard/journal` with sidebar navigation. This is a unique differentiator that deserves prominent placement. Don't integrate into Career Planning - give it visibility to drive the 40%+ engagement metric.

**Q2: Template Prompts - Should prompts be fixed or customizable?**
**Answer:** Fixed and visible prompts for MVP, with customization in future. Structured prompts ensure quality reflection. Fixed prompts easier to implement (M-sized, 1 week). Prompts should be research-backed based on journaling best practices.

**Q3: Data Model - Should we create a dedicated `journalEntries` table?**
**Answer:** YES, create `journalEntries` table with fields: `userId`, `templateType`, `content`, `createdAt`, `linkedSkillId` (optional), `linkedPlanId` (optional), `linkedJobId` (optional), `actionTaken` (boolean for 50%+ conversion tracking), `insights[]` (for future AI features).

**Q4: Integration Level - How deeply should journal integrate with Skills/Plans/Jobs?**
**Answer:** Both explicit linking AND AI suggestions for future. MVP includes: Link entries to Skills/Plans/Jobs (explicit), show recent journal entries on Skills/Plans pages. Future Phase 2.5: AI-powered analysis suggesting skill updates. Aligns with "50%+ of insights lead to actions" metric.

**Q5: Tracking Actions from Insights - How do we measure the "50%+ of insights lead to actions" success metric?**
**Answer:** Explicit user action for MVP. Add buttons: "Add to Skills Tracker", "Create Milestone", "Mark as Action Taken". Track in `actionTaken` field to measure 50%+ success metric. Future: AI-powered correlation analysis.

**Q6: Journal UI and Rich Text - What should the journal list view and entry editing experience look like?**
**Answer:** YES to rich text using existing TipTap editor (already used in job descriptions). List view with template type, date, preview. Filters by template, date, linked resources. Entry detail view with edit, link actions, archive, delete. Follow LinkedIn-style sidebar + preview pattern for consistency.

**Q7: Stats Display - Should we show the 22.8% research finding and/or personal progress stats?**
**Answer:** YES to both. Display 22.8% research finding prominently (evidence-based value prop). Show personal progress: "X entries this month", "Y-day streak", "Weekly goal: 3/3". Gamification without being gimmicky (growth mindset focus).

**Q8: Reminder/Nudge Features - Should we include email/notification reminders or complex dashboard widgets?**
**Answer:** Focus on core experience first, add nudges in Phase 2.5. MVP includes: Core journaling templates, basic stats (entry count, last journaled). EXCLUDE: Email reminders, complex dashboard widgets. Future: Email/notification system for engagement.

**Q9: Application & Interview Journal Linking - How should the "Application & Interview Journal" template link to Jobs?**
**Answer:** Optional linking. User can link to specific Job from Jobs table but not required. Auto-suggest recent jobs when template is selected. Linkage enables insights like "Your interview performance over time."

**Q10: Scope Boundaries - What's explicitly OUT of scope for MVP?**
**Answer:** EXCLUDE for MVP: AI-powered insight generation, sharing with mentors, PDF export, voice-to-text, mobile app. INCLUDE: Templates, entry CRUD, linking to Skills/Plans/Jobs, basic stats, rich text editor.

### Existing Code to Reference

**Similar Features Identified:**

- **List views with sidebar + preview pattern**:
  - Path: `src/app/dashboard/jobs/page.tsx`
  - Components: `src/components/jobs/`
  - Pattern: LinkedIn-style sidebar + preview layout

- **Rich text editor (TipTap)**:
  - Path: `src/components/ui/` (TipTap editor already used in job descriptions)
  - Component to reuse: Existing TipTap editor implementation

- **Form flows and multi-step patterns**:
  - Path: `src/app/onboarding/`
  - Components: `src/components/onboarding/`

- **Backend CRUD patterns**:
  - Path: `convex/plans.ts`, `convex/skills.ts`, `convex/jobs.ts`
  - Pattern: Follow same pattern for new `convex/journalEntries.ts`

- **Integration patterns (linking across features)**:
  - Skills linking in Career Planning
  - Job linking in Resume analysis
  - Reference these for journal linking implementation

- **Stats/analytics display**:
  - Analysis history in `analyses` table
  - Job sync stats in `/api/jobs/sync`
  - Pattern: Stats cards, progress tracking

### Follow-up Questions

No follow-up questions were needed. User provided comprehensive answers covering all aspects of the feature.

## Visual Assets

### Files Provided:
No visual assets provided.

### Visual Design Direction:
Follow existing CareerOS patterns:
- LinkedIn-style sidebar + preview layout (from Jobs page)
- TipTap rich text editor (from job descriptions)
- Multi-step forms (from onboarding)
- Stats cards and progress indicators (from analysis pages)

## Requirements Summary

### Functional Requirements

**Core Journaling Functionality:**
- Dedicated page at `/dashboard/journal` with prominent sidebar navigation
- Five research-backed journal templates (fixed for MVP):
  1. Daily Growth Log
  2. Transition Progress Check-in
  3. Career Capital Builder
  4. Experience Translation Journal
  5. Application & Interview Journal
- Rich text entry creation using existing TipTap editor
- Full CRUD operations: Create, Read, Update, Archive, Delete entries

**Journal Templates:**
- Each template has fixed, research-backed prompts
- Prompts are visible and guide structured reflection
- Template selection interface when creating new entry
- Templates designed to ensure quality reflection (not customizable in MVP)

**List & Preview Interface:**
- LinkedIn-style sidebar + preview pattern (following Jobs page)
- List view shows: template type, date, content preview
- Filters by: template type, date range, linked resources
- Entry detail view with full content display
- Editing interface with rich text capabilities

**Linking & Integration:**
- Explicit linking to Skills (optional field: `linkedSkillId`)
- Explicit linking to Plans/Milestones (optional field: `linkedPlanId`)
- Explicit linking to Jobs (optional field: `linkedJobId`)
- Auto-suggest recent jobs when "Application & Interview Journal" template selected
- Display recent journal entries on Skills and Plans pages (reverse integration)

**Action Tracking (for 50%+ conversion metric):**
- Action buttons on journal entries:
  - "Add to Skills Tracker"
  - "Create Milestone"
  - "Mark as Action Taken"
- `actionTaken` boolean field to track conversion
- Measure: "50%+ of journal insights lead to skill development actions"

**Stats & Progress Display:**
- Prominent display of 22.8% research finding (evidence-based value prop)
- Personal progress metrics:
  - "X entries this month"
  - "Y-day streak"
  - "Weekly goal: 3/3"
- Gamification with growth mindset focus (not gimmicky)
- Basic stats only (entry count, last journaled, streaks)

**Data Persistence:**
- New Convex table: `journalEntries`
- Fields:
  - `userId` - User who owns the entry
  - `templateType` - Which of 5 templates was used
  - `content` - Rich text content (TipTap format)
  - `createdAt` - Timestamp of creation
  - `linkedSkillId` - Optional link to Skills table
  - `linkedPlanId` - Optional link to Plans/Milestones table
  - `linkedJobId` - Optional link to Jobs table
  - `actionTaken` - Boolean for tracking conversion metric
  - `insights[]` - Array field for future AI-powered features
  - `archived` - Boolean for soft delete

### Reusability Opportunities

**Components to Reuse:**
- TipTap rich text editor (already in job descriptions)
- Sidebar + preview layout pattern (Jobs page)
- Stats cards (Analysis pages)
- Multi-step form patterns (Onboarding)

**Backend Patterns to Follow:**
- CRUD operations from `convex/plans.ts`, `convex/skills.ts`, `convex/jobs.ts`
- Linking patterns from Skills and Resume analysis features
- Stats/analytics patterns from analysis history and job sync

**Similar Features to Model After:**
- Jobs page for list/preview UI
- Career Planning for linking and integration patterns
- Skills Tracker for progress tracking and stats display

### Scope Boundaries

**In Scope (MVP):**
- Five fixed journal templates with research-backed prompts
- Full CRUD for journal entries (create, read, update, archive, delete)
- Rich text editing using TipTap
- Explicit linking to Skills, Plans, and Jobs
- List view with filters (template, date, linked resources)
- Entry detail view with edit capabilities
- Action tracking buttons and `actionTaken` field
- Basic stats: entry count, last journaled, streak tracking
- Display of 22.8% research finding
- Personal progress display (entries this month, streak, weekly goal)
- Auto-suggest recent jobs for Application & Interview template
- Show recent journal entries on Skills/Plans pages

**Out of Scope (Future Phases):**
- AI-powered insight generation and analysis
- AI-powered suggestions for skill updates based on journal content
- Template customization (prompts are fixed in MVP)
- Email or push notification reminders
- Complex dashboard widgets
- Sharing entries with mentors or coaches
- PDF export of journal entries
- Voice-to-text entry creation
- Mobile app for journaling
- Correlation analysis between journaling and outcomes
- Advanced analytics and trend visualization

### Technical Considerations

**Database:**
- Create new `journalEntries` table in Convex schema
- Follow existing patterns from `plans.ts`, `skills.ts`, `jobs.ts`
- Index by `userId`, `templateType`, `createdAt`
- Support for optional foreign keys: `linkedSkillId`, `linkedPlanId`, `linkedJobId`

**Frontend:**
- New page: `src/app/dashboard/journal/page.tsx`
- New components: `src/components/journal/`
- Reuse TipTap editor from `src/components/ui/`
- Follow LinkedIn-style sidebar + preview pattern from Jobs page

**Backend Operations:**
- New Convex file: `convex/journalEntries.ts`
- Queries: `list`, `getById`, `getRecent`, `getStats`
- Mutations: `create`, `update`, `archive`, `delete`, `markActionTaken`
- Follow existing CRUD patterns from other Convex operations

**Integration Points:**
- Skills Tracker: Display recent journal entries linked to skills
- Career Planning: Display recent journal entries linked to plans/milestones
- Jobs Tracker: Auto-suggest recent jobs, display linked entries
- Navigation: Add "Journal" to main sidebar navigation

**Success Metrics to Track:**
- 40%+ of active users journal at least 3x/week
- 50%+ of journal insights lead to skill development actions (via `actionTaken` field)
- Entry count, streak tracking, weekly goals
- Template usage distribution

**Tech Stack Alignment:**
- Uses existing TipTap rich text editor
- Uses Convex for data persistence (follows existing patterns)
- Uses existing UI components from `src/components/ui/`
- Follows existing page layout and navigation patterns
- No new external dependencies required
