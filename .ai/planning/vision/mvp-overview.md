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
- **Week 5-6**: Job posting system and analysis engine
- **Week 7-8**: Career Coach persona and development planning
- **Week 9-10**: Polish, testing, and deployment

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
