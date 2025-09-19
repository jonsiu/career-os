import { AnalysisProvider, Resume, Job, AnalysisResult, CareerAnalysis, SkillsGap, Recommendation, Skill, Milestone, SkillsMatch, ResumeQualityScore } from '../types';
import { AdvancedResumeAnalyzer, AdvancedResumeAnalysis } from './advanced-resume-analysis';

export class ConvexAnalysisProvider implements AnalysisProvider {
  private advancedAnalyzer = new AdvancedResumeAnalyzer();
  async analyzeResume(resume: Resume, job?: Job): Promise<AnalysisResult> {
    if (!job) {
      return {
        matchScore: 0,
        skillsMatch: [],
        experienceMatch: {
          level: 'mid',
          confidence: 0.5,
          yearsRequired: 0,
          yearsActual: 0
        },
        gaps: [],
        recommendations: [],
        summary: 'No job selected for comparison.'
      };
    }

    // Parse structured resume data if available
    let resumeData;
    try {
      resumeData = JSON.parse(resume.content);
    } catch {
      // Fallback to raw text analysis
      resumeData = null;
    }

    const resumeContent = resume.content.toLowerCase();
    const jobRequirements = job.requirements.map(req => req.toLowerCase());
    const jobDescription = job.description.toLowerCase();
    
    const skillsMatch: SkillsMatch[] = [];
    const gaps: SkillsGap[] = [];
    const matchedSkills = new Set<string>();
    
    // Expanded tech skills list
    const techSkills = [
      'javascript', 'python', 'java', 'react', 'node.js', 'sql', 'aws', 'docker',
      'kubernetes', 'typescript', 'angular', 'vue', 'mongodb', 'postgresql',
      'machine learning', 'ai', 'data science', 'agile', 'scrum', 'git',
      'html', 'css', 'php', 'ruby', 'go', 'rust', 'c++', 'c#', '.net',
      'spring', 'django', 'flask', 'express', 'laravel', 'rails',
      'mysql', 'redis', 'elasticsearch', 'graphql', 'rest', 'api',
      'microservices', 'serverless', 'terraform', 'jenkins', 'ci/cd',
      'tensorflow', 'pytorch', 'pandas', 'numpy', 'scikit-learn',
      'leadership', 'management', 'mentoring', 'team building'
    ];

    // Extract skills from structured resume if available
    const resumeSkills = resumeData?.skills || [];
    const resumeSkillsText = resumeSkills.map((s: any) => s.name?.toLowerCase() || '').join(' ');

    // Analyze each skill with more precise matching
    techSkills.forEach(skill => {
      // More precise matching - use word boundaries and exact matches
      const inResume = this.hasSkillInText(skill, resumeContent) || this.hasSkillInStructuredData(skill, resumeSkills);
      const inJob = this.hasSkillInJobRequirements(skill, jobRequirements, jobDescription);
      
      if (inResume && inJob) {
        // Find skill level from structured data
        const structuredSkill = resumeSkills.find((s: any) => 
          s.name?.toLowerCase() === skill || s.name?.toLowerCase().includes(skill)
        );
        
        skillsMatch.push({
          skill: skill.charAt(0).toUpperCase() + skill.slice(1),
          matchLevel: 'excellent',
          confidence: structuredSkill ? 0.9 : 0.7,
          relevance: 0.8
        });
        matchedSkills.add(skill);
      } else if (!inResume && inJob) {
        // Determine importance based on how often it appears in job requirements
        const importance = this.getSkillImportance(skill, jobRequirements, jobDescription);
        
        gaps.push({
          skill: skill.charAt(0).toUpperCase() + skill.slice(1),
          importance,
          timeToLearn: this.estimateTimeToLearn(skill),
          resources: this.getLearningResources(skill),
          priority: gaps.length + 1
        });
      }
    });

    // Calculate match score properly
    const totalJobSkills = this.extractSkillsFromJob(jobRequirements, jobDescription).length;
    const matchScore = totalJobSkills > 0 ? Math.min(100, Math.round((matchedSkills.size / totalJobSkills) * 100)) : 0;

    // Improved experience analysis
    const yearsActual = this.extractYearsExperience(resumeContent, resumeData);
    const experienceMatch = {
      level: this.assessExperienceLevel(resumeContent, resumeData),
      confidence: this.calculateConfidence(resumeData, resumeContent),
      yearsRequired: this.extractYearsRequired(jobRequirements, jobDescription),
      yearsActual
    };

    // Debug logging
    console.log('🔍 Analysis Debug:', {
      hasStructuredData: !!resumeData,
      experienceCount: resumeData?.experience?.length || 0,
      yearsCalculated: yearsActual,
      experienceData: resumeData?.experience?.map((exp: any) => ({
        title: exp.title,
        startDate: exp.startDate,
        endDate: exp.endDate,
        current: exp.current
      })) || 'No structured data'
    });

    // Generate personalized recommendations
    const recommendations = this.generateRecommendations(gaps, skillsMatch, experienceMatch, resumeData);

    return {
      matchScore,
      skillsMatch,
      experienceMatch,
      gaps,
      recommendations,
      summary: this.generateSummary(matchScore, skillsMatch.length, gaps.length, experienceMatch)
    };
  }

