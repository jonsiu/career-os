import { AnalysisProvider, Resume, Job, AnalysisResult, CareerAnalysis, SkillsGap, Recommendation, ResumeQualityScore } from '../types';
import { AdvancedResumeAnalysis, AdvancedResumeAnalyzer } from './advanced-resume-analysis';
import { ExperienceAnalyzer } from './experience-analyzer';

export class APIAnalysisProvider implements AnalysisProvider {
  private baseUrl: string;
  private experienceAnalyzer: ExperienceAnalyzer;
  private advancedAnalyzer: AdvancedResumeAnalyzer;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    this.experienceAnalyzer = new ExperienceAnalyzer();
    this.advancedAnalyzer = new AdvancedResumeAnalyzer();
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
    try {
      // Use sophisticated experience analysis based on academic research
      const experienceMatch = this.experienceAnalyzer.matchExperience(resume, job);
      const skillsMatch = this.experienceAnalyzer.generateSkillsMatch(resume, job);
      const gaps = this.experienceAnalyzer.generateSkillsGaps(resume, job);
      
      // Create initial analysis result
      const analysisResult: AnalysisResult = {
        matchScore: 0, // Will be calculated below
        skillsMatch,
        experienceMatch,
        gaps,
        recommendations: [],
        summary: ''
      };
      
      // Generate recommendations based on the analysis
      analysisResult.recommendations = this.experienceAnalyzer.generateRecommendations(resume, job, analysisResult);
      
      // Calculate overall match score based on multiple factors
      analysisResult.matchScore = this.calculateOverallMatchScore(analysisResult);
      
      // Generate summary
      analysisResult.summary = this.generateAnalysisSummary(analysisResult, experienceMatch);
      
      return analysisResult;
    } catch (error) {
      console.error('Sophisticated analysis failed, falling back to basic analysis:', error);
      
      // Fallback to basic analysis if sophisticated analysis fails
      const qualityScore = await this.scoreResumeQuality(resume);
      
      return {
        matchScore: qualityScore.overallScore,
        skillsMatch: [],
        experienceMatch: {
          level: 'mid',
          confidence: qualityScore.overallScore / 100,
          yearsRequired: 3,
          yearsActual: 2
        },
        gaps: [],
        recommendations: [],
        summary: `Resume scored ${qualityScore.overallScore}/100 (basic analysis)`
      };
    }
  }

  async analyzeCareerTransition(currentRole: string, targetRole: string, experience?: string): Promise<CareerAnalysis> {
    // This would need to be implemented as a separate API endpoint
    // For now, return a basic structure
    return {
      currentLevel: currentRole,
      targetLevel: targetRole,
      transitionPath: [],
      timeToTarget: 12,
      keyMilestones: [],
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

  // NEW: Advanced resume analysis method for comprehensive analysis
  async performAdvancedResumeAnalysis(resume: Resume): Promise<AdvancedResumeAnalysis> {
    try {
      console.log('🎯 APIAnalysisProvider: Starting advanced resume analysis...');
      
      // Use the advanced resume analyzer for comprehensive analysis
      const advancedAnalysis = await this.advancedAnalyzer.analyzeResume(resume);
      
      console.log('✅ APIAnalysisProvider: Advanced analysis completed with score:', advancedAnalysis.overallScore);
      return advancedAnalysis;
      
    } catch (error) {
      console.error('Advanced analysis failed:', error);
      throw new Error(`Advanced resume analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async scoreResumeQuality(resume: Resume): Promise<ResumeQualityScore> {
    try {
      console.log('🎯 APIAnalysisProvider: Starting advanced resume quality scoring...');
      
      // Use the advanced resume analyzer for comprehensive scoring
      const advancedAnalysis = await this.advancedAnalyzer.analyzeResume(resume);
      
      // Convert advanced analysis to ResumeQualityScore format
      const qualityScore: ResumeQualityScore = {
        overallScore: Math.round(advancedAnalysis.overallScore),
        scoreBreakdown: {
          contentQuality: Math.round(advancedAnalysis.categoryScores.contentQuality.score),
          structureFormat: Math.round(advancedAnalysis.categoryScores.structuralIntegrity.score),
          keywordsOptimization: Math.round(advancedAnalysis.categoryScores.atsOptimization.score),
          experienceSkills: Math.round(advancedAnalysis.categoryScores.experienceDepth.score),
          careerNarrative: Math.round(advancedAnalysis.categoryScores.careerProgression.score)
        },
        strengths: advancedAnalysis.detailedInsights.strengths,
        weaknesses: advancedAnalysis.detailedInsights.weaknesses,
        improvementAreas: {
          content: advancedAnalysis.detailedInsights.contentImprovements,
          structure: advancedAnalysis.detailedInsights.structureImprovements,
          keywords: advancedAnalysis.detailedInsights.keywordImprovements,
          experience: advancedAnalysis.detailedInsights.experienceImprovements,
          narrative: advancedAnalysis.detailedInsights.narrativeImprovements
        },
        recommendations: advancedAnalysis.recommendations.map(rec => ({
          priority: rec.priority as 'high' | 'medium' | 'low',
          category: rec.category as 'content' | 'structure' | 'keywords' | 'experience' | 'narrative',
          title: rec.title,
          description: rec.description,
          impact: rec.impact as 'high' | 'medium' | 'low'
        })),
        coachingPrompt: advancedAnalysis.overallScore < 70,
        industryBenchmark: {
          average: advancedAnalysis.benchmarking.industryAverage,
          percentile: advancedAnalysis.benchmarking.percentile
        }
      };
      
      console.log('✅ APIAnalysisProvider: Advanced scoring completed with score:', qualityScore.overallScore);
      return qualityScore;
      
    } catch (error) {
      console.error('Advanced analysis failed, falling back to API call:', error);
      
      try {
        const result = await this.makeAPICall('basic', { resumeId: resume.id });
        return result.data;
      } catch (apiError) {
        console.error('Basic analysis API call failed:', apiError);
        // Final fallback to local rule-based analysis
        const { ConvexAnalysisProvider } = await import('./convex-analysis');
        const provider = new ConvexAnalysisProvider();
        return await provider.scoreResumeQuality(resume);
      }
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
  async getCachedAnalysisResult(resumeId: string, analysisType: 'basic' | 'advanced' | 'ai-powered'): Promise<any> {
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

  async checkAnalysisCache(resumeId: string, analysisType: 'basic' | 'advanced' | 'ai-powered', contentHash: string): Promise<{ exists: boolean; analysis: any }> {
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

  async saveAnalysisResult(resumeId: string, analysisType: 'basic' | 'advanced' | 'ai-powered', analysisResult: any, contentHash: string): Promise<void> {
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

  async getAnalysisHistory(resumeId: string, analysisType?: 'basic' | 'advanced' | 'ai-powered'): Promise<any[]> {
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

  async calculateContentHash(resume: Resume): Promise<string> {
    const { generateContentHash } = await import('../../utils/content-hash');
    return await generateContentHash(resume);
  }

  /**
   * Calculate overall match score based on multiple factors
   * Based on research showing that multi-factor analysis is more predictive
   */
  private calculateOverallMatchScore(analysis: AnalysisResult): number {
    let totalScore = 0;
    let weightSum = 0;

    // Experience match weight: 30%
    const experienceWeight = 0.3;
    const experienceScore = analysis.experienceMatch.confidence * 100;
    totalScore += experienceScore * experienceWeight;
    weightSum += experienceWeight;

    // Skills match weight: 40%
    const skillsWeight = 0.4;
    const skillsScore = this.calculateSkillsMatchScore(analysis.skillsMatch);
    totalScore += skillsScore * skillsWeight;
    weightSum += skillsWeight;

    // Gaps penalty weight: 20%
    const gapsWeight = 0.2;
    const gapsScore = Math.max(0, 100 - (analysis.gaps.length * 10));
    totalScore += gapsScore * gapsWeight;
    weightSum += gapsWeight;

    // Recommendations weight: 10%
    const recommendationsWeight = 0.1;
    const recommendationsScore = Math.max(0, 100 - (analysis.recommendations.length * 5));
    totalScore += recommendationsScore * recommendationsWeight;
    weightSum += recommendationsWeight;

    return Math.round(totalScore / weightSum);
  }

  /**
   * Calculate skills match score based on skill relevance and match levels
   */
  private calculateSkillsMatchScore(skillsMatch: import('../types').SkillsMatch[]): number {
    if (skillsMatch.length === 0) return 50; // Neutral score for no skills data

    let totalScore = 0;
    let totalWeight = 0;

    for (const skill of skillsMatch) {
      const matchScore = this.getMatchLevelScore(skill.matchLevel);
      const weight = skill.relevance; // Use relevance as weight
      
      totalScore += matchScore * weight;
      totalWeight += weight;
    }

    return totalWeight > 0 ? (totalScore / totalWeight) * 100 : 50;
  }

  /**
   * Convert match level to numeric score
   */
  private getMatchLevelScore(level: 'excellent' | 'good' | 'partial' | 'missing'): number {
    const scores = {
      excellent: 100,
      good: 80,
      partial: 60,
      missing: 0
    };
    return scores[level];
  }

  /**
   * Generate analysis summary based on research findings
   */
  private generateAnalysisSummary(analysis: AnalysisResult, experienceMatch: any): string {
    const matchScore = analysis.matchScore;
    const experienceLevel = experienceMatch.level;
    const yearsActual = experienceMatch.yearsActual;
    const yearsRequired = experienceMatch.yearsRequired;
    const skillsCount = analysis.skillsMatch.length;
    const gapsCount = analysis.gaps.length;

    let summary = `Overall match score: ${matchScore}%. `;
    
    // Experience summary
    if (yearsActual >= yearsRequired) {
      summary += `You meet the experience requirements (${yearsActual} years vs ${yearsRequired} required). `;
    } else {
      summary += `You have ${yearsActual} years of relevant experience, but the role requires ${yearsRequired} years. `;
    }

    // Skills summary
    if (skillsCount > 0) {
      const excellentSkills = analysis.skillsMatch.filter(s => s.matchLevel === 'excellent').length;
      const goodSkills = analysis.skillsMatch.filter(s => s.matchLevel === 'good').length;
      summary += `Skills analysis shows ${excellentSkills} excellent matches and ${goodSkills} good matches. `;
    }

    // Gaps summary
    if (gapsCount > 0) {
      summary += `Identified ${gapsCount} skill gaps that need attention. `;
    }

    // Overall assessment
    if (matchScore >= 80) {
      summary += "Strong candidate match with minor areas for improvement.";
    } else if (matchScore >= 60) {
      summary += "Good candidate match with some development areas.";
    } else {
      summary += "Significant gaps identified that require focused development.";
    }

    return summary;
  }
}
