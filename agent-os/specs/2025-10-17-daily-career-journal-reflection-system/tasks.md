# Task Breakdown: Daily Career Journal & Reflection System

## Overview
Total Tasks: 34 tasks across 6 phases
Estimated Effort: 1 week (M-sized feature)
Assigned Roles: database-engineer, api-engineer, ui-designer, testing-engineer

## Task List

### Phase 1: Foundation Layer (Database Schema & Convex Operations)

#### Task Group 1: Database Schema & Core Operations
**Assigned implementer:** database-engineer
**Dependencies:** None
**Estimated Time:** 4-6 hours

- [ ] 1.0 Complete database foundation
  - [ ] 1.1 Write 2-8 focused tests for journalEntries operations
    - Test: Create entry with all template types
    - Test: Query by userId returns correct entries
    - Test: Query by templateType filters correctly
    - Test: Linking to skills/plans/jobs works
    - Test: Action tracking updates actionTaken field
    - Limit to critical CRUD and query behaviors only
  - [ ] 1.2 Add journalEntries table to convex/schema.ts
    - Fields: userId, templateType (union of 5 types), title, content (HTML string)
    - Optional linking: linkedSkillId, linkedPlanId, linkedJobId
    - Action tracking: actionTaken (boolean), actionType (union), actionTimestamp
    - Future AI: insights (array of strings)
    - Soft delete: archived (boolean)
    - Timestamps: createdAt, updatedAt
    - Add metadata field for flexibility
  - [ ] 1.3 Create indexes on journalEntries table
    - Index: by_user_id (userId)
    - Index: by_template_type (templateType)
    - Index: by_created_at (createdAt)
    - Index: by_linked_skill (linkedSkillId)
    - Index: by_linked_plan (linkedPlanId)
    - Index: by_linked_job (linkedJobId)
    - Index: by_user_and_created (userId, createdAt) - for chronological listing
    - Index: by_action_taken (actionTaken) - for conversion metric
  - [ ] 1.4 Create convex/journalEntries.ts with query operations
    - Implement: getById(id) - Get single entry
    - Implement: getByUserId(userId) - Get all entries for user
    - Implement: getByTemplateType(userId, templateType) - Filter by template
    - Implement: getRecent(userId, limit) - Get N most recent entries
    - Implement: getLinkedToSkill(skillId) - For Skills page integration
    - Implement: getLinkedToPlan(planId) - For Plans page integration
    - Implement: getLinkedToJob(jobId) - For job detail integration
    - Implement: getStats(userId) - Calculate total, streak, weekly count, action conversion
    - Follow pattern from convex/plans.ts and convex/skills.ts
  - [ ] 1.5 Add mutation operations to convex/journalEntries.ts
    - Implement: create(userId, templateType, title, content, links)
    - Implement: update(id, updates) - Update content and links
    - Implement: archive(id) - Soft delete (set archived = true)
    - Implement: remove(id) - Permanent delete
    - Implement: markActionTaken(id, actionType) - Track conversion metric
    - Implement: linkToSkill(id, skillId) - Link to Skills Tracker
    - Implement: linkToPlan(id, planId) - Link to Career Planning
    - Implement: linkToJob(id, jobId) - Link to Jobs Tracker
    - Add updatedAt timestamp on all updates
  - [ ] 1.6 Ensure database layer tests pass
    - Run ONLY the 2-8 tests written in 1.1
    - Verify all queries return expected results
    - Verify all mutations persist correctly
    - Do NOT run entire test suite at this stage

**Acceptance Criteria:**
- The 2-8 tests written in 1.1 pass
- journalEntries table created with all fields and indexes
- All queries and mutations implemented following existing patterns
- Stats calculation returns accurate metrics (streak, action conversion)

### Phase 2: Core Journaling UI (Templates, Entry Creation, Rich Text Editor)

#### Task Group 2: Template System & Entry Creation
**Assigned implementer:** ui-designer
**Dependencies:** Task Group 1
**Estimated Time:** 6-8 hours

