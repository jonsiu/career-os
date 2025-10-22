/**
 * Affiliate Recommendations API Tests
 * Task Group 3.3.1: Test affiliate API endpoints
 *
 * Tests cover:
 * - POST /api/recommendations/courses (course recommendations)
 * - POST /api/recommendations/track-click (click tracking)
 */

// Mock Clerk auth - must be before imports
jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn(),
}));

// Mock Convex client - must be before imports
jest.mock('convex/browser', () => ({
  ConvexHttpClient: jest.fn().mockImplementation(() => ({
    query: jest.fn(),
    mutation: jest.fn(),
  })),
}));

// Mock Convex API using the @/ alias path
jest.mock('@/convex/_generated/api', () => ({
  api: {
    skillGapAnalyses: {
      getById: 'skillGapAnalyses:getById',
      update: 'skillGapAnalyses:update',
    },
  },
}));

// Mock Convex dataModel using the module path jest will resolve
jest.mock('../../../../../convex/_generated/dataModel', () => ({
  Id: jest.fn(),
}), { virtual: true });

import { NextRequest } from 'next/server';
import { POST as coursesPost } from '../courses/route';
import { POST as trackClickPost } from '../track-click/route';
import { auth } from '@clerk/nextjs/server';
import { ConvexHttpClient } from 'convex/browser';

