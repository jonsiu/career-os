// Analysis engine abstraction interface for vendor switching
export interface AnalysisEngine {
  // Core analysis operations
  analyzeResumeJob(resume: Resume, job: JobPosting): Promise<AnalysisResult>;
  analyzeResume(resume: Resume): Promise<ResumeAnalysis>;
  analyzeJob(job: JobPosting): Promise<JobAnalysis>;
  
  // Skills analysis
  analyzeSkills(resumeSkills: Skill[], jobSkills: string[]): Promise<SkillsAnalysis>;
  suggestSkillImprovements(skills: Skill[], targetRole: string): Promise<SkillImprovement[]>;
  
  // Experience analysis
  analyzeExperience(resumeExperience: Experience[], jobRequirements: string[]): Promise<ExperienceAnalysis>;
  suggestExperienceGaps(experience: Experience[], targetRole: string): Promise<ExperienceGap[]>;
  
  // Development planning
  generateDevelopmentPlan(user: User, targetRole: string, analysis: AnalysisResult): Promise<DevelopmentPlan>;
  updateDevelopmentPlan(plan: DevelopmentPlan, progress: PlanProgress): Promise<DevelopmentPlan>;
  
  // Market insights
  getMarketInsights(role: string, location?: string): Promise<MarketInsights>;
  getSalaryInsights(role: string, location?: string, experience?: number): Promise<SalaryInsights>;
}

// Analysis result types
export interface AnalysisResult {
  matchPercentage: number;
  skillsMatch: SkillMatch[];
  experienceMatch: ExperienceMatch[];
  gaps: Gap[];
  recommendations: Recommendation[];
  insights: Insight[];
  confidence: number;
  analysisDate: number;
}

export interface ResumeAnalysis {
  resumeId: string;
  strengths: ResumeStrength[];
  weaknesses: ResumeWeakness[];
  suggestions: ResumeSuggestion[];
  overallScore: number;
  sections: ResumeSectionAnalysis[];
}

export interface JobAnalysis {
  jobId: string;
  requirements: JobRequirement[];
  skillDemand: SkillDemand[];
  experienceRequirements: ExperienceRequirement[];
  marketPosition: MarketPosition;
  difficulty: JobDifficulty;
}

// Skills analysis
export interface SkillsAnalysis {
  matchedSkills: MatchedSkill[];
  missingSkills: MissingSkill[];
  skillGaps: SkillGap[];
  overallMatch: number;
  prioritySkills: string[];
}

export interface MatchedSkill {
  skill: string;
  resumeLevel: number;
  jobRequirement: string;
  matchScore: number;
  relevance: number;
}

export interface MissingSkill {
  skill: string;
  importance: 'high' | 'medium' | 'low';
  impact: 'blocker' | 'significant' | 'minor';
  learningTime: number; // weeks
  resources: LearningResource[];
}

export interface SkillGap {
  skill: string;
  currentLevel: number;
  requiredLevel: number;
  gap: number;
  priority: 'high' | 'medium' | 'low';
}

export interface SkillImprovement {
  skill: string;
  currentLevel: number;
  targetLevel: number;
  improvementPlan: ImprovementStep[];
  timeline: number; // weeks
  resources: LearningResource[];
}

export interface ImprovementStep {
  step: string;
  description: string;
  duration: number; // weeks
  resources: LearningResource[];
  milestones: string[];
}

export interface LearningResource {
  type: 'course' | 'book' | 'project' | 'mentor' | 'certification' | 'practice';
  title: string;
  description: string;
  url?: string;
  cost?: number;
  duration?: number; // hours
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
}

// Experience analysis
export interface ExperienceAnalysis {
  relevantExperience: RelevantExperience[];
  missingExperience: MissingExperience[];
  experienceGaps: ExperienceGap[];
  overallRelevance: number;
}

export interface RelevantExperience {
  experience: Experience;
  relevance: number;
  alignment: 'strong' | 'moderate' | 'weak';
  keyAchievements: string[];
  transferableSkills: string[];
}

export interface MissingExperience {
  type: string;
  description: string;
  importance: 'high' | 'medium' | 'low';
  impact: 'blocker' | 'significant' | 'minor';
  alternatives: string[];
}

export interface ExperienceGap {
  category: string;
  description: string;
  currentLevel: number;
  requiredLevel: number;
  gap: number;
  suggestions: string[];
}

// Resume analysis
export interface ResumeStrength {
  category: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  evidence: string[];
}

export interface ResumeWeakness {
  category: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  suggestions: string[];
}