- [ ] 2.0 Complete core journaling UI
  - [ ] 2.1 Write 2-8 focused tests for journal UI components
    - Test: Template selector displays all 5 templates with correct icons
    - Test: Template selection triggers entry creation
    - Test: Rich text editor renders and accepts input
    - Test: Template prompts display correctly for selected template
    - Test: Entry save calls correct Convex mutation
    - Limit to critical user interaction flows only
  - [ ] 2.2 Create template constants in src/lib/constants/journal-templates.ts
    - Define 5 template types: "daily-growth", "transition-progress", "career-capital", "experience-translation", "application-interview"
    - Define template metadata: name, description, icon (from lucide-react)
    - Define fixed prompts for each template (4 prompts per template from spec)
    - Export template icon mappings: TrendingUp, Target, Award, Lightbulb, Briefcase
    - Export helper function: getTemplateByType(type)
  - [ ] 2.3 Create src/components/journal/journal-template-selector.tsx
    - Card-based template selection interface (5 cards in grid)
    - Each card shows: template icon, name, description, prompt count
    - On click: trigger onTemplateSelect(templateType) callback
    - Responsive: 1 column mobile, 2 columns tablet, 3 columns desktop
    - Follow existing Card component pattern from src/components/ui/card.tsx
  - [ ] 2.4 Create src/components/journal/journal-template-prompts.tsx
    - Display fixed prompts for selected template type at top of editor
    - Collapsible section with chevron icon
    - Each prompt numbered and styled as list item
    - Reference template constants from journal-templates.ts
    - Prominent display: sticky at top of editor on scroll
  - [ ] 2.5 Create src/components/journal/journal-entry-editor.tsx
    - Wrapper around TipTap editor from src/components/ui/rich-text-editor.tsx
    - Props: templateType, initialContent, onSave, onCancel
    - Display JournalTemplatePrompts at top
    - Include title input field above editor
    - Auto-save draft every 30 seconds using debounce
    - Save button calls onSave with HTML content
    - Cancel button calls onCancel
  - [ ] 2.6 Create src/app/dashboard/journal/page.tsx main layout
    - Follow LinkedIn-style sidebar + preview pattern from src/app/dashboard/jobs/page.tsx
    - Left sidebar: Entry list placeholder (1/3 width)
    - Right panel: Template selector or editor (2/3 width)
    - Responsive: Collapse sidebar on mobile, show full-screen editor
    - State management: activeView ("template-select" | "editor" | "preview")
    - Import and use JournalTemplateSelector component
  - [ ] 2.7 Implement entry creation flow in journal page
    - Initial state: Show JournalTemplateSelector
    - On template select: Show JournalEntryEditor with selected template
    - On save: Call Convex create mutation, reset to template selector
    - On cancel: Return to template selector
    - Display success/error toasts using existing toast pattern
  - [ ] 2.8 Ensure journal UI tests pass
    - Run ONLY the 2-8 tests written in 2.1
    - Verify template selection and editor rendering work
    - Do NOT run entire test suite at this stage

**Acceptance Criteria:**
- The 2-8 tests written in 2.1 pass
- All 5 templates display with correct icons and prompts
- Rich text editor integrates correctly with TipTap
- Entry creation flow works end-to-end
- Auto-save works every 30 seconds

#### Task Group 3: Entry List & Preview
**Assigned implementer:** ui-designer
**Dependencies:** Task Group 2
**Estimated Time:** 4-6 hours

