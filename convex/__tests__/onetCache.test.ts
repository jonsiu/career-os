/**
 * O*NET Cache Table Operations Tests
 *
 * Tests critical CRUD operations for the onetCache table:
 * - O*NET occupation data insertion with TTL
 * - Cache retrieval by occupation code
 * - Cache expiration logic (30-day TTL)
 * - Cache cleanup of expired entries
 */

import { describe, it, expect, beforeEach, vi } from '@jest/globals';
import { ConvexTestingHelper } from './helpers/convex_testing_helper';

describe('O*NET Cache Operations', () => {
  let testHelper: ConvexTestingHelper;

  beforeEach(() => {
    testHelper = new ConvexTestingHelper();
  });

  describe('Cache Insertion with TTL', () => {
    it('should insert O*NET occupation data with 30-day expiration', async () => {
      const occupationCode = '15-1252.00'; // Software Developers
      const now = Date.now();
      const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;

      const occupationData = {
        occupationCode,
        occupationTitle: 'Software Developers',
        skills: [
          {
            skillName: 'Programming',
            skillCode: '2.B.5.a',
            importance: 85,
            level: 6,
            category: 'Technical Skills'
          },
          {
            skillName: 'Critical Thinking',
            skillCode: '2.A.2.a',
            importance: 75,
            level: 5,
            category: 'Basic Skills'
          }
        ],
        knowledgeAreas: [
          {
            name: 'Computers and Electronics',
            level: 6,
            importance: 90
          }
        ],
        abilities: [
          {
            name: 'Deductive Reasoning',
            level: 5,
            importance: 80
          }
        ],
        laborMarketData: {
          employmentOutlook: 'Much faster than average',
          medianSalary: 110140,
          growthRate: 22
        },
        cacheVersion: '28.2'
      };

      const cacheId = await testHelper.mutation('onetCache', 'cacheOccupation', occupationData);

      expect(cacheId).toBeDefined();

      const cached = await testHelper.query('onetCache', 'getOccupation', { code: occupationCode });
      expect(cached).toBeDefined();
      expect(cached.occupationCode).toBe(occupationCode);
      expect(cached.occupationTitle).toBe('Software Developers');
      expect(cached.skills).toHaveLength(2);
      expect(cached.expiresAt).toBeGreaterThan(now);
      expect(cached.expiresAt).toBeLessThanOrEqual(now + thirtyDaysInMs + 1000); // Allow 1s buffer
    });

    it('should update existing cache entry instead of creating duplicate', async () => {
      const occupationCode = '15-1252.00';

      const firstData = {
        occupationCode,
        occupationTitle: 'Software Developers',
        skills: [],
        knowledgeAreas: [],
        abilities: [],
        laborMarketData: {
          employmentOutlook: 'Fast growth',
          medianSalary: 100000,
          growthRate: 20
        },
        cacheVersion: '28.1'
      };

      await testHelper.mutation('onetCache', 'cacheOccupation', firstData);

      const updatedData = {
        ...firstData,
        laborMarketData: {
          employmentOutlook: 'Much faster than average',
          medianSalary: 110140,
          growthRate: 22
        },
        cacheVersion: '28.2'
      };

      await testHelper.mutation('onetCache', 'cacheOccupation', updatedData);

      const allCached = await testHelper.query('onetCache', 'searchOccupations', { query: 'Software' });
      const matchingEntries = allCached.filter((c: any) => c.occupationCode === occupationCode);

      expect(matchingEntries).toHaveLength(1);
      expect(matchingEntries[0].laborMarketData.medianSalary).toBe(110140);
      expect(matchingEntries[0].cacheVersion).toBe('28.2');
    });
  });

  describe('Cache Retrieval', () => {
    it('should retrieve cached occupation by code', async () => {
      const occupationCode = '11-3121.00'; // Human Resources Managers

      await testHelper.mutation('onetCache', 'cacheOccupation', {
        occupationCode,
        occupationTitle: 'Human Resources Managers',
        skills: [
          {
            skillName: 'Management of Personnel Resources',
            skillCode: '2.B.1.b',
            importance: 90,
            level: 6,
            category: 'Technical Skills'
          }
        ],
        knowledgeAreas: [],
        abilities: [],
        laborMarketData: {
          employmentOutlook: 'Faster than average',
          medianSalary: 126230,
          growthRate: 9
        },
        cacheVersion: '28.2'
      });

      const cached = await testHelper.query('onetCache', 'getOccupation', { code: occupationCode });

      expect(cached).toBeDefined();
      expect(cached.occupationCode).toBe(occupationCode);
      expect(cached.occupationTitle).toBe('Human Resources Managers');
      expect(cached.skills[0].skillName).toBe('Management of Personnel Resources');
    });

    it('should return null for non-existent occupation code', async () => {
      const cached = await testHelper.query('onetCache', 'getOccupation', { code: '99-9999.99' });

      expect(cached).toBeNull();
    });

    it('should search occupations by title query', async () => {
      await testHelper.mutation('onetCache', 'cacheOccupation', {
        occupationCode: '15-1252.00',
        occupationTitle: 'Software Developers',
        skills: [],
        knowledgeAreas: [],
        abilities: [],
        laborMarketData: {
          employmentOutlook: 'Much faster than average',
          medianSalary: 110140,
          growthRate: 22
        },
        cacheVersion: '28.2'
      });

      await testHelper.mutation('onetCache', 'cacheOccupation', {
        occupationCode: '15-1211.00',
        occupationTitle: 'Computer Systems Analysts',
        skills: [],
        knowledgeAreas: [],
        abilities: [],
        laborMarketData: {
          employmentOutlook: 'Faster than average',
          medianSalary: 99270,
          growthRate: 10
        },
        cacheVersion: '28.2'
      });

      const results = await testHelper.query('onetCache', 'searchOccupations', { query: 'Software' });

      expect(results).toHaveLength(1);
      expect(results[0].occupationTitle).toBe('Software Developers');
    });
  });

  describe('Cache Expiration Logic', () => {
    it('should validate cache is not expired within 30-day TTL', async () => {
      const occupationCode = '15-1252.00';
      const now = Date.now();

      await testHelper.mutation('onetCache', 'cacheOccupation', {
        occupationCode,
        occupationTitle: 'Software Developers',
        skills: [],
        knowledgeAreas: [],
        abilities: [],
        laborMarketData: {
          employmentOutlook: 'Much faster than average',
          medianSalary: 110140,
          growthRate: 22
        },
        cacheVersion: '28.2'
      });

      const validCache = await testHelper.query('onetCache', 'getValidCache', { code: occupationCode });

      expect(validCache).toBeDefined();
      expect(validCache.occupationCode).toBe(occupationCode);
      expect(validCache.expiresAt).toBeGreaterThan(now);
    });

    it('should return null for expired cache entries', async () => {
      const occupationCode = '15-1252.00';
      const pastDate = Date.now() - (31 * 24 * 60 * 60 * 1000); // 31 days ago

      // Manually insert an expired cache entry
      await testHelper.directInsert('onetCache', {
        occupationCode,
        occupationTitle: 'Software Developers',
        skills: [],
        knowledgeAreas: [],
        abilities: [],
        laborMarketData: {
          employmentOutlook: 'Much faster than average',
          medianSalary: 110140,
          growthRate: 22
        },
        cacheVersion: '28.1',
        createdAt: pastDate,
        expiresAt: pastDate + (30 * 24 * 60 * 60 * 1000) // Set to expired
      });

      const validCache = await testHelper.query('onetCache', 'getValidCache', { code: occupationCode });

      expect(validCache).toBeNull();
    });
  });

  describe('Cache Cleanup', () => {
    it('should remove expired cache entries', async () => {
      const expiredDate = Date.now() - (31 * 24 * 60 * 60 * 1000); // 31 days ago
      const validDate = Date.now();

      // Insert expired entry
      await testHelper.directInsert('onetCache', {
        occupationCode: '15-1252.00',
        occupationTitle: 'Software Developers (Expired)',
        skills: [],
        knowledgeAreas: [],
        abilities: [],
        laborMarketData: {
          employmentOutlook: 'Much faster than average',
          medianSalary: 110140,
          growthRate: 22
        },
        cacheVersion: '28.1',
        createdAt: expiredDate,
        expiresAt: expiredDate + (30 * 24 * 60 * 60 * 1000)
      });

      // Insert valid entry
      await testHelper.mutation('onetCache', 'cacheOccupation', {
        occupationCode: '11-3121.00',
        occupationTitle: 'Human Resources Managers',
        skills: [],
        knowledgeAreas: [],
        abilities: [],
        laborMarketData: {
          employmentOutlook: 'Faster than average',
          medianSalary: 126230,
          growthRate: 9
        },
        cacheVersion: '28.2'
      });

      const deletedCount = await testHelper.mutation('onetCache', 'cleanupExpiredCache', {});

      expect(deletedCount).toBeGreaterThan(0);

      const expiredEntry = await testHelper.query('onetCache', 'getOccupation', { code: '15-1252.00' });
      const validEntry = await testHelper.query('onetCache', 'getOccupation', { code: '11-3121.00' });

      expect(expiredEntry).toBeNull();
      expect(validEntry).toBeDefined();
    });

    it('should handle cleanup when no expired entries exist', async () => {
      await testHelper.mutation('onetCache', 'cacheOccupation', {
        occupationCode: '15-1252.00',
        occupationTitle: 'Software Developers',
        skills: [],
        knowledgeAreas: [],
        abilities: [],
        laborMarketData: {
          employmentOutlook: 'Much faster than average',
          medianSalary: 110140,
          growthRate: 22
        },
        cacheVersion: '28.2'
      });

      const deletedCount = await testHelper.mutation('onetCache', 'cleanupExpiredCache', {});

      expect(deletedCount).toBe(0);

      const validEntry = await testHelper.query('onetCache', 'getOccupation', { code: '15-1252.00' });
      expect(validEntry).toBeDefined();
    });
  });
});
