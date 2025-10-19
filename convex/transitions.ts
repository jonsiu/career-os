import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

/**
 * Transition Planning Convex Operations
 *
 * This file contains queries and mutations for managing career transition plans
 * and their associated skills. It extends the base plans and skills functionality
 * with transition-specific operations.
 */

// Transition plan queries

/**
 * Get all transition plans for a user
 */
export const getTransitionPlans = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const plans = await ctx.db
      .query("plans")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .filter((q) => q.neq(q.field("primaryTransitionType"), undefined))
      .order("desc")
      .collect();

    return plans;
  },
});

/**
 * Get a single transition plan by ID with full details
 */
export const getTransitionPlanById = query({
  args: { planId: v.id("plans") },
  handler: async (ctx, args) => {
    const plan = await ctx.db.get(args.planId);
    return plan;
  },
});

/**
 * Get transition plans filtered by transition type
 */
export const getPlansByTransitionType = query({
  args: {
    userId: v.id("users"),
    transitionType: v.string(),
  },
  handler: async (ctx, args) => {
    const plans = await ctx.db
      .query("plans")
      .withIndex("by_transition_type", (q) =>
        q.eq("userId", args.userId).eq("primaryTransitionType", args.transitionType)
      )
      .order("desc")
      .collect();

    return plans;
  },
});

/**
 * Get skills associated with a specific transition plan
 */
export const getSkillsByTransitionPlan = query({
  args: { transitionPlanId: v.id("plans") },
  handler: async (ctx, args) => {
    const skills = await ctx.db
      .query("skills")
      .withIndex("by_transition_plan", (q) =>
        q.eq("transitionPlanId", args.transitionPlanId)
      )
      .order("desc")
      .collect();

    return skills;
  },
});

/**
 * Get skills filtered by criticality level for a user
 */
export const getSkillsByCriticality = query({
  args: {
    userId: v.id("users"),
    criticalityLevel: v.union(
      v.literal("critical"),
      v.literal("important"),
      v.literal("nice-to-have")
    ),
  },
  handler: async (ctx, args) => {
    const skills = await ctx.db
      .query("skills")
      .withIndex("by_criticality", (q) =>
        q.eq("userId", args.userId).eq("criticalityLevel", args.criticalityLevel)
      )
      .order("desc")
      .collect();

    return skills;
  },
});

// Transition plan mutations

/**
 * Create a new transition plan
 */