- [ ] 3.0 Complete entry list and preview UI
  - [ ] 3.1 Write 2-8 focused tests for entry list components
    - Test: Entry list displays entries sorted by createdAt descending
    - Test: Entry list item shows template icon, title, date, preview
    - Test: Entry click selects entry for preview
    - Test: Entry preview displays full content
    - Test: Filter by template type works
    - Limit to critical list behaviors only
  - [ ] 3.2 Create src/components/journal/journal-entry-list-item.tsx
    - Display: template icon, entry title, formatted date (e.g., "Oct 17, 2025")
    - Display: content preview (first 100 chars of HTML converted to plain text)
    - Display: action-taken indicator (checkmark icon if actionTaken = true)
    - Props: entry (JournalEntry), isSelected (boolean), onClick callback
    - Hover state: Highlight background on hover
    - Selected state: Blue border or background
  - [ ] 3.3 Create src/components/journal/journal-entry-list.tsx
    - Sidebar component with entry list
    - Header: "Your Journal" title, entry count badge, "New Entry" button
    - Use Convex useQuery to fetch getByUserId entries
    - Map entries to JournalEntryListItem components
    - Sort entries by createdAt descending (most recent first)
    - Loading state: Skeleton loaders
    - Empty state: "Start your first journal entry" with CTA
  - [ ] 3.4 Create src/components/journal/journal-entry-preview.tsx
    - Display selected entry in read-only mode
    - Show: template icon, title, formatted date, full content (rendered HTML)
    - Show: linked resources (Skills/Plans/Jobs) if present
    - Action buttons placeholder (will be filled in Task Group 4)
    - Edit button: Switch to editor mode
    - Archive button: Call archive mutation
    - Delete button: Confirmation modal then call remove mutation
  - [ ] 3.5 Integrate entry list into journal page.tsx
    - Replace placeholder sidebar with JournalEntryList
    - Add state: selectedEntryId (string | null)
    - On entry click: Set selectedEntryId, show JournalEntryPreview in right panel
    - On edit: Switch to JournalEntryEditor with entry data
    - On new entry: Show JournalTemplateSelector
    - Handle archive/delete: Refresh entry list after mutation
  - [ ] 3.6 Add basic filters to entry list
    - Filter by template type: Dropdown with all 5 template options + "All"
    - Filter by date range: Preset options (Last 7 days, Last 30 days, All time)
    - Use Convex getByTemplateType query when filter applied
    - Filter state managed in journal page.tsx
    - Clear filters button
  - [ ] 3.7 Ensure entry list tests pass
    - Run ONLY the 2-8 tests written in 3.1
    - Verify list displays and filters work correctly
    - Do NOT run entire test suite at this stage

**Acceptance Criteria:**
- The 2-8 tests written in 3.1 pass
- Entry list displays all user entries sorted by date
- Entry preview shows full content with edit/archive/delete actions
- Filters work correctly (template type, date range)
- Empty state and loading states display properly

### Phase 3: Integration Layer (Skills/Plans/Jobs Linking)

#### Task Group 4: Action Buttons & Linking System
**Assigned implementer:** api-engineer
**Dependencies:** Task Group 3
**Estimated Time:** 5-7 hours

- [ ] 4.0 Complete linking and action tracking
  - [ ] 4.1 Write 2-8 focused tests for linking functionality
    - Test: "Add to Skills Tracker" creates/links skill and sets actionTaken
    - Test: "Create Milestone" creates plan milestone and sets actionTaken
    - Test: "Mark as Action Taken" updates actionTaken field
    - Test: Link selector shows available Skills/Plans/Jobs
    - Test: Unlinking removes link but preserves entry
    - Limit to critical linking workflows only
  - [ ] 4.2 Create src/components/journal/journal-action-buttons.tsx
    - Three action buttons with icons:
      - "Add to Skills Tracker" (Plus icon) - Opens skill creation/selection modal
      - "Create Milestone" (Target icon) - Opens milestone creation modal
      - "Mark as Action Taken" (CheckCircle icon) - Directly marks actionTaken
    - Props: entryId, linkedSkillId, linkedPlanId, actionTaken (boolean)
    - Disable buttons if already linked/taken
    - On action: Call appropriate mutation, update entry state
    - Display success toast after action
  - [ ] 4.3 Create src/components/journal/journal-link-selector.tsx
    - Dropdown component to link to existing Skills/Plans/Jobs
    - Three sections: Skills, Plans, Jobs (with search/filter)
    - Use Convex queries to fetch user's skills, plans, jobs
    - On select: Call linkToSkill/linkToPlan/linkToJob mutation
    - Display currently linked items with "Unlink" button
    - Props: entryId, linkedSkillId, linkedPlanId, linkedJobId
  - [ ] 4.4 Implement "Add to Skills Tracker" action flow
    - Modal: Create new skill or select existing skill
    - If creating new skill: Pre-fill name from journal entry title/content
    - On submit: Create skill (or link existing), call markActionTaken mutation
    - Set actionType = "skill-added", actionTimestamp = now
    - Close modal, refresh entry preview
    - Reuse skill creation pattern from existing Skills Tracker
  - [ ] 4.5 Implement "Create Milestone" action flow
    - Modal: Create new plan milestone with journal context
    - Pre-fill milestone description with journal entry content summary
    - Select which plan to add milestone to (dropdown of user plans)
    - On submit: Update plan with new milestone, call markActionTaken mutation
    - Set actionType = "milestone-created", actionTimestamp = now
    - Close modal, refresh entry preview
  - [ ] 4.6 Implement "Mark as Action Taken" action
    - Simple confirmation: "Mark this journal entry as action taken?"
    - On confirm: Call markActionTaken mutation with actionType = "marked-complete"
    - Update UI to show checkmark indicator
    - No modal, just inline confirmation toast
  - [ ] 4.7 Integrate action buttons into journal-entry-preview.tsx
    - Display JournalActionButtons below entry content
    - Display JournalLinkSelector in collapsible section
    - Show linked resources with badges (e.g., "Linked to: JavaScript skill")
    - Update preview when actions are taken
  - [ ] 4.8 Ensure linking tests pass
    - Run ONLY the 2-8 tests written in 4.1
    - Verify all linking actions work correctly
    - Do NOT run entire test suite at this stage

