import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Type definitions for skill gap analysis components
const CriticalGapObject = v.object({
  skillName: v.string(),
  onetCode: v.optional(v.string()),
  importance: v.number(),
  currentLevel: v.number(),
  targetLevel: v.number(),
  priorityScore: v.number(),
  timeEstimate: v.number(),
  marketDemand: v.number(),
});

const NiceToHaveGapObject = v.object({
  skillName: v.string(),
  onetCode: v.optional(v.string()),
  importance: v.number(),
  currentLevel: v.number(),
  targetLevel: v.number(),
  priorityScore: v.number(),
  timeEstimate: v.number(),
});

const TransferableSkillObject = v.object({
  skillName: v.string(),
  currentLevel: v.number(),
  applicability: v.number(),
  transferExplanation: v.string(),
  confidence: v.number(),
});

const RoadmapPhaseObject = v.object({
  phase: v.number(),
  skills: v.array(v.string()),
  estimatedDuration: v.number(),
  milestoneTitle: v.string(),
});

const MetadataObject = v.object({
  onetDataVersion: v.string(),
  aiModel: v.string(),
  affiliateClickCount: v.number(),
  lastProgressUpdate: v.number(),
});

// Query: Get skill gap analysis by ID
export const getById = query({
  args: {
    analysisId: v.id("skillGapAnalyses"),
  },
  handler: async (ctx, args) => {
    const analysis = await ctx.db.get(args.analysisId);
    return analysis;
  },
});

// Query: Get all skill gap analyses for a user
export const getByUserId = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const analyses = await ctx.db
      .query("skillGapAnalyses")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();

    return analyses;
  },
});

// Query: Get all skill gap analyses for a resume
export const getByResumeId = query({
  args: {
    resumeId: v.id("resumes"),
  },
  handler: async (ctx, args) => {
    const analyses = await ctx.db
      .query("skillGapAnalyses")
      .withIndex("by_resume_id", (q) => q.eq("resumeId", args.resumeId))
      .order("desc")
      .collect();

    return analyses;
  },
});

// Query: Get historical skill gap analyses for a user with optional target role filter
export const getHistoricalAnalyses = query({
  args: {
    userId: v.id("users"),
    targetRole: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let analyses = await ctx.db
      .query("skillGapAnalyses")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();

    // Filter by target role if provided
    if (args.targetRole) {
      analyses = analyses.filter(
        (analysis) => analysis.targetRole === args.targetRole
      );
    }

    return analyses;
  },
});

// Query: Get analysis by content hash for cache lookup
export const getByContentHash = query({
  args: {
    resumeId: v.id("resumes"),
    contentHash: v.string(),
    targetRole: v.string(),
  },
  handler: async (ctx, args) => {
    // Find analysis matching resume, content hash, and target role
    const analysis = await ctx.db
      .query("skillGapAnalyses")
      .withIndex("by_resume_id", (q) => q.eq("resumeId", args.resumeId))
      .filter((q) =>
        q.and(
          q.eq(q.field("contentHash"), args.contentHash),
          q.eq(q.field("targetRole"), args.targetRole)
        )
      )
      .first();

    return analysis;
  },
});

// Mutation: Create a new skill gap analysis
export const create = mutation({
  args: {
    userId: v.id("users"),
    resumeId: v.id("resumes"),
    targetRole: v.string(),
    targetRoleONetCode: v.optional(v.string()),
    criticalGaps: v.array(CriticalGapObject),
    niceToHaveGaps: v.array(NiceToHaveGapObject),
    transferableSkills: v.array(TransferableSkillObject),
    prioritizedRoadmap: v.array(RoadmapPhaseObject),
    userAvailability: v.number(),
    transitionType: v.string(),
    completionProgress: v.number(),
    contentHash: v.string(),
    analysisVersion: v.string(),
    metadata: MetadataObject,
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const analysisId = await ctx.db.insert("skillGapAnalyses", {
      userId: args.userId,
      resumeId: args.resumeId,
      targetRole: args.targetRole,
      targetRoleONetCode: args.targetRoleONetCode,
      criticalGaps: args.criticalGaps,
      niceToHaveGaps: args.niceToHaveGaps,
      transferableSkills: args.transferableSkills,
      prioritizedRoadmap: args.prioritizedRoadmap,
      userAvailability: args.userAvailability,
      transitionType: args.transitionType,
      completionProgress: args.completionProgress,
      contentHash: args.contentHash,
      analysisVersion: args.analysisVersion,
      metadata: args.metadata,
      createdAt: now,
      updatedAt: now,
    });

    return analysisId;
  },
});

// Mutation: Update an existing skill gap analysis
export const update = mutation({
  args: {
    analysisId: v.id("skillGapAnalyses"),
    updates: v.object({
      targetRole: v.optional(v.string()),
      targetRoleONetCode: v.optional(v.string()),
      criticalGaps: v.optional(v.array(CriticalGapObject)),
      niceToHaveGaps: v.optional(v.array(NiceToHaveGapObject)),
      transferableSkills: v.optional(v.array(TransferableSkillObject)),
      prioritizedRoadmap: v.optional(v.array(RoadmapPhaseObject)),
      userAvailability: v.optional(v.number()),
      transitionType: v.optional(v.string()),
      completionProgress: v.optional(v.number()),
      metadata: v.optional(MetadataObject),
    }),
  },
  handler: async (ctx, args) => {
    const { analysisId, updates } = args;

    await ctx.db.patch(analysisId, {
      ...updates,
      updatedAt: Date.now(),
    });

    return analysisId;
  },
});

// Mutation: Update analysis completion progress
export const updateProgress = mutation({
  args: {
    analysisId: v.id("skillGapAnalyses"),
    completionProgress: v.number(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Get existing analysis to update metadata
    const analysis = await ctx.db.get(args.analysisId);
    if (!analysis) {
      throw new Error("Analysis not found");
    }

    await ctx.db.patch(args.analysisId, {
      completionProgress: args.completionProgress,
      metadata: {
        ...analysis.metadata,
        lastProgressUpdate: now,
      },
      updatedAt: now,
    });

    return args.analysisId;
  },
});

// Mutation: Delete a skill gap analysis
export const deleteAnalysis = mutation({
  args: {
    analysisId: v.id("skillGapAnalyses"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.analysisId);
  },
});
