// Core vendor abstraction interfaces for CareerOS
// This allows easy switching between different providers

export interface DatabaseProvider {
  // User operations
  createUser(user: CreateUserInput): Promise<User>;
  getUserById(id: string): Promise<User | null>;
  getUserByClerkId(clerkUserId: string): Promise<User | null>;
  updateUser(id: string, updates: Partial<User>): Promise<User>;
  deleteUser(id: string): Promise<void>;

  // Resume operations
  createResume(resume: CreateResumeInput): Promise<Resume>;
  getResumeById(id: string): Promise<Resume | null>;
  getUserResumes(userId: string): Promise<Resume[]>;
  updateResume(id: string, updates: Partial<Resume>): Promise<Resume>;
  deleteResume(id: string): Promise<void>;

  // Job operations
  createJob(job: CreateJobInput): Promise<Job>;
  getJobById(id: string): Promise<Job | null>;
  getUserJobs(userId: string): Promise<Job[]>;
  updateJob(id: string, updates: Partial<Job>): Promise<Job>;
  deleteJob(id: string): Promise<void>;

  // Analysis operations
  createAnalysis(analysis: CreateAnalysisInput): Promise<Analysis>;
  getAnalysisById(id: string): Promise<Analysis | null>;
  getUserAnalyses(userId: string): Promise<Analysis[]>;
  updateAnalysis(id: string, updates: Partial<Analysis>): Promise<Analysis>;

  // Plan operations
  createPlan(plan: CreatePlanInput): Promise<Plan>;
  getPlanById(id: string): Promise<Plan | null>;
  getUserPlans(userId: string): Promise<Plan[]>;
  updatePlan(id: string, updates: Partial<Plan>): Promise<Plan>;
  deletePlan(id: string): Promise<void>;

  // Skills operations
  createSkill(skill: CreateSkillInput): Promise<Skill>;
  getSkillById(id: string): Promise<Skill | null>;
  getUserSkills(userId: string): Promise<Skill[]>;
  getUserSkillsByCategory(userId: string, category: string): Promise<Skill[]>;
  getUserSkillsByStatus(userId: string, status: Skill['status']): Promise<Skill[]>;
  updateSkill(id: string, updates: Partial<Skill>): Promise<Skill>;
  deleteSkill(id: string): Promise<void>;
  updateSkillProgress(id: string, progress: number, timeSpent?: number, status?: Skill['status']): Promise<Skill>;
  addSkillResource(id: string, resource: SkillResource): Promise<Skill>;
  updateResourceCompletion(id: string, resourceIndex: number, completed: boolean): Promise<Skill>;
}

export interface FileStorageProvider {
  uploadFile(file: File, path: string, userId: string): Promise<string>;
  downloadFile(path: string): Promise<Blob>;
  deleteFile(path: string): Promise<void>;
  getFileUrl(path: string): Promise<string>;
  listFiles(prefix: string): Promise<string[]>;
}

export interface AnalysisProvider {
  analyzeResume(resume: Resume, job: Job): Promise<AnalysisResult>;
  analyzeCareerTransition(currentRole: string, targetRole: string, experience?: string): Promise<CareerAnalysis>;
  parseResumeContent(content: string): Promise<{
    personalInfo: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      location: string;
      summary: string;
    };
    experience: Array<{
      title: string;
      company: string;
      location: string;
      startDate: string;
      endDate: string;
      current: boolean;
      description: string;
    }>;
    education: Array<{
      degree: string;
      institution: string;
      location: string;
      startDate: string;
      endDate: string;
      current: boolean;
      gpa?: string;
      description: string;
    }>;
    skills: Array<{
      name: string;
      level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    }>;
    projects: Array<{
      name: string;
      description: string;
      technologies: string[];
      url?: string;
      startDate: string;
      endDate: string;
      current: boolean;
    }>;
  }>;
  generateSkillsGap(resume: Resume, job: Job): Promise<SkillsGap>;
  provideRecommendations(analysis: AnalysisResult): Promise<Recommendation[]>;
  scoreResumeQuality(resume: Resume): Promise<ResumeQualityScore>;
  getResumeById(resumeId: string): Promise<Resume | null>;
  performAdvancedResumeAnalysis(resume: Resume): Promise<any>;
  
  // Caching and persistence methods
  getCachedAnalysisResult(resumeId: string, analysisType: 'basic' | 'advanced' | 'ai-powered'): Promise<any>;
  checkAnalysisCache(resumeId: string, analysisType: 'basic' | 'advanced' | 'ai-powered', contentHash: string): Promise<{ exists: boolean; analysis: any }>;
  saveAnalysisResult(resumeId: string, analysisType: 'basic' | 'advanced' | 'ai-powered', analysisResult: any, contentHash: string): Promise<void>;
  getAnalysisHistory(resumeId: string, analysisType?: 'basic' | 'advanced' | 'ai-powered'): Promise<any[]>;
  getAnalysisStats(resumeId: string): Promise<any>;
  calculateContentHash(resume: Resume): Promise<string>;
}

export interface RealTimeProvider {
  subscribeToUserData(userId: string, callback: (data: User) => void): () => void;
  subscribeToResumeUpdates(userId: string, callback: (resume: Resume) => void): () => void;
  subscribeToJobUpdates(userId: string, callback: (job: Job) => void): () => void;
  subscribeToAnalysisUpdates(userId: string, callback: (analysis: Analysis) => void): () => void;
}

