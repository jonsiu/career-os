/**
 * Conversion Tracking API Tests
 * Task Group 5.3.3: Validate conversion tracking functionality
 *
 * Tests:
 * - Affiliate click-through rate (CTR) calculation: clicks / impressions
 * - Conversion tracking via partner webhooks
 * - Conversion rate calculation: enrollments / clicks
 */

import { NextRequest } from 'next/server';
import { GET, POST } from '../conversion/route';

// Mock Convex generated API
jest.mock('@/convex/_generated/api', () => ({
  api: {
    users: {
      getByClerkUserId: 'users:getByClerkUserId',
    },
    skillGapAnalyses: {
      getById: 'skillGapAnalyses:getById',
      getByUserId: 'skillGapAnalyses:getByUserId',
      update: 'skillGapAnalyses:update',
    },
  },
}));

// Mock Convex dataModel
jest.mock('@/convex/_generated/dataModel', () => ({
  Id: jest.fn(),
}));

// Mock Clerk authentication
jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn(() => Promise.resolve({ userId: 'test-clerk-user-123' })),
}));

// Mock Convex client
const mockQuery = jest.fn();
const mockMutation = jest.fn();

jest.mock('convex/browser', () => ({
  ConvexHttpClient: jest.fn().mockImplementation(() => ({
    query: mockQuery,
    mutation: mockMutation,
  })),
}));

// Mock environment variables
process.env.NEXT_PUBLIC_CONVEX_URL = 'https://test.convex.cloud';