**Acceptance Criteria:**
- The 2-8 tests written in 4.1 pass
- All three action buttons work correctly
- Skill creation/linking updates actionTaken field
- Milestone creation/linking updates actionTaken field
- Manual "Mark as Action Taken" updates actionTaken field
- Linked resources display correctly in preview

#### Task Group 5: Reverse Integration (Display Entries on Skills/Plans Pages)
**Assigned implementer:** ui-designer
**Dependencies:** Task Group 4
**Estimated Time:** 3-4 hours

- [ ] 5.0 Complete reverse integration
  - [ ] 5.1 Write 2-8 focused tests for reverse integration
    - Test: Skills page displays linked journal entries
    - Test: Plans page displays linked journal entries
    - Test: Clicking journal entry link navigates to journal page
    - Test: Empty state when no linked entries
    - Limit to critical integration display behaviors only
  - [ ] 5.2 Create src/components/journal/journal-entry-badge.tsx
    - Small badge component showing journal entry link
    - Display: template icon, entry title, date
    - Props: entryId, templateType, title, createdAt
    - On click: Navigate to /dashboard/journal?entryId={entryId}
    - Compact design for embedding in Skills/Plans pages
  - [ ] 5.3 Add journal entries section to Skills detail view
    - Location: Identify Skills detail component path
    - Use Convex getLinkedToSkill(skillId) query
    - Display section: "Related Journal Entries" with count badge
    - Map entries to JournalEntryBadge components
    - Collapsible section (collapsed by default)
    - Empty state: "No journal entries linked to this skill yet"
  - [ ] 5.4 Add journal entries section to Plans detail view
    - Location: Identify Plans detail component path
    - Use Convex getLinkedToPlan(planId) query
    - Display section: "Related Journal Entries" with count badge
    - Map entries to JournalEntryBadge components
    - Collapsible section (collapsed by default)
    - Empty state: "No journal entries linked to this plan yet"
  - [ ] 5.5 Implement deep linking from Skills/Plans to journal page
    - Update journal/page.tsx to accept ?entryId query param
    - On mount: If entryId provided, select and preview that entry
    - Scroll to entry in sidebar if needed
    - Highlight entry temporarily (fade in/out animation)
  - [ ] 5.6 Add "Application & Interview" auto-suggest for jobs
    - When "Application & Interview Journal" template selected
    - Display "Link to recent job" dropdown below template prompts
    - Use Convex query to fetch user's 10 most recent jobs
    - Auto-populate job link when selected
    - Optional: User can skip and add manually later
  - [ ] 5.7 Ensure reverse integration tests pass
    - Run ONLY the 2-8 tests written in 5.1
    - Verify linked entries display on Skills/Plans pages
    - Do NOT run entire test suite at this stage

**Acceptance Criteria:**
- The 2-8 tests written in 5.1 pass
- Linked journal entries display on Skills page
- Linked journal entries display on Plans page
- Deep linking works from Skills/Plans to journal entry
- Auto-suggest recent jobs for Application & Interview template

### Phase 4: Stats & Progress (Dashboard, Streak Tracking, Weekly Goals)

