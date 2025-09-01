## 🧠 Project Context

### Purpose
Build a multi-tenant saas application that helps users in creating and optimizing job-winning resumes

### Core Requirements

#### Multi-Tenant SaaS Architecture
- User management: Authentication, subscription tiers, workspace isolation
- Data architecture: Tenant-specific data separation
- Scalable infrastructure: Database, file storage, API design

### Target User Personas

The application simulates analysis from different stakeholder perspectives, providing unique insights from each persona:

#### 1. Career Coach Perspective
Analysis Focus:
- Career narrative and progression
- Skill development opportunities
- Long-term positioning

Key Questions:
- "What story does your resume tell about your career progression?"
- "How can we position your experience to align with your target role?"
- "What skills should you develop to be competitive?"

Resume Analysis:
- Story flow and narrative coherence
- Career progression logic
- Skill gap identification

Interview Preparation:
- "Tell me about yourself" narrative
- Career goal alignment
- Long-term development planning

#### 2. HR Recruiter Perspective
Analysis Focus:
- ATS compatibility
- Requirement matching
- Initial screening criteria

Key Questions:
- "Will this resume pass our ATS screening?"
- "Does the candidate meet our basic requirements?"
- "How does this candidate compare to our typical applicant pool?"

Resume Analysis:
- Keyword optimization
- Format compliance
- Requirement checklist verification

Interview Preparation:
- Basic qualification questions
- Salary expectations
- Availability and logistics

#### 3. Talent Manager Perspective
Analysis Focus:
- Competency assessment
- Performance indicators
- Growth potential

Key Questions:
- "Does this candidate have the right competencies for the role?"
- "How well can they demonstrate their impact and results?"
- "What's their potential for growth in this position?"

Resume Analysis:
- Quantified achievements
- Competency evidence
- Leadership examples

Interview Preparation:
- Behavioral questions (STAR method)
- Competency-based scenarios
- Growth and development potential

#### 4. Hiring Manager Perspective
Analysis Focus:
- Problem-solving ability
- Team fit
- Technical validation

Key Questions:
- "Can this person solve the specific problems I'm facing?"
- "Will they fit with my team and company culture?"
- "What questions should I ask to validate their experience?"

Resume Analysis:
- Problem-solving examples
- Relevant experience depth
- Cultural fit indicators

Interview Preparation:
- Technical deep-dives
- Situational problem-solving
- Team dynamics assessment

### Application Flow
1. User uploads resume and target job description(s)
2. Each persona performs unique analysis of the same resume/job combination
3. User receives four distinct feedback reports with specific recommendations
4. Guided improvement suggestions from each perspective
5. Interview preparation tailored to each persona's focus areas

### Features

#### Resume & Profile Management
- Multiple resume versions per user
- Resume templates and formatting options
- Skills tracking and proficiency levels
- Experience quantification tools
- Education and certification tracking

#### Resume Builder
Step-by-step form to collect: 
- Personal information
- Education history
- Work experience
- Skills
- Projects/achievements
- References

Features:
- Real-time preview of resume layout and formatting
- Local storage persistence for resume data
- Multi-step form interface with progress tracking
- Responsive design for all device sizes

#### Job Analysis & Matching
- Job posting collection and analysis
- Bulk job comparison capabilities
- Role-specific resume tailoring suggestions
- Industry trend analysis
- Skill demand forecasting

#### Job Description Analyzer
Allow users to: 
- Paste job descriptions
- Compare job requirements with resume content
- Highlight matching skills/experiences
- Identify gaps
- Calculate match rates for each experience section
- Generate overall resume-to-job match percentage

#### Interview Preparation
- Mock interview scenarios by persona
- Common question databases by role/industry
- STAR method story development
- Behavioral interview coaching
- Technical interview prep (role-dependent)

#### Learning & Development
- Skill gap identification
- Learning path recommendations
- Industry knowledge updates
- Networking strategy guidance
- Professional development tracking

#### Resume Optimization
Provide:
- Tailored recommendations for improving match rates
- Suggestions for keyword optimization
- Follow-up questions to extract more relevant experiences
- Real-time analysis of resume content against job requirements
- Actionable improvement suggestions based on analysis results

### Style Guide
- Implement proper error handling
- Write comprehensive documentation
- Include setup instructions
- Maintain backward compatibility


