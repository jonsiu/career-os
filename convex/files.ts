import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// File queries
export const getById = query({
  args: { id: v.id("files") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getByUserId = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("files")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

export const getByPath = query({
  args: { path: v.string() },
  handler: async (ctx, args) => {
    const files = await ctx.db
      .query("files")
      .withIndex("by_path", (q) => q.eq("path", args.path))
      .collect();
    return files[0] || null;
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("files")
      .withIndex("by_created_at", (q) => q)
      .collect();
  },
});

// File mutations
export const create = mutation({
  args: {
    userId: v.id("users"),
    name: v.string(),
    path: v.string(),
    size: v.number(),
    type: v.string(),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const fileId = await ctx.db.insert("files", {
      ...args,
      createdAt: now,
    });
    return await ctx.db.get(fileId);
  },
});

export const remove = mutation({
  args: { id: v.id("files") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
