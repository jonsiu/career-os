// Database abstraction interface for vendor switching
export interface DatabaseProvider {
  // User operations
  createUser(userData: CreateUserData): Promise<string>;
  getUser(clerkId: string): Promise<User | null>;
  updateUser(userId: string, updates: Partial<User>): Promise<void>;
  
  // Resume operations
  createResume(resumeData: CreateResumeData): Promise<string>;
  getUserResumes(userId: string): Promise<Resume[]>;
  updateResume(resumeId: string, updates: Partial<Resume>): Promise<void>;
  deleteResume(resumeId: string): Promise<void>;
  
  // Job operations
  createJobPosting(jobData: CreateJobData): Promise<string>;
  getUserJobs(userId: string, filters?: JobFilters): Promise<JobPosting[]>;
  updateJobStatus(jobId: string, status: JobStatus): Promise<void>;
  deleteJob(jobId: string): Promise<void>;
  
  // Development plan operations
  createDevelopmentPlan(planData: CreatePlanData): Promise<string>;
  getUserPlans(userId: string): Promise<DevelopmentPlan[]>;
  updatePlanProgress(planId: string, progress: PlanProgress): Promise<void>;
  
  // Analysis operations
  createAnalysis(analysisData: CreateAnalysisData): Promise<string>;
  getAnalysis(analysisId: string): Promise<Analysis | null>;
  getUserAnalyses(userId: string): Promise<Analysis[]>;
}

// Data types
export interface CreateUserData {
  clerkId: string;
  email: string;
  name: string;
  currentRole: string;
  targetRole: string;
  experience: number;
  company?: string;
  location?: string;
  linkedinUrl?: string;
  githubUrl?: string;
}

export interface CreateResumeData {
  userId: string;
  name: string;
  personalInfo: PersonalInfo;
  experience: Experience[];
  skills: Skill[];
  education: Education[];
  projects: Project[];
  template: string;
}

export interface CreateJobData {
  userId: string;
  title: string;
  company: string;
  location: string;
  description: string;
  requirements: string[];
  skills: string[];
  experienceLevel: string;
  industry: string;
  jobType: string;
  companyUrl?: string;
  remotePolicy?: string;
  jobUrl?: string;
  salary?: SalaryInfo;
}

export interface CreatePlanData {
  userId: string;
  targetRole: string;
  targetCompany?: string;
  targetTimeline: number;
  skillsToDevelop: SkillDevelopment[];
  projectsToBuild: ProjectDevelopment[];
  milestones: Milestone[];
}

export interface CreateAnalysisData {
  userId: string;
  resumeId: string;
  jobId: string;
  matchPercentage: number;
  skillsMatch: SkillMatch[];
  experienceMatch: ExperienceMatch[];
  gaps: Gap[];
  recommendations: Recommendation[];
  insights: Insight[];
}

// Filter and query types
export interface JobFilters {
  status?: string;
  company?: string;
  query?: string;
  experienceLevel?: string;
  industry?: string;
}

export interface PlanProgress {
  skillsProgress: Record<string, number>;
  projectsProgress: Record<string, number>;
  milestonesCompleted: string[];
}

// Core data types (these would be shared across the application)
export interface User {
  id: string;
  clerkId: string;
  email: string;
  name: string;
  currentRole: string;
  targetRole: string;
  experience: number;
  company?: string;
  location?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  createdAt: number;
  updatedAt: number;
}

export interface Resume {
  id: string;
  userId: string;
  name: string;
  personalInfo: PersonalInfo;
  experience: Experience[];
  skills: Skill[];
  education: Education[];
  projects: Project[];
  template: string;
  isPublic: boolean;
  fileId?: string;
  createdAt: number;
  updatedAt: number;
}

export interface JobPosting {
  id: string;
  userId: string;
  title: string;
  company: string;
  companyUrl?: string;
  location: string;
  remotePolicy?: string;
  jobUrl?: string;
  description: string;
  requirements: string[];
  skills: string[];
  experienceLevel: string;
  salary?: SalaryInfo;
  industry: string;
  jobType: string;
  notes?: string;
  rating?: number;
  status: JobStatus;
  bookmarkedAt: number;
  createdAt: number;
  updatedAt: number;
}

export interface DevelopmentPlan {
  id: string;
  userId: string;
  targetRole: string;
  targetCompany?: string;
  targetTimeline: number;
  skillsToDevelop: SkillDevelopment[];
  projectsToBuild: ProjectDevelopment[];
  milestones: Milestone[];
  status: string;
  createdAt: number;
  updatedAt: number;
}

export interface Analysis {
  id: string;
  userId: string;
  resumeId: string;
  jobId: string;
  matchPercentage: number;
  skillsMatch: SkillMatch[];
  experienceMatch: ExperienceMatch[];
  gaps: Gap[];
  recommendations: Recommendation[];
  insights: Insight[];
  createdAt: number;
}

// Supporting types
export interface PersonalInfo {
  fullName: string;
  email: string;
  phone?: string;
  location?: string;
  summary?: string;
}

export interface Experience {
  id: string;
  title: string;
  company: string;
  location?: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description: string;
  achievements: string[];
  skills: string[];
}

export interface Skill {
  name: string;
  category: string;
  proficiency: number;
  yearsOfExperience: number;
}

export interface Education {
  id: string;
  degree: string;
  institution: string;
  field: string;
  graduationYear: number;
  gpa?: number;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  url?: string;
  githubUrl?: string;
  startDate: string;
  endDate?: string;
  achievements: string[];
}

export interface SalaryInfo {
  min: number;
  max: number;
  currency: string;
  period: string;
}

export type JobStatus = "interested" | "applied" | "interviewing" | "rejected" | "accepted";

export interface SkillDevelopment {
  skill: string;
  currentLevel: number;
  targetLevel: number;
  priority: string;
  developmentTime: number;
  resources: string[];
  progress: number;
}

export interface ProjectDevelopment {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  timeline: number;
  status: string;
  progress: number;
  url?: string;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  targetDate: number;
  completed: boolean;
  completedDate?: number;
}

export interface SkillMatch {
  skill: string;
  match: boolean;
  relevance: number;
}

export interface ExperienceMatch {
  experience: string;
  relevance: number;
  alignment: string;
}

export interface Gap {
  category: string;
  item: string;
  importance: string;
  impact: string;
}

export interface Recommendation {
  type: string;
  title: string;
  description: string;
  priority: string;
  effort: string;
  timeline: number;
}

export interface Insight {
  category: string;
  insight: string;
  actionable: boolean;
}
