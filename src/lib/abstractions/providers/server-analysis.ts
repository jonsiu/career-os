import { AnalysisProvider, Resume, Job, AnalysisResult, CareerAnalysis, SkillsGap, Recommendation, ResumeQualityScore } from '../types';
import { AdvancedResumeAnalysis } from './advanced-resume-analysis';
import { ConvexDatabaseProvider } from './convex-database';
import { convexClient, api } from '../../convex-client';

export class ServerAnalysisProvider implements AnalysisProvider {
  private databaseProvider = new ConvexDatabaseProvider();

  async analyzeResume(resume: Resume, job: Job): Promise<AnalysisResult> {
    // For now, delegate to basic analysis
    const qualityScore = await this.scoreResumeQuality(resume);
    
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
    // Use the existing Convex parsing action
    return await convexClient.action(api.resumes.parseResumeWithAI, {
      content: content
    });
  }

  async generateSkillsGap(resume: Resume, job: Job): Promise<SkillsGap> {
    return {
      skill: 'General',
      importance: 'medium',
      timeToLearn: 6,
      resources: [],
      priority: 5
    };
  }

  async provideRecommendations(analysis: AnalysisResult): Promise<Recommendation[]> {
    return [];
  }

  async scoreResumeQuality(resume: Resume): Promise<ResumeQualityScore> {
    try {
      // Parse structured resume data if available
      let resumeData;
      try {
        resumeData = JSON.parse(resume.content);
      } catch {
        resumeData = null;
      }

      const resumeContent = resume.content.toLowerCase();
      
      // Calculate scores based on different criteria
      const contentQuality = this.scoreContentQuality(resumeContent, resumeData);
      const structureFormat = this.scoreStructureFormat(resumeContent, resumeData);
      const keywordsOptimization = this.scoreKeywordsOptimization(resumeContent, resumeData);
      const experienceSkills = this.scoreExperienceSkills(resumeContent, resumeData);
      const careerNarrative = this.scoreCareerNarrative(resumeContent, resumeData);
      
      const overallScore = contentQuality + structureFormat + keywordsOptimization + experienceSkills + careerNarrative;
      
      // Generate strengths and weaknesses
      const strengths = this.generateStrengths(resumeContent, resumeData, overallScore);
      const weaknesses = this.generateWeaknesses(resumeContent, resumeData, overallScore);
      
      // Generate improvement areas
      const improvementAreas = this.generateImprovementAreas(contentQuality, structureFormat, keywordsOptimization, experienceSkills, careerNarrative);
      
      // Generate recommendations
      const recommendations = this.generateQualityRecommendations(improvementAreas, overallScore);
      
      return {
        overallScore: Math.max(1, Math.min(100, overallScore)),
        scoreBreakdown: {
          contentQuality: Math.max(0, Math.min(25, contentQuality)),
          structureFormat: Math.max(0, Math.min(20, structureFormat)),
          keywordsOptimization: Math.max(0, Math.min(20, keywordsOptimization)),
          experienceSkills: Math.max(0, Math.min(20, experienceSkills)),
          careerNarrative: Math.max(0, Math.min(15, careerNarrative)),
        },
        strengths,
        weaknesses,
        improvementAreas,
        recommendations,
        coachingPrompt: overallScore < 70,
        industryBenchmark: {
          average: 68,
          percentile: Math.min(95, Math.max(5, overallScore))
        }
      };
    } catch (error) {
      console.error('Resume quality scoring failed:', error);
      return {
        overallScore: 50,
        scoreBreakdown: {
          contentQuality: 12,
          structureFormat: 10,
          keywordsOptimization: 10,
          experienceSkills: 10,
          careerNarrative: 8,
        },
        strengths: ['Resume uploaded successfully'],
        weaknesses: ['Unable to analyze content'],
        improvementAreas: {},
        recommendations: [],
        coachingPrompt: true,
        industryBenchmark: {
          average: 68,
          percentile: 50
        }
      };
    }
  }

  async getResumeById(resumeId: string): Promise<Resume | null> {
    return await this.databaseProvider.getResumeById(resumeId);
  }

  async performAdvancedResumeAnalysis(resume: Resume): Promise<AdvancedResumeAnalysis> {
    const { AdvancedResumeAnalyzer } = await import('./advanced-resume-analysis');
    const analyzer = new AdvancedResumeAnalyzer();
    return await analyzer.analyzeResume(resume);
  }

  // Caching and persistence methods - use server-side Convex calls
  async getCachedAnalysisResult(resumeId: string, analysisType: 'basic' | 'advanced'): Promise<any> {
    try {
      const result = await convexClient.query(api.analysisResults.getLatestAnalysisResult, {
        resumeId: resumeId as any,
        analysisType
      });
      return result;
    } catch (error) {
      console.error('Failed to get cached analysis result:', error);
      return null;
    }
  }

