/**
 * Skill Gap Analysis API Tests
 *
 * Tests for skill gap analysis API endpoints covering:
 * - POST /api/skill-gap/analyze with valid inputs
 * - Authentication requirement (Clerk)
 * - Cache hit scenario (existing contentHash)
 * - Error handling (missing resume, invalid O*NET code)
 */

import { POST as analyzePost } from '../analyze/route';
import { GET as getAnalysis } from '../[analysisId]/route';
import { GET as getHistory } from '../history/route';
import { POST as updateProgress } from '../progress/route';
import { auth } from '@clerk/nextjs/server';
import { NextRequest } from 'next/server';

// Mock Clerk authentication
jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn(),
}));

// Mock Convex client
jest.mock('@/lib/convex-client', () => ({
  api: {
    users: {
      getByClerkUserId: 'users:getByClerkUserId',
    },
    resumes: {
      getById: 'resumes:getById',
    },
    skillGapAnalyses: {
      getByContentHash: 'skillGapAnalyses:getByContentHash',
      create: 'skillGapAnalyses:create',
      getById: 'skillGapAnalyses:getById',
      getByUserId: 'skillGapAnalyses:getByUserId',
      updateProgress: 'skillGapAnalyses:updateProgress',
    },
    skills: {
      getByUserId: 'skills:getByUserId',
    },
  },
}));

// Mock services
jest.mock('@/lib/services/skill-gap-analyzer', () => ({
  SkillGapAnalyzer: jest.fn().mockImplementation(() => ({
    analyzeGap: jest.fn().mockReturnValue({
      criticalGaps: [
        {
          skillName: 'Python',
          onetCode: '2.B.5.a',
          importance: 0.9,
          currentLevel: 0,
          targetLevel: 75,
          timeToAcquire: 120,
          marketDemand: 0.8,
          careerCapital: 0.7,
        },
      ],
      niceToHaveGaps: [],
      existingSkills: ['JavaScript'],
    }),
    prioritizeGaps: jest.fn().mockReturnValue([
      {
        skillName: 'Python',
        onetCode: '2.B.5.a',
        importance: 0.9,
        currentLevel: 0,
        targetLevel: 75,
        timeToAcquire: 120,
        marketDemand: 0.8,
        careerCapital: 0.7,
        priorityScore: 85.5,
      },
    ]),
    generateRoadmap: jest.fn().mockReturnValue([
      {
        phase: 1,
        skills: ['Python'],
        estimatedDuration: 12,
        milestoneTitle: 'Critical Skills Foundation',
      },
    ]),
    calculateLearningVelocity: jest.fn().mockReturnValue(1.0),
  })),
}));

jest.mock('@/lib/services/transferable-skills-matcher', () => ({
  TransferableSkillsMatcher: jest.fn().mockImplementation(() => ({
    findTransferableSkills: jest.fn().mockResolvedValue({
      transferableSkills: [
        {
          skillName: 'JavaScript',
          currentLevel: 75,
          applicabilityToTarget: 80,
          transferRationale: 'Direct programming language transfer',
          confidence: 0.9,
        },
      ],
      transferPatterns: ['Programming language transfer'],
    }),
  })),
}));

jest.mock('@/lib/abstractions/providers/onet-provider', () => ({
  ONetProviderImpl: jest.fn().mockImplementation(() => ({
    getOccupationSkills: jest.fn().mockResolvedValue({
      occupationCode: '15-1252.00',
      occupationTitle: 'Software Developer',
      skills: [
        {
          skillName: 'Python',
          skillCode: '2.B.5.a',
          importance: 90,
          level: 75,
          category: 'Technical Skills',
        },
      ],
      knowledgeAreas: [],
      abilities: [],
      laborMarketData: {
        employmentOutlook: 'Bright',
        medianSalary: 120000,
        growthRate: 22,
      },
      cacheVersion: '29.0',
    }),
  })),
}));

jest.mock('@/lib/abstractions/providers/convex-analysis', () => ({
  ConvexAnalysisProvider: jest.fn().mockImplementation(() => ({
    parseResumeContent: jest.fn().mockResolvedValue({
      personalInfo: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '555-0123',
        location: 'San Francisco, CA',
        summary: 'Software developer',
      },
      experience: [],
      education: [],
      skills: [
        { name: 'JavaScript', level: 'advanced' },
      ],
      certifications: [],
    }),
  })),
}));

