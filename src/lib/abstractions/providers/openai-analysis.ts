import OpenAI from 'openai';
import { AnalysisProvider, Resume, Job, AnalysisResult, CareerAnalysis, SkillsGap, Recommendation } from '../types';

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
}
