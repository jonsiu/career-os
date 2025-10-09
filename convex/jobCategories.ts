import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Job Category queries
export const getById = query({
  args: { id: v.id("jobCategories") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getByUserId = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("jobCategories")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

export const getByStatus = query({
  args: { status: v.union(
    v.literal("active"),
    v.literal("paused"),
    v.literal("completed")
  ) },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("jobCategories")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .collect();
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("jobCategories")
      .withIndex("by_created_at", (q) => q.desc())
      .collect();
  },
});

// Job Category mutations
export const create = mutation({
  args: {
    userId: v.id("users"),
    name: v.string(),
    description: v.optional(v.string()),
    targetRole: v.string(),
    targetCompanies: v.optional(v.array(v.string())),
    targetLocations: v.optional(v.array(v.string())),
    status: v.union(
      v.literal("active"),
      v.literal("paused"),
      v.literal("completed")
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const categoryId = await ctx.db.insert("jobCategories", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });
    return categoryId; // Return just the ID, not the full object
  },
});

export const update = mutation({
  args: {
    id: v.id("jobCategories"),
    updates: v.object({
      name: v.optional(v.string()),
      description: v.optional(v.string()),
      targetRole: v.optional(v.string()),
      targetCompanies: v.optional(v.array(v.string())),
      targetLocations: v.optional(v.array(v.string())),
      status: v.optional(v.union(
        v.literal("active"),
        v.literal("paused"),
        v.literal("completed")
      )),
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
  args: { id: v.id("jobCategories") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
