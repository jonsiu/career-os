import { AnalysisProvider, Resume, Job, User, AnalysisResult, CareerAnalysis, SkillsGap, Recommendation } from '../types';

export class ConvexAnalysisProvider implements AnalysisProvider {
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

    // Extract skills from resume content (simplified parsing)
    const resumeContent = resume.content.toLowerCase();
    const jobRequirements = job.requirements.map(req => req.toLowerCase());
    
    // Simple skills matching algorithm
    const skillsMatch: any[] = [];
    const gaps: any[] = [];
    const matchedSkills = new Set<string>();
    
    // Common tech skills to look for
    const techSkills = [
      'javascript', 'python', 'java', 'react', 'node.js', 'sql', 'aws', 'docker',
      'kubernetes', 'typescript', 'angular', 'vue', 'mongodb', 'postgresql',
      'machine learning', 'ai', 'data science', 'agile', 'scrum', 'git'
    ];

    techSkills.forEach(skill => {
      const inResume = resumeContent.includes(skill);
      const inJob = jobRequirements.some(req => req.includes(skill));
      
      if (inResume && inJob) {
        skillsMatch.push({
          skill: skill.charAt(0).toUpperCase() + skill.slice(1),
          matchLevel: 'excellent',
          confidence: 0.9,
          relevance: 0.8
        });
        matchedSkills.add(skill);
      } else if (inResume && !inJob) {
        skillsMatch.push({
          skill: skill.charAt(0).toUpperCase() + skill.slice(1),
          matchLevel: 'good',
          confidence: 0.7,
          relevance: 0.4
        });
      } else if (!inResume && inJob) {
        gaps.push({
          skill: skill.charAt(0).toUpperCase() + skill.slice(1),
          importance: 'high',
          timeToLearn: Math.floor(Math.random() * 6) + 2, // 2-8 months
          resources: ['Online courses', 'Documentation', 'Practice projects'],
          priority: gaps.length + 1
        });
      }
    });

    // Calculate match score based on skills overlap
    const totalRequired = jobRequirements.length + gaps.length;
    const matchScore = Math.min(100, Math.round((matchedSkills.size / totalRequired) * 100));

    // Experience level assessment
    const experienceMatch = {
      level: this.assessExperienceLevel(resumeContent),
      confidence: 0.8,
      yearsRequired: this.extractYearsRequired(jobRequirements),
      yearsActual: this.extractYearsExperience(resumeContent)
    };

    // Generate recommendations
    const recommendations = this.generateRecommendations(gaps, skillsMatch);