#### Task Group 6: Stats Dashboard & Progress Metrics
**Assigned implementer:** api-engineer
**Dependencies:** Task Group 5
**Estimated Time:** 4-5 hours

- [ ] 6.0 Complete stats and progress tracking
  - [ ] 6.1 Write 2-8 focused tests for stats functionality
    - Test: getStats query calculates total entries correctly
    - Test: Streak calculation returns accurate day count
    - Test: Weekly count returns entries in last 7 days
    - Test: Action conversion calculates percentage correctly
    - Test: Stats dashboard displays all metrics
    - Limit to critical stats calculation behaviors only
  - [ ] 6.2 Implement streak calculation in getStats query
    - Algorithm: Count consecutive days with at least one entry
    - Start from today, go backwards until gap found
    - Return: currentStreak (number of days)
    - Edge cases: Handle timezone differences, no entries yet
    - Reference: Common streak calculation patterns
  - [ ] 6.3 Implement weekly goal tracking in getStats query
    - Calculate: Count entries in last 7 days
    - Default goal: 3 entries per week (hardcoded for MVP)
    - Return: weeklyCount (number), weeklyGoal (3), goalMet (boolean)
    - Future: Allow user to customize weekly goal
  - [ ] 6.4 Implement action conversion metric in getStats query
    - Calculate: (entries with actionTaken = true) / (total entries) * 100
    - Return: actionConversionRate (number 0-100), actionCount (number)
    - Handle edge case: 0 entries returns 0% (not NaN)
    - This is the critical 50%+ success metric from requirements
  - [ ] 6.5 Create src/components/journal/journal-stats-dashboard.tsx
    - Four stats cards in grid layout (2x2 on desktop, 1x4 on mobile)
    - Card 1: Research callout - "Structured journaling boosts performance by 22.8%"
    - Card 2: Total entries - "42 entries this month" with trend icon
    - Card 3: Current streak - "7-day streak 🔥" with flame emoji only if streak > 0
    - Card 4: Weekly goal - "4/3 entries this week" with progress bar (green if met)
    - Card 5: Action conversion - "58% led to action (goal: 50%)" with progress bar
    - Use existing Card component from src/components/ui/card.tsx
    - Use Progress component from src/components/ui/progress.tsx
  - [ ] 6.6 Integrate stats dashboard into journal page.tsx
    - Display JournalStatsDashboard at top of page (above sidebar + preview)
    - Use Convex useQuery to fetch getStats(userId)
    - Loading state: Skeleton loaders for stats cards
    - Refresh stats when new entry created or action taken
    - Collapsible on mobile to save space
  - [ ] 6.7 Add celebration UI for milestones
    - If action conversion >= 50%: Show success badge on stats card
    - If streak >= 7: Show "Week Streak!" badge
    - If weekly goal met: Show green checkmark
    - Subtle animations (no confetti, keep professional)
    - Growth mindset focus: Emphasize progress over perfection
  - [ ] 6.8 Ensure stats tests pass
    - Run ONLY the 2-8 tests written in 6.1
    - Verify all calculations are accurate
    - Do NOT run entire test suite at this stage

**Acceptance Criteria:**
- The 2-8 tests written in 6.1 pass
- Streak calculation works correctly
- Weekly goal tracking shows accurate count
- Action conversion displays correct percentage
- Stats dashboard displays all metrics with proper formatting
- Celebration UI shows for milestones

### Phase 5: Navigation & Polish

#### Task Group 7: Navigation & User Experience
**Assigned implementer:** ui-designer
**Dependencies:** Task Group 6
**Estimated Time:** 2-3 hours

