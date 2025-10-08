// Advanced Resume Analysis Tests
// Comprehensive unit tests for the 8-category research-backed scoring system

import { AdvancedResumeAnalyzer } from '../advanced-resume-analysis';
import { Resume } from '../../types';

describe('AdvancedResumeAnalyzer', () => {
  let analyzer: AdvancedResumeAnalyzer;
  let mockResume: Resume;

  beforeEach(() => {
    analyzer = new AdvancedResumeAnalyzer();
    
    mockResume = {
      id: 'test-resume-1',
      userId: 'test-user-1',
      title: 'Software Engineer Resume',
      content: JSON.stringify({
        personalInfo: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          phone: '+1-555-0123',
          location: 'San Francisco, CA',
          summary: 'Experienced software engineer with 5+ years in full-stack development'
        },
        experience: [
          {
            title: 'Senior Software Engineer',
            company: 'Tech Corp',
            location: 'San Francisco, CA',
            startDate: '2020-01',
            endDate: '2023-12',
            current: false,
            description: 'Led development of microservices architecture, improved system performance by 40%, managed team of 3 engineers'
          },
          {
            title: 'Software Engineer',
            company: 'Startup Inc',
            location: 'San Francisco, CA',
            startDate: '2018-06',
            endDate: '2019-12',
            current: false,
            description: 'Developed React applications, reduced page load time by 30%, implemented CI/CD pipelines'
          }
        ],
        education: [
          {
            degree: 'Bachelor of Science in Computer Science',
            institution: 'University of California',
            location: 'Berkeley, CA',
            startDate: '2014-09',
            endDate: '2018-05',
            current: false,
            gpa: '3.8',
            description: 'Relevant coursework: Data Structures, Algorithms, Software Engineering'
          }
        ],
        skills: [
          { name: 'JavaScript', level: 'expert' },
          { name: 'React', level: 'advanced' },
          { name: 'Node.js', level: 'advanced' },
          { name: 'Python', level: 'intermediate' },
          { name: 'Leadership', level: 'advanced' }
        ],
        projects: [
          {
            name: 'E-commerce Platform',
            description: 'Built full-stack e-commerce platform with React and Node.js, serving 10,000+ users',
            technologies: ['React', 'Node.js', 'MongoDB', 'AWS'],
            startDate: '2022-01',
            endDate: '2022-06',
            current: false
          }
        ]
      }),
      filePath: '/uploads/resume.pdf',
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-01'),
      metadata: {
        originalFileName: 'john_doe_resume.pdf',
        fileSize: 1024000,
        fileType: 'application/pdf'
      }
    };
  });

  describe('Overall Analysis', () => {
    test('should perform complete resume analysis', async () => {
      const analysis = await analyzer.analyzeResume(mockResume);
      
      expect(analysis).toBeDefined();
      expect(analysis.overallScore).toBeGreaterThan(0);
      expect(analysis.overallScore).toBeLessThanOrEqual(100);
      expect(analysis.categoryScores).toBeDefined();
      expect(analysis.detailedInsights).toBeDefined();
      expect(analysis.recommendations).toBeDefined();
      expect(analysis.recruiterPerspective).toBeDefined();
      expect(analysis.benchmarking).toBeDefined();
    });

    test('should calculate overall score correctly', async () => {
      const analysis = await analyzer.analyzeResume(mockResume);
      
      // Overall score should be weighted average of category scores
      const expectedScore = 
        (analysis.categoryScores.contentQuality.score * 0.20) +
        (analysis.categoryScores.structuralIntegrity.score * 0.15) +
        (analysis.categoryScores.professionalPresentation.score * 0.15) +
        (analysis.categoryScores.skillsAlignment.score * 0.15) +
        (analysis.categoryScores.experienceDepth.score * 0.15) +
        (analysis.categoryScores.careerProgression.score * 0.10) +
        (analysis.categoryScores.atsOptimization.score * 0.05) +
        (analysis.categoryScores.industryRelevance.score * 0.05);
      
      expect(Math.abs(analysis.overallScore - expectedScore)).toBeLessThan(1);
    });
  });

  describe('Content Quality Analysis', () => {
    test('should score quantified achievements', async () => {
      const analysis = await analyzer.analyzeResume(mockResume);
      const contentQuality = analysis.categoryScores.contentQuality;
      
      expect(contentQuality.score).toBeGreaterThan(0);
      expect(contentQuality.breakdown.achievementQuantification).toBeGreaterThan(0);
      expect(contentQuality.insights).toBeDefined();
      expect(contentQuality.insights.length).toBeGreaterThan(0);
    });

    test('should identify action verbs usage', async () => {
      const analysis = await analyzer.analyzeResume(mockResume);
      const contentQuality = analysis.categoryScores.contentQuality;
      
      expect(contentQuality.breakdown.actionVerbUsage).toBeGreaterThan(0);
    });

    test('should assess impact statements', async () => {
      const analysis = await analyzer.analyzeResume(mockResume);
      const contentQuality = analysis.categoryScores.contentQuality;
      
      expect(contentQuality.breakdown.impactStatements).toBeGreaterThan(0);
    });
  });

  describe('Structural Integrity Analysis', () => {
    test('should evaluate logical flow', async () => {
      const analysis = await analyzer.analyzeResume(mockResume);
      const structuralIntegrity = analysis.categoryScores.structuralIntegrity;
      
      expect(structuralIntegrity.breakdown.logicalFlow).toBeGreaterThan(0);
      expect(structuralIntegrity.insights).toBeDefined();
    });

    test('should check section completeness', async () => {
      const analysis = await analyzer.analyzeResume(mockResume);
      const structuralIntegrity = analysis.categoryScores.structuralIntegrity;
      
      expect(structuralIntegrity.breakdown.sectionCompleteness).toBeGreaterThan(0);
    });

    test('should assess consistent formatting', async () => {
      const analysis = await analyzer.analyzeResume(mockResume);
      const structuralIntegrity = analysis.categoryScores.structuralIntegrity;
      
      expect(structuralIntegrity.breakdown.consistentFormatting).toBeGreaterThan(0);
    });
  });

  describe('Skills Alignment Analysis', () => {
    test('should evaluate technical skills', async () => {
      const analysis = await analyzer.analyzeResume(mockResume);
      const skillsAlignment = analysis.categoryScores.skillsAlignment;
      
      expect(skillsAlignment.breakdown.technicalSkills).toBeGreaterThan(0);
      expect(skillsAlignment.insights).toBeDefined();
    });

    test('should assess soft skills', async () => {
      const analysis = await analyzer.analyzeResume(mockResume);
      const skillsAlignment = analysis.categoryScores.skillsAlignment;
      
      expect(skillsAlignment.breakdown.softSkills).toBeGreaterThan(0);
    });

    test('should evaluate skill progression', async () => {
      const analysis = await analyzer.analyzeResume(mockResume);
      const skillsAlignment = analysis.categoryScores.skillsAlignment;
      
      expect(skillsAlignment.breakdown.skillProgression).toBeGreaterThan(0);
    });
  });

  describe('Experience Depth Analysis', () => {
    test('should evaluate relevant experience', async () => {
      const analysis = await analyzer.analyzeResume(mockResume);
      const experienceDepth = analysis.categoryScores.experienceDepth;
      
      expect(experienceDepth.breakdown.relevantExperience).toBeGreaterThan(0);
      expect(experienceDepth.insights).toBeDefined();
    });

    test('should assess leadership examples', async () => {
      const analysis = await analyzer.analyzeResume(mockResume);
      const experienceDepth = analysis.categoryScores.experienceDepth;
      
      expect(experienceDepth.breakdown.leadershipExamples).toBeGreaterThan(0);
    });

    test('should evaluate project impact', async () => {
      const analysis = await analyzer.analyzeResume(mockResume);
      const experienceDepth = analysis.categoryScores.experienceDepth;
      
      expect(experienceDepth.breakdown.projectImpact).toBeGreaterThan(0);
    });
  });

  describe('Career Progression Analysis', () => {
    test('should evaluate career growth', async () => {
      const analysis = await analyzer.analyzeResume(mockResume);
      const careerProgression = analysis.categoryScores.careerProgression;
      
      expect(careerProgression.breakdown.careerGrowth).toBeGreaterThan(0);
      expect(careerProgression.insights).toBeDefined();
    });

    test('should assess role advancement', async () => {
      const analysis = await analyzer.analyzeResume(mockResume);
      const careerProgression = analysis.categoryScores.careerProgression;
      
      expect(careerProgression.breakdown.roleAdvancement).toBeGreaterThan(0);
    });
  });

  describe('ATS Optimization Analysis', () => {
    test('should evaluate keyword optimization', async () => {
      const analysis = await analyzer.analyzeResume(mockResume);
      const atsOptimization = analysis.categoryScores.atsOptimization;
      
      expect(atsOptimization.breakdown.keywordOptimization).toBeGreaterThan(0);
      expect(atsOptimization.insights).toBeDefined();
    });

    test('should assess format compatibility', async () => {
      const analysis = await analyzer.analyzeResume(mockResume);
      const atsOptimization = analysis.categoryScores.atsOptimization;
      
      expect(atsOptimization.breakdown.formatCompatibility).toBeGreaterThan(0);
    });
  });

  describe('Industry Relevance Analysis', () => {
    test('should evaluate industry terminology', async () => {
      const analysis = await analyzer.analyzeResume(mockResume);
      const industryRelevance = analysis.categoryScores.industryRelevance;
      
      expect(industryRelevance.breakdown.industryTerminology).toBeGreaterThan(0);
      expect(industryRelevance.insights).toBeDefined();
    });

    test('should assess market alignment', async () => {
      const analysis = await analyzer.analyzeResume(mockResume);
      const industryRelevance = analysis.categoryScores.industryRelevance;
      
      expect(industryRelevance.breakdown.marketAlignment).toBeGreaterThan(0);
    });
  });

  describe('Detailed Insights', () => {
    test('should generate comprehensive insights', async () => {
      const analysis = await analyzer.analyzeResume(mockResume);
      const insights = analysis.detailedInsights;
      
      expect(insights.strengths).toBeDefined();
      expect(insights.strengths.length).toBeGreaterThan(0);
      expect(insights.weaknesses).toBeDefined();
      expect(insights.weaknesses.length).toBeGreaterThan(0);
      expect(insights.contentImprovements).toBeDefined();
      expect(insights.structureImprovements).toBeDefined();
      expect(insights.keywordImprovements).toBeDefined();
      expect(insights.experienceImprovements).toBeDefined();
      expect(insights.narrativeImprovements).toBeDefined();
    });

    test('should provide actionable improvement suggestions', async () => {
      const analysis = await analyzer.analyzeResume(mockResume);
      const insights = analysis.detailedInsights;
      
      // Each improvement category should have specific, actionable suggestions
      expect(insights.contentImprovements.every(improvement => 
        improvement.length > 20 && improvement.includes('specific')
      )).toBe(true);
    });
  });

  describe('Recommendations', () => {
    test('should generate prioritized recommendations', async () => {
      const analysis = await analyzer.analyzeResume(mockResume);
      const recommendations = analysis.recommendations;
      
      expect(recommendations).toBeDefined();
      expect(recommendations.length).toBeGreaterThan(0);
      
      // Each recommendation should have required fields
      recommendations.forEach(rec => {
        expect(rec.priority).toMatch(/^(high|medium|low)$/);
        expect(rec.category).toBeDefined();
        expect(rec.title).toBeDefined();
        expect(rec.description).toBeDefined();
        expect(rec.impact).toMatch(/^(high|medium|low)$/);
        expect(rec.effort).toMatch(/^(high|medium|low)$/);
      });
    });

    test('should prioritize high-impact recommendations', async () => {
      const analysis = await analyzer.analyzeResume(mockResume);
      const recommendations = analysis.recommendations;
      
      const highPriorityRecs = recommendations.filter(rec => rec.priority === 'high');
      expect(highPriorityRecs.length).toBeGreaterThan(0);
    });
  });

  describe('Recruiter Perspective', () => {
    test('should provide recruiter insights', async () => {
      const analysis = await analyzer.analyzeResume(mockResume);
      const recruiterPerspective = analysis.recruiterPerspective;
      
      expect(recruiterPerspective.overallImpression).toBeDefined();
      expect(recruiterPerspective.strengths).toBeDefined();
      expect(recruiterPerspective.concerns).toBeDefined();
      expect(recruiterPerspective.interviewReadiness).toBeDefined();
      expect(recruiterPerspective.hiringRecommendation).toMatch(/^(strong|moderate|weak)$/);
    });
  });

  describe('Benchmarking', () => {
    test('should provide industry benchmarking data', async () => {
      const analysis = await analyzer.analyzeResume(mockResume);
      const benchmarking = analysis.benchmarking;
      
      expect(benchmarking.industryAverage).toBeGreaterThan(0);
      expect(benchmarking.percentile).toBeGreaterThan(0);
      expect(benchmarking.percentile).toBeLessThanOrEqual(100);
      expect(benchmarking.competitivePosition).toBeDefined();
      expect(benchmarking.recommendations).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    test('should handle malformed resume data gracefully', async () => {
      const malformedResume = {
        ...mockResume,
        content: 'invalid json'
      };
      
      await expect(analyzer.analyzeResume(malformedResume)).rejects.toThrow();
    });

    test('should handle empty resume content', async () => {
      const emptyResume = {
        ...mockResume,
        content: JSON.stringify({})
      };
      
      const analysis = await analyzer.analyzeResume(emptyResume);
      expect(analysis.overallScore).toBeGreaterThanOrEqual(0);
      expect(analysis.overallScore).toBeLessThanOrEqual(100);
    });
  });

  describe('Score Consistency', () => {
    test('should produce consistent scores for same resume', async () => {
      const analysis1 = await analyzer.analyzeResume(mockResume);
      const analysis2 = await analyzer.analyzeResume(mockResume);
      
      expect(Math.abs(analysis1.overallScore - analysis2.overallScore)).toBeLessThan(1);
    });

    test('should produce different scores for different resumes', async () => {
      const poorResume = {
        ...mockResume,
        content: JSON.stringify({
          personalInfo: { firstName: 'Jane', lastName: 'Doe' },
          experience: [],
          education: [],
          skills: [],
          projects: []
        })
      };
      
      const goodAnalysis = await analyzer.analyzeResume(mockResume);
      const poorAnalysis = await analyzer.analyzeResume(poorResume);
      
      expect(goodAnalysis.overallScore).toBeGreaterThan(poorAnalysis.overallScore);
    });
  });
});
