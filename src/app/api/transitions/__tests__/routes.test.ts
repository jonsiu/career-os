import { NextRequest } from 'next/server';
import { POST as identifyPOST } from '../identify/route';
import { POST as roadmapPOST } from '../roadmap/route';
import { POST as skillsGapPOST } from '../skills-gap/route';
import { GET as benchmarksGET } from '../benchmarks/route';
import { POST as coursesPOST } from '../courses/route';

// Mock Clerk auth
jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn(() => Promise.resolve({ userId: 'test-user-123' })),
}));

// Mock Convex database provider
jest.mock('@/lib/abstractions/providers/convex-database', () => ({
  ConvexDatabaseProvider: jest.fn().mockImplementation(() => ({
    getUserByClerkId: jest.fn().mockResolvedValue({
      _id: 'user_123',
      clerkUserId: 'test-user-123',
      email: 'test@example.com',
    }),
    getResumeById: jest.fn().mockResolvedValue({
      id: 'resume_123',
      userId: 'user_123',
      content: JSON.stringify({
        personalInfo: { firstName: 'John', lastName: 'Doe' },
        experience: [
          {
            title: 'Software Engineer',
            company: 'Tech Corp',
            startDate: '2020-01-01',
            endDate: '2023-01-01',
            current: false,
            description: 'Built scalable applications using React and Node.js',
          },
        ],
        skills: [
          { name: 'JavaScript', level: 'advanced' },
          { name: 'React', level: 'advanced' },
          { name: 'Node.js', level: 'intermediate' },
        ],
      }),
      fileName: 'resume.pdf',
      createdAt: Date.now(),
    }),
  })),
}));

// Mock external API integrations
jest.mock('@/lib/integrations/onet-api', () => ({
  validateSkill: jest.fn().mockResolvedValue({ valid: true, importance: 'high' }),
  getSkillRequirements: jest.fn().mockResolvedValue({
    level: 'advanced',
    importance: 4.5,
  }),
}));

jest.mock('@/lib/integrations/course-providers', () => ({
  searchCourses: jest.fn().mockResolvedValue([
    {
      provider: 'Coursera',
      title: 'Advanced React Development',
      url: 'https://coursera.org/course/react',
      affiliateLink: 'https://coursera.org/course/react?affiliate=test',
      price: 49.99,
    },
  ]),
}));