describe('/api/analytics/conversion', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST - Track Conversion Event', () => {
    const validConversionEvent = {
      analysisId: 'analysis-123',
      skillName: 'React',
      courseProvider: 'Coursera',
      courseUrl: 'https://coursera.org/learn/react',
      courseTitle: 'React - The Complete Guide',
      conversionType: 'enrollment',
      revenue: 22.05, // 45% commission on $49 course
    };

    it('should return 401 when user is not authenticated and no webhook signature', async () => {
      const { auth } = require('@clerk/nextjs/server');
      auth.mockResolvedValueOnce({ userId: null });

      const request = new NextRequest('http://localhost:3000/api/analytics/conversion', {
        method: 'POST',
        body: JSON.stringify(validConversionEvent),
      });

      const response = await POST(request);

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toBe('Unauthorized');
    });

    it('should return 400 when analysisId is missing', async () => {
      const invalidEvent = { ...validConversionEvent };
      delete (invalidEvent as any).analysisId;

      const request = new NextRequest('http://localhost:3000/api/analytics/conversion', {
        method: 'POST',
        body: JSON.stringify(invalidEvent),
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe('Analysis ID is required');
    });

    it('should return 400 when conversionType is invalid', async () => {
      const invalidEvent = {
        ...validConversionEvent,
        conversionType: 'invalid-type',
      };

      const request = new NextRequest('http://localhost:3000/api/analytics/conversion', {
        method: 'POST',
        body: JSON.stringify(invalidEvent),
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain('Conversion type must be one of');
    });

    it('should return 404 when analysis is not found', async () => {
      mockQuery.mockResolvedValueOnce(null); // Analysis not found

      const request = new NextRequest('http://localhost:3000/api/analytics/conversion', {
        method: 'POST',
        body: JSON.stringify(validConversionEvent),
      });

      const response = await POST(request);

      expect(response.status).toBe(404);
      const data = await response.json();
      expect(data.error).toBe('Analysis not found');
    });

    it('should successfully track conversion event', async () => {
      // Mock existing analysis
      const mockAnalysis = {
        _id: 'analysis-123',
        userId: 'user-123',
        targetRole: 'Software Engineer',
        criticalGaps: [],
        metadata: {
          affiliateClickCount: 10,
          onetDataVersion: '28.0',
          aiModel: 'claude-3-5-sonnet',
          lastProgressUpdate: Date.now(),
        },
        createdAt: Date.now(),
      };

      mockQuery.mockResolvedValueOnce(mockAnalysis);
      mockMutation.mockResolvedValueOnce('analysis-123');

      const request = new NextRequest('http://localhost:3000/api/analytics/conversion', {
        method: 'POST',
        body: JSON.stringify(validConversionEvent),
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.message).toBe('Conversion tracked successfully');
      expect(data.data.conversionEvent).toMatchObject({
        analysisId: validConversionEvent.analysisId,
        skillName: validConversionEvent.skillName,
        courseProvider: validConversionEvent.courseProvider,
        conversionType: validConversionEvent.conversionType,
      });
      expect(data.data.conversionEvent.timestamp).toBeDefined();
    });

    it('should calculate conversion metrics correctly', async () => {
      const mockAnalysis = {
        _id: 'analysis-123',
        userId: 'user-123',
        targetRole: 'Software Engineer',
        criticalGaps: [],
        metadata: {
          affiliateClickCount: 10,
          affiliateConversions: 0,
          totalRevenue: 0,
          onetDataVersion: '28.0',
          aiModel: 'claude-3-5-sonnet',
          lastProgressUpdate: Date.now(),
        },
        createdAt: Date.now(),
      };

      mockQuery.mockResolvedValueOnce(mockAnalysis);
      mockMutation.mockResolvedValueOnce('analysis-123');

      const request = new NextRequest('http://localhost:3000/api/analytics/conversion', {
        method: 'POST',
        body: JSON.stringify(validConversionEvent),
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      const data = await response.json();

      // Verify metrics calculation
      expect(data.data.metrics).toMatchObject({
        totalClicks: 10,
        totalConversions: 1,
        conversionRate: 0.1, // 1/10 = 10%
        totalRevenue: validConversionEvent.revenue,
      });
    });
  });

  describe('GET - Conversion Metrics', () => {
    it('should return 401 when user is not authenticated', async () => {
      const { auth } = require('@clerk/nextjs/server');
      auth.mockResolvedValueOnce({ userId: null });

      const request = new NextRequest('http://localhost:3000/api/analytics/conversion');
      const response = await GET(request);

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toBe('Unauthorized');
    });

    it('should calculate aggregated conversion metrics', async () => {
      // Mock user
      mockQuery.mockResolvedValueOnce({
        _id: 'user-123',
        clerkUserId: 'test-clerk-user-123',
        email: 'test@example.com',
      });

      // Mock analyses with conversion data
      mockQuery.mockResolvedValueOnce([
        {
          _id: 'analysis-1',
          userId: 'user-123',
          targetRole: 'Software Engineer',
          criticalGaps: [],
          metadata: {
            affiliateClickCount: 10,
            affiliateConversions: 1,
            totalRevenue: 22.05,
            onetDataVersion: '28.0',
            aiModel: 'claude-3-5-sonnet',
            lastProgressUpdate: Date.now(),
          },
          createdAt: Date.now(),
        },
        {
          _id: 'analysis-2',
          userId: 'user-123',
          targetRole: 'Data Scientist',
          criticalGaps: [],
          metadata: {
            affiliateClickCount: 15,
            affiliateConversions: 2,
            totalRevenue: 44.10,
            onetDataVersion: '28.0',
            aiModel: 'claude-3-5-sonnet',
            lastProgressUpdate: Date.now(),
          },
          createdAt: Date.now(),
        },
      ]);

      const request = new NextRequest('http://localhost:3000/api/analytics/conversion');
      const response = await GET(request);

      expect(response.status).toBe(200);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.metrics).toMatchObject({
        totalClicks: 25, // 10 + 15
        totalConversions: 3, // 1 + 2
        conversionRate: 0.12, // 3/25 = 12%
        totalRevenue: 66.15, // 22.05 + 44.10
        clickThroughRate: 12.5, // 25/2 analyses = 12.5
      });
    });

    it('should validate conversion rate against target (8-12%)', async () => {
      // Mock user
      mockQuery.mockResolvedValueOnce({
        _id: 'user-123',
        clerkUserId: 'test-clerk-user-123',
        email: 'test@example.com',
      });

      // Mock analyses with 10% conversion rate (within target)
      mockQuery.mockResolvedValueOnce([
        {
          _id: 'analysis-1',
          userId: 'user-123',
          targetRole: 'Software Engineer',
          criticalGaps: [],
          metadata: {
            affiliateClickCount: 100,
            affiliateConversions: 10, // 10% conversion rate
            totalRevenue: 220.50,
            onetDataVersion: '28.0',
            aiModel: 'claude-3-5-sonnet',
            lastProgressUpdate: Date.now(),
          },
          createdAt: Date.now(),
        },
      ]);

      const request = new NextRequest('http://localhost:3000/api/analytics/conversion');
      const response = await GET(request);

      expect(response.status).toBe(200);
      const data = await response.json();

      expect(data.targets).toEqual({
        clickThroughRate: 0.45, // 45%
        conversionRate: 0.10, // 10% (midpoint of 8-12%)
      });

      expect(data.meetsTargets.conversionRate).toBe(true);
      expect(data.metrics.conversionRate).toBeGreaterThanOrEqual(0.08); // >= 8%
    });
  });
});
