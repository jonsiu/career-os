/**
 * O*NET Provider Tests
 *
 * Tests focus on:
 * 1. Occupation search with valid query
 * 2. Occupation skills retrieval with caching
 * 3. Cache hit vs. cache miss scenarios
 * 4. API rate limit handling
 */

// Mock Convex client first
jest.mock('convex/browser', () => ({
  ConvexHttpClient: jest.fn().mockImplementation(() => ({
    query: jest.fn(),
    mutation: jest.fn(),
  })),
}));

// Mock the api import that comes from convex-client
jest.mock('@/lib/convex-client', () => ({
  api: {
    onetCache: {
      searchOccupations: 'onetCache:searchOccupations',
      getValidCache: 'onetCache:getValidCache',
      cacheOccupation: 'onetCache:cacheOccupation',
    },
  },
  convexClient: {
    query: jest.fn(),
    mutation: jest.fn(),
  },
}));

// Mock environment variables
process.env.NEXT_PUBLIC_CONVEX_URL = 'https://test.convex.cloud';
process.env.ONET_API_USERNAME = 'test_user';
process.env.ONET_API_PASSWORD = 'test_pass';

import { ONetProviderImpl } from '../onet-provider';

describe('ONetProviderImpl', () => {
  let provider: ONetProviderImpl;
  let mockConvexClient: any;

  beforeEach(() => {
    provider = new ONetProviderImpl();
    mockConvexClient = (provider as any).convexClient;

    // Reset mocks
    jest.clearAllMocks();

    // Mock fetch globally
    global.fetch = jest.fn();
  });

  describe('searchOccupations', () => {
    it('should return cached results when available', async () => {
      // Arrange: Mock cached results
      const cachedOccupations = [
        {
          occupationCode: '15-1252.00',
          occupationTitle: 'Software Developers',
          skills: [{}, {}, {}], // 3 skills
          knowledgeAreas: [{}, {}], // 2 knowledge areas
          abilities: [],
          laborMarketData: { employmentOutlook: 'Bright' },
          cacheVersion: '29.0',
        },
      ];

      mockConvexClient.query.mockResolvedValue(cachedOccupations);

      // Act
      const results = await provider.searchOccupations('software developer');

      // Assert
      expect(results).toHaveLength(1);
      expect(results[0]).toEqual({
        code: '15-1252.00',
        title: 'Software Developers',
        description: '3 skills, 2 knowledge areas',
      });
      expect(mockConvexClient.query).toHaveBeenCalledWith(
        'onetCache:searchOccupations',
        { query: 'software developer' }
      );
    });

    it('should return empty array when no results found', async () => {
      // Arrange: Mock empty cache and failed API call
      mockConvexClient.query.mockResolvedValue([]);
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 404,
      });

      // Act
      const results = await provider.searchOccupations('nonexistent occupation');

      // Assert
      expect(results).toHaveLength(0);
    });

    it('should handle API errors gracefully', async () => {
      // Arrange: Mock failed cache and API error
      mockConvexClient.query.mockResolvedValue([]);
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      // Act
      const results = await provider.searchOccupations('software developer');

      // Assert: Should return empty array instead of throwing
      expect(results).toHaveLength(0);
    });
  });

  describe('getOccupationSkills', () => {
    it('should return cached occupation skills when available', async () => {
      // Arrange: Mock cached occupation
      const cachedOccupation = {
        occupationCode: '15-1252.00',
        occupationTitle: 'Software Developers',
        skills: [
          {
            skillName: 'Programming',
            skillCode: '2.B.5.a',
            importance: 90,
            level: 71,
            category: 'Technical Skills',
          },
        ],
        knowledgeAreas: [],
        abilities: [],
        laborMarketData: { employmentOutlook: 'Bright' },
        cacheVersion: '29.0',
      };

      mockConvexClient.query.mockResolvedValue(cachedOccupation);

      // Act
      const result = await provider.getOccupationSkills('15-1252.00');

      // Assert
      expect(result).toEqual(cachedOccupation);
      expect(mockConvexClient.query).toHaveBeenCalled();
    });

    it('should fetch from O*NET API when cache misses', async () => {
      // Arrange: Mock cache miss and successful API response
      mockConvexClient.query.mockResolvedValue(null); // Cache miss

      const mockOccupationData = { title: 'Software Developers' };
      const mockSkillsData = {
        skill: [
          {
            element_name: 'Programming',
            element_id: '2.B.5.a',
            im_value: 4.5,
            lv_value: 5.0,
          },
        ],
      };
      const mockKnowledgeData = { knowledge: [] };
      const mockAbilitiesData = { ability: [] };

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({ ok: true, json: async () => mockOccupationData })
        .mockResolvedValueOnce({ ok: true, json: async () => mockSkillsData })
        .mockResolvedValueOnce({ ok: true, json: async () => mockKnowledgeData })
        .mockResolvedValueOnce({ ok: true, json: async () => mockAbilitiesData });

      mockConvexClient.mutation.mockResolvedValue('cache-id');

      // Act
      const result = await provider.getOccupationSkills('15-1252.00');

      // Assert
      expect(result.occupationCode).toBe('15-1252.00');
      expect(result.occupationTitle).toBe('Software Developers');
      expect(result.skills).toHaveLength(1);
      expect(result.skills[0].skillName).toBe('Programming');

      // Verify caching was called
      expect(mockConvexClient.mutation).toHaveBeenCalled();
    });

    it('should return mock data when API fails', async () => {
      // Arrange: Mock cache miss and failed API
      mockConvexClient.query.mockResolvedValue(null);
      (global.fetch as jest.Mock).mockRejectedValue(new Error('API Error'));

      // Act
      const result = await provider.getOccupationSkills('15-1252.00');

      // Assert: Should return mock data instead of throwing
      expect(result).toBeDefined();
      expect(result.occupationCode).toBe('15-1252.00');
      expect(result.skills.length).toBeGreaterThan(0);
    });
  });

  describe('getSkillComplexity', () => {
    it('should return normalized complexity value from O*NET API', async () => {
      // Arrange: Mock successful API response with level 5 (0-7 scale)
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ level: 5 }),
      });

      // Act
      const complexity = await provider.getSkillComplexity('2.B.5.a');

      // Assert: 5/7 * 100 = ~71
      expect(complexity).toBeCloseTo(71, 0);
    });

    it('should return default complexity when API fails', async () => {
      // Arrange: Mock failed API call
      (global.fetch as jest.Mock).mockRejectedValue(new Error('API Error'));

      // Act
      const complexity = await provider.getSkillComplexity('2.B.5.a');

      // Assert: Should return default value of 50
      expect(complexity).toBe(50);
    });
  });

  describe('cacheOccupation', () => {
    it('should cache occupation data with 30-day TTL', async () => {
      // Arrange
      const occupationData = {
        occupationCode: '15-1252.00',
        occupationTitle: 'Software Developers',
        skills: [],
        knowledgeAreas: [],
        abilities: [],
        laborMarketData: { employmentOutlook: 'Bright' },
        cacheVersion: '29.0',
      };

      mockConvexClient.mutation.mockResolvedValue('cache-id');

      // Act
      await provider.cacheOccupation('15-1252.00', occupationData);

      // Assert
      expect(mockConvexClient.mutation).toHaveBeenCalledWith(
        'onetCache:cacheOccupation',
        expect.objectContaining({
          occupationCode: '15-1252.00',
          occupationTitle: 'Software Developers',
        })
      );
    });

    it('should not throw when caching fails', async () => {
      // Arrange
      const occupationData = {
        occupationCode: '15-1252.00',
        occupationTitle: 'Software Developers',
        skills: [],
        knowledgeAreas: [],
        abilities: [],
        laborMarketData: { employmentOutlook: 'Bright' },
        cacheVersion: '29.0',
      };

      mockConvexClient.mutation.mockRejectedValue(new Error('Cache error'));

      // Act & Assert: Should not throw
      await expect(
        provider.cacheOccupation('15-1252.00', occupationData)
      ).resolves.not.toThrow();
    });
  });

  describe('rate limiting', () => {
    it('should enforce 200ms delay between requests', async () => {
      // Arrange
      mockConvexClient.query.mockResolvedValue([]);
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ occupation: [] }),
      });

      // Act: Make two consecutive API calls
      const start = Date.now();
      await provider.searchOccupations('test1');
      await provider.searchOccupations('test2');
      const duration = Date.now() - start;

      // Assert: Second call should have been delayed by at least 200ms
      expect(duration).toBeGreaterThanOrEqual(200);
    });
  });
});