    return {
      matchScore,
      skillsMatch,
      experienceMatch,
      gaps,
      recommendations,
      summary: this.generateSummary(matchScore, skillsMatch.length, gaps.length)
    };
  }

  async analyzeCareerTransition(user: User, targetRole: string): Promise<CareerAnalysis> {
    const currentRole = user.metadata?.currentRole || 'Software Engineer';
    const yearsExperience = user.metadata?.yearsExperience || 3;
    
    // Define transition paths for common roles
    const transitionPaths: Record<string, string[]> = {
      'engineering manager': ['Senior Developer', 'Tech Lead', 'Engineering Manager'],
      'product manager': ['Developer', 'Senior Developer', 'Product Manager'],
      'tech lead': ['Developer', 'Senior Developer', 'Tech Lead'],
      'architect': ['Developer', 'Senior Developer', 'Architect'],
      'cto': ['Senior Developer', 'Tech Lead', 'Engineering Manager', 'CTO']
    };

    const path = transitionPaths[targetRole.toLowerCase()] || ['Current Role', targetRole];
    const timeToTarget = Math.max(6, Math.min(24, (path.length - 1) * 6 + Math.floor(Math.random() * 6)));

    // Generate realistic milestones
    const keyMilestones = this.generateMilestones(path, timeToTarget);

    // Assess risks and opportunities based on current role
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

  private assessExperienceLevel(resumeContent: string): 'junior' | 'mid' | 'senior' | 'lead' | 'executive' {
    const content = resumeContent.toLowerCase();
    
    if (content.includes('cto') || content.includes('vp') || content.includes('director')) return 'executive';
    if (content.includes('lead') || content.includes('architect') || content.includes('principal')) return 'lead';
    if (content.includes('senior') || content.includes('5+ years') || content.includes('10+ years')) return 'senior';
    if (content.includes('3+ years') || content.includes('5 years')) return 'mid';
    return 'junior';
  }

  private extractYearsRequired(requirements: string[]): number {
    const yearPattern = /(\d+)\+?\s*years?/i;
    for (const req of requirements) {
      const match = req.match(yearPattern);
      if (match) return parseInt(match[1]);
    }
    return 3; // Default
  }

  private extractYearsExperience(resumeContent: string): number {
    const yearPattern = /(\d+)\+?\s*years?/i;
    const match = resumeContent.match(yearPattern);
    if (match) return parseInt(match[1]);
    
    // Estimate based on content
    if (resumeContent.includes('senior') || resumeContent.includes('lead')) return 5;
    if (resumeContent.includes('junior')) return 1;
    return 3; // Default
  }

  private generateRecommendations(gaps: SkillsGap[], skillsMatch: any[]): Recommendation[] {
    const recommendations: Recommendation[] = [];
    
    gaps.forEach((gap, index) => {
      recommendations.push({
        type: 'skill',
        title: `Learn ${gap.skill}`,
        description: `Focus on ${gap.skill.toLowerCase()} to improve your job match`,
        impact: gap.importance === 'high' ? 'high' : gap.importance === 'medium' ? 'medium' : 'low',
        effort: gap.timeToLearn > 6 ? 'high' : gap.timeToLearn > 3 ? 'medium' : 'low',
        timeline: gap.timeToLearn
      });
    });

    // Add general recommendations
    if (skillsMatch.length > 0) {
      recommendations.push({
        type: 'skill',
        title: 'Enhance Existing Skills',
        description: 'Deepen your knowledge in areas where you already have a foundation',
        impact: 'medium',
        effort: 'low',
        timeline: 1
      });
    }

    return recommendations;
  }

  private generateSummary(matchScore: number, skillsMatched: number, gapsCount: number): string {
    if (matchScore >= 80) {
      return 'Excellent match! Your skills align very well with this position.';
    } else if (matchScore >= 60) {
      return 'Good match with room for improvement. Focus on the identified skill gaps.';
    } else if (matchScore >= 40) {
      return 'Moderate match. Consider developing the required skills before applying.';
    } else {
      return 'Limited match. This role may require significant skill development.';
    }
  }

  private generateMilestones(path: string[], totalMonths: number): any[] {
    const milestones = [];
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
        effort: Math.floor(Math.random() * 40) + 20 // 20-60 hours
      });
    }
    
    return milestones;
  }

  private assessRisks(currentRole: string, targetRole: string, yearsExperience: number): string[] {
    const risks = [];
    
    if (targetRole.toLowerCase().includes('manager') && !currentRole.toLowerCase().includes('lead')) {
      risks.push('Lack of management experience');
      risks.push('Limited team leadership exposure');
    }
    
    if (yearsExperience < 5 && targetRole.toLowerCase().includes('senior')) {
      risks.push('Insufficient years of experience');
    }
    
    if (targetRole.toLowerCase().includes('architect') && yearsExperience < 7) {
      risks.push('Limited system design experience');
    }
    
    return risks.length > 0 ? risks : ['Technical skills may atrophy during transition'];
  }

  private assessOpportunities(currentRole: string, targetRole: string, yearsExperience: number): string[] {
    const opportunities = [];
    
    if (currentRole.toLowerCase().includes('senior')) {
      opportunities.push('Strong technical foundation');
    }
    
    if (yearsExperience >= 5) {
      opportunities.push('Solid industry experience');
    }
    
    if (currentRole.toLowerCase().includes('lead')) {
      opportunities.push('Existing leadership experience');
    }
    
    return opportunities.length > 0 ? opportunities : ['Good communication skills', 'Strong problem-solving abilities'];
  }
}
