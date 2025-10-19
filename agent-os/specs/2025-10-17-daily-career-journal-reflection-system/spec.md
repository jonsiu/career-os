# Specification: Daily Career Journal & Reflection System

## Goal
Create a research-backed journaling feature that helps users track daily growth, reflect on transitions, build career capital, and improve job search performance through structured reflection. Studies show that structured journaling can boost workplace performance by 22.8%, making this a high-value feature for active job seekers and career transitioners.

## User Stories
- As a job seeker, I want to reflect on my application and interview experiences so that I can improve my performance over time
- As a career transitioner, I want to track my progress during my transition so that I stay motivated and focused on my goals
- As a professional, I want to document my daily learning and growth so that I can identify patterns and build career capital
- As a user developing new skills, I want to translate my past experiences into relevant stories so that I can communicate my value effectively
- As an active CareerOS user, I want my journal insights to automatically link to my Skills, Plans, and Jobs so that I can take concrete action on my reflections

## Core Requirements

### Functional Requirements
- Dedicated journaling page at `/dashboard/journal` with prominent sidebar navigation
- Five research-backed journal templates with fixed, visible prompts:
  1. **Daily Growth Log** - Track daily learning, wins, and development
  2. **Transition Progress Check-in** - Monitor career transition milestones
  3. **Career Capital Builder** - Document skills, relationships, and achievements
  4. **Experience Translation Journal** - Reframe past experiences for new contexts
  5. **Application & Interview Journal** - Debrief on job applications and interviews
- Rich text entry creation using TipTap editor (reuse existing implementation)
- Full CRUD operations: Create, Read, Update, Archive, Delete entries
- LinkedIn-style sidebar + preview layout (pattern from Jobs page)
- Explicit linking to Skills, Plans, and Jobs
- Auto-suggest recent jobs when "Application & Interview Journal" template is selected
- Action tracking system with buttons: "Add to Skills Tracker", "Create Milestone", "Mark as Action Taken"
- Stats display showing 22.8% research finding and personal progress metrics
- Filter entries by template type, date range, and linked resources
- Display recent journal entries on Skills and Plans pages (reverse integration)

### Non-Functional Requirements
- Performance: Journal list should load within 500ms for 100+ entries
- Responsive design: Mobile-friendly layout with collapsible sidebar
- Accessibility: WCAG 2.1 AA compliance for all interactive elements
- Data persistence: Auto-save drafts every 30 seconds
- Privacy: Journal entries are private and never shared without explicit user action

## Visual Design

### Layout Pattern
Follow existing CareerOS LinkedIn-style sidebar + preview pattern from `/dashboard/jobs/page.tsx`:
- Left sidebar (1/3 width): Journal entry list with filters
- Right panel (2/3 width): Entry preview/editor with actions
- Responsive breakpoints: Collapse sidebar on mobile, show full-screen editor

### Key UI Elements
- **Sidebar Navigation**: Add "Journal" icon (BookOpen) to main dashboard nav
- **Template Selection**: Card-based template selector when creating new entry
- **Entry List Item**: Template icon, title/date, content preview (first 100 chars), action-taken indicator
- **Entry Editor**: TipTap rich text editor with template prompts displayed at top
- **Stats Cards**: Display entry count, streak, weekly goal progress, 22.8% research callout
- **Action Buttons**: Prominent CTAs for "Add to Skills", "Create Milestone", "Mark Action Taken"
- **Filters**: Chip-based filters for template type, date range, linked resource type

### Template Icons
- Daily Growth Log: TrendingUp
- Transition Progress Check-in: Target
- Career Capital Builder: Award
- Experience Translation Journal: Lightbulb
- Application & Interview Journal: Briefcase

## Reusable Components

### Existing Code to Leverage
- **Rich Text Editor**: `src/components/ui/rich-text-editor.tsx` - TipTap implementation with toolbar
- **Sidebar + Preview Layout**: `src/app/dashboard/jobs/page.tsx` and `src/components/jobs/job-tracker.tsx` - Exact pattern to replicate
- **CRUD Patterns**: `convex/plans.ts`, `convex/skills.ts`, `convex/jobs.ts` - Follow same query/mutation structure
- **Stats Cards**: `src/components/ui/card.tsx`, `src/components/ui/progress.tsx` - Reuse for metrics display
- **Filters**: Job tracker advanced filters pattern - Collapsible filter section with chips
- **Database Schema Pattern**: Follow existing table definitions in `convex/schema.ts`

### New Components Required
- **JournalTemplateSelector**: Card-based template selection interface (no existing equivalent)
- **JournalEntryList**: Sidebar list with template icons and action indicators (extend job list pattern)
- **JournalEntryEditor**: Wrapper around TipTap with template prompts and linking controls
- **JournalStats**: Stats dashboard showing entry count, streak, weekly goal (new component)
- **JournalActionButtons**: Action button group for linking and conversion tracking (new component)
- **JournalTemplatePrompts**: Display fixed prompts for each template type (new component)

