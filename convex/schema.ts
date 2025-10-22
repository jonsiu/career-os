import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkUserId: v.string(), // Store Clerk's user ID
    email: v.string(),
    name: v.string(),
    avatar: v.optional(v.string()),
    metadata: v.optional(v.any()),
    // Onboarding state
    onboardingState: v.optional(v.object({
      currentStep: v.string(),
      completedSteps: v.array(v.string()),
      skipped: v.boolean(),
      completedAt: v.optional(v.number()),
      jobInterests: v.optional(v.array(v.string())),
      targetRoles: v.optional(v.array(v.string())),
      industries: v.optional(v.array(v.string())),
      careerLevel: v.optional(v.string()),
      yearsOfExperience: v.optional(v.string()),
    })),
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
    descriptionHtml: v.optional(v.string()), // NEW: Sanitized HTML version
    requirements: v.array(v.string()),
    location: v.optional(v.string()),
    salary: v.optional(v.string()),
    postedDate: v.optional(v.string()), // NEW: Job posting date
    category: v.optional(v.string()), // NEW: Job category/project
    url: v.optional(v.string()), // NEW: Original job posting URL
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
    .index("by_category", ["category"]) // NEW: Index for job categories
    .index("by_created_at", ["createdAt"]),

  // NEW: Job Categories/Projects table
  jobCategories: defineTable({
    userId: v.id("users"),
    name: v.string(), // e.g., "Engineering Manager Search"
    description: v.optional(v.string()),
    targetRole: v.string(), // e.g., "Engineering Manager"
    targetCompanies: v.optional(v.array(v.string())),
    targetLocations: v.optional(v.array(v.string())),
    status: v.union(
      v.literal("active"),
      v.literal("paused"),
      v.literal("completed")
    ),
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
    // NEW: Transition-specific fields (all optional for backward compatibility)
    transitionTypes: v.optional(v.array(v.union(
      v.literal("cross-role"),
      v.literal("cross-industry"),
      v.literal("cross-function")
    ))),
    primaryTransitionType: v.optional(v.string()),
    currentRole: v.optional(v.string()),
    targetRole: v.optional(v.string()),
    currentIndustry: v.optional(v.string()),
    targetIndustry: v.optional(v.string()),
    bridgeRoles: v.optional(v.array(v.string())),
    estimatedTimeline: v.optional(v.object({
      minMonths: v.number(),
      maxMonths: v.number(),
      factors: v.array(v.string()),
    })),
    benchmarkData: v.optional(v.object({
      similarTransitions: v.string(),
      averageTimeline: v.string(),
      successRate: v.optional(v.number()),
    })),
    progressPercentage: v.optional(v.number()),
    careerCapitalAssessment: v.optional(v.object({
      uniqueSkills: v.array(v.string()),
      rareSkillCombinations: v.array(v.string()),
      competitiveAdvantages: v.array(v.string()),
    })),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user_id", ["userId"])
    .index("by_status", ["status"])
    .index("by_created_at", ["createdAt"])
    .index("by_transition_type", ["userId", "primaryTransitionType"]),

  skills: defineTable({
    userId: v.id("users"),
    name: v.string(),
    category: v.string(),
    currentLevel: v.union(
      v.literal("beginner"),
      v.literal("intermediate"),
      v.literal("advanced"),
      v.literal("expert")
    ),
    targetLevel: v.union(
      v.literal("beginner"),
      v.literal("intermediate"),
      v.literal("advanced"),
      v.literal("expert")
    ),
    progress: v.number(), // 0-100
    timeSpent: v.number(), // hours
    estimatedTimeToTarget: v.number(), // hours
    priority: v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high")
    ),
    status: v.union(
      v.literal("learning"),
      v.literal("practicing"),
      v.literal("mastered"),
      v.literal("not-started")
    ),
    resources: v.array(v.any()), // Resource objects
    notes: v.optional(v.string()),
    metadata: v.optional(v.any()),
    // NEW: Transition-specific fields (all optional for backward compatibility)
    transitionPlanId: v.optional(v.id("plans")),
    criticalityLevel: v.optional(v.union(
      v.literal("critical"),
      v.literal("important"),
      v.literal("nice-to-have")
    )),
    transferableFrom: v.optional(v.array(v.string())),
    onetCode: v.optional(v.string()),
    skillComplexity: v.optional(v.union(
      v.literal("basic"),
      v.literal("intermediate"),
      v.literal("advanced")
    )),
    estimatedLearningTime: v.optional(v.object({
      minWeeks: v.number(),
      maxWeeks: v.number(),
    })),
    affiliateCourses: v.optional(v.array(v.object({
      provider: v.string(),
      title: v.string(),
      url: v.string(),
      affiliateLink: v.string(),
      price: v.optional(v.number()),
    }))),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user_id", ["userId"])
    .index("by_category", ["category"])
    .index("by_status", ["status"])
    .index("by_priority", ["priority"])
    .index("by_created_at", ["createdAt"])
    .index("by_transition_plan", ["transitionPlanId"])
    .index("by_criticality", ["userId", "criticalityLevel"]),

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

  analysisResults: defineTable({
    resumeId: v.id("resumes"),
    analysisType: v.union(v.literal("basic"), v.literal("advanced"), v.literal("ai-powered")),
    overallScore: v.number(),
    categoryScores: v.any(), // JSON object with category breakdowns
    detailedInsights: v.any(), // JSON object with insights
    recommendations: v.any(), // JSON array of recommendations
    contentHash: v.string(), // SHA-256 hash of resume content
    metadata: v.optional(v.any()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_resume_id", ["resumeId"])
    .index("by_analysis_type", ["analysisType"])
    .index("by_content_hash", ["contentHash"])
    .index("by_created_at", ["createdAt"])
    .index("by_resume_and_type", ["resumeId", "analysisType"]),

  onboardingSessions: defineTable({
    userId: v.id("users"),
    currentStep: v.string(),
    completedSteps: v.array(v.string()),
    skipped: v.boolean(),
    completedAt: v.optional(v.number()),
    // Step-specific data
    resumeUploaded: v.optional(v.boolean()),
    jobInterests: v.optional(v.array(v.string())),
    targetRoles: v.optional(v.array(v.string())),
    industries: v.optional(v.array(v.string())),
    extensionInstalled: v.optional(v.boolean()),
    // Progress tracking
    stepData: v.optional(v.any()), // Store step-specific data
    metadata: v.optional(v.any()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user_id", ["userId"])
    .index("by_current_step", ["currentStep"])
    .index("by_created_at", ["createdAt"]),

  // NEW: O*NET Cache table for occupation data caching
  onetCache: defineTable({
    occupationCode: v.string(), // O*NET SOC code (e.g., "15-1252.00")
    occupationTitle: v.string(),
    skills: v.array(v.object({
      skillName: v.string(),
      skillCode: v.string(),
      importance: v.number(), // 1-100
      level: v.number(), // 0-7 scale from O*NET
      category: v.string(), // "Basic Skills", "Technical Skills", etc.
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
    cacheVersion: v.string(), // O*NET database version
    createdAt: v.number(),
    expiresAt: v.number(), // 30-day TTL
  })
    .index("by_occupation_code", ["occupationCode"])
    .index("by_expires_at", ["expiresAt"]), // for cache cleanup

  // NEW: Skill Gap Analyses table for career transition planning
  skillGapAnalyses: defineTable({
    userId: v.id("users"),
    resumeId: v.id("resumes"),
    targetRole: v.string(),
    targetRoleONetCode: v.optional(v.string()), // O*NET SOC code
    criticalGaps: v.array(v.object({
      skillName: v.string(),
      onetCode: v.optional(v.string()),
      importance: v.number(), // 1-100
      currentLevel: v.number(), // 0-100
      targetLevel: v.number(), // 0-100
      priorityScore: v.number(), // composite score
      timeEstimate: v.number(), // hours
      marketDemand: v.number(), // 1-100 from O*NET
    })),
    niceToHaveGaps: v.array(v.object({
      skillName: v.string(),
      onetCode: v.optional(v.string()),
      importance: v.number(),
      currentLevel: v.number(),
      targetLevel: v.number(),
      priorityScore: v.number(),
      timeEstimate: v.number(),
    })),
    transferableSkills: v.array(v.object({
      skillName: v.string(),
      currentLevel: v.number(),
      applicability: v.number(), // 1-100
      transferExplanation: v.string(), // AI-generated
      confidence: v.number(), // 0-1
    })),
    prioritizedRoadmap: v.array(v.object({
      phase: v.number(), // 1, 2, 3 for learning sequence
      skills: v.array(v.string()),
      estimatedDuration: v.number(), // weeks
      milestoneTitle: v.string(),
    })),
    userAvailability: v.number(), // hours per week
    transitionType: v.string(), // "lateral", "upward", "career-change"
    completionProgress: v.number(), // 0-100, calculated from Skills Tracker
    contentHash: v.string(), // SHA-256 of resume content
    analysisVersion: v.string(), // "1.0" for versioning algorithm changes
    metadata: v.object({
      onetDataVersion: v.string(),
      aiModel: v.string(), // "claude-3-5-sonnet" or "gpt-4"
      affiliateClickCount: v.number(),
      lastProgressUpdate: v.number(),
    }),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user_id", ["userId"])
    .index("by_resume_id", ["resumeId"])
    .index("by_target_role", ["targetRole"])
    .index("by_content_hash", ["contentHash"])
    .index("by_created_at", ["createdAt"]),
});