  async analyzeCareerTransition(currentRole: string, targetRole: string, experience?: string): Promise<CareerAnalysis> {
    const yearsExperience = experience ? this.extractYearsExperience(experience) : 3;
    
    const transitionPaths: Record<string, string[]> = {
      'engineering manager': ['Senior Developer', 'Tech Lead', 'Engineering Manager'],
      'product manager': ['Developer', 'Senior Developer', 'Product Manager'],
      'tech lead': ['Developer', 'Senior Developer', 'Tech Lead'],
      'architect': ['Developer', 'Senior Developer', 'Architect'],
      'cto': ['Senior Developer', 'Tech Lead', 'Engineering Manager', 'CTO']
    };

    const path = transitionPaths[targetRole.toLowerCase()] || ['Current Role', targetRole];
    const timeToTarget = Math.max(6, Math.min(24, (path.length - 1) * 6 + Math.floor(Math.random() * 6)));

    const keyMilestones = this.generateMilestones(path, timeToTarget);

    const risks = this.assessRisks(currentRole, targetRole, yearsExperience);
    const opportunities = this.assessOpportunities(currentRole, targetRole, yearsExperience);

    return {
      currentLevel: currentRole,
      targetLevel: targetRole,
      transitionPath: path,
      timeToTarget,
      keyMilestones,
      risks,
      opportunities
    };
  }

  async generateSkillsGap(resume: Resume, job: Job): Promise<SkillsGap> {
    const gaps = await this.analyzeResume(resume, job);
    return gaps.gaps[0] || {
      skill: 'Leadership',
      importance: 'high',
      timeToLearn: 6,
      resources: ['Management courses', 'Mentorship programs'],
      priority: 1
    };
  }

