import { describe, it, expect, beforeEach } from '@jest/globals';
import { ConvexTestingHelper } from './test-helpers';

/**
 * Tests for Transition Planning Database Layer
 *
 * This test suite covers:
 * 1. Schema extensions for plans table (transition fields)
 * 2. Schema extensions for skills table (transition fields)
 * 3. New indexes (by_transition_type, by_transition_plan, by_criticality)
 * 4. Convex queries and mutations in transitions.ts
 * 5. Backward compatibility with existing plans and skills
 */
describe('Transition Planning Database Layer', () => {
  let helper: ConvexTestingHelper;

  beforeEach(() => {
    helper = new ConvexTestingHelper();
  });

  describe('Plans Table Extensions', () => {
    it('should create transition plan with all new optional fields', async () => {
      const userId = await helper.createUser();

      const transitionPlan = {
        userId,
        title: 'IC to Manager Transition',
        description: 'Transition from Senior Engineer to Engineering Manager',
        goals: ['Develop leadership skills', 'Build team management experience'],
        timeline: 12,
        milestones: [],
        status: 'active' as const,
        // NEW transition-specific fields
        transitionTypes: ['cross-role' as const],
        primaryTransitionType: 'cross-role',
        currentRole: 'Senior Software Engineer',
        targetRole: 'Engineering Manager',
        currentIndustry: 'Technology',
        targetIndustry: 'Technology',
        bridgeRoles: ['Tech Lead', 'Senior Tech Lead'],
        estimatedTimeline: {
          minMonths: 8,
          maxMonths: 12,
          factors: ['Leadership experience needed', 'Team management training']
        },
        benchmarkData: {
          similarTransitions: 'Senior Engineer to EM',
          averageTimeline: '10 months',
          successRate: 75
        },
        progressPercentage: 0,
        careerCapitalAssessment: {
          uniqueSkills: ['Technical expertise', 'Cross-functional collaboration'],
          rareSkillCombinations: ['Deep technical + emerging leadership'],
          competitiveAdvantages: ['Technical credibility with teams']
        }
      };

      const planId = await helper.createTransitionPlan(transitionPlan);
      const plan = await helper.getTransitionPlan(planId);

      expect(plan).toBeDefined();
      expect(plan.transitionTypes).toEqual(['cross-role']);
      expect(plan.primaryTransitionType).toBe('cross-role');
      expect(plan.currentRole).toBe('Senior Software Engineer');
      expect(plan.targetRole).toBe('Engineering Manager');
      expect(plan.bridgeRoles).toEqual(['Tech Lead', 'Senior Tech Lead']);
      expect(plan.estimatedTimeline?.minMonths).toBe(8);
      expect(plan.benchmarkData?.successRate).toBe(75);
      expect(plan.careerCapitalAssessment?.uniqueSkills).toHaveLength(2);
    });

    it('should support hybrid transitions with multiple transition types', async () => {
      const userId = await helper.createUser();

      const hybridPlan = {
        userId,
        title: 'Engineer to PM in Healthcare',
        description: 'Transition from Software Engineer to Product Manager in Healthcare industry',
        goals: ['Product management skills', 'Healthcare domain knowledge'],
        timeline: 18,
        milestones: [],
        status: 'active' as const,
        transitionTypes: ['cross-role' as const, 'cross-industry' as const],
        primaryTransitionType: 'cross-role'
      };

      const planId = await helper.createTransitionPlan(hybridPlan);
      const plan = await helper.getTransitionPlan(planId);

      expect(plan.transitionTypes).toEqual(['cross-role', 'cross-industry']);
      expect(plan.primaryTransitionType).toBe('cross-role');
    });

    it('should maintain backward compatibility with existing plans without transition fields', async () => {
      const userId = await helper.createUser();

      // Create a plan WITHOUT any transition fields (legacy plan)
      const legacyPlan = {
        userId,
        title: 'Career Development Plan',
        description: 'General career development',
        goals: ['Skill improvement'],
        timeline: 6,
        milestones: [],
        status: 'active' as const
      };

      const planId = await helper.createPlan(legacyPlan);
      const plan = await helper.getPlan(planId);

      // Should work fine without transition fields
      expect(plan).toBeDefined();
      expect(plan.title).toBe('Career Development Plan');
      expect(plan.transitionTypes).toBeUndefined();
      expect(plan.primaryTransitionType).toBeUndefined();
    });
  });

  describe('Skills Table Extensions', () => {
    it('should create skill with transition-specific fields', async () => {
      const userId = await helper.createUser();
      const planId = await helper.createTransitionPlan({
        userId,
        title: 'Test Plan',
        description: 'Test',
        goals: [],
        timeline: 12,
        milestones: [],
        status: 'active' as const
      });

      const skill = {
        userId,
        name: 'Team Leadership',
        category: 'Management',
        currentLevel: 'beginner' as const,
        targetLevel: 'intermediate' as const,
        progress: 0,
        timeSpent: 0,
        estimatedTimeToTarget: 100,
        priority: 'high' as const,
        status: 'learning' as const,
        resources: [],
        // NEW transition-specific fields
        transitionPlanId: planId,
        criticalityLevel: 'critical' as const,
        transferableFrom: ['Project coordination', 'Mentoring juniors'],
        onetCode: '2.B.1.a',
        skillComplexity: 'advanced' as const,
        estimatedLearningTime: {
          minWeeks: 12,
          maxWeeks: 24
        },
        affiliateCourses: [
          {
            provider: 'Coursera',
            title: 'Leadership Fundamentals',
            url: 'https://coursera.org/course/leadership',
            affiliateLink: 'https://coursera.org/course/leadership?affiliate=careeros',
            price: 49
          }
        ]
      };

      const skillId = await helper.createSkillWithTransition(skill);
      const retrievedSkill = await helper.getSkill(skillId);

      expect(retrievedSkill).toBeDefined();
      expect(retrievedSkill.transitionPlanId).toBe(planId);
      expect(retrievedSkill.criticalityLevel).toBe('critical');
      expect(retrievedSkill.transferableFrom).toEqual(['Project coordination', 'Mentoring juniors']);
      expect(retrievedSkill.onetCode).toBe('2.B.1.a');
      expect(retrievedSkill.skillComplexity).toBe('advanced');
      expect(retrievedSkill.estimatedLearningTime?.minWeeks).toBe(12);
      expect(retrievedSkill.affiliateCourses).toHaveLength(1);
      expect(retrievedSkill.affiliateCourses?.[0].provider).toBe('Coursera');
    });

    it('should maintain backward compatibility with existing skills', async () => {
      const userId = await helper.createUser();

      // Create legacy skill without transition fields
      const legacySkill = {
        userId,
        name: 'JavaScript',
        category: 'Programming',
        currentLevel: 'intermediate' as const,
        targetLevel: 'advanced' as const,
        progress: 50,
        timeSpent: 40,
        estimatedTimeToTarget: 60,
        priority: 'medium' as const,
        status: 'learning' as const,
        resources: []
      };

      const skillId = await helper.createSkill(legacySkill);
      const skill = await helper.getSkill(skillId);

      expect(skill).toBeDefined();
      expect(skill.name).toBe('JavaScript');
      expect(skill.transitionPlanId).toBeUndefined();
      expect(skill.criticalityLevel).toBeUndefined();
    });
  });

  describe('Transition Queries', () => {
    it('should query transition plans by user', async () => {
      const userId = await helper.createUser();

      await helper.createTransitionPlan({
        userId,
        title: 'Plan A',
        description: 'First plan',
        goals: [],
        timeline: 12,
        milestones: [],
        status: 'active' as const,
        primaryTransitionType: 'cross-role'
      });

      await helper.createTransitionPlan({
        userId,
        title: 'Plan B',
        description: 'Second plan',
        goals: [],
        timeline: 18,
        milestones: [],
        status: 'active' as const,
        primaryTransitionType: 'cross-industry'
      });

      const plans = await helper.getTransitionPlansByUser(userId);
      expect(plans).toHaveLength(2);
    });

    it('should query transition plans by transition type', async () => {
      const userId = await helper.createUser();

      await helper.createTransitionPlan({
        userId,
        title: 'Cross-Role Plan',
        description: 'Role change',
        goals: [],
        timeline: 12,
        milestones: [],
        status: 'active' as const,
        primaryTransitionType: 'cross-role'
      });

      await helper.createTransitionPlan({
        userId,
        title: 'Cross-Industry Plan',
        description: 'Industry change',
        goals: [],
        timeline: 18,
        milestones: [],
        status: 'active' as const,
        primaryTransitionType: 'cross-industry'
      });

      const crossRolePlans = await helper.getPlansByTransitionType(userId, 'cross-role');
      expect(crossRolePlans).toHaveLength(1);
      expect(crossRolePlans[0].title).toBe('Cross-Role Plan');
    });

    it('should query skills by transition plan', async () => {
      const userId = await helper.createUser();
      const planId = await helper.createTransitionPlan({
        userId,
        title: 'Manager Transition',
        description: 'Become a manager',
        goals: [],
        timeline: 12,
        milestones: [],
        status: 'active' as const
      });

      await helper.createSkillWithTransition({
        userId,
        name: 'Leadership',
        category: 'Management',
        currentLevel: 'beginner' as const,
        targetLevel: 'intermediate' as const,
        progress: 0,
        timeSpent: 0,
        estimatedTimeToTarget: 100,
        priority: 'high' as const,
        status: 'learning' as const,
        resources: [],
        transitionPlanId: planId
      });

      const skills = await helper.getSkillsByTransitionPlan(planId);
      expect(skills).toHaveLength(1);
      expect(skills[0].name).toBe('Leadership');
    });

    it('should query skills by criticality level', async () => {
      const userId = await helper.createUser();

      await helper.createSkillWithTransition({
        userId,
        name: 'Critical Skill',
        category: 'Leadership',
        currentLevel: 'beginner' as const,
        targetLevel: 'advanced' as const,
        progress: 0,
        timeSpent: 0,
        estimatedTimeToTarget: 200,
        priority: 'high' as const,
        status: 'learning' as const,
        resources: [],
        criticalityLevel: 'critical' as const
      });

      await helper.createSkillWithTransition({
        userId,
        name: 'Nice-to-Have Skill',
        category: 'Communication',
        currentLevel: 'intermediate' as const,
        targetLevel: 'advanced' as const,
        progress: 0,
        timeSpent: 0,
        estimatedTimeToTarget: 50,
        priority: 'low' as const,
        status: 'not-started' as const,
        resources: [],
        criticalityLevel: 'nice-to-have' as const
      });

      const criticalSkills = await helper.getSkillsByCriticality(userId, 'critical');
      expect(criticalSkills).toHaveLength(1);
      expect(criticalSkills[0].name).toBe('Critical Skill');
    });
  });

  describe('Transition Mutations', () => {
    it('should update transition progress', async () => {
      const userId = await helper.createUser();
      const planId = await helper.createTransitionPlan({
        userId,
        title: 'Test Plan',
        description: 'Test',
        goals: [],
        timeline: 12,
        milestones: [],
        status: 'active' as const,
        progressPercentage: 0
      });

      await helper.updateTransitionProgress(planId, 35);
      const plan = await helper.getTransitionPlan(planId);

      expect(plan.progressPercentage).toBe(35);
    });

    it('should delete transition plan', async () => {
      const userId = await helper.createUser();
      const planId = await helper.createTransitionPlan({
        userId,
        title: 'To Delete',
        description: 'Will be deleted',
        goals: [],
        timeline: 12,
        milestones: [],
        status: 'draft' as const
      });

      await helper.deleteTransitionPlan(planId);
      const plan = await helper.getTransitionPlan(planId);

      expect(plan).toBeNull();
    });
  });
});
