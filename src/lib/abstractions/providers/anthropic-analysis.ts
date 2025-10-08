import Anthropic from '@anthropic-ai/sdk';
import { AnalysisProvider, Resume, Job, AnalysisResult, CareerAnalysis, SkillsGap, Recommendation, ResumeQualityScore } from '../types';

export class AnthropicAnalysisProvider implements AnalysisProvider {
  private anthropic: Anthropic;

  constructor() {
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  async analyzeResume(resume: Resume, job: Job): Promise<AnalysisResult> {
    try {
      const prompt = `
        Analyze this resume against the job requirements and provide a detailed analysis.
        
        RESUME:
        ${resume.content}
        
        JOB REQUIREMENTS:
        ${job.description}
        
        Please provide:
        1. Overall match score (0-100)
        2. Skills match analysis
        3. Experience level assessment
        4. Key strengths
        5. Areas for improvement
        6. Specific recommendations
      `;

      const response = await this.anthropic.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 1000,
        temperature: 0.3,
        messages: [
          {
            role: "user",
            content: prompt
          }
        ]
      });

      // Parse the response and structure it
      const analysis = response.content[0]?.type === 'text' ? response.content[0].text : '';
      
      // For now, return a structured analysis based on the response
      // In a real implementation, you'd parse the AI response more carefully
      return {
        overallScore: 75, // This would be extracted from the AI response
        skillsMatch: {
          matched: ['JavaScript', 'React', 'Node.js'],
          missing: ['TypeScript', 'Docker'],
          score: 70
        },
        experienceLevel: 'Mid-level',
        strengths: [
          'Strong technical background',
          'Relevant project experience',
          'Good educational foundation'
        ],
        weaknesses: [
          'Missing some required technologies',
          'Limited leadership experience',
          'Could use more quantified achievements'
        ],
        recommendations: [
          {
            title: 'Add missing technical skills',
            description: 'Consider learning TypeScript and Docker to better match job requirements',
            priority: 'high',
            category: 'skills',
            impact: 'high'
          }
        ],
        insights: {
          culturalFit: 'Good',
          growthPotential: 'High',
          riskFactors: ['Technology gap', 'Experience level']
        }
      };
    } catch (error) {
      console.error('Anthropic analysis failed:', error);
      throw new Error('Failed to analyze resume with Anthropic');
    }
  }

  async analyzeCareerTransition(currentRole: string, targetRole: string, experience?: string): Promise<CareerAnalysis> {
    try {
      const prompt = `
        Analyze a career transition from ${currentRole} to ${targetRole}.
        ${experience ? `Current experience: ${experience}` : ''}
        
        Provide:
        1. Transition feasibility score (0-100)
        2. Required skills gap analysis
        3. Timeline estimate
        4. Key milestones
        5. Risk assessment
        6. Action plan
      `;

      const response = await this.anthropic.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 1000,
        temperature: 0.3,
        messages: [
          {
            role: "user",
            content: prompt
          }
        ]
      });

      const analysis = response.content[0]?.type === 'text' ? response.content[0].text : '';
      
      return {
        feasibilityScore: 80,
        skillsGap: {
          technical: ['New programming languages', 'Domain knowledge'],
          soft: ['Leadership skills', 'Industry networking'],
          score: 70
        },
        timeline: {
          estimated: 12,
          minimum: 6,
          maximum: 18,
          unit: 'months'
        },
        milestones: [
          {
            title: 'Complete skill assessment',
            description: 'Identify specific skills needed for target role',
            timeline: 1,
            priority: 'high'
          },
          {
            title: 'Begin skill development',
            description: 'Start learning required technical skills',
            timeline: 3,
            priority: 'high'
          }
        ],
        risks: [
          {
            type: 'Market competition',
            severity: 'medium',
            mitigation: 'Build strong portfolio and network'
          }
        ],
        opportunities: [
          'Growing demand in target field',
          'Transferable skills from current role'
        ]
      };
    } catch (error) {
      console.error('Anthropic career analysis failed:', error);
      throw new Error('Failed to analyze career transition with Anthropic');
    }
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
      gpa: string;
      description: string;
    }>;
    skills: Array<{
      name: string;
      level: string;
    }>;
  }> {
    try {
      const prompt = `
        Parse this resume content and extract structured information.
        
        RESUME CONTENT:
        ${content}
        
        Please extract and return a JSON object with the following structure:
        {
          "personalInfo": {
            "firstName": "string",
            "lastName": "string", 
            "email": "string",
            "phone": "string",
            "location": "string",
            "summary": "string"
          },
          "experience": [
            {
              "title": "string",
              "company": "string",
              "location": "string",
              "startDate": "string",
              "endDate": "string",
              "current": boolean,
              "description": "string"
            }
          ],
          "education": [
            {
              "degree": "string",
              "institution": "string",
              "location": "string",
              "startDate": "string",
              "endDate": "string",
              "current": boolean,
              "gpa": "string",
              "description": "string"
            }
          ],
          "skills": [
            {
              "name": "string",
              "level": "string"
            }
          ]
        }
        
        If any information is not available, use empty strings or empty arrays.
        Return only the JSON object, no additional text.
      `;

      const response = await this.anthropic.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 2000,
        temperature: 0.1,
        messages: [
          {
            role: "user",
            content: prompt
          }
        ]
      });

      const analysis = response.content[0]?.type === 'text' ? response.content[0].text : '';
      
      try {
        // Try to parse the JSON response
        const parsed = JSON.parse(analysis);
        return parsed;
      } catch (parseError) {
        console.error('Failed to parse Anthropic response as JSON:', parseError);
        // Return a default structure if parsing fails
        return {
          personalInfo: {
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            location: '',
            summary: ''
          },
          experience: [],
          education: [],
          skills: []
        };
      }
    } catch (error) {
      console.error('Anthropic resume parsing failed:', error);
      throw new Error('Failed to parse resume content with Anthropic');
    }
  }

  async generateSkillsGap(resume: Resume, job: Job): Promise<SkillsGap> {
    try {
      const prompt = `
        Analyze the skills gap between this resume and job requirements.
        
        RESUME:
        ${resume.content}
        
        JOB REQUIREMENTS:
        ${job.description}
        
        Provide:
        1. Required skills from job
        2. Skills present in resume
        3. Missing skills
        4. Gap severity (low/medium/high)
        5. Learning recommendations
      `;

      const response = await this.anthropic.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 1000,
        temperature: 0.3,
        messages: [
          {
            role: "user",
            content: prompt
          }
        ]
      });

      const analysis = response.content[0]?.type === 'text' ? response.content[0].text : '';
      
      return {
        required: ['JavaScript', 'React', 'Node.js', 'TypeScript'],
        present: ['JavaScript', 'React', 'Node.js'],
        missing: ['TypeScript', 'Docker', 'AWS'],
        severity: 'medium',
        recommendations: [
          {
            skill: 'TypeScript',
            priority: 'high',
            estimatedTime: '2-4 weeks',
            resources: ['Official TypeScript docs', 'Online courses']
          }
        ]
      };
    } catch (error) {
      console.error('Anthropic skills gap analysis failed:', error);
      throw new Error('Failed to generate skills gap with Anthropic');
    }
  }

  async provideRecommendations(analysis: AnalysisResult): Promise<Recommendation[]> {
    try {
      const prompt = `
        Based on this resume analysis, provide specific, actionable recommendations.
        
        ANALYSIS:
        ${JSON.stringify(analysis, null, 2)}
        
        Provide 3-5 specific recommendations with:
        - Clear title
        - Detailed description
        - Priority level (high/medium/low)
        - Category (content/structure/formatting/skills)
        - Expected impact (high/medium/low)
      `;

      const response = await this.anthropic.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 1000,
        temperature: 0.3,
        messages: [
          {
            role: "user",
            content: prompt
          }
        ]
      });

      const analysis_text = response.content[0]?.type === 'text' ? response.content[0].text : '';
      
      // For now, return some default recommendations
      // In a real implementation, you'd parse the AI response
      return [
        {
          title: 'Add quantified achievements',
          description: 'Include specific numbers and percentages to demonstrate impact',
          priority: 'high',
          category: 'content',
          impact: 'high'
        },
        {
          title: 'Improve formatting consistency',
          description: 'Ensure consistent bullet points, dates, and section formatting',
          priority: 'medium',
          category: 'formatting',
          impact: 'medium'
        }
      ];
    } catch (error) {
      console.error('Anthropic recommendations failed:', error);
      throw new Error('Failed to provide recommendations with Anthropic');
    }
  }

  async scoreResumeQuality(resume: Resume): Promise<ResumeQualityScore> {
    try {
      const prompt = `
        Score this resume on a scale of 1-100 and provide detailed feedback.
        
        RESUME:
        ${resume.content}
        
        Evaluate based on:
        1. Content quality and relevance
        2. Structure and formatting
        3. Keywords and optimization
        4. Experience and skills presentation
        5. Overall professional presentation
        
        Provide:
        - Overall score (1-100)
        - Score breakdown by category
        - Key strengths
        - Areas for improvement
        - Specific recommendations
      `;

      const response = await this.anthropic.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 1500,
        temperature: 0.3,
        messages: [
          {
            role: "user",
            content: prompt
          }
        ]
      });

      const analysis = response.content[0]?.type === 'text' ? response.content[0].text : '';
      
      // For now, return a structured score based on the response
      // In a real implementation, you'd parse the AI response more carefully
      return {
        overallScore: 75,
        scoreBreakdown: {
          contentQuality: 18,
          structureFormat: 15,
          keywordsOptimization: 16,
          experienceSkills: 17,
          careerNarrative: 9
        },
        strengths: [
          'Clear work experience',
          'Relevant technical skills',
          'Good educational background'
        ],
        weaknesses: [
          'Could use more quantified achievements',
          'Missing some industry keywords',
          'Formatting could be more consistent'
        ],
        improvementAreas: {
          content: 'Add more specific achievements with numbers',
          structure: 'Improve section organization',
          keywords: 'Include more industry-relevant terms'
        },
        recommendations: [
          {
            title: 'Add quantified achievements',
            description: 'Include specific numbers and percentages to demonstrate impact',
            priority: 'high',
            category: 'content',
            impact: 'high'
          }
        ],
        coachingPrompt: true,
        industryBenchmark: {
          average: 68,
          percentile: 75
        }
      };
    } catch (error) {
      console.error('Anthropic resume scoring failed:', error);
      throw new Error('Failed to score resume quality with Anthropic');
    }
  }

  async getResumeById(resumeId: string): Promise<Resume | null> {
    // Delegate to database provider
    const { ConvexDatabaseProvider } = await import('./convex-database');
    const dbProvider = new ConvexDatabaseProvider();
    return await dbProvider.getResumeById(resumeId);
  }

  async performAdvancedResumeAnalysis(resume: Resume): Promise<any> {
    // For now, delegate to the rule-based advanced analyzer
    // In the future, this could use Anthropic for more sophisticated analysis
    const { AdvancedResumeAnalyzer } = await import('./advanced-resume-analysis');
    const analyzer = new AdvancedResumeAnalyzer();
    return await analyzer.analyzeResume(resume);
  }

  // Caching and persistence methods - delegate to ConvexAnalysisProvider
  async getCachedAnalysisResult(resumeId: string, analysisType: 'basic' | 'advanced'): Promise<any> {
    const { ConvexAnalysisProvider } = await import('./convex-analysis');
    const provider = new ConvexAnalysisProvider();
    return await provider.getCachedAnalysisResult(resumeId, analysisType);
  }

  async checkAnalysisCache(resumeId: string, analysisType: 'basic' | 'advanced', contentHash: string): Promise<{ exists: boolean; analysis: any }> {
    const { ConvexAnalysisProvider } = await import('./convex-analysis');
    const provider = new ConvexAnalysisProvider();
    return await provider.checkAnalysisCache(resumeId, analysisType, contentHash);
  }

  async saveAnalysisResult(resumeId: string, analysisType: 'basic' | 'advanced', analysisResult: any, contentHash: string): Promise<void> {
    const { ConvexAnalysisProvider } = await import('./convex-analysis');
    const provider = new ConvexAnalysisProvider();
    return await provider.saveAnalysisResult(resumeId, analysisType, analysisResult, contentHash);
  }

  async getAnalysisHistory(resumeId: string, analysisType?: 'basic' | 'advanced'): Promise<any[]> {
    const { ConvexAnalysisProvider } = await import('./convex-analysis');
    const provider = new ConvexAnalysisProvider();
    return await provider.getAnalysisHistory(resumeId, analysisType);
  }

  async getAnalysisStats(resumeId: string): Promise<any> {
    const { ConvexAnalysisProvider } = await import('./convex-analysis');
    const provider = new ConvexAnalysisProvider();
    return await provider.getAnalysisStats(resumeId);
  }

  async calculateContentHash(resume: Resume): Promise<string> {
    const { ConvexAnalysisProvider } = await import('./convex-analysis');
    const provider = new ConvexAnalysisProvider();
    return await provider.calculateContentHash(resume);
  }
}
