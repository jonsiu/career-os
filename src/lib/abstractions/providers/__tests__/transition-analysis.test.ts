import { TransitionAnalysisProvider } from '../transition-analysis';
import { Resume } from '../../types';

// Mock fetch for API calls
global.fetch = jest.fn();

describe('TransitionAnalysisProvider', () => {
  let provider: TransitionAnalysisProvider;

  beforeEach(() => {
    provider = new TransitionAnalysisProvider();
    provider.clearCache(); // Clear cache between tests
    jest.clearAllMocks();
  });

  describe('identifyTransitionType', () => {
    it('should detect cross-role transition', async () => {
      const mockResponse = {
        transitionTypes: ['cross-role'],
        primaryTransitionType: 'cross-role',
        currentRole: 'Software Engineer',
        targetRole: 'Engineering Manager',
        transitionDifficulty: 'medium',
        confidence: 0.9
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: mockResponse })
      });

      const result = await provider.identifyTransitionType(
        'Experienced software engineer with 5 years...',
        'Software Engineer',
        'Engineering Manager',
        'Technology'
      );

      expect(result.transitionTypes).toContain('cross-role');
      expect(result.primaryTransitionType).toBe('cross-role');
      expect(result.transitionDifficulty).toBe('medium');
      expect(fetch).toHaveBeenCalledWith(
        '/api/transitions/identify',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        })
      );
    });

    it('should detect hybrid transition (cross-role + cross-industry)', async () => {
      const mockResponse = {
        transitionTypes: ['cross-role', 'cross-industry'],
        primaryTransitionType: 'cross-industry',
        currentRole: 'Marketing Manager',
        targetRole: 'Product Manager',
        currentIndustry: 'Retail',
        targetIndustry: 'Technology',
        transitionDifficulty: 'high',
        confidence: 0.85
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: mockResponse })
      });

      const result = await provider.identifyTransitionType(
        'Marketing manager in retail with 8 years...',
        'Marketing Manager',
        'Product Manager',
        'Technology'
      );

      expect(result.transitionTypes).toHaveLength(2);
      expect(result.transitionTypes).toContain('cross-role');
      expect(result.transitionTypes).toContain('cross-industry');
      expect(result.primaryTransitionType).toBe('cross-industry');
    });
  });

  describe('generateRoadmap', () => {
    it('should generate roadmap with timeline and milestones', async () => {
      const mockResponse = {
        timeline: {
          minMonths: 8,
          maxMonths: 12,
          factors: ['skill complexity', 'learning velocity']
        },
        milestones: [
          {
            id: '1',
            title: 'Complete leadership training',
            description: 'Develop core management skills',
            targetDate: new Date('2025-12-01'),
            status: 'pending',
            dependencies: [],
            effort: 40
          }
        ],
        bridgeRoles: ['Tech Lead', 'Team Lead']
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: mockResponse })
      });

      const transitionData = {
        transitionTypes: ['cross-role'],
        primaryTransitionType: 'cross-role',
        currentRole: 'Senior Engineer',
        targetRole: 'Engineering Manager'
      };

      const result = await provider.generateRoadmap(transitionData, 'Resume content...');

      expect(result.timeline.minMonths).toBe(8);
      expect(result.timeline.maxMonths).toBe(12);
      expect(result.milestones).toHaveLength(1);
      expect(result.bridgeRoles).toContain('Tech Lead');
    });

    it('should use cache for identical roadmap requests', async () => {
      const transitionData = {
        transitionTypes: ['cross-role'],
        primaryTransitionType: 'cross-role',
        currentRole: 'Engineer',
        targetRole: 'Manager'
      };
      const resumeContent = 'Resume content...';

      const mockResponse = {
        timeline: { minMonths: 6, maxMonths: 10, factors: [] },
        milestones: [],
        bridgeRoles: []
      };

      // First call - cache miss
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: mockResponse })
      });

      const result1 = await provider.generateRoadmap(transitionData, resumeContent);

      // Second call - should use cache (no fetch call)
      const result2 = await provider.generateRoadmap(transitionData, resumeContent);

      // Fetch should only be called once due to caching
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(result1).toEqual(result2);
    });
  });

  describe('analyzeSkillGaps', () => {
    it('should identify critical and nice-to-have skills', async () => {
      const mockResponse = {
        criticalSkills: [
          {
            skill: 'People Management',
            criticalityLevel: 'critical',
            currentLevel: 0,
            targetLevel: 4,
            transferableFrom: [],
            skillComplexity: 'advanced',
            estimatedLearningTime: { minWeeks: 12, maxWeeks: 24 }
          }
        ],
        importantSkills: [
          {
            skill: 'Budget Planning',
            criticalityLevel: 'important',
            currentLevel: 1,
            targetLevel: 3,
            transferableFrom: ['Project Planning'],
            skillComplexity: 'intermediate',
            estimatedLearningTime: { minWeeks: 8, maxWeeks: 16 }
          }
        ],
        niceToHaveSkills: [
          {
            skill: 'Public Speaking',
            criticalityLevel: 'nice-to-have',
            currentLevel: 2,
            targetLevel: 3,
            transferableFrom: [],
            skillComplexity: 'intermediate',
            estimatedLearningTime: { minWeeks: 4, maxWeeks: 8 }
          }
        ]
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: mockResponse })
      });

      const result = await provider.analyzeSkillGaps(
        'Software Engineer',
        'Engineering Manager',
        'Resume content with technical skills...'
      );

      expect(result.criticalSkills).toHaveLength(1);
      expect(result.criticalSkills[0].criticalityLevel).toBe('critical');
      expect(result.importantSkills).toHaveLength(1);
      expect(result.niceToHaveSkills).toHaveLength(1);
    });
  });

  describe('assessCareerCapital', () => {
    it('should identify unique skill combinations', async () => {
      // The current implementation uses fallback logic that extracts from content
      const resumeContent = 'Experienced in machine learning, distributed systems, and technical leadership';

      const result = await provider.assessCareerCapital(
        resumeContent,
        'Senior ML Engineer'
      );

      // The fallback implementation should extract skills from content
      expect(result.uniqueSkills.length).toBeGreaterThan(0);
      expect(result.rareSkillCombinations).toBeDefined();
      expect(result.competitiveAdvantages).toBeDefined();
      expect(result.marketValue).toBe('medium');
    });
  });

  describe('error handling', () => {
    it('should handle API failures gracefully', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'API Error' })
      });

      await expect(
        provider.identifyTransitionType('Resume...', 'Engineer', 'Manager', 'Tech')
      ).rejects.toThrow('API Error');
    });

    it('should handle network errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      await expect(
        provider.generateRoadmap(
          { transitionTypes: ['cross-role'], primaryTransitionType: 'cross-role' },
          'Resume...'
        )
      ).rejects.toThrow('Network error');
    });
  });
});
