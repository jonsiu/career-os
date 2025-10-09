# 🎯 CareerOS MVP Overview

## Project Summary
**CareerOS** is a career development platform that helps professionals prepare for management roles through intelligent resume analysis and personalized development planning.

## MVP Focus: Career Coach for Management Roles
The MVP will focus exclusively on the **Career Coach persona** for **management roles across industries**, providing personalized guidance to help users transition into leadership positions.

## Core Value Proposition
Transform your resume from good to exceptional through intelligent scoring and personalized coaching. Upload your resume, get an instant quality assessment, and work with our virtual HR coach to create a compelling, job-winning resume that gets you noticed by hiring managers.

## Target User
- **Primary**: Professionals (developers, engineers, designers, marketers, sales, etc.) looking to move into management
- **Secondary**: Current managers looking to advance to senior management
- **Industry Focus**: Multi-industry support (technology, healthcare, finance, marketing, etc.)

## Key Success Metrics
- User engagement with development plans
- Resume improvement tracking
- Job application success rate improvement
- User retention and plan completion rates

## MVP Scope Boundaries
### ✅ **In Scope**
- **Enhanced Job Parsing**: Robust LinkedIn job description extraction with raw HTML storage
- **Advanced Resume Scoring**: Research-backed 8-category scoring system with AI/API integration
- **User Onboarding Flow**: Resume upload → Job interests → Browser extension installation
- **Resume Analysis & Improvement**: Comprehensive scoring with detailed recommendations
- **Browser Extension Integration**: Enhanced authentication and job collection system
- **Progress Tracking**: Onboarding state management and user journey tracking
- **Resume Quality Assessment**: Technical, programmatic analysis with AI fallbacks
- **Job Description Analysis**: Enhanced parsing and requirement extraction
- **Career Development Tools**: Skill gap analysis and learning recommendations
- **Multi-vendor Architecture**: Vendor abstraction for database, AI, and storage services
- **Unit Testing**: Comprehensive test coverage for all scoring algorithms
- **Real-time Data Synchronization**: Seamless extension-to-app data flow
- **NEW**: LinkedIn-style Job Tracker Interface with sidebar + preview layout
- **NEW**: Job Categories System for organizing jobs by role/project
- **NEW**: Resume Manager UX Redesign with sidebar + preview layout
- **NEW**: Job Hunting Projects System for organizing resumes by role searches
- **NEW**: Resume Builder Single-Page Form with clickable section navigation
- **NEW**: Resume Versioning System for role-specific resume optimization
- **NEW**: Cover Letter Management System with AI-powered generation
- **NEW**: HTML Job Description Storage and Rich Text Editing
- **NEW**: Enhanced Browser Extension with improved data extraction

### ❌ **Out of Scope (Future Phases)**
- Other personas (HR Recruiter, Talent Manager, Hiring Manager)
- Multi-tenant architecture
- Subscription management
- Job posting bookmarking and analysis
- Development planning and tracking
- Interview preparation tools
- Networking features

## Technology Stack
- **Frontend**: Next.js 15 with App Router
- **Backend & Database**: Convex for real-time data and backend functions
- **Styling**: Tailwind CSS + shadcn/ui
- **Authentication**: Clerk
- **Deployment**: Vercel
- **File Storage**: Convex File Storage
- **State Management**: React hooks + Convex real-time subscriptions

## Development Timeline
- **Week 1-2**: Project setup and Convex integration
- **Week 3-4**: Resume management and file storage
- **Week 5-6**: Job Tracker UI redesign and data enhancement
- **Week 7-8**: Resume Manager UX redesign and job hunting projects
- **Week 9-10**: Resume versioning and cover letter system
- **Week 11-12**: Career Coach persona and development planning
- **Week 13-14**: Polish, testing, and deployment

## Success Criteria
1. Users can upload their resume and receive an instant quality score
2. Users can engage with virtual HR coach for general resume optimization
3. Users can input job descriptions for targeted optimization
4. Users can engage with job-specific virtual HR coach sessions
5. Users receive AI-generated resume improvements based on their responses
6. Users can validate and refine AI-generated content for accuracy
7. Users can identify skill gaps and receive personalized learning pathways
8. Users can access course recommendations with affiliate marketing integration
9. Users can track learning progress and validate skill development
10. Users can receive project recommendations to demonstrate new skills
11. The application significantly improves resume quality and job prospects
12. Real-time data synchronization works seamlessly across devices
13. **NEW**: Users can organize jobs by categories/projects (e.g., "Engineering Manager Search")
14. **NEW**: Users can view jobs in LinkedIn-style interface with sidebar + preview layout
15. **NEW**: Users can manage resumes in LinkedIn-style interface with sidebar + preview layout
16. **NEW**: Users can create and manage job hunting projects for organizing resumes by role searches
17. **NEW**: Users can edit resumes in single-page form with clickable section navigation
18. **NEW**: Users can create role-specific resume versions for different job categories
19. **NEW**: Users can create and manage cover letters with AI-powered generation
20. **NEW**: Job descriptions display with proper HTML formatting and rich text editing
21. **NEW**: Browser extension properly extracts all job fields including company, location, posted date
22. **NEW**: Resume cards show only relevant information (title, years of experience, industry, job hunting project)
23. **NEW**: Analysis is removed from resume cards and only available in dedicated report view
