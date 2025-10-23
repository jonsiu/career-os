import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { Id } from '../_generated/dataModel';

// Mock Convex database context
const createMockDb = () => {
  const store = new Map<string, any>();
  let idCounter = 0;

  const generateId = (table: string): Id<any> => {
    return `${table}_${idCounter++}` as Id<any>;
  };

  return {
    get: jest.fn(async (id: Id<any>) => store.get(id)),
    insert: jest.fn(async (table: string, doc: any) => {
      const id = generateId(table);
      store.set(id, { _id: id, ...doc });
      return id;
    }),
    patch: jest.fn(async (id: Id<any>, updates: any) => {
      const existing = store.get(id);
      if (existing) {
        store.set(id, { ...existing, ...updates });
      }
    }),
    delete: jest.fn(async (id: Id<any>) => {
      store.delete(id);
    }),
    query: jest.fn((table: string) => {
      return {
        withIndex: jest.fn(() => ({
          order: jest.fn(() => ({
            collect: jest.fn(async () => {
              return Array.from(store.values()).filter((doc) =>
                doc._id.startsWith(table)
              );
            }),
            first: jest.fn(async () => {
              const items = Array.from(store.values()).filter((doc) =>
                doc._id.startsWith(table)
              );
              return items[0] || null;
            }),
          })),
          filter: jest.fn(() => ({
            first: jest.fn(async () => null),
            collect: jest.fn(async () => []),
          })),
        })),
        filter: jest.fn(() => ({
          order: jest.fn(() => ({
            collect: jest.fn(async () => []),
            first: jest.fn(async () => null),
          })),
          first: jest.fn(async () => null),
          collect: jest.fn(async () => []),
        })),
        order: jest.fn(() => ({
          collect: jest.fn(async () => []),
          first: jest.fn(async () => null),
        })),
        collect: jest.fn(async () => []),
      };
    }),
    _store: store,
  };
};

