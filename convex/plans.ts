import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Plan queries
export const getById = query({
  args: { id: v.id("plans") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getByUserId = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("plans")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

export const getByStatus = query({
  args: { status: v.union(
    v.literal("draft"),
    v.literal("active"),
    v.literal("completed")
  ) },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("plans")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .collect();
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("plans")
      .withIndex("by_created_at", (q) => q)
      .collect();
  },
});

// Plan mutations
export const create = mutation({
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
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const planId = await ctx.db.insert("plans", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });
    return await ctx.db.get(planId);
  },
});

export const update = mutation({
  args: {
    id: v.id("plans"),
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
  args: { id: v.id("plans") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
