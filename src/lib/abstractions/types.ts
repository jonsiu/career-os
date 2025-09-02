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
}

export interface FileStorageProvider {
  uploadFile(file: File, path: string, userId: string): Promise<string>;
  downloadFile(path: string): Promise<Blob>;
  deleteFile(path: string): Promise<void>;
  getFileUrl(path: string): Promise<string>;
  listFiles(prefix: string): Promise<string[]>;
}

export interface AnalysisProvider {
  analyzeResume(resume: Resume, job?: Job): Promise<AnalysisResult>;
  analyzeCareerTransition(user: User, targetRole: string): Promise<CareerAnalysis>;
  generateSkillsGap(resume: Resume, job: Job): Promise<SkillsGap>;
  provideRecommendations(analysis: AnalysisResult): Promise<Recommendation[]>;
}

export interface RealTimeProvider {
  subscribeToUserData(userId: string, callback: (data: any) => void): () => void;
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
  metadata?: Record<string, any>;
}

export interface CreateResumeInput {
  userId: string;
  title: string;
  content: string;
  filePath?: string;
  metadata?: Record<string, any>;
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
  metadata?: Record<string, any>;
}

export interface CreateAnalysisInput {
  userId: string;
  resumeId: string;
  jobId?: string;
  type: 'resume' | 'career' | 'skills';
  result: AnalysisResult;
  metadata?: Record<string, any>;
}

export interface CreatePlanInput {
  userId: string;
  title: string;
  description: string;
  goals: string[];
  timeline: number; // months
  milestones: Milestone[];
  status: 'draft' | 'active' | 'completed';
  metadata?: Record<string, any>;
}

// Core entity types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, any>;
}

export interface Resume {
  id: string;
  userId: string;
  title: string;
  content: string;
  filePath?: string;
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, any>;
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
  metadata?: Record<string, any>;
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
  metadata?: Record<string, any>;
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
  metadata?: Record<string, any>;
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