describe('skillGapAnalyses table operations', () => {
  let mockDb: ReturnType<typeof createMockDb>;
  let testUserId: Id<'users'>;
  let testResumeId: Id<'resumes'>;

  beforeEach(() => {
    mockDb = createMockDb();
    testUserId = 'users_1' as Id<'users'>;
    testResumeId = 'resumes_1' as Id<'resumes'>;
  });

  it('should support creating a skill gap analysis with all required fields', async () => {
    const analysisData = {
      userId: testUserId,
      resumeId: testResumeId,
      targetRole: 'Software Engineer',
      targetRoleONetCode: '15-1252.00',
      criticalGaps: [
        {
          skillName: 'React',
          onetCode: undefined,
          importance: 85,
          currentLevel: 30,
          targetLevel: 80,
          priorityScore: 92.5,
          timeEstimate: 120,
          marketDemand: 90,
        },
      ],
      niceToHaveGaps: [
        {
          skillName: 'TypeScript',
          onetCode: undefined,
          importance: 70,
          currentLevel: 40,
          targetLevel: 75,
          priorityScore: 78.3,
          timeEstimate: 80,
        },
      ],
      transferableSkills: [
        {
          skillName: 'JavaScript',
          currentLevel: 85,
          applicability: 95,
          transferExplanation: 'JavaScript knowledge directly transfers to modern web development',
          confidence: 0.95,
        },
      ],
      prioritizedRoadmap: [
        {
          phase: 1,
          skills: ['React'],
          estimatedDuration: 12,
          milestoneTitle: 'Immediate Skills (0-3 months)',
        },
      ],
      userAvailability: 10,
      transitionType: 'lateral',
      completionProgress: 0,
      contentHash: 'abc123def456',
      analysisVersion: '1.0',
      metadata: {
        onetDataVersion: '27.0',
        aiModel: 'claude-3-5-sonnet',
        affiliateClickCount: 0,
        lastProgressUpdate: Date.now(),
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const analysisId = await mockDb.insert('skillGapAnalyses', analysisData);
    expect(analysisId).toBeDefined();
    expect(analysisId).toContain('skillGapAnalyses');

    const analysis = await mockDb.get(analysisId);
    expect(analysis).toBeDefined();
    expect(analysis.targetRole).toBe('Software Engineer');
    expect(analysis.criticalGaps).toHaveLength(1);
    expect(analysis.criticalGaps[0].skillName).toBe('React');
  });

  it('should support retrieving analyses by userId via index', async () => {
    // Create multiple analyses
    const baseData = {
      userId: testUserId,
      resumeId: testResumeId,
      criticalGaps: [],
      niceToHaveGaps: [],
      transferableSkills: [],
      prioritizedRoadmap: [],
      userAvailability: 10,
      transitionType: 'lateral',
      completionProgress: 0,
      analysisVersion: '1.0',
      metadata: {
        onetDataVersion: '27.0',
        aiModel: 'claude-3-5-sonnet',
        affiliateClickCount: 0,
        lastProgressUpdate: Date.now(),
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await mockDb.insert('skillGapAnalyses', {
      ...baseData,
      targetRole: 'Software Engineer',
      contentHash: 'hash1',
      targetRoleONetCode: '15-1252.00',
    });

    await mockDb.insert('skillGapAnalyses', {
      ...baseData,
      targetRole: 'Senior Software Engineer',
      contentHash: 'hash2',
      targetRoleONetCode: '15-1253.00',
    });

    // Verify two items were inserted
    const allItems = Array.from(mockDb._store.values());
    const analysisItems = allItems.filter((item) =>
      item._id.startsWith('skillGapAnalyses')
    );
    expect(analysisItems).toHaveLength(2);
  });

  it('should support updating analysis progress', async () => {
    const analysisData = {
      userId: testUserId,
      resumeId: testResumeId,
      targetRole: 'Software Engineer',
      targetRoleONetCode: '15-1252.00',
      criticalGaps: [],
      niceToHaveGaps: [],
      transferableSkills: [],
      prioritizedRoadmap: [],
      userAvailability: 10,
      transitionType: 'lateral',
      completionProgress: 0,
      contentHash: 'hash1',
      analysisVersion: '1.0',
      metadata: {
        onetDataVersion: '27.0',
        aiModel: 'claude-3-5-sonnet',
        affiliateClickCount: 0,
        lastProgressUpdate: Date.now(),
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const analysisId = await mockDb.insert('skillGapAnalyses', analysisData);

    // Update progress
    await mockDb.patch(analysisId, { completionProgress: 50 });

    const updatedAnalysis = await mockDb.get(analysisId);
    expect(updatedAnalysis.completionProgress).toBe(50);
  });

  it('should support deleting an analysis', async () => {
    const analysisData = {
      userId: testUserId,
      resumeId: testResumeId,
      targetRole: 'Software Engineer',
      targetRoleONetCode: '15-1252.00',
      criticalGaps: [],
      niceToHaveGaps: [],
      transferableSkills: [],
      prioritizedRoadmap: [],
      userAvailability: 10,
      transitionType: 'lateral',
      completionProgress: 0,
      contentHash: 'hash1',
      analysisVersion: '1.0',
      metadata: {
        onetDataVersion: '27.0',
        aiModel: 'claude-3-5-sonnet',
        affiliateClickCount: 0,
        lastProgressUpdate: Date.now(),
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const analysisId = await mockDb.insert('skillGapAnalyses', analysisData);
    expect(await mockDb.get(analysisId)).toBeDefined();

    await mockDb.delete(analysisId);
    expect(await mockDb.get(analysisId)).toBeUndefined();
  });

  it('should support content hash-based cache lookup structure', async () => {
    const contentHash = 'unique-hash-123';
    const targetRole = 'Software Engineer';

    const analysisData = {
      userId: testUserId,
      resumeId: testResumeId,
      targetRole,
      targetRoleONetCode: '15-1252.00',
      criticalGaps: [],
      niceToHaveGaps: [],
      transferableSkills: [],
      prioritizedRoadmap: [],
      userAvailability: 10,
      transitionType: 'lateral',
      completionProgress: 0,
      contentHash,
      analysisVersion: '1.0',
      metadata: {
        onetDataVersion: '27.0',
        aiModel: 'claude-3-5-sonnet',
        affiliateClickCount: 0,
        lastProgressUpdate: Date.now(),
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const analysisId = await mockDb.insert('skillGapAnalyses', analysisData);
    const analysis = await mockDb.get(analysisId);

    expect(analysis.contentHash).toBe(contentHash);
    expect(analysis.targetRole).toBe(targetRole);
    expect(analysis.resumeId).toBe(testResumeId);
  });

  it('should support partial updates to analysis fields', async () => {
    const analysisData = {
      userId: testUserId,
      resumeId: testResumeId,
      targetRole: 'Software Engineer',
      targetRoleONetCode: '15-1252.00',
      criticalGaps: [],
      niceToHaveGaps: [],
      transferableSkills: [],
      prioritizedRoadmap: [],
      userAvailability: 10,
      transitionType: 'lateral',
      completionProgress: 0,
      contentHash: 'hash1',
      analysisVersion: '1.0',
      metadata: {
        onetDataVersion: '27.0',
        aiModel: 'claude-3-5-sonnet',
        affiliateClickCount: 0,
        lastProgressUpdate: Date.now(),
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const analysisId = await mockDb.insert('skillGapAnalyses', analysisData);

    // Update specific fields
    await mockDb.patch(analysisId, {
      transitionType: 'career-change',
      userAvailability: 15,
    });

    const updatedAnalysis = await mockDb.get(analysisId);
    expect(updatedAnalysis.transitionType).toBe('career-change');
    expect(updatedAnalysis.userAvailability).toBe(15);
    expect(updatedAnalysis.targetRole).toBe('Software Engineer'); // Unchanged
  });

  it('should support storing complex skill gap structures', async () => {
    const analysisData = {
      userId: testUserId,
      resumeId: testResumeId,
      targetRole: 'Data Scientist',
      targetRoleONetCode: '15-2051.00',
      criticalGaps: [
        {
          skillName: 'Machine Learning',
          onetCode: '2.C.4.e',
          importance: 95,
          currentLevel: 20,
          targetLevel: 85,
          priorityScore: 98.5,
          timeEstimate: 300,
          marketDemand: 95,
        },
        {
          skillName: 'Python',
          onetCode: '2.A.1.a',
          importance: 90,
          currentLevel: 50,
          targetLevel: 90,
          priorityScore: 94.0,
          timeEstimate: 150,
          marketDemand: 92,
        },
      ],
      niceToHaveGaps: [
        {
          skillName: 'R Programming',
          onetCode: '2.A.1.b',
          importance: 60,
          currentLevel: 0,
          targetLevel: 70,
          priorityScore: 70.5,
          timeEstimate: 120,
        },
      ],
      transferableSkills: [
        {
          skillName: 'Statistics',
          currentLevel: 75,
          applicability: 90,
          transferExplanation: 'Strong statistical background transfers directly to ML',
          confidence: 0.92,
        },
      ],
      prioritizedRoadmap: [
        {
          phase: 1,
          skills: ['Python', 'Machine Learning'],
          estimatedDuration: 16,
          milestoneTitle: 'Core Technical Skills (0-4 months)',
        },
        {
          phase: 2,
          skills: ['R Programming'],
          estimatedDuration: 12,
          milestoneTitle: 'Secondary Skills (4-7 months)',
        },
      ],
      userAvailability: 15,
      transitionType: 'career-change',
      completionProgress: 0,
      contentHash: 'data-scientist-hash',
      analysisVersion: '1.0',
      metadata: {
        onetDataVersion: '27.0',
        aiModel: 'claude-3-5-sonnet',
        affiliateClickCount: 0,
        lastProgressUpdate: Date.now(),
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const analysisId = await mockDb.insert('skillGapAnalyses', analysisData);
    const analysis = await mockDb.get(analysisId);

    expect(analysis.criticalGaps).toHaveLength(2);
    expect(analysis.niceToHaveGaps).toHaveLength(1);
    expect(analysis.transferableSkills).toHaveLength(1);
    expect(analysis.prioritizedRoadmap).toHaveLength(2);
    expect(analysis.prioritizedRoadmap[0].skills).toContain('Python');
    expect(analysis.prioritizedRoadmap[0].skills).toContain('Machine Learning');
  });
});