  async provideRecommendations(analysis: AnalysisResult): Promise<Recommendation[]> {
    return analysis.recommendations;
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
      const lines = content.split('\n').map(line => line.trim()).filter(line => line);
      
      const result = {
        personalInfo: {
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          location: '',
          summary: '',
        },
        experience: [],
        education: [],
        skills: [],
        projects: [],
      };

      const emailMatch = content.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
      if (emailMatch) {
        result.personalInfo.email = emailMatch[0];
      }

      const phoneMatch = content.match(/(\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
      if (phoneMatch) {
        result.personalInfo.phone = phoneMatch[0];
      }

      let currentSection = '';
      let currentExperience: {
        title: string;
        company: string;
        location: string;
        startDate: string;
        endDate: string;
        current: boolean;
        description: string;
      } | null = null;
      let currentEducation: {
        degree: string;
        institution: string;
        location: string;
        startDate: string;
        endDate: string;
        current: boolean;
        gpa: string;
        description: string;
      } | null = null;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const lowerLine = line.toLowerCase();

        if (lowerLine.includes('experience') || lowerLine.includes('work history') || lowerLine.includes('employment')) {
          currentSection = 'experience';
          continue;
        } else if (lowerLine.includes('education') || lowerLine.includes('academic') || lowerLine.includes('degree')) {
          currentSection = 'education';
          continue;
        } else if (lowerLine.includes('skills') || lowerLine.includes('competencies') || lowerLine.includes('technologies')) {
          currentSection = 'skills';
          continue;
        } else if (lowerLine.includes('projects') || lowerLine.includes('portfolio') || lowerLine.includes('achievements')) {
          currentSection = 'projects';
          continue;
        } else if (lowerLine.includes('summary') || lowerLine.includes('objective') || lowerLine.includes('profile')) {
          currentSection = 'summary';
          continue;
        }

        switch (currentSection) {
          case 'experience':
            if (line.length > 3 && line.length < 100 && !line.includes('@') && !line.includes('http')) {
              if (line.includes(' at ') || line.includes(' - ') || line.includes(' | ')) {
                if (currentExperience) {
                  result.experience.push(currentExperience);
                }
                
                const parts = line.split(/ at | - | \| /);
                currentExperience = {
                  title: parts[0].trim(),
                  company: parts[1]?.trim() || '',
                  location: '',
                  startDate: '',
                  endDate: '',
                  current: false,
                  description: ''
                };
              } else if (currentExperience && line.length > 20) {
                currentExperience.description += (currentExperience.description ? ' ' : '') + line;
              }
            }
            break;

          case 'education':
            if (line.length > 5 && line.length < 150 && !line.includes('@')) {
              if (currentEducation) {
                result.education.push(currentEducation);
              }
              
              const eduParts = line.split(/ - | at | \| /);
              currentEducation = {
                degree: eduParts[0]?.trim() || '',
                institution: eduParts[1]?.trim() || '',
                location: '',
                startDate: '',
                endDate: '',
                current: false,
                gpa: '',
                description: ''
              };
            }
            break;

          case 'skills':
            if (line.includes(',') || line.includes('•') || line.includes('-')) {
              const skillItems = line.split(/[,•-]/).map(s => s.trim()).filter(s => s.length > 1);
              skillItems.forEach(skill => {
                if (skill.length > 2 && skill.length < 50) {
                  result.skills.push({
                    name: skill,
                    level: 'intermediate'
                  });
                }
              });
            } else if (line.length > 2 && line.length < 50 && !line.includes('@')) {
              result.skills.push({
                name: line,
                level: 'intermediate'
              });
            }
            break;

          case 'summary':
            if (line.length > 20 && !result.personalInfo.summary) {
              result.personalInfo.summary = line.substring(0, 300);
            }
            break;
        }
      }

      if (currentExperience) {
        result.experience.push(currentExperience);
      }
      if (currentEducation) {
        result.education.push(currentEducation);
      }

      if (!result.personalInfo.firstName) {
        const firstLines = lines.slice(0, 10);
        for (const line of firstLines) {
          if (line.length > 3 && line.length < 50 && !line.includes('@') && !line.includes('http')) {
            const nameParts = line.split(/\s+/);
            if (nameParts.length >= 2 && nameParts.length <= 4) {
              result.personalInfo.firstName = nameParts[0];
              result.personalInfo.lastName = nameParts.slice(1).join(' ');
              break;
            }
          }
        }
      }

      if (!result.personalInfo.location) {
        const locationPattern = /([A-Z][a-z]+(?:[\s,]+[A-Z][a-z]+)*),\s*([A-Z]{2})/;
        for (const line of lines) {
          const match = line.match(locationPattern);
          if (match) {
            result.personalInfo.location = match[0];
            break;
          }
        }
      }

      return result;
    } catch (error) {
      console.error('Error parsing resume content:', error);
      return {
        personalInfo: {
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          location: '',
          summary: '',
        },
        experience: [],
        education: [],
        skills: [],
        projects: [],
      };
    }
  }



  private generateMilestones(path: string[], totalMonths: number): Milestone[] {
    const milestones: Milestone[] = [];
    const monthsPerStep = Math.floor(totalMonths / (path.length - 1));
    
    for (let i = 1; i < path.length; i++) {
      const targetDate = new Date();
      targetDate.setMonth(targetDate.getMonth() + (i * monthsPerStep));
      
      milestones.push({
        id: `milestone_${i}`,
        title: `Transition to ${path[i]}`,
        description: `Develop skills and experience required for ${path[i]} role`,
        targetDate,
        status: 'pending',
        dependencies: i === 1 ? [] : [`milestone_${i - 1}`],
        effort: Math.floor(Math.random() * 40) + 20
      });
    }
    
    return milestones;
  }