describe('POST /api/recommendations/courses', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Set up environment variable
    process.env.NEXT_PUBLIC_CONVEX_URL = 'https://test.convex.cloud';
  });

  it('should return 401 if user is not authenticated', async () => {
    (auth as jest.Mock).mockResolvedValue({ userId: null });

    const request = new NextRequest('http://localhost:3000/api/recommendations/courses', {
      method: 'POST',
      body: JSON.stringify({
        analysisId: 'test123',
        skillGaps: [{ skillName: 'Python', priorityScore: 85 }],
      }),
    });

    const response = await coursesPost(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('should return 400 if analysisId is missing', async () => {
    (auth as jest.Mock).mockResolvedValue({ userId: 'user123' });

    const request = new NextRequest('http://localhost:3000/api/recommendations/courses', {
      method: 'POST',
      body: JSON.stringify({
        skillGaps: [{ skillName: 'Python', priorityScore: 85 }],
      }),
    });

    const response = await coursesPost(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('Analysis ID is required');
  });

  it('should return 400 if skillGaps is empty or missing', async () => {
    (auth as jest.Mock).mockResolvedValue({ userId: 'user123' });

    const request = new NextRequest('http://localhost:3000/api/recommendations/courses', {
      method: 'POST',
      body: JSON.stringify({
        analysisId: 'test123',
        skillGaps: [],
      }),
    });

    const response = await coursesPost(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('Skill gaps array is required');
  });

  it('should return 404 if analysis is not found', async () => {
    (auth as jest.Mock).mockResolvedValue({ userId: 'user123' });

    // Mock Convex query to return null (analysis not found)
    const mockQuery = jest.fn().mockResolvedValue(null);
    (ConvexHttpClient as jest.Mock).mockImplementation(() => ({
      query: mockQuery,
      mutation: jest.fn(),
    }));

    const request = new NextRequest('http://localhost:3000/api/recommendations/courses', {
      method: 'POST',
      body: JSON.stringify({
        analysisId: 'nonexistent123',
        skillGaps: [
          { skillName: 'Python', priorityScore: 85, importance: 0.9, currentLevel: 20, targetLevel: 80, timeToAcquire: 120, marketDemand: 0.8, careerCapital: 0.7 }
        ],
      }),
    });

    const response = await coursesPost(request);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe('Analysis not found');
  });

  it('should return course recommendations with affiliate links and FTC disclosure', async () => {
    (auth as jest.Mock).mockResolvedValue({ userId: 'user123' });

    // Mock Convex query to return valid analysis
    const mockAnalysis = {
      _id: 'analysis123',
      userId: 'convexUser123',
      targetRole: 'Data Scientist',
      metadata: {
        onetDataVersion: '28.0',
        aiModel: 'claude-3-5-sonnet',
        affiliateClickCount: 5,
        lastProgressUpdate: Date.now(),
      },
    };

    const mockQuery = jest.fn().mockResolvedValue(mockAnalysis);
    (ConvexHttpClient as jest.Mock).mockImplementation(() => ({
      query: mockQuery,
      mutation: jest.fn(),
    }));

    const request = new NextRequest('http://localhost:3000/api/recommendations/courses', {
      method: 'POST',
      body: JSON.stringify({
        analysisId: 'analysis123',
        skillGaps: [
          {
            skillName: 'Python',
            priorityScore: 85,
            importance: 0.9,
            currentLevel: 20,
            targetLevel: 80,
            timeToAcquire: 120,
            marketDemand: 0.8,
            careerCapital: 0.7,
          },
        ],
      }),
    });

    const response = await coursesPost(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.recommendations).toBeDefined();
    expect(Array.isArray(data.recommendations)).toBe(true);
    expect(data.disclosure).toBeDefined();
    expect(data.disclosure).toContain('commission');
    expect(data.disclosure).toContain('no additional cost');
    expect(data.metadata).toBeDefined();
    expect(data.metadata.analysisId).toBe('analysis123');
  });

  it('should generate affiliate links with unique tracking tags', async () => {
    (auth as jest.Mock).mockResolvedValue({ userId: 'user456' });

    const mockAnalysis = {
      _id: 'analysis789',
      userId: 'convexUser456',
      targetRole: 'Frontend Developer',
      metadata: {
        onetDataVersion: '28.0',
        aiModel: 'claude-3-5-sonnet',
        affiliateClickCount: 0,
        lastProgressUpdate: Date.now(),
      },
    };

    const mockQuery = jest.fn().mockResolvedValue(mockAnalysis);
    (ConvexHttpClient as jest.Mock).mockImplementation(() => ({
      query: mockQuery,
      mutation: jest.fn(),
    }));

    const request = new NextRequest('http://localhost:3000/api/recommendations/courses', {
      method: 'POST',
      body: JSON.stringify({
        analysisId: 'analysis789',
        skillGaps: [
          {
            skillName: 'React',
            priorityScore: 90,
            importance: 0.95,
            currentLevel: 30,
            targetLevel: 90,
            timeToAcquire: 100,
            marketDemand: 0.9,
            careerCapital: 0.8,
          },
        ],
      }),
    });

    const response = await coursesPost(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);

    // Check that recommendations contain courses with affiliate URLs
    if (data.recommendations.length > 0 && data.recommendations[0].courses.length > 0) {
      const firstCourse = data.recommendations[0].courses[0];
      expect(firstCourse.affiliateUrl).toBeDefined();
      // Tracking tag should contain user ID, analysis ID, and skill name
      expect(firstCourse.affiliateUrl).toContain('user456');
      expect(firstCourse.affiliateUrl).toContain('analysis789');
      expect(firstCourse.affiliateUrl).toContain('React');
    }
  });
});

describe('POST /api/recommendations/track-click', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NEXT_PUBLIC_CONVEX_URL = 'https://test.convex.cloud';
  });

  it('should return 401 if user is not authenticated', async () => {
    (auth as jest.Mock).mockResolvedValue({ userId: null });

    const request = new NextRequest('http://localhost:3000/api/recommendations/track-click', {
      method: 'POST',
      body: JSON.stringify({
        analysisId: 'test123',
        skillName: 'Python',
        courseProvider: 'Coursera',
        courseUrl: 'https://example.com',
      }),
    });

    const response = await trackClickPost(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('should return 400 if required fields are missing', async () => {
    (auth as jest.Mock).mockResolvedValue({ userId: 'user123' });

    const request = new NextRequest('http://localhost:3000/api/recommendations/track-click', {
      method: 'POST',
      body: JSON.stringify({
        analysisId: 'test123',
        // Missing skillName, courseProvider, courseUrl
      }),
    });

    const response = await trackClickPost(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBeDefined();
  });

  it('should return 404 if analysis is not found', async () => {
    (auth as jest.Mock).mockResolvedValue({ userId: 'user123' });

    // Mock Convex query to return null
    const mockQuery = jest.fn().mockResolvedValue(null);
    (ConvexHttpClient as jest.Mock).mockImplementation(() => ({
      query: mockQuery,
      mutation: jest.fn(),
    }));

    const request = new NextRequest('http://localhost:3000/api/recommendations/track-click', {
      method: 'POST',
      body: JSON.stringify({
        analysisId: 'nonexistent123',
        skillName: 'Python',
        courseProvider: 'Coursera',
        courseUrl: 'https://example.com',
      }),
    });

    const response = await trackClickPost(request);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe('Analysis not found');
  });

  it('should track click and increment affiliate click count', async () => {
    (auth as jest.Mock).mockResolvedValue({ userId: 'user123' });

    const mockAnalysis = {
      _id: 'analysis123',
      userId: 'convexUser123',
      metadata: {
        onetDataVersion: '28.0',
        aiModel: 'claude-3-5-sonnet',
        affiliateClickCount: 5,
        lastProgressUpdate: Date.now() - 10000,
      },
    };

    const mockQuery = jest.fn().mockResolvedValue(mockAnalysis);
    const mockMutation = jest.fn().mockResolvedValue('analysis123');

    (ConvexHttpClient as jest.Mock).mockImplementation(() => ({
      query: mockQuery,
      mutation: mockMutation,
    }));

    const request = new NextRequest('http://localhost:3000/api/recommendations/track-click', {
      method: 'POST',
      body: JSON.stringify({
        analysisId: 'analysis123',
        skillName: 'Python',
        courseProvider: 'Coursera',
        courseUrl: 'https://www.coursera.org/learn/python',
        courseTitle: 'Python for Everybody',
      }),
    });

    const response = await trackClickPost(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.message).toBe('Click tracked successfully');
    expect(data.data.analysisId).toBe('analysis123');
    expect(data.data.skillName).toBe('Python');
    expect(data.data.courseProvider).toBe('Coursera');
    expect(data.data.clickCount).toBe(6); // Incremented from 5 to 6

    // Verify mutation was called to update analysis
    expect(mockMutation).toHaveBeenCalled();
  });

  it('should handle click tracking for analysis with zero prior clicks', async () => {
    (auth as jest.Mock).mockResolvedValue({ userId: 'user789' });

    const mockAnalysis = {
      _id: 'analysis999',
      userId: 'convexUser789',
      metadata: {
        onetDataVersion: '28.0',
        aiModel: 'gpt-4',
        affiliateClickCount: 0,
        lastProgressUpdate: Date.now(),
      },
    };

    const mockQuery = jest.fn().mockResolvedValue(mockAnalysis);
    const mockMutation = jest.fn().mockResolvedValue('analysis999');

    (ConvexHttpClient as jest.Mock).mockImplementation(() => ({
      query: mockQuery,
      mutation: mockMutation,
    }));

    const request = new NextRequest('http://localhost:3000/api/recommendations/track-click', {
      method: 'POST',
      body: JSON.stringify({
        analysisId: 'analysis999',
        skillName: 'JavaScript',
        courseProvider: 'Udemy',
        courseUrl: 'https://www.udemy.com/course/javascript-complete',
      }),
    });

    const response = await trackClickPost(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.clickCount).toBe(1); // First click
  });
});
