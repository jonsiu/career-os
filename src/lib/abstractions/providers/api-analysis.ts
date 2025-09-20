import { AnalysisProvider, Resume, Job, AnalysisResult, CareerAnalysis, SkillsGap, Recommendation, ResumeQualityScore } from '../types';
import { AdvancedResumeAnalysis } from './advanced-resume-analysis';

export class APIAnalysisProvider implements AnalysisProvider {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  }

  private async makeAPICall(endpoint: string, data: any) {
    const response = await fetch(`${this.baseUrl}/api/analysis/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'API call failed');
    }

    return response.json();
  }

  private async makeAPIGetCall(endpoint: string, params: Record<string, string>) {
    const url = new URL(`${this.baseUrl}/api/analysis/${endpoint}`);
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'API call failed');
    }

    return response.json();
  }

  async analyzeResume(resume: Resume, job: Job): Promise<AnalysisResult> {
    // For now, delegate to basic analysis
    // In the future, this could be enhanced to use AI-powered analysis
    const qualityScore = await this.scoreResumeQuality(resume);
    
    // Convert ResumeQualityScore to AnalysisResult
    return {
      matchScore: qualityScore.overallScore,
      skillsMatch: [],
      experienceMatch: {
        level: 'mid',
        confidence: qualityScore.overallScore / 100,
        yearsRequired: 3
      },
      gaps: [],
      summary: `Resume scored ${qualityScore.overallScore}/100`,
      severity: qualityScore.overallScore < 70 ? 'high' : qualityScore.overallScore < 85 ? 'medium' : 'low'
    };
  }

  async analyzeCareerTransition(currentRole: string, targetRole: string, experience?: string): Promise<CareerAnalysis> {
    // This would need to be implemented as a separate API endpoint
    // For now, return a basic structure
    return {
      timeline: {
        estimated: 12,
        minimum: 6,
        maximum: 18,
        unit: 'months'
      },
      milestones: [],
      risks: [],
      opportunities: []
    };
  }

  async parseResumeContent(content: string): Promise<{
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
  }> {
    // This should delegate to the existing Convex parsing
    // since that's working well and is already server-side
    const { ConvexAnalysisProvider } = await import('./convex-analysis');
    const provider = new ConvexAnalysisProvider();
    return await provider.parseResumeContent(content);
  }

  async generateSkillsGap(resume: Resume, job: Job): Promise<SkillsGap> {
    // This would need to be implemented as a separate API endpoint
    return {
      skill: 'General',
      importance: 'medium',
      timeToLearn: 6,
      resources: [],
      priority: 5
    };
  }

  async provideRecommendations(analysis: AnalysisResult): Promise<Recommendation[]> {
    // This would need to be implemented as a separate API endpoint
    return [];
  }

  async scoreResumeQuality(resume: Resume): Promise<ResumeQualityScore> {
    try {
      const result = await this.makeAPICall('basic', { resumeId: resume.id });
      return result.data;
    } catch (error) {
      console.error('Basic analysis API call failed:', error);
      // Fallback to local rule-based analysis
      const { ConvexAnalysisProvider } = await import('./convex-analysis');
      const provider = new ConvexAnalysisProvider();
      return await provider.scoreResumeQuality(resume);
    }
  }

  async getResumeById(resumeId: string): Promise<Resume | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/resumes/${resumeId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get resume');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Get resume API call failed:', error);
      return null;
    }
  }

  async performAdvancedResumeAnalysis(resume: Resume): Promise<AdvancedResumeAnalysis> {
    try {
      const result = await this.makeAPICall('advanced', { resumeId: resume.id });
      return result.data;
    } catch (error) {
      console.error('Advanced analysis API call failed:', error);
      // Fallback to local advanced analysis
      const { ConvexAnalysisProvider } = await import('./convex-analysis');
      const provider = new ConvexAnalysisProvider();
      return await provider.performAdvancedResumeAnalysis(resume);
    }
  }

  async performAIPoweredAnalysis(resume: Resume): Promise<ResumeQualityScore> {
    try {
      const result = await this.makeAPICall('ai-powered', { resumeId: resume.id });
      return result.data;
    } catch (error) {
      console.error('AI-powered analysis API call failed:', error);
      throw error; // Don't fallback for AI analysis
    }
  }

  // Caching methods
  async getCachedAnalysisResult(resumeId: string, analysisType: 'basic' | 'advanced'): Promise<any> {
    try {
      const result = await this.makeAPIGetCall('cache', { 
        resumeId, 
        analysisType 
      });
      return result.data;
    } catch (error) {
      console.error('Get cached analysis API call failed:', error);
      return null;
    }
  }

  async checkAnalysisCache(resumeId: string, analysisType: 'basic' | 'advanced', contentHash: string): Promise<{ exists: boolean; analysis: any }> {
    try {
      const result = await this.makeAPICall('cache', {
        resumeId,
        analysisType,
        contentHash
      });
      return result.data;
    } catch (error) {
      console.error('Check analysis cache API call failed:', error);
      return { exists: false, analysis: null };
    }
  }

  async saveAnalysisResult(resumeId: string, analysisType: 'basic' | 'advanced', analysisResult: any, contentHash: string): Promise<void> {
    try {
      await this.makeAPICall('save', {
        resumeId,
        analysisType,
        analysisResult,
        contentHash
      });
    } catch (error) {
      console.error('Save analysis API call failed:', error);
      throw error;
    }
  }

  async getAnalysisHistory(resumeId: string, analysisType?: 'basic' | 'advanced'): Promise<any[]> {
    try {
      const params: Record<string, string> = { resumeId };
      if (analysisType) {
        params.analysisType = analysisType;
      }
      const result = await this.makeAPIGetCall('history', params);
      return result.data;
    } catch (error) {
      console.error('Get analysis history API call failed:', error);
      return [];
    }
  }

  async getAnalysisStats(resumeId: string): Promise<any> {
    try {
      const result = await this.makeAPIGetCall('stats', { resumeId });
      return result.data;
    } catch (error) {
      console.error('Get analysis stats API call failed:', error);
      return null;
    }
  }
}
