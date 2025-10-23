/**
 * Tests for SkillGapAnalyzer service
 * Validates multi-factor prioritization algorithm and timeline estimation
 */

import { SkillGapAnalyzer } from '../skill-gap-analyzer';

describe('SkillGapAnalyzer', () => {
  let analyzer: SkillGapAnalyzer;

  beforeEach(() => {
    analyzer = new SkillGapAnalyzer();
  });

  describe('prioritizeGaps', () => {
    it('should calculate priority scores using weighted formula', () => {
      const gaps = [
        {
          skillName: 'Python',
          onetCode: 'SKL001',
          importance: 0.9, // High importance
          currentLevel: 20,
          targetLevel: 80,
          timeToAcquire: 100,
          marketDemand: 0.8,
          careerCapital: 0.7,
        },
        {
          skillName: 'Excel',
          onetCode: 'SKL002',
          importance: 0.4, // Low importance
          currentLevel: 50,
          targetLevel: 70,
          timeToAcquire: 40,
          marketDemand: 0.5,
          careerCapital: 0.3,
        },
      ];

      const learningVelocity = 1.0; // Average learner
      const prioritized = analyzer.prioritizeGaps(gaps, learningVelocity);

      // Python should rank higher due to higher importance and impact
      expect(prioritized[0].skillName).toBe('Python');
      expect(prioritized[1].skillName).toBe('Excel');

      // Verify priority scores are calculated
      expect(prioritized[0].priorityScore).toBeGreaterThan(0);
      expect(prioritized[0].priorityScore).toBeGreaterThan(prioritized[1].priorityScore);
    });

    it('should identify quick wins (high impact, low time)', () => {
      const gaps = [
        {
          skillName: 'Git', // Quick win: high importance, low time
          onetCode: 'SKL003',
          importance: 0.8,
          currentLevel: 30,
          targetLevel: 80,
          timeToAcquire: 40, // Low time
          marketDemand: 0.7,
          careerCapital: 0.6,
        },
        {
          skillName: 'System Design', // Long-term: high importance, high time
          onetCode: 'SKL004',
          importance: 0.9,
          currentLevel: 20,
          targetLevel: 80,
          timeToAcquire: 200, // High time
          marketDemand: 0.8,
          careerCapital: 0.9,
        },
      ];

      const learningVelocity = 1.0;
      const prioritized = analyzer.prioritizeGaps(gaps, learningVelocity);

      // Quick win (Git) should have high priority due to inverse time weighting
      const gitGap = prioritized.find(g => g.skillName === 'Git');
      expect(gitGap?.priorityScore).toBeGreaterThan(50);
    });

    it('should incorporate learning velocity multiplier', () => {
      const gaps = [
        {
          skillName: 'JavaScript',
          onetCode: 'SKL005',
          importance: 0.7,
          currentLevel: 40,
          targetLevel: 80,
          timeToAcquire: 100,
          marketDemand: 0.6,
          careerCapital: 0.5,
        },
      ];

      const fastLearner = 1.5; // Fast learning velocity
      const slowLearner = 0.5; // Slow learning velocity

      const fastResult = analyzer.prioritizeGaps(gaps, fastLearner);
      const slowResult = analyzer.prioritizeGaps(gaps, slowLearner);

      // Fast learner should get higher priority score (learning velocity factor)
      expect(fastResult[0].priorityScore).toBeGreaterThan(slowResult[0].priorityScore);
    });

    it('should handle edge case: no skills history (default velocity)', () => {
      const gaps = [
        {
          skillName: 'React',
          onetCode: 'SKL006',
          importance: 0.8,
          currentLevel: 30,
          targetLevel: 90,
          timeToAcquire: 120,
          marketDemand: 0.7,
          careerCapital: 0.6,
        },
      ];

      // No learning velocity provided (should default to 1.0)
      const prioritized = analyzer.prioritizeGaps(gaps);

      expect(prioritized).toHaveLength(1);
      expect(prioritized[0].priorityScore).toBeGreaterThan(0);
    });

    it('should handle edge case: missing O*NET data', () => {
      const gaps = [
        {
          skillName: 'Custom Framework', // No O*NET code
          onetCode: undefined,
          importance: 0.6,
          currentLevel: 20,
          targetLevel: 70,
          timeToAcquire: 80,
          marketDemand: 0.5, // Default value when missing
          careerCapital: 0.4, // Default value when missing
        },
      ];

      const learningVelocity = 1.0;
      const prioritized = analyzer.prioritizeGaps(gaps, learningVelocity);

      // Should still calculate priority score with defaults
      expect(prioritized).toHaveLength(1);
      expect(prioritized[0].priorityScore).toBeGreaterThan(0);
    });

    it('should sort gaps by priority score descending', () => {
      const gaps = [
        {
          skillName: 'Low Priority',
          onetCode: 'SKL007',
          importance: 0.3,
          currentLevel: 60,
          targetLevel: 80,
          timeToAcquire: 100,
          marketDemand: 0.3,
          careerCapital: 0.2,
        },
        {
          skillName: 'High Priority',
          onetCode: 'SKL008',
          importance: 0.9,
          currentLevel: 20,
          targetLevel: 90,
          timeToAcquire: 80,
          marketDemand: 0.9,
          careerCapital: 0.8,
        },
        {
          skillName: 'Medium Priority',
          onetCode: 'SKL009',
          importance: 0.6,
          currentLevel: 40,
          targetLevel: 80,
          timeToAcquire: 90,
          marketDemand: 0.6,
          careerCapital: 0.5,
        },
      ];

      const learningVelocity = 1.0;
      const prioritized = analyzer.prioritizeGaps(gaps, learningVelocity);

      // Verify descending order
      expect(prioritized[0].skillName).toBe('High Priority');
      expect(prioritized[2].skillName).toBe('Low Priority');
      expect(prioritized[0].priorityScore).toBeGreaterThan(prioritized[1].priorityScore);
      expect(prioritized[1].priorityScore).toBeGreaterThan(prioritized[2].priorityScore);
    });
  });

  describe('estimateTimeline', () => {
    it('should estimate hours based on O*NET complexity level', () => {
      const basicGap = {
        skillName: 'Basic HTML',
        onetLevel: 2, // Basic skill (0-3)
        currentLevel: 0,
        targetLevel: 70,
      };

      const intermediateGap = {
        skillName: 'React',
        onetLevel: 5, // Intermediate skill (4-5)
        currentLevel: 0,
        targetLevel: 70,
      };

      const advancedGap = {
        skillName: 'Machine Learning',
        onetLevel: 7, // Advanced skill (6-7)
        currentLevel: 0,
        targetLevel: 70,
      };

      const userAvailability = 10; // 10 hours per week
      const learningVelocity = 1.0; // Average learner

      const basicEstimate = analyzer.estimateTimeline(basicGap, userAvailability, learningVelocity);
      const intermediateEstimate = analyzer.estimateTimeline(intermediateGap, userAvailability, learningVelocity);
      const advancedEstimate = analyzer.estimateTimeline(advancedGap, userAvailability, learningVelocity);

      // Advanced should take more time than intermediate, which takes more than basic
      expect(advancedEstimate.estimatedHours).toBeGreaterThan(intermediateEstimate.estimatedHours);
      expect(intermediateEstimate.estimatedHours).toBeGreaterThan(basicEstimate.estimatedHours);
    });

    it('should apply learning velocity multiplier correctly', () => {
      const gap = {
        skillName: 'TypeScript',
        onetLevel: 5,
        currentLevel: 30,
        targetLevel: 80,
      };

      const userAvailability = 10;

      const fastLearner = 1.3; // >1.2 = fast
      const averageLearner = 1.0; // 0.8-1.2 = average
      const slowLearner = 0.7; // <0.8 = slow

      const fastEstimate = analyzer.estimateTimeline(gap, userAvailability, fastLearner);
      const avgEstimate = analyzer.estimateTimeline(gap, userAvailability, averageLearner);
      const slowEstimate = analyzer.estimateTimeline(gap, userAvailability, slowLearner);

      // Fast learner should take less time, slow learner more time
      expect(fastEstimate.estimatedHours).toBeLessThan(avgEstimate.estimatedHours);
      expect(slowEstimate.estimatedHours).toBeGreaterThan(avgEstimate.estimatedHours);
    });

    it('should apply skill level gap multiplier', () => {
      const userAvailability = 10;
      const learningVelocity = 1.0;

      const smallGap = {
        skillName: 'CSS',
        onetLevel: 4,
        currentLevel: 75, // Gap: 25% (0-30%)
        targetLevel: 100,
      };

      const mediumGap = {
        skillName: 'Node.js',
        onetLevel: 4,
        currentLevel: 50, // Gap: 50% (31-60%)
        targetLevel: 100,
      };

      const largeGap = {
        skillName: 'Kubernetes',
        onetLevel: 4,
        currentLevel: 20, // Gap: 80% (61-100%)
        targetLevel: 100,
      };

      const smallEstimate = analyzer.estimateTimeline(smallGap, userAvailability, learningVelocity);
      const mediumEstimate = analyzer.estimateTimeline(mediumGap, userAvailability, learningVelocity);
      const largeEstimate = analyzer.estimateTimeline(largeGap, userAvailability, learningVelocity);

      // Larger gaps should take more time
      expect(largeEstimate.estimatedHours).toBeGreaterThan(mediumEstimate.estimatedHours);
      expect(mediumEstimate.estimatedHours).toBeGreaterThan(smallEstimate.estimatedHours);
    });

    it('should calculate weeks to complete based on user availability', () => {
      const gap = {
        skillName: 'Docker',
        onetLevel: 5,
        currentLevel: 40,
        targetLevel: 80,
      };

      const learningVelocity = 1.0;

      const fullTime = analyzer.estimateTimeline(gap, 40, learningVelocity); // 40 hrs/week
      const partTime = analyzer.estimateTimeline(gap, 10, learningVelocity); // 10 hrs/week

      // Part-time should take more weeks than full-time
      expect(partTime.weeksToComplete).toBeGreaterThan(fullTime.weeksToComplete);

      // Verify weeks calculation uses ceiling (rounds up)
      // If estimatedHours is 214, and availability is 40: 214/40 = 5.35, ceil = 6
      expect(fullTime.weeksToComplete).toBe(Math.ceil(fullTime.estimatedHours / 40));
      expect(partTime.weeksToComplete).toBe(Math.ceil(partTime.estimatedHours / 10));
    });
  });

  describe('calculateLearningVelocity', () => {
    it('should calculate velocity from completed skills history', () => {
      const mockSkills = [
        {
          id: '1' as any,
          userId: 'user1' as any,
          name: 'Python',
          category: 'Programming',
          currentLevel: 'advanced' as const,
          targetLevel: 'expert' as const,
          progress: 100,
          timeSpent: 80, // Spent 80 hours
          estimatedTimeToTarget: 100, // Estimated 100 hours
          priority: 'high' as const,
          status: 'mastered' as const,
          resources: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2' as any,
          userId: 'user1' as any,
          name: 'React',
          category: 'Framework',
          currentLevel: 'intermediate' as const,
          targetLevel: 'advanced' as const,
          progress: 100,
          timeSpent: 120, // Spent 120 hours
          estimatedTimeToTarget: 100, // Estimated 100 hours
          priority: 'high' as const,
          status: 'mastered' as const,
          resources: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const velocity = analyzer.calculateLearningVelocity(mockSkills);

      // Velocity = average(timeSpent / estimatedTime)
      // Skill 1: 80/100 = 0.8, Skill 2: 120/100 = 1.2
      // Average: (0.8 + 1.2) / 2 = 1.0
      expect(velocity).toBeCloseTo(1.0, 1);
    });

    it('should default to 1.0 when no skills history', () => {
      const velocity = analyzer.calculateLearningVelocity([]);

      // No history = average learner (1.0)
      expect(velocity).toBe(1.0);
    });

    it('should only include completed/mastered skills', () => {
      const mockSkills = [
        {
          id: '1' as any,
          userId: 'user1' as any,
          name: 'Completed Skill',
          category: 'Tech',
          currentLevel: 'advanced' as const,
          targetLevel: 'expert' as const,
          progress: 100,
          timeSpent: 80,
          estimatedTimeToTarget: 100,
          priority: 'high' as const,
          status: 'mastered' as const,
          resources: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2' as any,
          userId: 'user1' as any,
          name: 'In Progress Skill',
          category: 'Tech',
          currentLevel: 'beginner' as const,
          targetLevel: 'intermediate' as const,
          progress: 50,
          timeSpent: 40,
          estimatedTimeToTarget: 100,
          priority: 'medium' as const,
          status: 'learning' as const, // Not completed
          resources: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const velocity = analyzer.calculateLearningVelocity(mockSkills);

      // Should only use the mastered skill
      // Velocity = 80/100 = 0.8
      expect(velocity).toBeCloseTo(0.8, 1);
    });
  });
});
