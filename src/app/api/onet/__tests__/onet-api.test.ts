/**
 * O*NET API Integration Tests
 * Task Group 3.2.1: Tests for O*NET API endpoints
 */

import { NextRequest } from 'next/server';
import { GET as searchHandler } from '../search/route';
import { GET as occupationHandler } from '../occupation/[code]/route';
import { GET as skillsHandler } from '../skills/[code]/route';

// Mock Clerk authentication
jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn(() => Promise.resolve({ userId: 'test-user-123' })),
}));

// Mock O*NET provider
jest.mock('@/lib/abstractions/providers/onet-provider', () => ({
  ONetProviderImpl: jest.fn().mockImplementation(() => ({
    searchOccupations: jest.fn().mockResolvedValue([
      {
        code: '15-1252.00',
        title: 'Software Developers, Applications',
        description: 'Develop, create, and modify general computer applications software or specialized utility programs.',
      },
      {
        code: '15-1251.00',
        title: 'Computer Programmers',
        description: 'Create, modify, and test the code and scripts that allow computer applications to run.',
      },
    ]),
    getOccupationSkills: jest.fn().mockResolvedValue({
      code: '15-1252.00',
      title: 'Software Developers, Applications',
      skills: [
        {
          skillName: 'Programming',
          skillCode: '2.A.1.b',
          importance: 95,
          level: 6.5,
          category: 'Technical Skills',
        },
        {
          skillName: 'Critical Thinking',
          skillCode: '2.A.1.a',
          importance: 85,
          level: 5.5,
          category: 'Basic Skills',
        },
      ],
      knowledgeAreas: [
        {
          name: 'Computers and Electronics',
          level: 7.0,
          importance: 95,
        },
      ],
      abilities: [
        {
          name: 'Deductive Reasoning',
          level: 6.0,
          importance: 90,
        },
      ],
      laborMarketData: {
        employmentOutlook: 'Bright',
        medianSalary: 110140,
        growthRate: 22,
      },
    }),
    getCachedOccupation: jest.fn().mockResolvedValue(null), // No cache initially
    cacheOccupation: jest.fn().mockResolvedValue(undefined),
  })),
}));

describe('O*NET API Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/onet/search', () => {
    it('should search occupations with valid query', async () => {
      const url = new URL('http://localhost:3000/api/onet/search?query=software');
      const request = new NextRequest(url);

      const response = await searchHandler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.occupations).toHaveLength(2);
      expect(data.occupations[0].code).toBe('15-1252.00');
      expect(data.occupations[0].title).toBe('Software Developers, Applications');
    });

    it('should require query parameter', async () => {
      const url = new URL('http://localhost:3000/api/onet/search');
      const request = new NextRequest(url);

      const response = await searchHandler(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('query');
    });

    it('should handle authentication requirement', async () => {
      const { auth } = require('@clerk/nextjs/server');
      auth.mockResolvedValueOnce({ userId: null });

      const url = new URL('http://localhost:3000/api/onet/search?query=software');
      const request = new NextRequest(url);

      const response = await searchHandler(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });
  });

  describe('GET /api/onet/occupation/[code]', () => {
    it('should retrieve occupation details with valid code', async () => {
      const url = new URL('http://localhost:3000/api/onet/occupation/15-1252.00');
      const request = new NextRequest(url);
      const params = { code: '15-1252.00' };

      const response = await occupationHandler(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.occupation).toBeDefined();
      expect(data.occupation.code).toBe('15-1252.00');
      expect(data.occupation.skills).toHaveLength(2);
      expect(data.occupation.laborMarketData).toBeDefined();
    });

    it('should handle invalid occupation code', async () => {
      const { ONetProviderImpl } = require('@/lib/abstractions/providers/onet-provider');
      const mockProvider = new ONetProviderImpl();
      mockProvider.getOccupationSkills.mockRejectedValueOnce(new Error('Occupation not found'));

      const url = new URL('http://localhost:3000/api/onet/occupation/99-9999.99');
      const request = new NextRequest(url);
      const params = { code: '99-9999.99' };

      const response = await occupationHandler(request, { params });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toContain('not found');
    });
  });

  describe('GET /api/onet/skills/[code]', () => {
    it('should retrieve occupation skills only', async () => {
      const url = new URL('http://localhost:3000/api/onet/skills/15-1252.00');
      const request = new NextRequest(url);
      const params = { code: '15-1252.00' };

      const response = await skillsHandler(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.skills).toHaveLength(2);
      expect(data.skills[0].skillName).toBe('Programming');
      // Should not include full occupation details
      expect(data.occupation).toBeUndefined();
    });
  });

  describe('Cache Layer Integration', () => {
    it('should utilize cache to avoid redundant API calls', async () => {
      const { ONetProviderImpl } = require('@/lib/abstractions/providers/onet-provider');
      const mockProvider = new ONetProviderImpl();

      // First call - cache miss
      mockProvider.getCachedOccupation.mockResolvedValueOnce(null);

      const url1 = new URL('http://localhost:3000/api/onet/occupation/15-1252.00');
      const request1 = new NextRequest(url1);
      const params1 = { code: '15-1252.00' };

      await occupationHandler(request1, { params: params1 });

      expect(mockProvider.getCachedOccupation).toHaveBeenCalledWith('15-1252.00');
      expect(mockProvider.getOccupationSkills).toHaveBeenCalled();
      expect(mockProvider.cacheOccupation).toHaveBeenCalled();
    });
  });
});
