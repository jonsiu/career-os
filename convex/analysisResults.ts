import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Analysis Results Schema
export const createAnalysisResult = mutation({
  args: {
    resumeId: v.id("resumes"),
    analysisType: v.union(v.literal("basic"), v.literal("advanced"), v.literal("ai-powered")),
    overallScore: v.number(),
    categoryScores: v.any(), // JSON object with category breakdowns
    detailedInsights: v.any(), // JSON object with insights
    recommendations: v.any(), // JSON array of recommendations
    contentHash: v.string(), // SHA-256 hash of resume content
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get the resume to verify ownership
    const resume = await ctx.db.get(args.resumeId);
    if (!resume) {
      throw new Error("Resume not found");
    }

    // Get user by Clerk ID
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkUserId"), identity.subject))
      .first();

    if (!user || resume.userId !== user._id) {
      throw new Error("Not authorized to analyze this resume");
    }

    // Check if analysis already exists for this content hash
    const existingAnalysis = await ctx.db
      .query("analysisResults")
      .filter((q) => 
        q.and(
          q.eq(q.field("resumeId"), args.resumeId),
          q.eq(q.field("analysisType"), args.analysisType),
          q.eq(q.field("contentHash"), args.contentHash)
        )
      )
      .first();

    if (existingAnalysis) {
      // Update existing analysis with new timestamp
      return await ctx.db.patch(existingAnalysis._id, {
        updatedAt: Date.now(),
        metadata: args.metadata,
      });
    }

    // Create new analysis result
    return await ctx.db.insert("analysisResults", {
      resumeId: args.resumeId,
      analysisType: args.analysisType,
      overallScore: args.overallScore,
      categoryScores: args.categoryScores,
      detailedInsights: args.detailedInsights,
      recommendations: args.recommendations,
      contentHash: args.contentHash,
      metadata: args.metadata,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

// Get latest analysis result for a resume
export const getLatestAnalysisResult = query({
  args: {
    resumeId: v.id("resumes"),
    analysisType: v.union(v.literal("basic"), v.literal("advanced"), v.literal("ai-powered")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get the resume to verify ownership
    const resume = await ctx.db.get(args.resumeId);
    if (!resume) {
      throw new Error("Resume not found");
    }

    // Get user by Clerk ID
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkUserId"), identity.subject))
      .first();

    if (!user || resume.userId !== user._id) {
      throw new Error("Not authorized to view this analysis");
    }

    // Get the latest analysis result
    return await ctx.db
      .query("analysisResults")
      .filter((q) => 
        q.and(
          q.eq(q.field("resumeId"), args.resumeId),
          q.eq(q.field("analysisType"), args.analysisType)
        )
      )
      .order("desc")
      .first();
  },
});

// Get analysis history for a resume
export const getAnalysisHistory = query({
  args: {
    resumeId: v.id("resumes"),
    analysisType: v.optional(v.union(v.literal("basic"), v.literal("advanced"))),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get the resume to verify ownership
    const resume = await ctx.db.get(args.resumeId);
    if (!resume) {
      throw new Error("Resume not found");
    }

    // Get user by Clerk ID
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkUserId"), identity.subject))
      .first();

    if (!user || resume.userId !== user._id) {
      throw new Error("Not authorized to view this analysis history");
    }

    // Build query filter
    let query = ctx.db
      .query("analysisResults")
      .filter((q) => q.eq(q.field("resumeId"), args.resumeId));

    if (args.analysisType) {
      query = query.filter((q) => q.eq(q.field("analysisType"), args.analysisType));
    }

    return await query.order("desc").collect();
  },
});

// Check if analysis exists for current content hash
export const checkAnalysisExists = query({
  args: {
    resumeId: v.id("resumes"),
    analysisType: v.union(v.literal("basic"), v.literal("advanced"), v.literal("ai-powered")),
    contentHash: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get the resume to verify ownership
    const resume = await ctx.db.get(args.resumeId);
    if (!resume) {
      throw new Error("Resume not found");
    }

    // Get user by Clerk ID
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkUserId"), identity.subject))
      .first();

    if (!user || resume.userId !== user._id) {
      throw new Error("Not authorized to check this analysis");
    }

    // Check if analysis exists for this content hash
    const existingAnalysis = await ctx.db
      .query("analysisResults")
      .filter((q) => 
        q.and(
          q.eq(q.field("resumeId"), args.resumeId),
          q.eq(q.field("analysisType"), args.analysisType),
          q.eq(q.field("contentHash"), args.contentHash)
        )
      )
      .first();

    return {
      exists: !!existingAnalysis,
      analysis: existingAnalysis,
    };
  },
});

// Get analysis statistics for a resume
export const getAnalysisStats = query({
  args: {
    resumeId: v.id("resumes"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get the resume to verify ownership
    const resume = await ctx.db.get(args.resumeId);
    if (!resume) {
      throw new Error("Resume not found");
    }

    // Get user by Clerk ID
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkUserId"), identity.subject))
      .first();

    if (!user || resume.userId !== user._id) {
      throw new Error("Not authorized to view this analysis stats");
    }

    // Get all analysis results for this resume
    const analyses = await ctx.db
      .query("analysisResults")
      .filter((q) => q.eq(q.field("resumeId"), args.resumeId))
      .order("desc")
      .collect();

    if (analyses.length === 0) {
      return {
        totalAnalyses: 0,
        latestScore: null,
        scoreTrend: null,
        improvementCount: 0,
        lastAnalyzed: null,
      };
    }

    // Calculate statistics
    const latestScore = analyses[0].overallScore;
    const scoreTrend = analyses.length > 1 ? 
      analyses[0].overallScore - analyses[1].overallScore : 0;
    
    let improvementCount = 0;
    for (let i = 1; i < analyses.length; i++) {
      if (analyses[i-1].overallScore > analyses[i].overallScore) {
        improvementCount++;
      }
    }

    return {
      totalAnalyses: analyses.length,
      latestScore,
      scoreTrend,
      improvementCount,
      lastAnalyzed: analyses[0].createdAt,
      analyses: analyses.slice(0, 10), // Return last 10 analyses
    };
  },
});

// Delete analysis result
export const deleteAnalysisResult = mutation({
  args: {
    analysisId: v.id("analysisResults"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get the analysis result
    const analysis = await ctx.db.get(args.analysisId);
    if (!analysis) {
      throw new Error("Analysis not found");
    }

    // Get the resume to verify ownership
    const resume = await ctx.db.get(analysis.resumeId);
    if (!resume) {
      throw new Error("Resume not found");
    }

    // Get user by Clerk ID
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkUserId"), identity.subject))
      .first();

    if (!user || resume.userId !== user._id) {
      throw new Error("Not authorized to delete this analysis");
    }

    await ctx.db.delete(args.analysisId);
  },
});