- [ ] 7.0 Complete navigation and UX polish
  - [ ] 7.1 Write 2-8 focused tests for navigation
    - Test: "Journal" nav link navigates to /dashboard/journal
    - Test: Badge shows unarchived entry count
    - Test: Mobile sidebar collapses correctly
    - Test: Keyboard navigation works for entry list
    - Limit to critical navigation behaviors only
  - [ ] 7.2 Add "Journal" to main dashboard navigation
    - Location: src/components/layout/main-nav.tsx (or equivalent nav component)
    - Position: Between "Plan" and next nav item (as specified in spec)
    - Icon: BookOpen from lucide-react
    - Label: "Journal"
    - Active state: Highlight when on /dashboard/journal
  - [ ] 7.3 Add entry count badge to navigation
    - Display: Number of unarchived entries (or "New" if > 0 entries this week)
    - Query: Count from getByUserId where archived = false
    - Style: Small blue badge similar to notification badges
    - Update: Real-time when entries created/archived
  - [ ] 7.4 Implement responsive mobile layout
    - Mobile (<768px): Hide sidebar by default, show hamburger menu
    - Hamburger toggle: Slide-in sidebar overlay
    - Entry selected: Hide sidebar, show full-screen preview/editor
    - Back button: Return to entry list
    - Test on mobile breakpoints: 320px, 375px, 414px
  - [ ] 7.5 Add keyboard shortcuts for power users
    - "N" - New entry (show template selector)
    - "E" - Edit selected entry
    - "/" - Focus search/filter
    - Esc - Cancel editor, return to list
    - Arrow up/down - Navigate entry list
    - Display shortcuts in help tooltip
  - [ ] 7.6 Implement accessibility improvements
    - All interactive elements keyboard accessible (tab navigation)
    - ARIA labels for icons and buttons
    - Screen reader announcements for state changes
    - Focus indicators on all interactive elements
    - Skip to content link for keyboard users
    - WCAG 2.1 AA compliance
  - [ ] 7.7 Ensure navigation tests pass
    - Run ONLY the 2-8 tests written in 7.1
    - Verify navigation works correctly
    - Do NOT run entire test suite at this stage

**Acceptance Criteria:**
- The 2-8 tests written in 7.1 pass
- "Journal" navigation link displays correctly
- Badge shows accurate entry count
- Responsive mobile layout works on all breakpoints
- Keyboard shortcuts functional
- Accessibility standards met

### Phase 6: Testing & Validation

#### Task Group 8: Comprehensive Testing & Success Metrics Validation
**Assigned implementer:** testing-engineer
**Dependencies:** Task Groups 1-7
**Estimated Time:** 4-6 hours

- [ ] 8.0 Review tests and validate feature completion
  - [ ] 8.1 Review existing tests from Task Groups 1-7
    - Review database layer tests (2-8 tests from Task 1.1)
    - Review core UI tests (2-8 tests from Task 2.1)
    - Review entry list tests (2-8 tests from Task 3.1)
    - Review linking tests (2-8 tests from Task 4.1)
    - Review integration tests (2-8 tests from Task 5.1)
    - Review stats tests (2-8 tests from Task 6.1)
    - Review navigation tests (2-8 tests from Task 7.1)
    - Total existing tests: approximately 14-56 tests
  - [ ] 8.2 Analyze test coverage gaps for journal feature ONLY
    - Identify critical end-to-end workflows lacking coverage:
      - Full entry creation flow (template → editor → save → preview)
      - Action tracking workflow (create entry → mark action → verify stats)
      - Linking workflow (create entry → link to skill → verify reverse display)
      - Filter and search workflows
    - Focus ONLY on gaps related to journal feature requirements
    - Do NOT assess entire application test coverage
    - Prioritize user-facing workflows over internal implementation
  - [ ] 8.3 Write up to 10 additional strategic tests maximum
    - Integration test: End-to-end entry creation with all steps
    - Integration test: Action tracking updates conversion metric correctly
    - Integration test: Linking to skill shows on Skills page
    - Integration test: Archive/delete workflows preserve data integrity
    - Integration test: Stats refresh after entry creation/action
    - E2E test: Template selection → entry creation → link to skill → verify stats
    - E2E test: Filter by template type shows correct entries
    - E2E test: Mobile responsive layout works correctly
    - Skip: Edge cases, performance tests unless business-critical
    - Do NOT write exhaustive coverage
  - [ ] 8.4 Validate success metrics tracking
    - Verify: 40%+ engagement metric tracking (users journaling 3x/week)
    - Test: getUserJournalFrequency calculation (if implemented)
    - Verify: 50%+ action conversion metric tracking
    - Test: Action conversion percentage calculation accuracy
    - Test: Streak calculation edge cases (timezone, no entries)
    - Test: Weekly goal progress accuracy
    - Ensure all metrics match requirements from spec
  - [ ] 8.5 Test integration points with existing features
    - Test: Skills page displays linked journal entries correctly
    - Test: Plans page displays linked journal entries correctly
    - Test: Deep linking from Skills/Plans to journal works
    - Test: Auto-suggest jobs for Application & Interview template
    - Test: Navigation badge updates in real-time
    - Verify bidirectional integration works both ways
  - [ ] 8.6 Run feature-specific tests only
    - Run ONLY tests related to journal feature (Tasks 1.1 through 7.1 + 8.3)
    - Expected total: approximately 24-66 tests maximum
    - Do NOT run entire application test suite
    - Verify all critical workflows pass
    - Generate coverage report for journal feature only
  - [ ] 8.7 Manual testing checklist
    - Test all 5 template types create entries correctly
    - Test rich text editor formatting (bold, italic, lists, links)
    - Test auto-save works every 30 seconds
    - Test filters work correctly (template, date range)
    - Test all three action buttons trigger correct behaviors
    - Test linking to Skills/Plans/Jobs works
    - Test stats display shows accurate metrics
    - Test mobile responsive layout on real device
    - Test keyboard shortcuts work
    - Test accessibility with screen reader
  - [ ] 8.8 Performance validation
    - Test: Journal list loads in < 500ms for 100+ entries
    - Test: Entry creation completes in < 200ms
    - Test: Stats calculation completes in < 100ms
    - Test: No memory leaks in editor during long sessions
    - Use browser DevTools to measure performance
    - Profile Convex query performance if needed