jest.mock('@/lib/utils/content-hash', () => ({
  generateContentHash: jest.fn().mockResolvedValue('abc123def456'),
}));

// Mock Convex client implementation
const mockConvexQuery = jest.fn();
const mockConvexMutation = jest.fn();

jest.mock('convex/nextjs', () => ({
  ConvexHttpClient: jest.fn().mockImplementation(() => ({
    query: mockConvexQuery,
    mutation: mockConvexMutation,
  })),
}));

describe('Skill Gap Analysis API', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Default: authenticated user
    (auth as jest.Mock).mockReturnValue({ userId: 'user_123' });

    // Default Convex query responses
    mockConvexQuery.mockImplementation((operation: string) => {
      if (operation === 'users:getByClerkUserId') {
        return Promise.resolve({
          _id: 'convex_user_123',
          clerkUserId: 'user_123',
          email: 'test@example.com',
          name: 'Test User',
        });
      }
      if (operation === 'resumes:getById') {
        return Promise.resolve({
          _id: 'resume_123',
          userId: 'convex_user_123',
          title: 'Software Developer Resume',
          content: 'JavaScript developer with 5 years experience',
          filePath: '/resumes/resume.pdf',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      }
      if (operation === 'skillGapAnalyses:getByContentHash') {
        return Promise.resolve(null); // No cache by default
      }
      return Promise.resolve(null);
    });

    // Default Convex mutation response
    mockConvexMutation.mockResolvedValue('analysis_123');
  });

  describe('POST /api/skill-gap/analyze', () => {
    it('should analyze skill gaps with valid inputs', async () => {
      const request = new NextRequest('http://localhost:3000/api/skill-gap/analyze', {
        method: 'POST',
        body: JSON.stringify({
          resumeId: 'resume_123',
          targetRole: 'Software Developer',
          targetRoleONetCode: '15-1252.00',
          userAvailability: 10,
        }),
      });

      const response = await analyzePost(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.analysisId).toBeDefined();
      expect(data.criticalGaps).toHaveLength(1);
      expect(data.criticalGaps[0].skillName).toBe('Python');
      expect(data.transferableSkills).toHaveLength(1);
      expect(data.roadmap).toHaveLength(1);
    });

    it('should require authentication', async () => {
      (auth as jest.Mock).mockReturnValue({ userId: null });

      const request = new NextRequest('http://localhost:3000/api/skill-gap/analyze', {
        method: 'POST',
        body: JSON.stringify({
          resumeId: 'resume_123',
          targetRole: 'Software Developer',
          userAvailability: 10,
        }),
      });

      const response = await analyzePost(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should return cached analysis when content hash matches', async () => {
      // Mock cache hit
      mockConvexQuery.mockImplementation((operation: string) => {
        if (operation === 'skillGapAnalyses:getByContentHash') {
          return Promise.resolve({
            _id: 'cached_analysis_123',
            userId: 'convex_user_123',
            resumeId: 'resume_123',
            targetRole: 'Software Developer',
            criticalGaps: [
              {
                skillName: 'Python',
                priorityScore: 85.5,
                importance: 0.9,
                currentLevel: 0,
                targetLevel: 75,
                timeEstimate: 120,
                marketDemand: 0.8,
              },
            ],
            niceToHaveGaps: [],
            transferableSkills: [],
            prioritizedRoadmap: [],
            contentHash: 'abc123def456',
            createdAt: Date.now(),
          });
        }
        if (operation === 'users:getByClerkUserId') {
          return Promise.resolve({
            _id: 'convex_user_123',
            clerkUserId: 'user_123',
          });
        }
        if (operation === 'resumes:getById') {
          return Promise.resolve({
            _id: 'resume_123',
            content: 'test content',
          });
        }
        return Promise.resolve(null);
      });

      const request = new NextRequest('http://localhost:3000/api/skill-gap/analyze', {
        method: 'POST',
        body: JSON.stringify({
          resumeId: 'resume_123',
          targetRole: 'Software Developer',
          targetRoleONetCode: '15-1252.00',
          userAvailability: 10,
        }),
      });

      const response = await analyzePost(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.cached).toBe(true);
      expect(data.analysisId).toBe('cached_analysis_123');
    });

    it('should handle missing resume error', async () => {
      mockConvexQuery.mockImplementation((operation: string) => {
        if (operation === 'resumes:getById') {
          return Promise.resolve(null); // Resume not found
        }
        if (operation === 'users:getByClerkUserId') {
          return Promise.resolve({
            _id: 'convex_user_123',
            clerkUserId: 'user_123',
          });
        }
        return Promise.resolve(null);
      });

      const request = new NextRequest('http://localhost:3000/api/skill-gap/analyze', {
        method: 'POST',
        body: JSON.stringify({
          resumeId: 'nonexistent_resume',
          targetRole: 'Software Developer',
          userAvailability: 10,
        }),
      });

      const response = await analyzePost(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Resume not found');
    });

    it('should handle missing required fields', async () => {
      const request = new NextRequest('http://localhost:3000/api/skill-gap/analyze', {
        method: 'POST',
        body: JSON.stringify({
          // Missing resumeId, targetRole, userAvailability
        }),
      });

      const response = await analyzePost(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('required');
    });
  });

  describe('GET /api/skill-gap/[analysisId]', () => {
    it('should retrieve analysis by ID', async () => {
      mockConvexQuery.mockImplementation((operation: string) => {
        if (operation === 'skillGapAnalyses:getById') {
          return Promise.resolve({
            _id: 'analysis_123',
            userId: 'convex_user_123',
            targetRole: 'Software Developer',
            criticalGaps: [],
          });
        }
        if (operation === 'users:getByClerkUserId') {
          return Promise.resolve({
            _id: 'convex_user_123',
            clerkUserId: 'user_123',
          });
        }
        return Promise.resolve(null);
      });

      const request = new NextRequest('http://localhost:3000/api/skill-gap/analysis_123');
      const response = await getAnalysis(request, { params: { analysisId: 'analysis_123' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.analysis).toBeDefined();
    });

    it('should require authentication', async () => {
      (auth as jest.Mock).mockReturnValue({ userId: null });

      const request = new NextRequest('http://localhost:3000/api/skill-gap/analysis_123');
      const response = await getAnalysis(request, { params: { analysisId: 'analysis_123' } });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });
  });

  describe('GET /api/skill-gap/history', () => {
    it('should retrieve user analysis history', async () => {
      mockConvexQuery.mockImplementation((operation: string) => {
        if (operation === 'skillGapAnalyses:getByUserId') {
          return Promise.resolve([
            {
              _id: 'analysis_1',
              targetRole: 'Software Developer',
              createdAt: Date.now(),
            },
            {
              _id: 'analysis_2',
              targetRole: 'Data Scientist',
              createdAt: Date.now() - 1000,
            },
          ]);
        }
        if (operation === 'users:getByClerkUserId') {
          return Promise.resolve({
            _id: 'convex_user_123',
            clerkUserId: 'user_123',
          });
        }
        return Promise.resolve(null);
      });

      const request = new NextRequest('http://localhost:3000/api/skill-gap/history');
      const response = await getHistory(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.analyses).toHaveLength(2);
      expect(data.count).toBe(2);
    });
  });

  describe('POST /api/skill-gap/progress', () => {
    it('should update analysis progress', async () => {
      mockConvexQuery.mockImplementation((operation: string) => {
        if (operation === 'skillGapAnalyses:getById') {
          return Promise.resolve({
            _id: 'analysis_123',
            userId: 'convex_user_123',
            criticalGaps: [
              { skillName: 'Python' },
              { skillName: 'React' },
            ],
            niceToHaveGaps: [
              { skillName: 'Docker' },
            ],
          });
        }
        if (operation === 'skills:getByUserId') {
          return Promise.resolve([
            { name: 'Python', status: 'mastered' },
            { name: 'React', status: 'practicing' },
          ]);
        }
        if (operation === 'users:getByClerkUserId') {
          return Promise.resolve({
            _id: 'convex_user_123',
            clerkUserId: 'user_123',
          });
        }
        return Promise.resolve(null);
      });

      const request = new NextRequest('http://localhost:3000/api/skill-gap/progress', {
        method: 'POST',
        body: JSON.stringify({
          analysisId: 'analysis_123',
        }),
      });

      const response = await updateProgress(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.completionProgress).toBeGreaterThan(0);
      expect(data.closedGaps).toBe(2);
      expect(data.totalGaps).toBe(3);
    });
  });
});
