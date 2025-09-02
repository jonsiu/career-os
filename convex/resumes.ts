import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Resume queries
export const getById = query({
  args: { id: v.id("resumes") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getByUserId = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("resumes")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("resumes")
      .withIndex("by_created_at", (q) => q.desc())
      .collect();
  },
});

// Resume mutations
export const create = mutation({
  args: {
    userId: v.id("users"),
    title: v.string(),
    content: v.string(),
    filePath: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const resumeId = await ctx.db.insert("resumes", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });
    return await ctx.db.get(resumeId);
  },
});

export const update = mutation({
  args: {
    id: v.id("resumes"),
    updates: v.object({
      title: v.optional(v.string()),
      content: v.optional(v.string()),
      filePath: v.optional(v.string()),
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

export const remove = mutation({
  args: { id: v.id("resumes") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
