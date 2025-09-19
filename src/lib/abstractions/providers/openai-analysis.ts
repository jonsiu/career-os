import OpenAI from 'openai';
import { AnalysisProvider, Resume, Job, AnalysisResult, CareerAnalysis, SkillsGap, Recommendation, ResumeQualityScore } from '../types';

export class OpenAIAnalysisProvider implements AnalysisProvider {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
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

      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an expert HR analyst and career coach. Analyze resumes with precision and provide actionable insights."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1000
      });

      // Parse the response and structure it
      const analysis = response.choices[0]?.message?.content || '';
      
      // For now, return a structured mock result
      // In production, you'd parse the AI response more intelligently
      return {
        overallScore: 85,
        skillsMatch: 90,
        experienceLevel: 'senior',
        strengths: ['Strong technical background', 'Leadership experience', 'Project management skills'],
        weaknesses: ['Could use more cloud experience'],
        recommendations: ['Highlight cloud projects', 'Emphasize team leadership'],
        analysis: analysis
      };
    } catch (error) {
      console.error('OpenAI analysis failed:', error);
      throw new Error('Failed to analyze resume with AI');
    }
  }

  async analyzeCareerTransition(currentRole: string, targetRole: string, experience: string): Promise<CareerAnalysis> {
    try {
      const prompt = `
        Analyze this career transition request and provide guidance.
        
        CURRENT ROLE: ${currentRole}
        TARGET ROLE: ${targetRole}
        EXPERIENCE: ${experience}
        
        Please provide:
        1. Transition feasibility (0-100)
        2. Key skills needed
        3. Timeline estimate
        4. Potential challenges
        5. Action plan
      `;

      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an expert career transition coach. Provide practical, actionable advice for career changes."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 800
      });

      return {
        feasibility: 85,
        skillsNeeded: ['Leadership', 'Strategic thinking', 'Business acumen'],
        timeline: '6-12 months',
        challenges: ['Building leadership experience', 'Gaining business knowledge'],
        actionPlan: ['Take on leadership projects', 'Study business fundamentals', 'Network with leaders'],
        analysis: response.choices[0]?.message?.content || ''
      };
    } catch (error) {
      console.error('OpenAI career analysis failed:', error);
      throw new Error('Failed to analyze career transition with AI');
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
    try {
      const prompt = `
        Parse this resume content and extract structured data. Return ONLY valid JSON in this exact format:
        
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
              "startDate": "string (YYYY-MM format)",
              "endDate": "string (YYYY-MM format or 'Present')",
              "current": "boolean",
              "description": "string"
            }
          ],
          "education": [
            {
              "degree": "string",
              "institution": "string",
              "location": "string",
              "startDate": "string (YYYY format)",
              "endDate": "string (YYYY format)",
              "current": "boolean",
              "gpa": "string (optional)",
              "description": "string"
            }
          ],
          "skills": [
            {
              "name": "string",
              "level": "beginner|intermediate|advanced|expert"
            }
          ],
          "projects": [
            {
              "name": "string",
              "description": "string",
              "technologies": ["string"],
              "url": "string (optional)",
              "startDate": "string (YYYY-MM format)",
              "endDate": "string (YYYY-MM format or 'Present')",
              "current": "boolean"
            }
          ]
        }
        
        RESUME CONTENT:
        ${content}
        
        IMPORTANT: 
        - Extract ALL experience entries with proper dates
        - Parse skills from comma-separated lists
        - Convert dates to YYYY-MM format
        - Set current=true for "Present" dates
        - Be precise with company names and titles
        - Return ONLY the JSON, no other text
      `;

      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an expert resume parser. Extract structured data with high accuracy. Return only valid JSON."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.1, // Low temperature for consistent parsing
        max_tokens: 2000
      });

      const jsonResponse = response.choices[0]?.message?.content || '';
      
      // Extract JSON from response (in case there's extra text)
      const jsonMatch = jsonResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in AI response');
      }

      const parsedData = JSON.parse(jsonMatch[0]);
      
      // Validate and clean the data
      return {
        personalInfo: {
          firstName: parsedData.personalInfo?.firstName || '',
          lastName: parsedData.personalInfo?.lastName || '',
          email: parsedData.personalInfo?.email || '',
          phone: parsedData.personalInfo?.phone || '',
          location: parsedData.personalInfo?.location || '',
          summary: parsedData.personalInfo?.summary || '',
        },
        experience: parsedData.experience || [],
        education: parsedData.education || [],
        skills: parsedData.skills || [],
        projects: parsedData.projects || [],
      };
    } catch (error) {
      console.error('OpenAI resume parsing failed:', error);
      throw new Error('Failed to parse resume with AI');
    }
  }

  async generateSkillsGap(resume: Resume, job: Job): Promise<SkillsGap> {
    // Implementation for skills gap analysis
    return {
      missingSkills: ['Cloud Computing', 'DevOps'],
      recommendedSkills: ['AWS', 'Docker', 'Kubernetes'],
      priority: 'high'
    };
  }

  async provideRecommendations(analysis: AnalysisResult): Promise<Recommendation[]> {
    // Implementation for recommendations
    return [
      {
        type: 'skill',
        title: 'Improve Cloud Skills',
        description: 'Focus on AWS and cloud deployment',
        priority: 'high',
        effort: 'medium'
      }
    ];
  }

  async scoreResumeQuality(resume: Resume): Promise<ResumeQualityScore> {
    try {
      const prompt = `
        Analyze this resume and provide a comprehensive quality score (1-100) based on the following criteria:
        
        RESUME CONTENT:
        ${resume.content}
        
        SCORING CRITERIA (Total: 100 points):
        
        1. CONTENT QUALITY (25 points max):
           - Achievement quantification (10 points): Are achievements quantified with numbers, percentages, or metrics?
           - Impact statements (8 points): Do bullet points show clear impact and results?
           - Action verbs usage (4 points): Are strong action verbs used consistently?
           - Industry-specific terminology (3 points): Is appropriate industry language used?
        
        2. STRUCTURE & FORMAT (20 points max):
           - Logical flow and organization (8 points): Is information organized logically?
           - Consistent formatting (5 points): Are fonts, spacing, and styles consistent?
           - Appropriate length (3 points): Is the resume 1-2 pages for most roles?
           - Visual appeal and readability (4 points): Is it easy to scan and read?
        
        3. KEYWORDS & OPTIMIZATION (20 points max):
           - Industry-relevant keywords (8 points): Are relevant industry keywords present?
           - ATS compatibility (6 points): Is it formatted for ATS systems?
           - Skills alignment (4 points): Are skills clearly listed and relevant?
           - Job-specific optimization (2 points): Is it tailored for specific roles?
        
        4. EXPERIENCE & SKILLS (20 points max):
           - Relevant experience depth (8 points): Is experience relevant and detailed?
           - Skills progression (6 points): Do skills show growth and advancement?
           - Leadership examples (4 points): Are leadership experiences highlighted?
           - Technical competency (2 points): Are technical skills clearly demonstrated?
        
        5. CAREER NARRATIVE (15 points max):
           - Career progression logic (6 points): Does the career path make sense?
           - Story coherence (5 points): Is there a clear professional story?
           - Goal alignment (4 points): Do experiences align with stated goals?
        
        Please return ONLY a valid JSON object in this exact format:
        {
          "overallScore": number (1-100),
          "scoreBreakdown": {
            "contentQuality": number (0-25),
            "structureFormat": number (0-20),
            "keywordsOptimization": number (0-20),
            "experienceSkills": number (0-20),
            "careerNarrative": number (0-15)
          },
          "strengths": ["string1", "string2", "string3"],
          "weaknesses": ["string1", "string2", "string3"],
          "improvementAreas": {
            "content": ["specific improvement 1", "specific improvement 2"],
            "structure": ["specific improvement 1", "specific improvement 2"],
            "keywords": ["specific improvement 1", "specific improvement 2"],
            "experience": ["specific improvement 1", "specific improvement 2"],
            "narrative": ["specific improvement 1", "specific improvement 2"]
          },
          "recommendations": [
            {
              "priority": "high|medium|low",
              "category": "content|structure|keywords|experience|narrative",
              "title": "Recommendation title",
              "description": "Detailed description of the recommendation",
              "impact": "high|medium|low"
            }
          ],
          "coachingPrompt": boolean,
          "industryBenchmark": {
            "average": number (industry average score),
            "percentile": number (user's percentile 0-100)
          }
        }
        
        IMPORTANT: 
        - Be critical but fair in scoring
        - Provide specific, actionable feedback
        - Set coachingPrompt to true if overallScore < 70
        - Base industryBenchmark on typical resume quality (average ~65-70)
        - Return ONLY the JSON, no other text
      `;

      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an expert HR professional and resume coach with 15+ years of experience. Analyze resumes with precision and provide detailed, actionable feedback. Always return valid JSON."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.2, // Low temperature for consistent scoring
        max_tokens: 2000
      });

      const jsonResponse = response.choices[0]?.message?.content || '';
      
      // Extract JSON from response (in case there's extra text)
      const jsonMatch = jsonResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in AI response');
      }

      const scoreData = JSON.parse(jsonMatch[0]);
      
      // Validate and ensure all required fields are present
      return {
        overallScore: Math.max(1, Math.min(100, scoreData.overallScore || 0)),
        scoreBreakdown: {
          contentQuality: Math.max(0, Math.min(25, scoreData.scoreBreakdown?.contentQuality || 0)),
          structureFormat: Math.max(0, Math.min(20, scoreData.scoreBreakdown?.structureFormat || 0)),
          keywordsOptimization: Math.max(0, Math.min(20, scoreData.scoreBreakdown?.keywordsOptimization || 0)),
          experienceSkills: Math.max(0, Math.min(20, scoreData.scoreBreakdown?.experienceSkills || 0)),
          careerNarrative: Math.max(0, Math.min(15, scoreData.scoreBreakdown?.careerNarrative || 0)),
        },
        strengths: Array.isArray(scoreData.strengths) ? scoreData.strengths : [],
        weaknesses: Array.isArray(scoreData.weaknesses) ? scoreData.weaknesses : [],
        improvementAreas: {
          content: Array.isArray(scoreData.improvementAreas?.content) ? scoreData.improvementAreas.content : [],
          structure: Array.isArray(scoreData.improvementAreas?.structure) ? scoreData.improvementAreas.structure : [],
          keywords: Array.isArray(scoreData.improvementAreas?.keywords) ? scoreData.improvementAreas.keywords : [],
          experience: Array.isArray(scoreData.improvementAreas?.experience) ? scoreData.improvementAreas.experience : [],
          narrative: Array.isArray(scoreData.improvementAreas?.narrative) ? scoreData.improvementAreas.narrative : [],
        },
        recommendations: Array.isArray(scoreData.recommendations) ? scoreData.recommendations : [],
        coachingPrompt: Boolean(scoreData.coachingPrompt),
        industryBenchmark: {
          average: Math.max(50, Math.min(90, scoreData.industryBenchmark?.average || 68)),
          percentile: Math.max(0, Math.min(100, scoreData.industryBenchmark?.percentile || 50)),
        }
      };
    } catch (error) {
      console.error('OpenAI resume scoring failed:', error);
      // Return a fallback score if AI fails
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
        weaknesses: ['Unable to analyze content', 'Please try again'],
        improvementAreas: {
          content: ['Unable to analyze - please try again'],
          structure: ['Unable to analyze - please try again'],
          keywords: ['Unable to analyze - please try again'],
          experience: ['Unable to analyze - please try again'],
          narrative: ['Unable to analyze - please try again'],
        },
        recommendations: [{
          priority: 'high',
          category: 'content',
          title: 'Retry Analysis',
          description: 'The resume analysis failed. Please try uploading again.',
          impact: 'high'
        }],
        coachingPrompt: true,
        industryBenchmark: {
          average: 68,
          percentile: 25,
        }
      };
    }
  }
}