export interface AuthProvider {
  getCurrentUser(): Promise<User | null>;
  signIn(email: string, password: string): Promise<User>;
  signUp(email: string, password: string, userData: Partial<User>): Promise<User>;
  signOut(): Promise<void>;
  isAuthenticated(): Promise<boolean>;
}

// Input types for database operations
export interface CreateUserInput {
  clerkUserId?: string; // Clerk user ID for authentication
  email: string;
  name: string;
  avatar?: string;
  metadata?: Record<string, unknown>;
}

export interface CreateResumeInput {
  userId: string;
  title: string;
  content: string;
  filePath?: string;
  metadata?: Record<string, unknown>;
}

export interface CreateJobInput {
  userId: string;
  title: string;
  company: string;
  description: string;
  requirements: string[];
  location?: string;
  salary?: string;
  status: 'saved' | 'applied' | 'interviewing' | 'offered' | 'rejected';
  metadata?: Record<string, unknown>;
}

export interface CreateAnalysisInput {
  userId: string;
  resumeId: string;
  jobId?: string;
  type: 'resume' | 'career' | 'skills';
  result: AnalysisResult;
  metadata?: Record<string, unknown>;
}

export interface CreatePlanInput {
  userId: string;
  title: string;
  description: string;
  goals: string[];
  timeline: number; // months
  milestones: Milestone[];
  status: 'draft' | 'active' | 'completed';
  metadata?: Record<string, unknown>;
}

// Core entity types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, unknown>;
}

export interface Resume {
  id: string;
  userId: string;
  title: string;
  content: string;
  filePath?: string;
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, unknown>;
}

export interface Job {
  id: string;
  userId: string;
  title: string;
  company: string;
  description: string;
  requirements: string[];
  location?: string;
  salary?: string;
  status: 'saved' | 'applied' | 'interviewing' | 'offered' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, unknown>;
}

export interface Analysis {
  id: string;
  userId: string;
  resumeId: string;
  jobId?: string;
  type: 'resume' | 'career' | 'skills';
  result: AnalysisResult;
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, unknown>;
}

export interface Plan {
  id: string;
  userId: string;
  title: string;
  description: string;
  goals: string[];
  timeline: number;
  milestones: Milestone[];
  status: 'draft' | 'active' | 'completed';
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, unknown>;
}

// Analysis result types
export interface AnalysisResult {
  matchScore: number;
  skillsMatch: SkillsMatch[];
  experienceMatch: ExperienceMatch;
  gaps: SkillsGap[];
  recommendations: Recommendation[];
  summary: string;
}

export interface SkillsMatch {
  skill: string;
  matchLevel: 'excellent' | 'good' | 'partial' | 'missing';
  confidence: number;
  relevance: number;
}

export interface ExperienceMatch {
  level: 'junior' | 'mid' | 'senior' | 'lead' | 'executive';
  confidence: number;
  yearsRequired: number;
  yearsActual: number;
}

export interface SkillsGap {
  skill: string;
  importance: 'high' | 'medium' | 'low';
  timeToLearn: number; // months
  resources: string[];
  priority: number;
}

export interface Recommendation {
  type: 'skill' | 'experience' | 'certification' | 'project';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'high' | 'medium' | 'low';
  timeline: number; // months
}

export interface CareerAnalysis {
  currentLevel: string;
  targetLevel: string;
  transitionPath: string[];
  timeToTarget: number; // months
  keyMilestones: Milestone[];
  risks: string[];
  opportunities: string[];
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  targetDate: Date;
  status: 'pending' | 'in-progress' | 'completed';
  dependencies: string[];
  effort: number; // hours
}

export interface SkillResource {
  name: string;
  type: 'course' | 'book' | 'video' | 'project' | 'mentorship';
  url?: string;
  estimatedHours: number;
  completed: boolean;
}

export interface Skill {
  id: string;
  userId: string;
  name: string;
  category: string;
  currentLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  targetLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  progress: number; // 0-100
  timeSpent: number; // hours
  estimatedTimeToTarget: number; // hours
  priority: 'low' | 'medium' | 'high';
  status: 'learning' | 'practicing' | 'mastered' | 'not-started';
  resources: SkillResource[];
  notes?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSkillInput {
  userId: string;
  name: string;
  category: string;
  currentLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  targetLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  progress: number;
  timeSpent: number;
  estimatedTimeToTarget: number;
  priority: 'low' | 'medium' | 'high';
  status: 'learning' | 'practicing' | 'mastered' | 'not-started';
  resources: SkillResource[];
  notes?: string;
  metadata?: Record<string, unknown>;
}

export interface ResumeQualityScore {
  overallScore: number; // 1-100
  scoreBreakdown: {
    contentQuality: number; // 25 points max
    structureFormat: number; // 20 points max
    keywordsOptimization: number; // 20 points max
    experienceSkills: number; // 20 points max
    careerNarrative: number; // 15 points max
  };
  strengths: string[];
  weaknesses: string[];
  improvementAreas: {
    content: string[];
    structure: string[];
    keywords: string[];
    experience: string[];
    narrative: string[];
  };
  recommendations: {
    priority: 'high' | 'medium' | 'low';
    category: 'content' | 'structure' | 'keywords' | 'experience' | 'narrative';
    title: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
  }[];
  coachingPrompt: boolean; // Whether to suggest coaching session
  industryBenchmark: {
    average: number;
    percentile: number; // User's percentile vs industry average
  };
}