## Technical Approach

### Database Schema

Add `journalEntries` table to `convex/schema.ts`:

```typescript
journalEntries: defineTable({
  userId: v.id("users"),
  templateType: v.union(
    v.literal("daily-growth"),
    v.literal("transition-progress"),
    v.literal("career-capital"),
    v.literal("experience-translation"),
    v.literal("application-interview")
  ),
  title: v.string(), // User-provided or auto-generated from template
  content: v.string(), // Rich text HTML from TipTap
  createdAt: v.number(),
  updatedAt: v.number(),
  // Optional linking
  linkedSkillId: v.optional(v.id("skills")),
  linkedPlanId: v.optional(v.id("plans")),
  linkedJobId: v.optional(v.id("jobs")),
  // Action tracking for 50%+ conversion metric
  actionTaken: v.boolean(),
  actionType: v.optional(v.union(
    v.literal("skill-added"),
    v.literal("milestone-created"),
    v.literal("marked-complete")
  )),
  actionTimestamp: v.optional(v.number()),
  // Future AI features
  insights: v.array(v.string()), // For future AI-powered insight extraction
  archived: v.boolean(),
  metadata: v.optional(v.any()),
})
  .index("by_user_id", ["userId"])
  .index("by_template_type", ["templateType"])
  .index("by_created_at", ["createdAt"])
  .index("by_linked_skill", ["linkedSkillId"])
  .index("by_linked_plan", ["linkedPlanId"])
  .index("by_linked_job", ["linkedJobId"])
  .index("by_user_and_created", ["userId", "createdAt"])
  .index("by_action_taken", ["actionTaken"]),
```

### Convex Operations

Create `convex/journalEntries.ts` following patterns from `convex/plans.ts` and `convex/skills.ts`:

**Queries:**
- `getById(id)` - Get single entry
- `getByUserId(userId)` - Get all entries for user
- `getByTemplateType(userId, templateType)` - Filter by template
- `getRecent(userId, limit)` - Get N most recent entries
- `getLinkedToSkill(skillId)` - Get entries linked to skill (for Skills page integration)
- `getLinkedToPlan(planId)` - Get entries linked to plan (for Plans page integration)
- `getLinkedToJob(jobId)` - Get entries linked to job
- `getStats(userId)` - Get statistics: total count, streak, weekly count, action conversion rate

**Mutations:**
- `create(userId, templateType, title, content, ...links)` - Create new entry
- `update(id, updates)` - Update entry content and links
- `archive(id)` - Soft delete (set archived = true)
- `delete(id)` - Permanent delete
- `markActionTaken(id, actionType)` - Track conversion metric
- `linkToSkill(id, skillId)` - Link to Skills Tracker
- `linkToPlan(id, planId)` - Link to Career Planning
- `linkToJob(id, jobId)` - Link to Jobs Tracker

### Frontend Architecture

**New Page:**
- `src/app/dashboard/journal/page.tsx` - Main journal page with sidebar + preview layout

**New Components:**
- `src/components/journal/journal-template-selector.tsx` - Template selection cards
- `src/components/journal/journal-entry-list.tsx` - Sidebar list with filters
- `src/components/journal/journal-entry-editor.tsx` - Editor wrapper with prompts
- `src/components/journal/journal-entry-preview.tsx` - Read-only entry display
- `src/components/journal/journal-stats-dashboard.tsx` - Stats cards and metrics
- `src/components/journal/journal-action-buttons.tsx` - Action button group
- `src/components/journal/journal-template-prompts.tsx` - Template prompt display
- `src/components/journal/journal-link-selector.tsx` - Dropdown to link to Skills/Plans/Jobs

**Template Prompts (Fixed for MVP):**

1. **Daily Growth Log**
   - What did you learn today?
   - What went well?
   - What could be improved?
   - What action will you take tomorrow?

2. **Transition Progress Check-in**
   - What progress did you make toward your transition goal?
   - What obstacles did you encounter?
   - What support or resources do you need?
   - What's your focus for the next week?

3. **Career Capital Builder**
   - What new skill did you develop or practice?
   - What relationship did you strengthen?
   - What achievement can you quantify?
   - How can you leverage this in your career?

4. **Experience Translation Journal**
   - What past experience are you reflecting on?
   - What skills did this experience demonstrate?
   - How does this translate to your target role?
   - What story can you tell about this experience?

5. **Application & Interview Journal**
   - Which job/company is this about? (auto-suggest recent jobs)
   - What went well in the application/interview?
   - What could you improve next time?
   - What follow-up actions are needed?

### Integration Points

**Skills Tracker Integration:**
- Display recent journal entries linked to each skill on Skills detail view
- "Add to Skills Tracker" button creates new skill or links to existing skill
- Journal insights inform skill progress updates

**Career Planning Integration:**
- Display recent journal entries linked to each plan/milestone on Plans detail view
- "Create Milestone" button opens milestone creation modal pre-filled with journal context
- Journal helps track qualitative progress toward career goals

