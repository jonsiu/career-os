/**
 * Test Helper for Convex Database Operations
 *
 * This helper provides mock implementations for testing Convex operations
 * without requiring a live Convex backend.
 */

import { Id } from '../_generated/dataModel';

interface MockPlan {
  _id: Id<'plans'>;
  userId: Id<'users'>;
  title: string;
  description: string;
  goals: string[];
  timeline: number;
  milestones: any[];
  status: 'draft' | 'active' | 'completed';
  transitionTypes?: ('cross-role' | 'cross-industry' | 'cross-function')[];
  primaryTransitionType?: string;
  currentRole?: string;
  targetRole?: string;
  currentIndustry?: string;
  targetIndustry?: string;
  bridgeRoles?: string[];
  estimatedTimeline?: {
    minMonths: number;
    maxMonths: number;
    factors: string[];
  };
  benchmarkData?: {
    similarTransitions: string;
    averageTimeline: string;
    successRate?: number;
  };
  progressPercentage?: number;
  careerCapitalAssessment?: {
    uniqueSkills: string[];
    rareSkillCombinations: string[];
    competitiveAdvantages: string[];
  };
  createdAt: number;
  updatedAt: number;
}

interface MockSkill {
  _id: Id<'skills'>;
  userId: Id<'users'>;
  name: string;
  category: string;
  currentLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  targetLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  progress: number;
  timeSpent: number;
  estimatedTimeToTarget: number;
  priority: 'low' | 'medium' | 'high';
  status: 'learning' | 'practicing' | 'mastered' | 'not-started';
  resources: any[];
  transitionPlanId?: Id<'plans'>;
  criticalityLevel?: 'critical' | 'important' | 'nice-to-have';
  transferableFrom?: string[];
  onetCode?: string;
  skillComplexity?: 'basic' | 'intermediate' | 'advanced';
  estimatedLearningTime?: {
    minWeeks: number;
    maxWeeks: number;
  };
  affiliateCourses?: Array<{
    provider: string;
    title: string;
    url: string;
    affiliateLink: string;
    price?: number;
  }>;
  createdAt: number;
  updatedAt: number;
}

export class ConvexTestingHelper {
  private users: Map<Id<'users'>, any> = new Map();
  private plans: Map<Id<'plans'>, MockPlan> = new Map();
  private skills: Map<Id<'skills'>, MockSkill> = new Map();
  private idCounter = 0;

  private generateId<T extends string>(table: T): Id<T> {
    this.idCounter++;
    return `${table}_${this.idCounter}` as Id<T>;
  }

  async createUser(email = 'test@example.com'): Promise<Id<'users'>> {
    const userId = this.generateId('users');
    this.users.set(userId, {
      _id: userId,
      clerkUserId: `clerk_${userId}`,
      email,
      name: 'Test User',
      createdAt: Date.now(),
      updatedAt: Date.now()
    });
    return userId;
  }

  async createPlan(planData: Omit<MockPlan, '_id' | 'createdAt' | 'updatedAt'>): Promise<Id<'plans'>> {
    const planId = this.generateId('plans');
    const now = Date.now();
    const plan: MockPlan = {
      _id: planId,
      ...planData,
      createdAt: now,
      updatedAt: now
    };
    this.plans.set(planId, plan);
    return planId;
  }

  async createTransitionPlan(planData: Omit<MockPlan, '_id' | 'createdAt' | 'updatedAt'>): Promise<Id<'plans'>> {
    return this.createPlan(planData);
  }

  async getPlan(planId: Id<'plans'>): Promise<MockPlan | null> {
    return this.plans.get(planId) || null;
  }

  async getTransitionPlan(planId: Id<'plans'>): Promise<MockPlan | null> {
    return this.getPlan(planId);
  }

  async getTransitionPlansByUser(userId: Id<'users'>): Promise<MockPlan[]> {
    return Array.from(this.plans.values()).filter(plan => plan.userId === userId);
  }

  async getPlansByTransitionType(userId: Id<'users'>, transitionType: string): Promise<MockPlan[]> {
    return Array.from(this.plans.values()).filter(
      plan => plan.userId === userId && plan.primaryTransitionType === transitionType
    );
  }

  async updateTransitionProgress(planId: Id<'plans'>, progressPercentage: number): Promise<void> {
    const plan = this.plans.get(planId);
    if (plan) {
      plan.progressPercentage = progressPercentage;
      plan.updatedAt = Date.now();
    }
  }

  async deleteTransitionPlan(planId: Id<'plans'>): Promise<void> {
    this.plans.delete(planId);
  }

  async createSkill(skillData: Omit<MockSkill, '_id' | 'createdAt' | 'updatedAt'>): Promise<Id<'skills'>> {
    const skillId = this.generateId('skills');
    const now = Date.now();
    const skill: MockSkill = {
      _id: skillId,
      ...skillData,
      createdAt: now,
      updatedAt: now
    };
    this.skills.set(skillId, skill);
    return skillId;
  }

  async createSkillWithTransition(skillData: Omit<MockSkill, '_id' | 'createdAt' | 'updatedAt'>): Promise<Id<'skills'>> {
    return this.createSkill(skillData);
  }

  async getSkill(skillId: Id<'skills'>): Promise<MockSkill | null> {
    return this.skills.get(skillId) || null;
  }

  async getSkillsByTransitionPlan(planId: Id<'plans'>): Promise<MockSkill[]> {
    return Array.from(this.skills.values()).filter(skill => skill.transitionPlanId === planId);
  }

  async getSkillsByCriticality(userId: Id<'users'>, criticalityLevel: string): Promise<MockSkill[]> {
    return Array.from(this.skills.values()).filter(
      skill => skill.userId === userId && skill.criticalityLevel === criticalityLevel
    );
  }
}