  async checkAnalysisCache(resumeId: string, analysisType: 'basic' | 'advanced', contentHash: string): Promise<{ exists: boolean; analysis: any }> {
    try {
      const result = await convexClient.query(api.analysisResults.checkAnalysisExists, {
        resumeId: resumeId as any,
        analysisType,
        contentHash
      });
      return result;
    } catch (error) {
      console.error('Failed to check analysis cache:', error);
      return { exists: false, analysis: null };
    }
  }

  async saveAnalysisResult(resumeId: string, analysisType: 'basic' | 'advanced', analysisResult: any, contentHash: string): Promise<void> {
    try {
      await convexClient.mutation(api.analysisResults.createAnalysisResult, {
        resumeId: resumeId as any,
        analysisType,
        overallScore: analysisResult.overallScore || 0,
        categoryScores: analysisResult.categoryScores || analysisResult.scoreBreakdown || {},
        detailedInsights: analysisResult.detailedInsights || {
          strengths: analysisResult.strengths || [],
          weaknesses: analysisResult.weaknesses || [],
          improvementAreas: analysisResult.improvementAreas || {}
        },
        recommendations: analysisResult.recommendations || [],
        contentHash,
        metadata: {
          analysisVersion: '1.0',
          generatedAt: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Failed to save analysis result:', error);
      throw error;
    }
  }

  async getAnalysisHistory(resumeId: string, analysisType?: 'basic' | 'advanced'): Promise<any[]> {
    try {
      const result = await convexClient.query(api.analysisResults.getAnalysisHistory, {
        resumeId: resumeId as any,
        analysisType
      });
      return result;
    } catch (error) {
      console.error('Failed to get analysis history:', error);
      return [];
    }
  }

  async getAnalysisStats(resumeId: string): Promise<any> {
    try {
      const result = await convexClient.query(api.analysisResults.getAnalysisStats, {
        resumeId: resumeId as any
      });
      return result;
    } catch (error) {
      console.error('Failed to get analysis stats:', error);
      return null;
    }
  }

  // Helper methods for scoring (copied from ConvexAnalysisProvider)
  private scoreContentQuality(content: string, resumeData: any): number {
    let score = 0;
    
    // Check for professional summary
    if (content.includes('summary') || content.includes('objective') || content.includes('profile')) {
      score += 3;
    }
    
    // Check for quantified achievements
    const hasNumbers = /\d+%|\d+\+|\$\d+|\d+ years|\d+ months/.test(content);
    if (hasNumbers) score += 4;
    
    // Check for action verbs
    const actionVerbs = ['achieved', 'developed', 'implemented', 'managed', 'led', 'created', 'improved', 'increased', 'reduced'];
    const hasActionVerbs = actionVerbs.some(verb => content.includes(verb));
    if (hasActionVerbs) score += 3;
    
    // Check for professional language
    const professionalTerms = ['collaborated', 'strategic', 'innovative', 'results-driven', 'cross-functional'];
    const hasProfessionalTerms = professionalTerms.some(term => content.includes(term));
    if (hasProfessionalTerms) score += 2;
    
    // Check content length (not too short, not too long)
    const wordCount = content.split(/\s+/).length;
    if (wordCount >= 200 && wordCount <= 800) score += 3;
    
    return Math.min(25, score);
  }

  private scoreStructureFormat(content: string, resumeData: any): number {
    let score = 0;
    
    // Check for proper sections
    const sections = ['experience', 'education', 'skills', 'contact', 'summary'];
    const hasSections = sections.filter(section => content.includes(section)).length;
    score += Math.min(8, hasSections * 1.5);
    
    // Check for consistent formatting
    const hasBulletPoints = content.includes('•') || content.includes('-') || content.includes('*');
    if (hasBulletPoints) score += 3;
    
    // Check for dates
    const hasDates = /\d{4}|\d{2}\/\d{2}|\d{2}-\d{2}/.test(content);
    if (hasDates) score += 3;
    
    // Check for contact information
    const hasEmail = /@/.test(content);
    const hasPhone = /\d{3}[-.]?\d{3}[-.]?\d{4}/.test(content);
    if (hasEmail) score += 2;
    if (hasPhone) score += 2;
    
    return Math.min(20, score);
  }

  private scoreKeywordsOptimization(content: string, resumeData: any): number {
    let score = 0;
    
    // Check for industry-relevant keywords
    const techKeywords = ['javascript', 'python', 'react', 'node', 'sql', 'aws', 'docker', 'kubernetes'];
    const businessKeywords = ['management', 'leadership', 'strategy', 'analytics', 'marketing', 'sales'];
    const designKeywords = ['ui', 'ux', 'design', 'figma', 'photoshop', 'illustrator'];
    
    const allKeywords = [...techKeywords, ...businessKeywords, ...designKeywords];
    const keywordMatches = allKeywords.filter(keyword => content.includes(keyword)).length;
    score += Math.min(8, keywordMatches);
    
    // Check for skills section
    if (content.includes('skills') || content.includes('technologies') || content.includes('competencies')) {
      score += 4;
    }
    
    // Check for certifications
    if (content.includes('certified') || content.includes('certification') || content.includes('license')) {
      score += 3;
    }
    
    return Math.min(20, score);
  }

  private scoreExperienceSkills(content: string, resumeData: any): number {
    let score = 0;
    
    // Check for work experience
    const experienceKeywords = ['experience', 'employment', 'work history', 'professional experience'];
    const hasExperience = experienceKeywords.some(keyword => content.includes(keyword));
    if (hasExperience) score += 5;
    
    // Check for job titles
    const jobTitles = ['manager', 'director', 'senior', 'lead', 'principal', 'architect', 'engineer', 'analyst'];
    const hasJobTitles = jobTitles.some(title => content.includes(title));
    if (hasJobTitles) score += 4;
    
    // Check for company names
    const hasCompanies = content.includes('inc') || content.includes('corp') || content.includes('llc') || content.includes('ltd');
    if (hasCompanies) score += 3;
    
    // Check for education
    const educationKeywords = ['university', 'college', 'degree', 'bachelor', 'master', 'phd', 'diploma'];
    const hasEducation = educationKeywords.some(keyword => content.includes(keyword));
    if (hasEducation) score += 4;
    
    return Math.min(20, score);
  }

  private scoreCareerNarrative(content: string, resumeData: any): number {
    let score = 0;
    
    // Check for career progression
    const progressionKeywords = ['promoted', 'advanced', 'grew', 'expanded', 'increased responsibility'];
    const hasProgression = progressionKeywords.some(keyword => content.includes(keyword));
    if (hasProgression) score += 4;
    
    // Check for leadership experience
    const leadershipKeywords = ['led', 'managed', 'supervised', 'directed', 'mentored', 'team'];
    const hasLeadership = leadershipKeywords.some(keyword => content.includes(keyword));
    if (hasLeadership) score += 4;
    
    // Check for impact statements
    const impactKeywords = ['improved', 'increased', 'reduced', 'saved', 'generated', 'delivered'];
    const hasImpact = impactKeywords.some(keyword => content.includes(keyword));
    if (hasImpact) score += 4;
    
    return Math.min(15, score);
  }

  private generateStrengths(content: string, resumeData: any, score: number): string[] {
    const strengths = [];
    
    if (score >= 80) {
      strengths.push('Strong overall presentation');
    }
    if (content.includes('summary') || content.includes('objective')) {
      strengths.push('Clear professional summary');
    }
    if (/\d+%|\d+\+|\$\d+/.test(content)) {
      strengths.push('Quantified achievements');
    }
    if (content.includes('led') || content.includes('managed')) {
      strengths.push('Leadership experience');
    }
    if (content.includes('university') || content.includes('degree')) {
      strengths.push('Strong educational background');
    }
    
    return strengths.length > 0 ? strengths : ['Resume uploaded successfully'];
  }

  private generateWeaknesses(content: string, resumeData: any, score: number): string[] {
    const weaknesses = [];
    
    if (score < 70) {
      weaknesses.push('Overall presentation needs improvement');
    }
    if (!content.includes('summary') && !content.includes('objective')) {
      weaknesses.push('Missing professional summary');
    }
    if (!/\d+%|\d+\+|\$\d+/.test(content)) {
      weaknesses.push('Lack of quantified achievements');
    }
    if (!content.includes('skills') && !content.includes('technologies')) {
      weaknesses.push('Missing skills section');
    }
    if (content.split(/\s+/).length < 200) {
      weaknesses.push('Content too brief');
    }
    
    return weaknesses.length > 0 ? weaknesses : ['Consider adding more detail'];
  }

  private generateImprovementAreas(contentQuality: number, structureFormat: number, keywordsOptimization: number, experienceSkills: number, careerNarrative: number): any {
    const areas = {};
    
    if (contentQuality < 15) {
      areas.content = 'Improve content quality and add quantified achievements';
    }
    if (structureFormat < 12) {
      areas.structure = 'Better organize sections and formatting';
    }
    if (keywordsOptimization < 12) {
      areas.keywords = 'Add more industry-relevant keywords';
    }
    if (experienceSkills < 12) {
      areas.experience = 'Highlight more relevant experience and skills';
    }
    if (careerNarrative < 8) {
      areas.narrative = 'Show career progression and impact';
    }
    
    return areas;
  }

  private generateQualityRecommendations(improvementAreas: any, overallScore: number): Recommendation[] {
    const recommendations = [];
    
    if (improvementAreas.content) {
      recommendations.push({
        title: 'Add quantified achievements',
        description: 'Include specific numbers and percentages to demonstrate impact',
        priority: 'high',
        category: 'content',
        impact: 'high'
      });
    }
    
    if (improvementAreas.structure) {
      recommendations.push({
        title: 'Improve formatting consistency',
        description: 'Ensure consistent bullet points, dates, and section formatting',
        priority: 'medium',
        category: 'formatting',
        impact: 'medium'
      });
    }
    
    if (improvementAreas.keywords) {
      recommendations.push({
        title: 'Include more industry keywords',
        description: 'Add relevant technical and industry-specific terms',
        priority: 'high',
        category: 'content',
        impact: 'high'
      });
    }
    
    return recommendations;
  }
}