export interface ResumeSuggestion {
  type: 'content' | 'format' | 'structure' | 'keywords';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  effort: 'low' | 'medium' | 'high';
  impact: 'high' | 'medium' | 'low';
}

export interface ResumeSectionAnalysis {
  section: string;
  score: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
}

// Job analysis
export interface JobRequirement {
  category: string;
  requirements: string[];
  importance: 'required' | 'preferred' | 'nice-to-have';
  weight: number;
}

export interface SkillDemand {
  skill: string;
  demand: number; // 0-100
  growth: number; // -100 to 100
  marketValue: number;
  alternatives: string[];
}

export interface ExperienceRequirement {
  type: string;
  years: number;
  description: string;
  flexibility: 'strict' | 'moderate' | 'flexible';
}

export interface MarketPosition {
  demand: 'high' | 'medium' | 'low';
  competition: 'high' | 'medium' | 'low';
  growth: 'growing' | 'stable' | 'declining';
  salaryRange: SalaryRange;
}

export interface JobDifficulty {
  overall: 'easy' | 'moderate' | 'hard' | 'very-hard';
  factors: DifficultyFactor[];
  score: number; // 0-100
}

export interface DifficultyFactor {
  factor: string;
  difficulty: 'easy' | 'moderate' | 'hard';
  weight: number;
  description: string;
}

// Market insights
export interface MarketInsights {
  role: string;
  location?: string;
  demand: MarketDemand;
  trends: MarketTrend[];
  topSkills: TopSkill[];
  topCompanies: TopCompany[];
  salaryData: SalaryData;
  growthRate: number;
}

export interface MarketDemand {
  level: 'high' | 'medium' | 'low';
  score: number; // 0-100
  trend: 'growing' | 'stable' | 'declining';
  forecast: string;
}

export interface MarketTrend {
  trend: string;
  description: string;
  impact: 'positive' | 'negative' | 'neutral';
  confidence: number;
}

export interface TopSkill {
  skill: string;
  demand: number;
  growth: number;
  salaryImpact: number;
}

export interface TopCompany {
  company: string;
  hiring: boolean;
  reputation: number;
  salary: number;
}

export interface SalaryData {
  min: number;
  max: number;
  median: number;
  average: number;
  percentiles: Record<string, number>;
  currency: string;
  period: string;
}

export interface SalaryInsights {
  role: string;
  location?: string;
  experience?: number;
  salaryRange: SalaryRange;
  factors: SalaryFactor[];
  negotiationTips: string[];
  marketPosition: 'below' | 'at' | 'above';
}

export interface SalaryRange {
  min: number;
  max: number;
  median: number;
  currency: string;
  period: string;
}

export interface SalaryFactor {
  factor: string;
  impact: 'positive' | 'negative' | 'neutral';
  magnitude: number;
  description: string;
}

// Development planning
export interface DevelopmentPlan {
  id: string;
  userId: string;
  targetRole: string;
  targetCompany?: string;
  targetTimeline: number; // months
  skillsToDevelop: SkillDevelopment[];
  projectsToBuild: ProjectDevelopment[];
  milestones: Milestone[];
  status: 'active' | 'paused' | 'completed';
  progress: PlanProgress;
  createdAt: number;
  updatedAt: number;
}

export interface PlanProgress {
  overallProgress: number; // 0-100
  skillsProgress: Record<string, number>;
  projectsProgress: Record<string, number>;
  milestonesCompleted: string[];
  timeRemaining: number; // days
  onTrack: boolean;
}

// Error handling
export class AnalysisError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'AnalysisError';
  }
}

export class InsufficientDataError extends Error {
  constructor(
    message: string,
    public missingData: string[]
  ) {
    super(message);
    this.name = 'InsufficientDataError';
  }
}

// Configuration interface
export interface AnalysisEngineConfig {
  provider: 'openai' | 'anthropic' | 'google' | 'azure' | 'custom';
  model?: string;
  apiKey?: string;
  endpoint?: string;
  maxTokens?: number;
  temperature?: number;
  timeout?: number;
  retries?: number;
}

// Analysis quality metrics
export interface AnalysisQuality {
  confidence: number;
  dataQuality: number;
  completeness: number;
  accuracy: number;
  timeliness: number;
}

// Re-export types from database interface
export type {
  Resume,
  JobPosting,
  User,
  Skill,
  Experience,
  SkillMatch,
  ExperienceMatch,
  Gap,
  Recommendation,
  Insight,
  SkillDevelopment,
  ProjectDevelopment,
  Milestone
} from './database-interface';
