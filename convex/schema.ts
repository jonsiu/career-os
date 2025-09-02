import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkUserId: v.string(), // Store Clerk's user ID
    email: v.string(),
    name: v.string(),
    avatar: v.optional(v.string()),
    metadata: v.optional(v.any()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_clerk_user_id", ["clerkUserId"]) // Index for Clerk user ID lookups
    .index("by_created_at", ["createdAt"]),

  resumes: defineTable({
    userId: v.id("users"),
    title: v.string(),
    content: v.string(),
    filePath: v.optional(v.string()),
    metadata: v.optional(v.any()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user_id", ["userId"])
    .index("by_created_at", ["createdAt"]),

  jobs: defineTable({
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
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user_id", ["userId"])
    .index("by_status", ["status"])
    .index("by_created_at", ["createdAt"]),

  analyses: defineTable({
    userId: v.id("users"),
    resumeId: v.id("resumes"),
    jobId: v.optional(v.id("jobs")),
    type: v.union(
      v.literal("resume"),
      v.literal("career"),
      v.literal("skills")
    ),
    result: v.any(), // AnalysisResult object
    metadata: v.optional(v.any()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user_id", ["userId"])
    .index("by_resume_id", ["resumeId"])
    .index("by_job_id", ["jobId"])
    .index("by_type", ["type"])
    .index("by_created_at", ["createdAt"]),

  plans: defineTable({
    userId: v.id("users"),
    title: v.string(),
    description: v.string(),
    goals: v.array(v.string()),
    timeline: v.number(), // months
    milestones: v.array(v.any()), // Milestone objects
    status: v.union(
      v.literal("draft"),
      v.literal("active"),
      v.literal("completed")
    ),
    metadata: v.optional(v.any()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user_id", ["userId"])
    .index("by_status", ["status"])
    .index("by_created_at", ["createdAt"]),

  files: defineTable({
    userId: v.id("users"),
    name: v.string(),
    path: v.string(),
    size: v.number(),
    type: v.string(),
    metadata: v.optional(v.any()),
    createdAt: v.number(),
  })
    .index("by_user_id", ["userId"])
    .index("by_path", ["path"])
    .index("by_created_at", ["createdAt"]),
});
