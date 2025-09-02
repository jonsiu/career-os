import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Types for skills
export interface SkillResource {
  name: string;
  type: 'course' | 'book' | 'video' | 'project' | 'mentorship';
  url?: string;
  estimatedHours: number;
  completed: boolean;
}

export interface Skill {
  id: Id<"skills">;
  userId: Id<"users">;
  name: string;
  category: string;
  currentLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  targetLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  progress: number; // 0-100
  timeSpent: number; // hours
  estimatedTimeToTarget: number; // hours
  priority: 'low' | 'medium' | 'high';
  status: 'learning' | 'practicing' | 'mastered' | 'not-started';
  resources: SkillResource[];
  notes?: string;
  metadata?: any;
  createdAt: number;
  updatedAt: number;
}

// Get all skills for a user
export const getUserSkills = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const skills = await ctx.db
      .query("skills")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();

    return skills;
  },
});

// Get skills by category for a user
export const getUserSkillsByCategory = query({
  args: { 
    userId: v.id("users"),
    category: v.string()
  },
  handler: async (ctx, args) => {
    const skills = await ctx.db
      .query("skills")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("category"), args.category))
      .order("desc")
      .collect();

    return skills;
  },
});

// Get skills by status for a user
export const getUserSkillsByStatus = query({
  args: { 
    userId: v.id("users"),
    status: v.union(
      v.literal("learning"),
      v.literal("practicing"),
      v.literal("mastered"),
      v.literal("not-started")
    )
  },
  handler: async (ctx, args) => {
    const skills = await ctx.db
      .query("skills")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("status"), args.status))
      .order("desc")
      .collect();

    return skills;
  },
});

// Get a single skill by ID
export const getSkill = query({
  args: { skillId: v.id("skills") },
  handler: async (ctx, args) => {
    const skill = await ctx.db.get(args.skillId);
    return skill;
  },
});

// Create a new skill
export const createSkill = mutation({
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

// Update an existing skill
export const updateSkill = mutation({
  args: {
    skillId: v.id("skills"),
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
  },
  handler: async (ctx, args) => {
    const { skillId, ...updates } = args;
    
    await ctx.db.patch(skillId, {
      ...updates,
      updatedAt: Date.now(),
    });

    return skillId;
  },
});

// Delete a skill
export const deleteSkill = mutation({
  args: { skillId: v.id("skills") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.skillId);
  },
});

// Update skill progress
export const updateSkillProgress = mutation({
  args: {
    skillId: v.id("skills"),
    progress: v.number(),
    timeSpent: v.optional(v.number()),
    status: v.optional(v.union(
      v.literal("learning"),
      v.literal("practicing"),
      v.literal("mastered"),
      v.literal("not-started")
    )),
  },
  handler: async (ctx, args) => {
    const { skillId, ...updates } = args;
    
    await ctx.db.patch(skillId, {
      ...updates,
      updatedAt: Date.now(),
    });

    return skillId;
  },
});

// Add resource to skill
export const addSkillResource = mutation({
  args: {
    skillId: v.id("skills"),
    resource: v.object({
      name: v.string(),
      type: v.union(
        v.literal("course"),
        v.literal("book"),
        v.literal("video"),
        v.literal("project"),
        v.literal("mentorship")
      ),
      url: v.optional(v.string()),
      estimatedHours: v.number(),
      completed: v.boolean(),
    }),
  },
  handler: async (ctx, args) => {
    const skill = await ctx.db.get(args.skillId);
    if (!skill) throw new Error("Skill not found");

    const updatedResources = [...skill.resources, args.resource];
    
    await ctx.db.patch(args.skillId, {
      resources: updatedResources,
      updatedAt: Date.now(),
    });

    return args.skillId;
  },
});

// Update resource completion status
export const updateResourceCompletion = mutation({
  args: {
    skillId: v.id("skills"),
    resourceIndex: v.number(),
    completed: v.boolean(),
  },
  handler: async (ctx, args) => {
    const skill = await ctx.db.get(args.skillId);
    if (!skill) throw new Error("Skill not found");

    const updatedResources = [...skill.resources];
    updatedResources[args.resourceIndex] = {
      ...updatedResources[args.resourceIndex],
      completed: args.completed,
    };
    
    await ctx.db.patch(args.skillId, {
      resources: updatedResources,
      updatedAt: Date.now(),
    });

    return args.skillId;
  },
});
