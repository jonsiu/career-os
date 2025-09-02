import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Analysis queries
export const getById = query({
  args: { id: v.id("analyses") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getByUserId = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("analyses")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

export const getByResumeId = query({
  args: { resumeId: v.id("resumes") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("analyses")
      .withIndex("by_resume_id", (q) => q.eq("resumeId", args.resumeId))
      .collect();
  },
});

export const getByJobId = query({
  args: { jobId: v.id("jobs") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("analyses")
      .withIndex("by_job_id", (q) => q.eq("jobId", args.jobId))
      .collect();
  },
});

export const getByType = query({
  args: { type: v.union(
    v.literal("resume"),
    v.literal("career"),
    v.literal("skills")
  ) },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("analyses")
      .withIndex("by_type", (q) => q.eq("type", args.type))
      .collect();
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("analyses")
      .withIndex("by_created_at", (q) => q)
      .collect();
  },
});

// Analysis mutations
export const create = mutation({
  args: {
    userId: v.id("users"),
    resumeId: v.id("resumes"),
    jobId: v.optional(v.id("jobs")),
    type: v.union(
      v.literal("resume"),
      v.literal("career"),
      v.literal("skills")
    ),
    result: v.any(),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const analysisId = await ctx.db.insert("analyses", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });
    return analysisId; // Return just the ID, not the full object
  },
});

export const update = mutation({
  args: {
    id: v.id("analyses"),
    updates: v.object({
      result: v.optional(v.any()),
      metadata: v.optional(v.any()),
    }),
  },
  handler: async (ctx, args) => {
    const { id, updates } = args;
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
    return await ctx.db.get(id);
  },
});
