// API Analysis Provider Tests
// Tests for the integration of advanced resume analysis with API provider

import { APIAnalysisProvider } from '../api-analysis';
import { Resume, ResumeQualityScore } from '../../types';

// Mock the advanced analyzer
jest.mock('../advanced-resume-analysis', () => ({
  AdvancedResumeAnalyzer: jest.fn().mockImplementation(() => ({
    analyzeResume: jest.fn()
  }))
}));

describe('APIAnalysisProvider', () => {
  let provider: APIAnalysisProvider;
  let mockResume: Resume;
  let mockAdvancedAnalyzer: any;

  beforeEach(() => {
    provider = new APIAnalysisProvider();
    mockAdvancedAnalyzer = (provider as any).advancedAnalyzer;
    
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

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('scoreResumeQuality', () => {
    test('should use advanced analyzer for scoring', async () => {
      const mockAdvancedAnalysis = {
        overallScore: 85,
        categoryScores: {
          contentQuality: { score: 20 },
          structuralIntegrity: { score: 18 },
          professionalPresentation: { score: 17 },
          skillsAlignment: { score: 16 },
          experienceDepth: { score: 15 },
          careerProgression: { score: 12 },
          atsOptimization: { score: 8 },
          industryRelevance: { score: 7 }
        },
        detailedInsights: {
          strengths: ['Strong technical skills', 'Quantified achievements'],
          weaknesses: ['Could improve soft skills section'],
          contentImprovements: ['Add more specific metrics'],
          structureImprovements: ['Improve formatting consistency'],
          keywordImprovements: ['Add more industry keywords'],
          experienceImprovements: ['Highlight leadership experience'],
          narrativeImprovements: ['Strengthen career progression story']
        },
        recommendations: [
          {
            priority: 'high',
            category: 'content',
            title: 'Add More Quantified Achievements',
            description: 'Include specific metrics and numbers to demonstrate impact',
            impact: 'high',
            effort: 'medium'
          }
        ],
        benchmarking: {
          industryAverage: 72,
          percentile: 85
        }
      };

      mockAdvancedAnalyzer.analyzeResume.mockResolvedValue(mockAdvancedAnalysis);

      const result = await provider.scoreResumeQuality(mockResume);

      expect(mockAdvancedAnalyzer.analyzeResume).toHaveBeenCalledWith(mockResume);
      expect(result.overallScore).toBe(85);
      expect(result.scoreBreakdown.contentQuality).toBe(20);
      expect(result.scoreBreakdown.structureFormat).toBe(18);
      expect(result.scoreBreakdown.keywordsOptimization).toBe(8);
      expect(result.scoreBreakdown.experienceSkills).toBe(15);
      expect(result.scoreBreakdown.careerNarrative).toBe(12);
      expect(result.strengths).toEqual(['Strong technical skills', 'Quantified achievements']);
      expect(result.weaknesses).toEqual(['Could improve soft skills section']);
      expect(result.recommendations).toHaveLength(1);
      expect(result.recommendations[0].priority).toBe('high');
      expect(result.coachingPrompt).toBe(false); // Score >= 70
      expect(result.industryBenchmark.average).toBe(72);
      expect(result.industryBenchmark.percentile).toBe(85);
    });

    test('should trigger coaching prompt for low scores', async () => {
      const mockAdvancedAnalysis = {
        overallScore: 65,
        categoryScores: {
          contentQuality: { score: 15 },
          structuralIntegrity: { score: 12 },
          professionalPresentation: { score: 10 },
          skillsAlignment: { score: 8 },
          experienceDepth: { score: 10 },
          careerProgression: { score: 5 },
          atsOptimization: { score: 3 },
          industryRelevance: { score: 2 }
        },
        detailedInsights: {
          strengths: ['Basic technical skills'],
          weaknesses: ['Poor formatting', 'Lack of quantified achievements'],
          contentImprovements: ['Add specific metrics'],
          structureImprovements: ['Improve overall formatting'],
          keywordImprovements: ['Add industry keywords'],
          experienceImprovements: ['Better describe achievements'],
          narrativeImprovements: ['Strengthen career story']
        },
        recommendations: [
          {
            priority: 'high',
            category: 'content',
            title: 'Major Resume Overhaul Needed',
            description: 'Resume needs significant improvements across multiple areas',
            impact: 'high',
            effort: 'high'
          }
        ],
        benchmarking: {
          industryAverage: 72,
          percentile: 25
        }
      };

      mockAdvancedAnalyzer.analyzeResume.mockResolvedValue(mockAdvancedAnalysis);

      const result = await provider.scoreResumeQuality(mockResume);

      expect(result.overallScore).toBe(65);
      expect(result.coachingPrompt).toBe(true); // Score < 70
      expect(result.industryBenchmark.percentile).toBe(25);
    });

    test('should handle advanced analyzer errors gracefully', async () => {
      mockAdvancedAnalyzer.analyzeResume.mockRejectedValue(new Error('Analysis failed'));

      // Mock fetch for API fallback
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          data: {
            overallScore: 75,
            scoreBreakdown: {
              contentQuality: 18,
              structureFormat: 15,
              keywordsOptimization: 12,
              experienceSkills: 16,
              careerNarrative: 14
            },
            strengths: ['API fallback analysis'],
            weaknesses: ['Limited analysis'],
            improvementAreas: {
              content: ['API-based suggestions'],
              structure: ['API-based suggestions'],
              keywords: ['API-based suggestions'],
              experience: ['API-based suggestions'],
              narrative: ['API-based suggestions']
            },
            recommendations: [
              {
                priority: 'medium',
                category: 'content',
                title: 'API Fallback Recommendation',
                description: 'This is a fallback recommendation',
                impact: 'medium'
              }
            ],
            coachingPrompt: false,
            industryBenchmark: {
              average: 70,
              percentile: 60
            }
          }
        })
      });

      const result = await provider.scoreResumeQuality(mockResume);

      expect(result.overallScore).toBe(75);
      expect(result.strengths).toEqual(['API fallback analysis']);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/analysis/basic'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ resumeId: 'test-resume-1' })
        })
      );
    });

    test('should fallback to Convex provider when API fails', async () => {
      mockAdvancedAnalyzer.analyzeResume.mockRejectedValue(new Error('Analysis failed'));

      // Mock fetch to fail
      global.fetch = jest.fn().mockRejectedValue(new Error('API failed'));

      // Mock Convex provider
      const mockConvexProvider = {
        scoreResumeQuality: jest.fn().mockResolvedValue({
          overallScore: 70,
          scoreBreakdown: {
            contentQuality: 16,
            structureFormat: 14,
            keywordsOptimization: 10,
            experienceSkills: 15,
            careerNarrative: 15
          },
          strengths: ['Convex fallback analysis'],
          weaknesses: ['Basic analysis only'],
          improvementAreas: {
            content: ['Convex-based suggestions'],
            structure: ['Convex-based suggestions'],
            keywords: ['Convex-based suggestions'],
            experience: ['Convex-based suggestions'],
            narrative: ['Convex-based suggestions']
          },
          recommendations: [
            {
              priority: 'low',
              category: 'content',
              title: 'Convex Fallback Recommendation',
              description: 'This is a Convex fallback recommendation',
              impact: 'low'
            }
          ],
          coachingPrompt: false,
          industryBenchmark: {
            average: 70,
            percentile: 50
          }
        })
      };

      // Mock the dynamic import
      jest.doMock('../convex-analysis', () => ({
        ConvexAnalysisProvider: jest.fn().mockImplementation(() => mockConvexProvider)
      }));

      const result = await provider.scoreResumeQuality(mockResume);

      expect(result.overallScore).toBe(70);
      expect(result.strengths).toEqual(['Convex fallback analysis']);
    });
  });

  describe('performAdvancedResumeAnalysis', () => {
    test('should perform advanced analysis successfully', async () => {
      const mockAdvancedAnalysis = {
        overallScore: 88,
        categoryScores: {
          contentQuality: { score: 22 },
          structuralIntegrity: { score: 19 },
          professionalPresentation: { score: 18 },
          skillsAlignment: { score: 17 },
          experienceDepth: { score: 16 },
          careerProgression: { score: 14 },
          atsOptimization: { score: 9 },
          industryRelevance: { score: 8 }
        },
        detailedInsights: {
          strengths: ['Excellent technical skills', 'Strong leadership experience'],
          weaknesses: ['Could improve ATS optimization'],
          contentImprovements: ['Minor content improvements'],
          structureImprovements: ['Minor structure improvements'],
          keywordImprovements: ['Add more keywords'],
          experienceImprovements: ['Minor experience improvements'],
          narrativeImprovements: ['Minor narrative improvements']
        },
        recommendations: [
          {
            priority: 'medium',
            category: 'keywords',
            title: 'Improve ATS Optimization',
            description: 'Add more industry-specific keywords',
            impact: 'medium',
            effort: 'low'
          }
        ],
        recruiterPerspective: {
          overallImpression: 'Strong candidate',
          strengths: ['Technical expertise', 'Leadership'],
          concerns: ['ATS compatibility'],
          interviewReadiness: 'Ready',
          hiringRecommendation: 'strong'
        },
        benchmarking: {
          industryAverage: 72,
          percentile: 90
        }
      };

      mockAdvancedAnalyzer.analyzeResume.mockResolvedValue(mockAdvancedAnalysis);

      const result = await provider.performAdvancedResumeAnalysis(mockResume);

      expect(mockAdvancedAnalyzer.analyzeResume).toHaveBeenCalledWith(mockResume);
      expect(result).toEqual(mockAdvancedAnalysis);
    });

    test('should handle advanced analysis errors', async () => {
      mockAdvancedAnalyzer.analyzeResume.mockRejectedValue(new Error('Advanced analysis failed'));

      await expect(provider.performAdvancedResumeAnalysis(mockResume))
        .rejects.toThrow('Advanced resume analysis failed: Advanced analysis failed');
    });
  });

  describe('Integration with UI Components', () => {
    test('should provide data in correct format for ResumeQualityScoreComponent', async () => {
      const mockAdvancedAnalysis = {
        overallScore: 82,
        categoryScores: {
          contentQuality: { score: 20 },
          structuralIntegrity: { score: 17 },
          professionalPresentation: { score: 16 },
          skillsAlignment: { score: 15 },
          experienceDepth: { score: 14 },
          careerProgression: { score: 13 },
          atsOptimization: { score: 7 },
          industryRelevance: { score: 6 }
        },
        detailedInsights: {
          strengths: ['Strong technical background'],
          weaknesses: ['Could improve formatting'],
          contentImprovements: ['Add more metrics'],
          structureImprovements: ['Improve layout'],
          keywordImprovements: ['Add keywords'],
          experienceImprovements: ['Better descriptions'],
          narrativeImprovements: ['Strengthen story']
        },
        recommendations: [
          {
            priority: 'high',
            category: 'content',
            title: 'Add Quantified Achievements',
            description: 'Include specific numbers and metrics',
            impact: 'high',
            effort: 'medium'
          }
        ],
        benchmarking: {
          industryAverage: 72,
          percentile: 80
        }
      };

      mockAdvancedAnalyzer.analyzeResume.mockResolvedValue(mockAdvancedAnalysis);

      const result = await provider.scoreResumeQuality(mockResume);

      // Verify the result has all required fields for the UI component
      expect(result).toHaveProperty('overallScore');
      expect(result).toHaveProperty('scoreBreakdown');
      expect(result).toHaveProperty('strengths');
      expect(result).toHaveProperty('weaknesses');
      expect(result).toHaveProperty('improvementAreas');
      expect(result).toHaveProperty('recommendations');
      expect(result).toHaveProperty('coachingPrompt');
      expect(result).toHaveProperty('industryBenchmark');

      // Verify score breakdown has all required categories
      expect(result.scoreBreakdown).toHaveProperty('contentQuality');
      expect(result.scoreBreakdown).toHaveProperty('structureFormat');
      expect(result.scoreBreakdown).toHaveProperty('keywordsOptimization');
      expect(result.scoreBreakdown).toHaveProperty('experienceSkills');
      expect(result.scoreBreakdown).toHaveProperty('careerNarrative');

      // Verify recommendations have correct structure
      expect(result.recommendations[0]).toHaveProperty('priority');
      expect(result.recommendations[0]).toHaveProperty('category');
      expect(result.recommendations[0]).toHaveProperty('title');
      expect(result.recommendations[0]).toHaveProperty('description');
      expect(result.recommendations[0]).toHaveProperty('impact');
    });
  });
});