  private assessRisks(currentRole: string, targetRole: string, yearsExperience: number): string[] {
    const risks = [];
    
    // Ensure parameters are strings
    const currentRoleStr = String(currentRole || '');
    const targetRoleStr = String(targetRole || '');
    
    if (targetRoleStr.toLowerCase().includes('manager') && !currentRoleStr.toLowerCase().includes('lead')) {
      risks.push('Lack of management experience');
      risks.push('Limited team leadership exposure');
    }
    
    if (yearsExperience < 5 && targetRoleStr.toLowerCase().includes('senior')) {
      risks.push('Insufficient years of experience');
    }
    
    if (targetRoleStr.toLowerCase().includes('architect') && yearsExperience < 7) {
      risks.push('Limited system design experience');
    }
    
    return risks.length > 0 ? risks : ['Technical skills may atrophy during transition'];
  }

  private assessOpportunities(currentRole: string, targetRole: string, yearsExperience: number): string[] {
    const opportunities = [];
    
    // Ensure parameters are strings
    const currentRoleStr = String(currentRole || '');
    const targetRoleStr = String(targetRole || '');
    
    if (currentRoleStr.toLowerCase().includes('senior')) {
      opportunities.push('Strong technical foundation');
    }
    
    if (yearsExperience >= 5) {
      opportunities.push('Solid industry experience');
    }
    
    if (currentRoleStr.toLowerCase().includes('lead')) {
      opportunities.push('Existing leadership experience');
    }
    
    return opportunities.length > 0 ? opportunities : ['Good communication skills', 'Strong problem-solving abilities'];
  }

  // Helper methods for improved analysis
  private hasSkillInText(skill: string, text: string): boolean {
    // Use word boundaries for more precise matching
    const regex = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    return regex.test(text);
  }

  private hasSkillInStructuredData(skill: string, skills: any[]): boolean {
    return skills.some((s: any) => {
      const skillName = s.name?.toLowerCase() || '';
      return skillName === skill || skillName.includes(skill);
    });
  }

  private hasSkillInJobRequirements(skill: string, jobRequirements: string[], jobDescription: string): boolean {
    const allText = [...jobRequirements, jobDescription].join(' ').toLowerCase();
    return this.hasSkillInText(skill, allText);
  }

  private extractSkillsFromJob(jobRequirements: string[], jobDescription: string): string[] {
    const skills = new Set<string>();
    const techSkills = [
      'javascript', 'python', 'java', 'react', 'node.js', 'sql', 'aws', 'docker',
      'kubernetes', 'typescript', 'angular', 'vue', 'mongodb', 'postgresql',
      'machine learning', 'ai', 'data science', 'agile', 'scrum', 'git',
      'html', 'css', 'php', 'ruby', 'go', 'rust', 'c++', 'c#', '.net',
      'spring', 'django', 'flask', 'express', 'laravel', 'rails',
      'mysql', 'redis', 'elasticsearch', 'graphql', 'rest', 'api',
      'microservices', 'serverless', 'terraform', 'jenkins', 'ci/cd',
      'tensorflow', 'pytorch', 'pandas', 'numpy', 'scikit-learn',
      'leadership', 'management', 'mentoring', 'team building'
    ];

    techSkills.forEach(skill => {
      if (jobRequirements.some(req => req.includes(skill)) || jobDescription.includes(skill)) {
        skills.add(skill);
      }
    });

    return Array.from(skills);
  }

  private getSkillImportance(skill: string, jobRequirements: string[], jobDescription: string): 'low' | 'medium' | 'high' {
    let mentions = 0;
    jobRequirements.forEach(req => {
      if (req.includes(skill)) mentions++;
    });
    if (jobDescription.includes(skill)) mentions++;

    if (mentions >= 3) return 'high';
    if (mentions >= 2) return 'medium';
    return 'low';
  }

  private estimateTimeToLearn(skill: string): number {
    const timeEstimates: Record<string, number> = {
      'javascript': 3, 'python': 4, 'java': 6, 'react': 4, 'node.js': 3,
      'aws': 6, 'docker': 2, 'kubernetes': 8, 'typescript': 2,
      'machine learning': 12, 'ai': 12, 'data science': 10,
      'leadership': 6, 'management': 8, 'mentoring': 4
    };

    return timeEstimates[skill] || 4; // Default 4 months
  }

