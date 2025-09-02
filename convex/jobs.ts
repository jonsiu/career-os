import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Job queries
export const getById = query({
  args: { id: v.id("jobs") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getByUserId = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("jobs")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

export const getByStatus = query({
  args: { status: v.union(
    v.literal("saved"),
    v.literal("applied"),
    v.literal("interviewing"),
    v.literal("offered"),
    v.literal("rejected")
  ) },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("jobs")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .collect();
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("jobs")
      .withIndex("by_created_at", (q) => q.desc())
      .collect();
  },
});

// Job mutations
export const create = mutation({
  args: {
    userId: v.id("users"),
    title: v.string(),
    company: v.string(),
    description: v.string(),
    requirements: v.array(v.string()),
    location: v.optional(v.string()),
    salary: v.optional(v.string()),
    status: v.union(
      v.literal("saved"),
      v.literal("applied"),
      v.literal("interviewing"),
      v.literal("offered"),
      v.literal("rejected")
    ),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const jobId = await ctx.db.insert("jobs", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });
    return jobId; // Return just the ID, not the full object
  },
});

export const update = mutation({
  args: {
    id: v.id("jobs"),
    updates: v.object({
      title: v.optional(v.string()),
      company: v.optional(v.string()),
      description: v.optional(v.string()),
      requirements: v.optional(v.array(v.string())),
      location: v.optional(v.string()),
      salary: v.optional(v.string()),
      status: v.optional(v.union(
        v.literal("saved"),
        v.literal("applied"),
        v.literal("interviewing"),
        v.literal("offered"),
        v.literal("rejected")
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
  args: { id: v.id("jobs") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