**Acceptance Criteria:**
- All feature-specific tests pass (approximately 24-66 tests total)
- Critical user workflows covered by tests
- No more than 10 additional tests added by testing-engineer
- Success metrics (40% engagement, 50% conversion) are trackable
- Integration with Skills/Plans/Jobs works bidirectionally
- Performance benchmarks met (500ms, 200ms, 100ms)
- Manual testing checklist completed

## Execution Order

Recommended implementation sequence:
1. **Phase 1: Foundation Layer** (Task Group 1) - 4-6 hours
   - Database schema and Convex operations
   - Enables all subsequent work

2. **Phase 2: Core Journaling UI** (Task Groups 2-3) - 10-14 hours
   - Template system and entry creation
   - Entry list and preview
   - Core user experience foundation

3. **Phase 3: Integration Layer** (Task Groups 4-5) - 8-11 hours
   - Action buttons and linking system
   - Reverse integration with Skills/Plans
   - Critical for success metrics

4. **Phase 4: Stats & Progress** (Task Group 6) - 4-5 hours
   - Stats dashboard and metrics
   - Streak tracking and weekly goals
   - Success metric validation

5. **Phase 5: Navigation & Polish** (Task Group 7) - 2-3 hours
   - Navigation integration
   - Responsive design
   - Accessibility

6. **Phase 6: Testing & Validation** (Task Group 8) - 4-6 hours
   - Comprehensive testing
   - Success metrics validation
   - Performance validation

**Total Estimated Time: 32-45 hours (4-5.5 days of focused work)**

This fits within the 1-week (M-sized) timeline with buffer for code review, bug fixes, and documentation.

## Notes

**Reusable Components:**
- TipTap editor: `src/components/ui/rich-text-editor.tsx`
- Sidebar + preview layout: `src/app/dashboard/jobs/page.tsx`
- Card components: `src/components/ui/card.tsx`
- Progress bars: `src/components/ui/progress.tsx`

**Backend Patterns:**
- CRUD operations: `convex/plans.ts`, `convex/skills.ts`, `convex/jobs.ts`
- Schema definitions: `convex/schema.ts`
- Query/mutation structure: Follow existing Convex patterns

**Success Metrics Focus:**
- 40%+ users journal 3x/week (track via weekly count in stats)
- 50%+ insights lead to actions (track via actionTaken field)
- Performance benchmarks: 500ms list load, 200ms save, 100ms stats calc

**Out of Scope (Do NOT Implement):**
- AI-powered insights or suggestions
- Custom template prompts (fixed in MVP)
- Email/notification reminders
- PDF export
- Sharing with mentors
- Voice-to-text
- Mobile app
- Advanced analytics