  private getLearningResources(skill: string): string[] {
    const resources: Record<string, string[]> = {
      'javascript': ['MDN Web Docs', 'JavaScript.info', 'FreeCodeCamp'],
      'python': ['Python.org', 'Real Python', 'Python Crash Course'],
      'react': ['React Docs', 'React Tutorial', 'Codecademy React'],
      'aws': ['AWS Training', 'AWS Docs', 'A Cloud Guru'],
      'leadership': ['Harvard Business Review', 'Leadership books', 'Mentorship programs'],
      'machine learning': ['Coursera ML Course', 'Kaggle', 'Fast.ai']
    };

    return resources[skill] || ['Online courses', 'Documentation', 'Practice projects'];
  }

  private assessExperienceLevel(resumeContent: string, resumeData?: any): 'junior' | 'mid' | 'senior' | 'lead' {
    if (resumeData?.experience) {
      const totalYears = this.calculateTotalExperience(resumeData.experience);
      const hasLeadership = resumeData.experience.some((exp: any) => 
        exp.title?.toLowerCase().includes('lead') || 
        exp.title?.toLowerCase().includes('manager') ||
        exp.title?.toLowerCase().includes('director')
      );

      if (hasLeadership || totalYears >= 8) return 'lead';
      if (totalYears >= 5) return 'senior';
      if (totalYears >= 2) return 'mid';
      return 'junior';
    }

    // Fallback to text analysis
    const content = resumeContent.toLowerCase();
    if (content.includes('lead') || content.includes('manager') || content.includes('director')) {
      return 'lead';
    }
    if (content.includes('senior') || content.includes('principal')) {
      return 'senior';
    }
    if (content.includes('junior') || content.includes('entry')) {
      return 'junior';
    }
    return 'mid';
  }

  private calculateTotalExperience(experience: any[]): number {
    if (!experience || experience.length === 0) return 0;
    
    console.log('🔍 Experience calculation debug:', {
      experienceCount: experience.length,
      experiences: experience.map((exp: any) => ({
        title: exp.title,
        startDate: exp.startDate,
        endDate: exp.endDate,
        current: exp.current
      }))
    });
    
    // Sort experiences by start date
    const sortedExp = experience
      .filter((exp: any) => exp.startDate)
      .sort((a: any, b: any) => {
        const dateA = new Date(a.startDate);
        const dateB = new Date(b.startDate);
        return dateA.getTime() - dateB.getTime();
      });
    
    if (sortedExp.length === 0) return 0;
    
    // Calculate total career span from earliest start to latest end/current
    const earliestStart = new Date(sortedExp[0].startDate);
    const latestEnd = sortedExp.reduce((latest: Date, exp: any) => {
      const endDate = exp.current ? new Date() : new Date(exp.endDate);
      return endDate > latest ? endDate : latest;
    }, new Date(sortedExp[0].startDate));
    
    const totalYears = (latestEnd.getTime() - earliestStart.getTime()) / (1000 * 60 * 60 * 24 * 365);
    const roundedYears = Math.round(totalYears * 10) / 10;
    
    console.log('🔍 Experience calculation result:', {
      earliestStart: earliestStart.toISOString(),
      latestEnd: latestEnd.toISOString(),
      totalYears: totalYears,
      roundedYears: roundedYears
    });
    
    return roundedYears;
  }

  private calculateConfidence(resumeData: any, resumeContent: string): number {
    if (resumeData) {
      // Higher confidence for structured data
      let confidence = 0.7;
      if (resumeData.experience?.length > 0) confidence += 0.1;
      if (resumeData.skills?.length > 0) confidence += 0.1;
      if (resumeData.education?.length > 0) confidence += 0.1;
      return Math.min(1.0, confidence);
    }
    return 0.5; // Lower confidence for raw text
  }

  private extractYearsRequired(jobRequirements: string[], jobDescription: string): number {
    const text = [...jobRequirements, jobDescription].join(' ').toLowerCase();
    
    // Look for common patterns
    const patterns = [
      /(\d+)\+?\s*years?\s*(?:of\s*)?experience/i,
      /(\d+)\+?\s*years?\s*(?:in\s*)?/i,
      /minimum\s*(\d+)\s*years/i,
      /at\s*least\s*(\d+)\s*years/i
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        const years = parseInt(match[1]);
        if (years >= 1 && years <= 20) return years;
      }
    }

