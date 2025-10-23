import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * O*NET Cache Operations
 *
 * Manages caching of O*NET occupation data with 30-day TTL.
 * Reduces redundant API calls to O*NET Web Services.
 */

// QUERIES

/**
 * Get occupation data by O*NET SOC code
 */
export const getOccupation = query({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("onetCache")
      .withIndex("by_occupation_code", (q) => q.eq("occupationCode", args.code))
      .first();
  },
});

/**
 * Search occupations by title query
 */
export const searchOccupations = query({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    const lowerQuery = args.query.toLowerCase();

    // Get all cache entries (this is not ideal for large datasets, but
    // acceptable for MVP since O*NET has ~1000 occupations and we'll
    // only cache those that users search for)
    const allOccupations = await ctx.db
      .query("onetCache")
      .collect();

    // Filter by title match
    return allOccupations.filter((occupation) =>
      occupation.occupationTitle.toLowerCase().includes(lowerQuery)
    );
  },
});

/**
 * Get valid (non-expired) cached occupation
 * Returns null if cache is expired or doesn't exist
 */
export const getValidCache = query({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    const cached = await ctx.db
      .query("onetCache")
      .withIndex("by_occupation_code", (q) => q.eq("occupationCode", args.code))
      .first();

    if (!cached) {
      return null;
    }

    const now = Date.now();
    if (cached.expiresAt <= now) {
      return null; // Expired
    }

    return cached;
  },
});

// MUTATIONS

/**
 * Cache occupation data with 30-day TTL
 * Updates existing entry if already cached
 */
export const cacheOccupation = mutation({
  args: {
    occupationCode: v.string(),
    occupationTitle: v.string(),
    skills: v.array(v.object({
      skillName: v.string(),
      skillCode: v.string(),
      importance: v.number(),
      level: v.number(),
      category: v.string(),
    })),
    knowledgeAreas: v.array(v.object({
      name: v.string(),
      level: v.number(),
      importance: v.number(),
    })),
    abilities: v.array(v.object({
      name: v.string(),
      level: v.number(),
      importance: v.number(),
    })),
    laborMarketData: v.object({
      employmentOutlook: v.string(),
      medianSalary: v.optional(v.number()),
      growthRate: v.optional(v.number()),
    }),
    cacheVersion: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;

    // Check if occupation is already cached
    const existingCache = await ctx.db
      .query("onetCache")
      .withIndex("by_occupation_code", (q) => q.eq("occupationCode", args.occupationCode))
      .first();

    if (existingCache) {
      // Update existing cache entry
      await ctx.db.patch(existingCache._id, {
        occupationTitle: args.occupationTitle,
        skills: args.skills,
        knowledgeAreas: args.knowledgeAreas,
        abilities: args.abilities,
        laborMarketData: args.laborMarketData,
        cacheVersion: args.cacheVersion,
        expiresAt: now + thirtyDaysInMs,
      });
      return existingCache._id;
    }

    // Create new cache entry
    const cacheId = await ctx.db.insert("onetCache", {
      occupationCode: args.occupationCode,
      occupationTitle: args.occupationTitle,
      skills: args.skills,
      knowledgeAreas: args.knowledgeAreas,
      abilities: args.abilities,
      laborMarketData: args.laborMarketData,
      cacheVersion: args.cacheVersion,
      createdAt: now,
      expiresAt: now + thirtyDaysInMs,
    });

    return cacheId;
  },
});

/**
 * Remove expired cache entries
 * Returns count of deleted entries
 */
export const cleanupExpiredCache = mutation({
  args: {},
  handler: async (ctx, args) => {
    const now = Date.now();

    // Get all expired entries
    const expiredEntries = await ctx.db
      .query("onetCache")
      .withIndex("by_expires_at")
      .filter((q) => q.lte(q.field("expiresAt"), now))
      .collect();

    // Delete each expired entry
    for (const entry of expiredEntries) {
      await ctx.db.delete(entry._id);
    }

    return expiredEntries.length;
  },
});