describe('Transition API Routes', () => {
  describe('POST /api/transitions/identify', () => {
    it('should identify transition type from resume and target role', async () => {
      const request = new NextRequest('http://localhost:3000/api/transitions/identify', {
        method: 'POST',
        body: JSON.stringify({
          resumeId: 'resume_123',
          targetRole: 'Engineering Manager',
          targetIndustry: 'Technology',
        }),
      });

      const response = await identifyPOST(request);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('transitionTypes');
      expect(data.data).toHaveProperty('primaryTransitionType');
      expect(data.data).toHaveProperty('currentRole');
      expect(data.data).toHaveProperty('targetRole');
    });

    it('should return 401 when user is not authenticated', async () => {
      const { auth } = require('@clerk/nextjs/server');
      auth.mockResolvedValueOnce({ userId: null });

      const request = new NextRequest('http://localhost:3000/api/transitions/identify', {
        method: 'POST',
        body: JSON.stringify({
          resumeId: 'resume_123',
          targetRole: 'Engineering Manager',
        }),
      });

      const response = await identifyPOST(request);
      expect(response.status).toBe(401);
    });

    it('should return 400 when required parameters are missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/transitions/identify', {
        method: 'POST',
        body: JSON.stringify({
          // Missing resumeId and targetRole
        }),
      });

      const response = await identifyPOST(request);
      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/transitions/roadmap', () => {
    it('should generate personalized transition roadmap', async () => {
      const request = new NextRequest('http://localhost:3000/api/transitions/roadmap', {
        method: 'POST',
        body: JSON.stringify({
          resumeId: 'resume_123',
          transitionTypes: ['cross-role'],
          currentRole: 'Software Engineer',
          targetRole: 'Engineering Manager',
          currentIndustry: 'Technology',
          targetIndustry: 'Technology',
        }),
      });

      const response = await roadmapPOST(request);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('timeline');
      expect(data.data).toHaveProperty('milestones');
      expect(data.data).toHaveProperty('bridgeRoles');
      expect(data.data.timeline).toHaveProperty('minMonths');
      expect(data.data.timeline).toHaveProperty('maxMonths');
    });

    it('should use cached result when content hash matches', async () => {
      const requestBody = {
        resumeId: 'resume_123',
        transitionTypes: ['cross-role'],
        currentRole: 'Software Engineer',
        targetRole: 'Engineering Manager',
      };

      // First request
      const request1 = new NextRequest('http://localhost:3000/api/transitions/roadmap', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      const response1 = await roadmapPOST(request1);
      const data1 = await response1.json();

      // Second request with same data (should use cache)
      const request2 = new NextRequest('http://localhost:3000/api/transitions/roadmap', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      const response2 = await roadmapPOST(request2);
      const data2 = await response2.json();

      expect(data2.cached).toBeDefined();
    });
  });

  describe('POST /api/transitions/skills-gap', () => {
    it('should analyze skill gaps with O*NET validation', async () => {
      const request = new NextRequest('http://localhost:3000/api/transitions/skills-gap', {
        method: 'POST',
        body: JSON.stringify({
          resumeId: 'resume_123',
          currentRole: 'Software Engineer',
          targetRole: 'Engineering Manager',
        }),
      });

      const response = await skillsGapPOST(request);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('skillGaps');
      expect(Array.isArray(data.data.skillGaps)).toBe(true);

      if (data.data.skillGaps.length > 0) {
        const skillGap = data.data.skillGaps[0];
        expect(skillGap).toHaveProperty('skill');
        expect(skillGap).toHaveProperty('criticality');
        expect(skillGap).toHaveProperty('transferable');
        expect(skillGap).toHaveProperty('learningTime');
      }
    });

    it('should gracefully handle O*NET API failures', async () => {
      const { validateSkill } = require('@/lib/integrations/onet-api');
      validateSkill.mockRejectedValueOnce(new Error('O*NET API unavailable'));

      const request = new NextRequest('http://localhost:3000/api/transitions/skills-gap', {
        method: 'POST',
        body: JSON.stringify({
          resumeId: 'resume_123',
          currentRole: 'Software Engineer',
          targetRole: 'Engineering Manager',
        }),
      });

      const response = await skillsGapPOST(request);
      expect(response.status).toBe(200); // Should still succeed with AI-only analysis

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.onetValidation).toBe(false);
    });
  });

  describe('GET /api/transitions/benchmarks', () => {
    it('should return benchmarking data for transition type', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/transitions/benchmarks?transitionType=cross-role&currentRole=Software%20Engineer&targetRole=Engineering%20Manager'
      );

      const response = await benchmarksGET(request);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('similarTransitions');
      expect(data.data).toHaveProperty('averageTimeline');
      expect(data.data).toHaveProperty('successRate');
    });

    it('should return 400 when required parameters are missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/transitions/benchmarks');

      const response = await benchmarksGET(request);
      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/transitions/courses', () => {
    it('should return course recommendations with affiliate links', async () => {
      const request = new NextRequest('http://localhost:3000/api/transitions/courses', {
        method: 'POST',
        body: JSON.stringify({
          skillName: 'Leadership',
          criticalityLevel: 'critical',
          targetRole: 'Engineering Manager',
        }),
      });

      const response = await coursesPOST(request);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('courses');
      expect(Array.isArray(data.data.courses)).toBe(true);
      expect(data.affiliateDisclosure).toBeDefined();

      if (data.data.courses.length > 0) {
        const course = data.data.courses[0];
        expect(course).toHaveProperty('provider');
        expect(course).toHaveProperty('title');
        expect(course).toHaveProperty('url');
        expect(course).toHaveProperty('affiliateLink');
        expect(course.affiliateLink).toContain('affiliate');
      }
    });

    it('should include affiliate disclosure in response', async () => {
      const request = new NextRequest('http://localhost:3000/api/transitions/courses', {
        method: 'POST',
        body: JSON.stringify({
          skillName: 'Leadership',
          criticalityLevel: 'critical',
          targetRole: 'Engineering Manager',
        }),
      });

      const response = await coursesPOST(request);
      const data = await response.json();

      expect(data.affiliateDisclosure).toBe(
        'We may earn a commission from course purchases made through these affiliate links.'
      );
    });
  });
});
