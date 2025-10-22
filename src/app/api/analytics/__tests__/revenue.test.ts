/**
 * Revenue Analytics API Tests
 * Task Group 5.3.4: Validate revenue targets from spec
 *
 * Tests:
 * - Affiliate click-through rate (CTR) target: 45%+
 * - Affiliate conversion rate target: 8-12%
 * - Revenue per analysis target: $3-5
 */

import { NextRequest } from 'next/server';
import { GET } from '../revenue/route';

// Mock Convex generated API
jest.mock('@/convex/_generated/api', () => ({
  api: {
    users: {
      getByClerkUserId: 'users:getByClerkUserId',
    },
    skillGapAnalyses: {
      getByUserId: 'skillGapAnalyses:getByUserId',
    },
  },
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

describe('/api/analytics/revenue', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET - Revenue Metrics Calculation', () => {
    it('should return 401 when user is not authenticated', async () => {
      const { auth } = require('@clerk/nextjs/server');
      auth.mockResolvedValueOnce({ userId: null });

      const request = new NextRequest('http://localhost:3000/api/analytics/revenue');
      const response = await GET(request);

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toBe('Unauthorized');
    });

    it('should return 404 when user is not found in database', async () => {
      mockQuery.mockResolvedValueOnce(null); // User not found

      const request = new NextRequest('http://localhost:3000/api/analytics/revenue');
      const response = await GET(request);

      expect(response.status).toBe(404);
      const data = await response.json();
      expect(data.error).toBe('User not found');
    });

    it('should calculate revenue metrics correctly', async () => {
      // Mock user
      mockQuery.mockResolvedValueOnce({
        _id: 'user-123',
        clerkUserId: 'test-clerk-user-123',
        email: 'test@example.com',
      });

      // Mock skill gap analyses with affiliate clicks
      mockQuery.mockResolvedValueOnce([
        {
          _id: 'analysis-1',
          userId: 'user-123',
          targetRole: 'Software Engineer',
          criticalGaps: [
            { skillName: 'React', priorityScore: 85 },
            { skillName: 'TypeScript', priorityScore: 80 },
          ],
          metadata: {
            affiliateClickCount: 5,
            aiModel: 'claude-3-5-sonnet',
            onetDataVersion: '28.0',
            lastProgressUpdate: Date.now(),
          },
          createdAt: Date.now() - 7 * 24 * 60 * 60 * 1000, // 7 days ago
        },
        {
          _id: 'analysis-2',
          userId: 'user-123',
          targetRole: 'Product Manager',
          criticalGaps: [
            { skillName: 'Product Strategy', priorityScore: 90 },
          ],
          metadata: {
            affiliateClickCount: 3,
            aiModel: 'rule-based',
            onetDataVersion: '28.0',
            lastProgressUpdate: Date.now(),
          },
          createdAt: Date.now() - 14 * 24 * 60 * 60 * 1000, // 14 days ago
        },
      ]);

      const request = new NextRequest('http://localhost:3000/api/analytics/revenue');
      const response = await GET(request);

      expect(response.status).toBe(200);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.analytics).toBeDefined();
      expect(data.analytics.totalAnalyses).toBe(2);
      expect(data.analytics.totalAffiliateClicks).toBe(8); // 5 + 3

      // Verify target metrics are included
      expect(data.analytics.targetMetrics).toEqual({
        clickThroughRate: 0.45, // 45%
        conversionRate: 0.10, // 10%
        revenuePerAnalysis: 4.0, // $4
      });

      // Verify metrics structure
      expect(data.analytics).toHaveProperty('clickThroughRate');
      expect(data.analytics).toHaveProperty('estimatedConversionRate');
      expect(data.analytics).toHaveProperty('estimatedTotalRevenue');
      expect(data.analytics).toHaveProperty('revenuePerAnalysis');
    });

    it('should validate CTR against 45% target', async () => {
      // Mock user
      mockQuery.mockResolvedValueOnce({
        _id: 'user-123',
        clerkUserId: 'test-clerk-user-123',
        email: 'test@example.com',
      });

      // Create analyses with high click rate to meet target
      const highClickAnalyses = Array(10).fill(null).map((_, i) => ({
        _id: `analysis-${i}`,
        userId: 'user-123',
        targetRole: 'Data Scientist',
        criticalGaps: [{ skillName: 'Python', priorityScore: 85 }],
        metadata: {
          affiliateClickCount: 5, // 5 clicks per analysis = 50% CTR (5/10 = 0.5)
          aiModel: 'claude-3-5-sonnet',
          onetDataVersion: '28.0',
          lastProgressUpdate: Date.now(),
        },
        createdAt: Date.now(),
      }));

      mockQuery.mockResolvedValueOnce(highClickAnalyses);

      const request = new NextRequest('http://localhost:3000/api/analytics/revenue');
      const response = await GET(request);

      expect(response.status).toBe(200);
      const data = await response.json();

      // With 10 analyses and 50 clicks, CTR = 50/10 = 5.0 = 500%
      // (This is impressions = analyses count, not courses * analyses)
      expect(data.analytics.clickThroughRate).toBeGreaterThanOrEqual(0.45);
      expect(data.status.ctr).toBe('meeting');
    });

    it('should validate revenue per analysis against $3-5 target', async () => {
      // Mock user
      mockQuery.mockResolvedValueOnce({
        _id: 'user-123',
        clerkUserId: 'test-clerk-user-123',
        email: 'test@example.com',
      });

      // Create analyses with sufficient clicks to generate target revenue
      mockQuery.mockResolvedValueOnce([
        {
          _id: 'analysis-1',
          userId: 'user-123',
          targetRole: 'Software Engineer',
          criticalGaps: [{ skillName: 'React', priorityScore: 85 }],
          metadata: {
            affiliateClickCount: 10, // Higher click count for revenue
            aiModel: 'claude-3-5-sonnet',
            onetDataVersion: '28.0',
            lastProgressUpdate: Date.now(),
          },
          createdAt: Date.now(),
        },
      ]);

      const request = new NextRequest('http://localhost:3000/api/analytics/revenue');
      const response = await GET(request);

      expect(response.status).toBe(200);
      const data = await response.json();

      // Verify revenue per analysis is calculated
      expect(data.analytics.revenuePerAnalysis).toBeDefined();
      expect(typeof data.analytics.revenuePerAnalysis).toBe('number');

      // Check status against target
      expect(data.status.revenuePerAnalysis).toBeDefined();
      expect(['meeting', 'below']).toContain(data.status.revenuePerAnalysis);

      // Verify targets are documented
      expect(data.targets.revenuePerAnalysis).toEqual({ min: 3, max: 5 });
    });

    it('should filter analyses by date range', async () => {
      // Mock user
      mockQuery.mockResolvedValueOnce({
        _id: 'user-123',
        clerkUserId: 'test-clerk-user-123',
        email: 'test@example.com',
      });

      const now = Date.now();
      const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);
      const sixtyDaysAgo = now - (60 * 24 * 60 * 60 * 1000);

      // Mock analyses with different dates
      mockQuery.mockResolvedValueOnce([
        {
          _id: 'analysis-recent',
          userId: 'user-123',
          targetRole: 'Software Engineer',
          criticalGaps: [],
          metadata: { affiliateClickCount: 5, aiModel: 'claude-3-5-sonnet', onetDataVersion: '28.0', lastProgressUpdate: now },
          createdAt: now - (10 * 24 * 60 * 60 * 1000), // 10 days ago
        },
        {
          _id: 'analysis-old',
          userId: 'user-123',
          targetRole: 'Data Scientist',
          criticalGaps: [],
          metadata: { affiliateClickCount: 3, aiModel: 'rule-based', onetDataVersion: '28.0', lastProgressUpdate: now },
          createdAt: sixtyDaysAgo, // 60 days ago (outside 30-day window)
        },
      ]);

      const startDate = new Date(thirtyDaysAgo).toISOString();
      const request = new NextRequest(
        `http://localhost:3000/api/analytics/revenue?startDate=${startDate}`
      );
      const response = await GET(request);

      expect(response.status).toBe(200);
      const data = await response.json();

      // Only one analysis should be in the 30-day window
      expect(data.analytics.totalAnalyses).toBe(1);
      expect(data.analytics.totalAffiliateClicks).toBe(5);
    });

    it('should calculate ROI comparison between AI-powered and rule-based', async () => {
      // Mock user
      mockQuery.mockResolvedValueOnce({
        _id: 'user-123',
        clerkUserId: 'test-clerk-user-123',
        email: 'test@example.com',
      });

      // Mock mix of AI-powered and rule-based analyses
      mockQuery.mockResolvedValueOnce([
        {
          _id: 'ai-analysis-1',
          userId: 'user-123',
          targetRole: 'Software Engineer',
          criticalGaps: [],
          metadata: {
            affiliateClickCount: 8,
            aiModel: 'claude-3-5-sonnet',
            onetDataVersion: '28.0',
            lastProgressUpdate: Date.now(),
          },
          createdAt: Date.now(),
        },
        {
          _id: 'rule-analysis-1',
          userId: 'user-123',
          targetRole: 'Product Manager',
          criticalGaps: [],
          metadata: {
            affiliateClickCount: 3,
            aiModel: 'rule-based',
            onetDataVersion: '28.0',
            lastProgressUpdate: Date.now(),
          },
          createdAt: Date.now(),
        },
      ]);

      const request = new NextRequest('http://localhost:3000/api/analytics/revenue');
      const response = await GET(request);

      expect(response.status).toBe(200);
      const data = await response.json();

      // Verify ROI comparison data exists
      expect(data.analytics.roiComparison).toBeDefined();
      expect(data.analytics.roiComparison.aiPowered).toBeDefined();
      expect(data.analytics.roiComparison.ruleBased).toBeDefined();

      expect(data.analytics.aiPoweredAnalyses).toBe(1);
      expect(data.analytics.ruleBasedAnalyses).toBe(1);
    });

    it('should track clicks by partner', async () => {
      // Mock user
      mockQuery.mockResolvedValueOnce({
        _id: 'user-123',
        clerkUserId: 'test-clerk-user-123',
        email: 'test@example.com',
      });

      mockQuery.mockResolvedValueOnce([
        {
          _id: 'analysis-1',
          userId: 'user-123',
          targetRole: 'Software Engineer',
          criticalGaps: [],
          metadata: {
            affiliateClickCount: 9, // Will be split evenly across partners
            aiModel: 'claude-3-5-sonnet',
            onetDataVersion: '28.0',
            lastProgressUpdate: Date.now(),
          },
          createdAt: Date.now(),
        },
      ]);

      const request = new NextRequest('http://localhost:3000/api/analytics/revenue');
      const response = await GET(request);

      expect(response.status).toBe(200);
      const data = await response.json();

      // Verify partner tracking structure exists
      expect(data.analytics.clicksByPartner).toBeDefined();
      expect(typeof data.analytics.clicksByPartner).toBe('object');
    });

    it('should handle empty analytics gracefully', async () => {
      // Mock user
      mockQuery.mockResolvedValueOnce({
        _id: 'user-123',
        clerkUserId: 'test-clerk-user-123',
        email: 'test@example.com',
      });

      // No analyses
      mockQuery.mockResolvedValueOnce([]);

      const request = new NextRequest('http://localhost:3000/api/analytics/revenue');
      const response = await GET(request);

      expect(response.status).toBe(200);
      const data = await response.json();

      expect(data.analytics.totalAnalyses).toBe(0);
      expect(data.analytics.totalAffiliateClicks).toBe(0);
      expect(data.analytics.clickThroughRate).toBe(0);
      expect(data.analytics.estimatedTotalRevenue).toBe(0);
      expect(data.analytics.revenuePerAnalysis).toBe(0);
    });
  });

  describe('Revenue Target Validation', () => {
    it('should validate all three target metrics from spec', async () => {
      // Mock user
      mockQuery.mockResolvedValueOnce({
        _id: 'user-123',
        clerkUserId: 'test-clerk-user-123',
        email: 'test@example.com',
      });

      mockQuery.mockResolvedValueOnce([
        {
          _id: 'analysis-1',
          userId: 'user-123',
          targetRole: 'Software Engineer',
          criticalGaps: [],
          metadata: {
            affiliateClickCount: 5,
            aiModel: 'claude-3-5-sonnet',
            onetDataVersion: '28.0',
            lastProgressUpdate: Date.now(),
          },
          createdAt: Date.now(),
        },
      ]);

      const request = new NextRequest('http://localhost:3000/api/analytics/revenue');
      const response = await GET(request);

      expect(response.status).toBe(200);
      const data = await response.json();

      // Verify all three targets are present
      expect(data.targets).toEqual({
        clickThroughRate: 45, // 45%+ target
        conversionRate: { min: 8, max: 12 }, // 8-12% target
        revenuePerAnalysis: { min: 3, max: 5 }, // $3-5 target
      });

      // Verify status checks exist for key metrics
      expect(data.status).toHaveProperty('ctr');
      expect(data.status).toHaveProperty('revenuePerAnalysis');
    });
  });
});