    // Default based on role level
    if (text.includes('senior') || text.includes('lead')) return 5;
    if (text.includes('junior') || text.includes('entry')) return 1;
    return 3;
  }

  private extractYearsExperience(resumeContent: string, resumeData?: any): number {
    if (resumeData?.experience) {
      return this.calculateTotalExperience(resumeData.experience);
    }

    // Fallback to text analysis - look for more specific patterns
    const content = resumeContent.toLowerCase();
    const patterns = [
      /(\d+)\+?\s*years?\s*(?:of\s*)?(?:total\s*)?experience/i,
      /(\d+)\+?\s*years?\s*(?:in\s*)?(?:software\s*)?(?:development|engineering|tech)/i,
      /over\s*(\d+)\s*years/i,
      /(\d+)\+?\s*years?\s*(?:of\s*)?(?:professional\s*)?(?:work\s*)?(?:experience)/i
    ];

    for (const pattern of patterns) {
      const match = content.match(pattern);
      if (match) {
        const years = parseInt(match[1]);
        if (years >= 1 && years <= 30) return years;
      }
    }

    // If no explicit years found, try to estimate from role levels
    if (content.includes('senior') || content.includes('lead') || content.includes('principal')) {
      return 5; // Conservative estimate for senior roles
    }
    if (content.includes('junior') || content.includes('entry')) {
      return 1;
    }

    return 3; // Default
  }

  private generateRecommendations(gaps: SkillsGap[], skillsMatch: SkillsMatch[], experienceMatch: any, resumeData?: any): Recommendation[] {
    const recommendations: Recommendation[] = [];

    // Skill gap recommendations
    gaps.slice(0, 3).forEach((gap, index) => {
      recommendations.push({
        type: 'skill',
        title: `Learn ${gap.skill}`,
        description: `Focus on developing ${gap.skill} skills to improve your match for this role.`,
        impact: gap.importance === 'high' ? 'high' : gap.importance === 'medium' ? 'medium' : 'low',
        effort: gap.timeToLearn > 6 ? 'high' : gap.timeToLearn > 3 ? 'medium' : 'low',
        timeline: gap.timeToLearn
      });
    });

    // Experience recommendations
    if (experienceMatch.yearsActual < experienceMatch.yearsRequired) {
      const yearsNeeded = experienceMatch.yearsRequired - experienceMatch.yearsActual;
      recommendations.push({
        type: 'experience',
        title: 'Gain More Experience',
        description: `This role requires ${experienceMatch.yearsRequired} years of experience, but you have ${experienceMatch.yearsActual} years.`,
        impact: 'high',
        effort: 'high',
        timeline: yearsNeeded * 12 // Convert years to months
      });
    }

    return recommendations;
  }

  private generateSummary(matchScore: number, skillsMatched: number, gapsCount: number, experienceMatch: any): string {
    if (matchScore >= 80) {
      return `Excellent match! You have ${skillsMatched} relevant skills and strong experience.`;
    } else if (matchScore >= 60) {
      return `Good match with ${skillsMatched} relevant skills. Consider addressing ${gapsCount} skill gaps.`;
    } else if (matchScore >= 40) {
      return `Moderate match. You have ${skillsMatched} relevant skills but need to develop ${gapsCount} additional skills.`;
    } else {
      return `Limited match. Focus on developing the ${gapsCount} missing skills to improve your candidacy.`;
    }
  }

  async getResumeById(resumeId: string): Promise<Resume | null> {
    // Delegate to database provider since analysis provider doesn't have direct database access
    const { ConvexDatabaseProvider } = await import('./convex-database');
    const dbProvider = new ConvexDatabaseProvider();
    return await dbProvider.getResumeById(resumeId);
  }

  async performAdvancedResumeAnalysis(resume: Resume): Promise<AdvancedResumeAnalysis> {
    return await this.advancedAnalyzer.analyzeResume(resume);
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
      const improvementAreas = this.generateImprovementAreas(resumeContent, resumeData, {
        contentQuality, structureFormat, keywordsOptimization, experienceSkills, careerNarrative
      });
      
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

  private scoreContentQuality(content: string, resumeData?: any): number {
    let score = 0;
    
    // Achievement quantification (10 points)
    const hasNumbers = /\d+%|\d+\+|\d+[km]|\$\d+/.test(content);
    const hasMetrics = /increased|decreased|improved|reduced|saved|generated|achieved/.test(content);
    if (hasNumbers && hasMetrics) score += 10;
    else if (hasNumbers || hasMetrics) score += 5;
    
    // Impact statements (8 points)
    const actionVerbs = /led|managed|developed|created|implemented|designed|built|launched|improved|optimized/.test(content);
    const impactWords = /result|impact|outcome|success|achievement|growth|increase|decrease/.test(content);
    if (actionVerbs && impactWords) score += 8;
    else if (actionVerbs || impactWords) score += 4;
    
    // Action verbs usage (4 points)
    const strongVerbs = /achieved|accomplished|delivered|executed|facilitated|initiated|orchestrated|spearheaded|transformed|streamlined/.test(content);
    if (strongVerbs) score += 4;
    else if (actionVerbs) score += 2;
    
    // Industry terminology (3 points)
    const techTerms = /api|database|framework|algorithm|architecture|infrastructure|deployment|scalability|performance|optimization/.test(content);
    const businessTerms = /strategy|stakeholder|budget|roi|kpi|metrics|analytics|process|workflow|collaboration/.test(content);
    if (techTerms || businessTerms) score += 3;
    
    return Math.min(25, score);
  }

  private scoreStructureFormat(content: string, resumeData?: any): number {
    let score = 0;
    
    // Logical flow and organization (8 points)
    const hasSections = /experience|education|skills|projects|summary|objective/.test(content);
    const hasContactInfo = /@|phone|email|linkedin|github/.test(content);
    if (hasSections && hasContactInfo) score += 8;
    else if (hasSections || hasContactInfo) score += 4;
    
    // Consistent formatting (5 points) - hard to detect from text, give baseline
    score += 3;
    
    // Appropriate length (3 points)
    const wordCount = content.split(/\s+/).length;
    if (wordCount >= 200 && wordCount <= 800) score += 3;
    else if (wordCount >= 100 && wordCount <= 1200) score += 2;
    else score += 1;
    
    // Visual appeal and readability (4 points)
    const hasBullets = /•|\*|-|\d+\./.test(content);
    const hasDates = /\d{4}|\d{2}\/\d{2}|\d{2}-\d{2}/.test(content);
    if (hasBullets && hasDates) score += 4;
    else if (hasBullets || hasDates) score += 2;
    
    return Math.min(20, score);
  }

  private scoreKeywordsOptimization(content: string, resumeData?: any): number {
    let score = 0;
    
    // Industry-relevant keywords (8 points)
    const techKeywords = /javascript|python|java|react|node|sql|aws|docker|kubernetes|typescript|angular|vue|mongodb|postgresql|machine learning|ai|data science|agile|scrum|git/.test(content);
    const businessKeywords = /leadership|management|mentoring|team building|project management|strategy|analytics|budget|stakeholder|collaboration/.test(content);
    if (techKeywords && businessKeywords) score += 8;
    else if (techKeywords || businessKeywords) score += 4;
    
    // ATS compatibility (6 points) - assume good if structured
    if (resumeData) score += 6;
    else score += 3;
    
    // Skills alignment (4 points)
    const skillsSection = /skills|competencies|technologies|expertise/.test(content);
    if (skillsSection) score += 4;
    else score += 2;
    
    // Job-specific optimization (2 points) - hard to detect without job description
    score += 1;
    
    return Math.min(20, score);
  }

  private scoreExperienceSkills(content: string, resumeData?: any): number {
    let score = 0;
    
    // Relevant experience depth (8 points)
    const experienceCount = resumeData?.experience?.length || 0;
    if (experienceCount >= 3) score += 8;
    else if (experienceCount >= 2) score += 5;
    else if (experienceCount >= 1) score += 3;
    
    // Skills progression (6 points)
    const hasProgression = /senior|lead|principal|manager|director|architect/.test(content);
    if (hasProgression) score += 6;
    else score += 3;
    
    // Leadership examples (4 points)
    const leadershipWords = /led|managed|mentored|supervised|directed|coordinated|facilitated|guided/.test(content);
    if (leadershipWords) score += 4;
    else score += 2;
    
    // Technical competency (2 points)
    const technicalWords = /developed|programmed|coded|designed|architected|implemented|debugged|optimized/.test(content);
    if (technicalWords) score += 2;
    
    return Math.min(20, score);
  }

  private scoreCareerNarrative(content: string, resumeData?: any): number {
    let score = 0;
    
    // Career progression logic (6 points)
    const hasProgression = /junior|mid|senior|lead|principal|manager|director|architect|cto/.test(content);
    if (hasProgression) score += 6;
    else score += 3;
    
    // Story coherence (5 points)
    const hasSummary = /summary|objective|profile|about/.test(content);
    if (hasSummary) score += 5;
    else score += 2;
    
    // Goal alignment (4 points) - hard to detect without explicit goals
    score += 2;
    
    return Math.min(15, score);
  }

  private generateStrengths(content: string, resumeData?: any, overallScore: number): string[] {
    const strengths = [];
    
    if (overallScore >= 80) {
      strengths.push('Strong overall resume quality');
    }
    
    if (/\d+%|\d+\+|\d+[km]|\$\d+/.test(content)) {
      strengths.push('Quantified achievements with metrics');
    }
    
    if (/led|managed|developed|created|implemented/.test(content)) {
      strengths.push('Strong action verbs and impact statements');
    }
    
    if (resumeData?.experience?.length >= 3) {
      strengths.push('Comprehensive work experience');
    }
    
    if (/senior|lead|principal|manager/.test(content)) {
      strengths.push('Clear career progression');
    }
    
    return strengths.length > 0 ? strengths : ['Resume uploaded successfully'];
  }

  private generateWeaknesses(content: string, resumeData?: any, overallScore: number): string[] {
    const weaknesses = [];
    
    if (overallScore < 60) {
      weaknesses.push('Overall resume quality needs improvement');
    }
    
    if (!/\d+%|\d+\+|\d+[km]|\$\d+/.test(content)) {
      weaknesses.push('Missing quantified achievements');
    }
    
    if (!/led|managed|developed|created|implemented/.test(content)) {
      weaknesses.push('Weak action verbs and impact statements');
    }
    
    if (!resumeData?.experience || resumeData.experience.length < 2) {
      weaknesses.push('Limited work experience');
    }
    
    if (!/senior|lead|principal|manager/.test(content)) {
      weaknesses.push('Unclear career progression');
    }
    
    return weaknesses.length > 0 ? weaknesses : ['Consider adding more detail'];
  }

  private generateImprovementAreas(content: string, resumeData?: any, scores: any): any {
    const improvementAreas = {
      content: [],
      structure: [],
      keywords: [],
      experience: [],
      narrative: []
    };
    
    if (scores.contentQuality < 15) {
      improvementAreas.content.push('Add quantified achievements with numbers and percentages');
      improvementAreas.content.push('Use stronger action verbs and impact statements');
    }
    
    if (scores.structureFormat < 12) {
      improvementAreas.structure.push('Improve section organization and formatting');
      improvementAreas.structure.push('Add consistent bullet points and date formatting');
    }
    
    if (scores.keywordsOptimization < 12) {
      improvementAreas.keywords.push('Include more industry-relevant keywords');
      improvementAreas.keywords.push('Add a dedicated skills section');
    }
    
    if (scores.experienceSkills < 12) {
      improvementAreas.experience.push('Expand work experience descriptions');
      improvementAreas.experience.push('Highlight leadership and technical achievements');
    }
    
    if (scores.careerNarrative < 8) {
      improvementAreas.narrative.push('Add a professional summary or objective');
      improvementAreas.narrative.push('Show clear career progression and growth');
    }
    
    return improvementAreas;
  }

  private generateQualityRecommendations(improvementAreas: any, overallScore: number): any[] {
    const recommendations = [];
    
    if (overallScore < 70) {
      recommendations.push({
        priority: 'high',
        category: 'content',
        title: 'Engage with Virtual HR Coach',
        description: 'Work with our virtual HR coach to improve your resume content and structure.',
        impact: 'high'
      });
    }
    
    if (improvementAreas.content.length > 0) {
      recommendations.push({
        priority: 'high',
        category: 'content',
        title: 'Improve Content Quality',
        description: 'Add quantified achievements and stronger action verbs to make your resume more compelling.',
        impact: 'high'
      });
    }
    
    if (improvementAreas.structure.length > 0) {
      recommendations.push({
        priority: 'medium',
        category: 'structure',
        title: 'Enhance Structure',
        description: 'Improve formatting and organization to make your resume more readable and professional.',
        impact: 'medium'
      });
    }
    
    return recommendations;
  }
}