export const createTransitionPlan = mutation({
  args: {
    userId: v.id("users"),
    title: v.string(),
    description: v.string(),
    goals: v.array(v.string()),
    timeline: v.number(),
    milestones: v.array(v.any()),
    status: v.union(
      v.literal("draft"),
      v.literal("active"),
      v.literal("completed")
    ),
    metadata: v.optional(v.any()),
    // Transition-specific fields (all optional)
    transitionTypes: v.optional(v.array(v.union(
      v.literal("cross-role"),
      v.literal("cross-industry"),
      v.literal("cross-function")
    ))),
    primaryTransitionType: v.optional(v.string()),
    currentRole: v.optional(v.string()),
    targetRole: v.optional(v.string()),
    currentIndustry: v.optional(v.string()),
    targetIndustry: v.optional(v.string()),
    bridgeRoles: v.optional(v.array(v.string())),
    estimatedTimeline: v.optional(v.object({
      minMonths: v.number(),
      maxMonths: v.number(),
      factors: v.array(v.string()),
    })),
    benchmarkData: v.optional(v.object({
      similarTransitions: v.string(),
      averageTimeline: v.string(),
      successRate: v.optional(v.number()),
    })),
    progressPercentage: v.optional(v.number()),
    careerCapitalAssessment: v.optional(v.object({
      uniqueSkills: v.array(v.string()),
      rareSkillCombinations: v.array(v.string()),
      competitiveAdvantages: v.array(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const planId = await ctx.db.insert("plans", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });
    return planId;
  },
});

/**
 * Update an existing transition plan
 */
export const updateTransitionPlan = mutation({
  args: {
    planId: v.id("plans"),
    updates: v.object({
      title: v.optional(v.string()),
      description: v.optional(v.string()),
      goals: v.optional(v.array(v.string())),
      timeline: v.optional(v.number()),
      milestones: v.optional(v.array(v.any())),
      status: v.optional(v.union(
        v.literal("draft"),
        v.literal("active"),
        v.literal("completed")
      )),
      metadata: v.optional(v.any()),
      transitionTypes: v.optional(v.array(v.union(
        v.literal("cross-role"),
        v.literal("cross-industry"),
        v.literal("cross-function")
      ))),
      primaryTransitionType: v.optional(v.string()),
      currentRole: v.optional(v.string()),
      targetRole: v.optional(v.string()),
      currentIndustry: v.optional(v.string()),
      targetIndustry: v.optional(v.string()),
      bridgeRoles: v.optional(v.array(v.string())),
      estimatedTimeline: v.optional(v.object({
        minMonths: v.number(),
        maxMonths: v.number(),
        factors: v.array(v.string()),
      })),
      benchmarkData: v.optional(v.object({
        similarTransitions: v.string(),
        averageTimeline: v.string(),
        successRate: v.optional(v.number()),
      })),
      progressPercentage: v.optional(v.number()),
      careerCapitalAssessment: v.optional(v.object({
        uniqueSkills: v.array(v.string()),
        rareSkillCombinations: v.array(v.string()),
        competitiveAdvantages: v.array(v.string()),
      })),
    }),
  },
  handler: async (ctx, args) => {
    const { planId, updates } = args;
    await ctx.db.patch(planId, {
      ...updates,
      updatedAt: Date.now(),
    });
    return await ctx.db.get(planId);
  },
});

/**
 * Update transition plan progress percentage
 */
export const updateTransitionProgress = mutation({
  args: {
    planId: v.id("plans"),
    progressPercentage: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.planId, {
      progressPercentage: args.progressPercentage,
      updatedAt: Date.now(),
    });
    return await ctx.db.get(args.planId);
  },
});

/**
 * Delete a transition plan
 */
export const deleteTransitionPlan = mutation({
  args: { planId: v.id("plans") },
  handler: async (ctx, args) => {
    // Note: In a production system, you might want to also handle
    // cascading deletes for associated skills or archive the plan instead
    await ctx.db.delete(args.planId);
  },
});

// Skill mutations with transition support

/**
 * Create a skill with transition-specific fields
 */
export const createTransitionSkill = mutation({
  args: {
    userId: v.id("users"),
    name: v.string(),
    category: v.string(),
    currentLevel: v.union(
      v.literal("beginner"),
      v.literal("intermediate"),
      v.literal("advanced"),
      v.literal("expert")
    ),
    targetLevel: v.union(
      v.literal("beginner"),
      v.literal("intermediate"),
      v.literal("advanced"),
      v.literal("expert")
    ),
    progress: v.number(),
    timeSpent: v.number(),
    estimatedTimeToTarget: v.number(),
    priority: v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high")
    ),
    status: v.union(
      v.literal("learning"),
      v.literal("practicing"),
      v.literal("mastered"),
      v.literal("not-started")
    ),
    resources: v.array(v.any()),
    notes: v.optional(v.string()),
    metadata: v.optional(v.any()),
    // Transition-specific fields
    transitionPlanId: v.optional(v.id("plans")),
    criticalityLevel: v.optional(v.union(
      v.literal("critical"),
      v.literal("important"),
      v.literal("nice-to-have")
    )),
    transferableFrom: v.optional(v.array(v.string())),
    onetCode: v.optional(v.string()),
    skillComplexity: v.optional(v.union(
      v.literal("basic"),
      v.literal("intermediate"),
      v.literal("advanced")
    )),
    estimatedLearningTime: v.optional(v.object({
      minWeeks: v.number(),
      maxWeeks: v.number(),
    })),
    affiliateCourses: v.optional(v.array(v.object({
      provider: v.string(),
      title: v.string(),
      url: v.string(),
      affiliateLink: v.string(),
      price: v.optional(v.number()),
    }))),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const skillId = await ctx.db.insert("skills", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });
    return skillId;
  },
});

/**
 * Update a skill's transition-specific fields
 */
export const updateTransitionSkill = mutation({
  args: {
    skillId: v.id("skills"),
    updates: v.object({
      name: v.optional(v.string()),
      category: v.optional(v.string()),
      currentLevel: v.optional(v.union(
        v.literal("beginner"),
        v.literal("intermediate"),
        v.literal("advanced"),
        v.literal("expert")
      )),
      targetLevel: v.optional(v.union(
        v.literal("beginner"),
        v.literal("intermediate"),
        v.literal("advanced"),
        v.literal("expert")
      )),
      progress: v.optional(v.number()),
      timeSpent: v.optional(v.number()),
      estimatedTimeToTarget: v.optional(v.number()),
      priority: v.optional(v.union(
        v.literal("low"),
        v.literal("medium"),
        v.literal("high")
      )),
      status: v.optional(v.union(
        v.literal("learning"),
        v.literal("practicing"),
        v.literal("mastered"),
        v.literal("not-started")
      )),
      resources: v.optional(v.array(v.any())),
      notes: v.optional(v.string()),
      metadata: v.optional(v.any()),
      transitionPlanId: v.optional(v.id("plans")),
      criticalityLevel: v.optional(v.union(
        v.literal("critical"),
        v.literal("important"),
        v.literal("nice-to-have")
      )),
      transferableFrom: v.optional(v.array(v.string())),
      onetCode: v.optional(v.string()),
      skillComplexity: v.optional(v.union(
        v.literal("basic"),
        v.literal("intermediate"),
        v.literal("advanced")
      )),
      estimatedLearningTime: v.optional(v.object({
        minWeeks: v.number(),
        maxWeeks: v.number(),
      })),
      affiliateCourses: v.optional(v.array(v.object({
        provider: v.string(),
        title: v.string(),
        url: v.string(),
        affiliateLink: v.string(),
        price: v.optional(v.number()),
      }))),
    }),
  },
  handler: async (ctx, args) => {
    const { skillId, updates } = args;
    await ctx.db.patch(skillId, {
      ...updates,
      updatedAt: Date.now(),
    });
    return await ctx.db.get(skillId);
  },
});