**Jobs Tracker Integration:**
- Auto-suggest recent jobs when creating "Application & Interview Journal" entry
- Display linked journal entries on Job detail view
- Enable performance tracking across multiple interviews

**Navigation:**
- Add "Journal" to main sidebar nav between "Plan" and existing pages
- Badge indicator showing unarchived entries count

## Action Tracking System

To measure "50%+ of journal insights lead to skill development actions" metric:

**User Flow:**
1. User creates journal entry with reflection
2. Journal entry displayed with three action buttons:
   - "Add to Skills Tracker" - Creates/links skill, sets `actionTaken = true`, `actionType = "skill-added"`
   - "Create Milestone" - Creates plan milestone, sets `actionTaken = true`, `actionType = "milestone-created"`
   - "Mark as Action Taken" - Manual confirmation, sets `actionTaken = true`, `actionType = "marked-complete"`
3. System tracks `actionTaken` boolean field
4. Stats dashboard displays: "X% of your journal entries led to action (goal: 50%)"

**Conversion Tracking:**
- Calculate daily: `(entries with actionTaken = true) / (total entries) * 100`
- Display on stats dashboard with progress bar
- Celebrate when user hits 50%+ milestone

## Stats & Progress Display

**Stats Dashboard (top of journal page):**
1. **Research Callout Card**: "Research shows structured journaling boosts workplace performance by 22.8%" with link to study
2. **Personal Stats Cards**:
   - Total Entries: "42 entries this month"
   - Current Streak: "7-day streak 🔥"
   - Weekly Goal: "4/3 entries this week" (green if met, yellow if close)
   - Action Conversion: "58% of entries led to action (goal: 50%)" with progress bar

**Growth Mindset Focus:**
- Celebrate streaks without being gimmicky (simple flame emoji)
- Show progress toward weekly goal (user can set goal, default 3/week)
- Emphasize action conversion as the ultimate success metric
- Avoid excessive gamification (no levels, points, or badges)

## Testing Strategy

**Unit Tests:**
- `convex/journalEntries.ts`: Test all queries and mutations
- Template prompt data structures
- Stats calculation functions (streak, action conversion)
- Link validation (prevent linking to non-existent Skills/Plans/Jobs)

**Component Tests:**
- `journal-template-selector.tsx`: Template selection flow
- `journal-entry-editor.tsx`: TipTap integration and auto-save
- `journal-stats-dashboard.tsx`: Stats display and calculations
- `journal-action-buttons.tsx`: Action button states and click handlers
- `journal-link-selector.tsx`: Linking to Skills/Plans/Jobs

**Integration Tests:**
- End-to-end journal creation with template selection
- Linking journal entry to skill and verifying reverse display
- Action tracking workflow (create entry → mark action taken → verify stats update)
- Filtering and searching entries
- Archive/delete workflows

**Success Metrics Tests:**
- Verify 40%+ engagement metric tracking (users journaling 3x/week)
- Verify 50%+ action conversion metric tracking
- Streak calculation accuracy
- Weekly goal progress calculation

## Success Criteria

**User Engagement (40%+ of active users journal 3x/week):**
- Track: `getUserJournalFrequency(userId, weekNumber)` query
- Calculate: Users with 3+ entries per week / Total active users
- Display: Analytics dashboard for product team

**Action Conversion (50%+ of journal insights lead to actions):**
- Track: `actionTaken` field on each entry
- Calculate: Entries with `actionTaken = true` / Total entries
- Display: User-facing stats dashboard on journal page

**Qualitative Success:**
- Users report feeling more organized and intentional about career development
- Users reference journal entries during interviews and networking
- Users create measurable action plans from journal reflections

**Performance Benchmarks:**
- Journal list loads in < 500ms for 100+ entries
- Entry creation and save completes in < 200ms
- Stats calculation completes in < 100ms

## Out of Scope

**Excluded from MVP (Future Phase 2.5+):**
- AI-powered insight generation and analysis
- AI-powered suggestions for skill updates based on journal content
- Template customization (prompts are fixed in MVP)
- Email or push notification reminders
- Complex dashboard widgets on main dashboard
- Sharing entries with mentors or coaches
- PDF export of journal entries
- Voice-to-text entry creation
- Mobile app for journaling
- Correlation analysis between journaling frequency and job search outcomes
- Advanced analytics and trend visualization
- Tagging system beyond template types
- Search across all entry content (MVP only filters by template/date/links)
- Collaborative journaling or peer feedback features
- Integration with external journaling apps
- Batch operations (bulk archive, bulk delete)

**Why These Are Out of Scope:**
- Keep MVP focused on core experience (M-sized, 1 week effort)
- Validate engagement and conversion metrics before adding complexity
- AI features require additional infrastructure and cost optimization
- Export and sharing require additional security considerations
- Mobile app is separate product roadmap item
