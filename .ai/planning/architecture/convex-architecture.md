# 🏗️ CareerOS Convex Architecture

## System Overview

CareerOS MVP is a full-stack application built with Next.js 15 frontend and Convex backend, providing real-time data synchronization, scalable data storage, and a foundation for future multi-tenant SaaS features.

## 🔄 Vendor Abstraction Strategy

While this document describes the Convex-specific implementation, CareerOS has been designed with vendor abstraction layers to ensure flexibility and avoid vendor lock-in. The abstraction strategy allows seamless switching between different vendors without changing application code.

### Abstraction Benefits
- **Vendor Independence**: Application code doesn't depend on specific vendors
- **Cost Optimization**: Switch to cheaper alternatives as needed
- **Risk Mitigation**: Handle vendor outages with fallbacks
- **Testing Flexibility**: Test with different vendors easily
- **Gradual Migration**: Migrate one service at a time

### Current Implementation
The Convex architecture serves as the **reference implementation** for the abstraction interfaces. All Convex-specific code is wrapped in abstraction layers that can be replaced with other vendor implementations.

### Abstraction Documentation
For detailed information about the vendor abstraction strategy, see:
- `abstractions/README.md` - Complete abstraction strategy overview
- `abstractions/database-interface.ts` - Database abstraction interface
- `abstractions/file-storage-interface.ts` - File storage abstraction interface
- `abstractions/analysis-engine-interface.ts` - Analysis engine abstraction interface
- `abstractions/real-time-interface.ts` - Real-time abstraction interface
- `abstractions/authentication-interface.ts` - Authentication abstraction interface
- `abstractions/service-factory.ts` - Service factory implementation

### Migration Path
The current Convex implementation can be gradually migrated to other vendors:
1. **Database**: Convex → PostgreSQL/MongoDB
2. **File Storage**: Convex → AWS S3/Google Cloud Storage
3. **Analysis**: OpenAI → Anthropic/Google/Azure
4. **Real-time**: Convex → Pusher/Socket.IO
5. **Auth**: Clerk → Auth0/Firebase/Supabase

## Technology Stack

### Frontend
- **Next.js 15** with App Router and Server Components
- **React 19** with hooks and context for state management
- **TypeScript** for type safety and developer experience
- **Tailwind CSS** for utility-first styling
- **shadcn/ui** for pre-built, accessible components

### Backend & Database
- **Convex** for real-time database and backend functions
- **Convex Auth** for user authentication and management
- **Convex File Storage** for resume file uploads
- **Convex Search** for job posting search and filtering

### Authentication & Deployment
- **Clerk** for user authentication and management
- **Vercel** for hosting and deployment
- **Convex Dashboard** for database management and monitoring

## Convex Data Architecture

### Database Schema

```typescript
// convex/schema.ts

import { defineSchema, defineTable } from "convex/schema";
import { v } from "convex/values";

export default defineSchema({
  // User profiles and authentication
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
    currentRole: v.string(),
    // UPDATED: Support multiple target roles for career flexibility
    targetRoles: v.array(v.object({
      role: v.string(),
      industry: v.string(),
      priority: v.string(), // "primary", "secondary", "exploring"
      targetTimeline: v.optional(v.number()), // months
      isActive: v.boolean(),
      addedAt: v.number(),
    })),
    experience: v.number(),
    company: v.optional(v.string()),
    location: v.optional(v.string()),
    // UPDATED: Abstracted URLs for multi-industry support
    socialLinks: v.optional(v.array(v.object({
      platform: v.string(), // "linkedin", "github", "twitter", "portfolio", "behance", "dribbble", etc.
      url: v.string(),
      isPublic: v.boolean(),
      addedAt: v.number(),
    }))),
    // NEW: Added for vendor abstraction compatibility
    emailVerified: v.optional(v.boolean()),
    mfaEnabled: v.optional(v.boolean()),
    linkedAccounts: v.optional(v.array(v.object({
      provider: v.string(),
      providerUserId: v.string(),
      email: v.optional(v.string()),
      name: v.optional(v.string()),
      linkedAt: v.number(),
    }))),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_clerk_id", ["clerkId"]),

  // Resume management
  resumes: defineTable({
    userId: v.id("users"),
    name: v.string(),
    personalInfo: v.object({
      fullName: v.string(),
      email: v.string(),
      phone: v.optional(v.string()),
      location: v.optional(v.string()),
      summary: v.optional(v.string()),
    }),
    experience: v.array(v.object({
      id: v.string(),
      title: v.string(),
      company: v.string(),
      location: v.optional(v.string()),
      startDate: v.string(),
      endDate: v.optional(v.string()),
      current: v.boolean(),
      description: v.string(),
      achievements: v.array(v.string()),
      skills: v.array(v.string()),
    })),
    skills: v.array(v.object({
      name: v.string(),
      category: v.string(),
      proficiency: v.number(), // 1-5 scale
      yearsOfExperience: v.number(),
    })),
    education: v.array(v.object({
      id: v.string(),
      degree: v.string(),
      institution: v.string(),
      field: v.string(),
      graduationYear: v.number(),
      gpa: v.optional(v.number()),
    })),
    projects: v.array(v.object({
      id: v.string(),
      name: v.string(),
      description: v.string(),
      technologies: v.array(v.string()),
      // UPDATED: Abstracted URLs for multi-industry support
      links: v.optional(v.array(v.object({
        type: v.string(), // "live", "github", "demo", "documentation", "portfolio", etc.
        url: v.string(),
        label: v.optional(v.string()),
      }))),
      startDate: v.string(),
      endDate: v.optional(v.string()),
      achievements: v.array(v.string()),
    })),
    template: v.string(),
    isPublic: v.boolean(),
    // NEW: Added for vendor abstraction compatibility
    fileId: v.optional(v.string()),
    extractedText: v.optional(v.string()),
    lastAnalyzed: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user_id", ["userId"]),

  // Job postings and bookmarks
  jobPostings: defineTable({
    userId: v.id("users"),
    title: v.string(),
    company: v.string(),
    companyUrl: v.optional(v.string()),
    location: v.string(),
    remotePolicy: v.optional(v.string()), // "remote", "hybrid", "onsite"
    jobUrl: v.optional(v.string()),
    description: v.string(),
    requirements: v.array(v.string()),
    skills: v.array(v.string()),
    experienceLevel: v.string(), // "entry", "mid", "senior", "lead", "manager"
    salary: v.optional(v.object({
      min: v.number(),
      max: v.number(),
      currency: v.string(),
      period: v.string(), // "yearly", "monthly", "hourly"
    })),
    industry: v.string(),
    jobType: v.string(), // "full-time", "part-time", "contract", "internship"
    notes: v.optional(v.string()),
    rating: v.optional(v.number()), // 1-5 scale
    status: v.string(), // "interested", "applied", "interviewing", "rejected", "accepted"
    bookmarkedAt: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user_id", ["userId"])
    .index("by_status", ["userId", "status"])
    .index("by_company", ["company"])
    .index("by_title", ["title"])
    .index("by_experience_level", ["experienceLevel"])
    .index("by_industry", ["industry"]),

  // Development plans and progress tracking
  developmentPlans: defineTable({
    userId: v.id("users"),
    // UPDATED: Support multiple target roles
    targetRoleId: v.string(), // References a role from user's targetRoles array
    targetCompany: v.optional(v.string()),
    targetTimeline: v.number(), // months
    skillsToDevelop: v.array(v.object({
      skill: v.string(),
      currentLevel: v.number(),
      targetLevel: v.number(),
      priority: v.string(), // "high", "medium", "low"
      developmentTime: v.number(), // weeks
      resources: v.array(v.string()),
      progress: v.number(), // 0-100
    })),
    projectsToBuild: v.array(v.object({
      id: v.string(),
      name: v.string(),
      description: v.string(),
      technologies: v.array(v.string()),
      timeline: v.number(), // weeks
      status: v.string(), // "planned", "in-progress", "completed"
      progress: v.number(), // 0-100
      // UPDATED: Abstracted URLs for multi-industry support
      links: v.optional(v.array(v.object({
        type: v.string(), // "live", "github", "demo", "documentation", "portfolio", etc.
        url: v.string(),
        label: v.optional(v.string()),
      }))),
    })),
    milestones: v.array(v.object({
      id: v.string(),
      title: v.string(),
      description: v.string(),
      targetDate: v.number(),
      completed: v.boolean(),
      completedDate: v.optional(v.number()),
    })),
    status: v.string(), // "active", "paused", "completed"
    // NEW: Added for vendor abstraction compatibility
    progress: v.optional(v.object({
      overallProgress: v.number(), // 0-100
      skillsProgress: v.record(v.string(), v.number()),
      projectsProgress: v.record(v.string(), v.number()),
      milestonesCompleted: v.array(v.string()),
      timeRemaining: v.number(), // days
      onTrack: v.boolean(),
    })),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user_id", ["userId"])
    .index("by_status", ["userId", "status"]),

  // Analysis results and insights
  analyses: defineTable({
    userId: v.id("users"),
    resumeId: v.id("resumes"),
    jobId: v.id("jobPostings"),
    matchPercentage: v.number(),
    skillsMatch: v.array(v.object({
      skill: v.string(),
      match: v.boolean(),
      relevance: v.number(), // 0-1
    })),
    experienceMatch: v.array(v.object({
      experience: v.string(),
      relevance: v.number(), // 0-1
      alignment: v.string(), // "strong", "moderate", "weak"
    })),
    gaps: v.array(v.object({
      category: v.string(), // "skills", "experience", "education"
      item: v.string(),
      importance: v.string(), // "high", "medium", "low"
      impact: v.string(), // "blocker", "significant", "minor"
    })),
    recommendations: v.array(v.object({
      type: v.string(), // "skill", "experience", "project", "education"
      title: v.string(),
      description: v.string(),
      priority: v.string(), // "high", "medium", "low"
      effort: v.string(), // "low", "medium", "high"
      timeline: v.number(), // weeks
    })),
    insights: v.array(v.object({
      category: v.string(),
      insight: v.string(),
      actionable: v.boolean(),
    })),
    // NEW: Added for vendor abstraction compatibility
    confidence: v.optional(v.number()), // 0-1
    analysisDate: v.optional(v.number()),
    provider: v.optional(v.string()), // "openai", "anthropic", "custom"
    model: v.optional(v.string()),
    processingTime: v.optional(v.number()), // milliseconds
    createdAt: v.number(),
  }).index("by_user_id", ["userId"])
    .index("by_resume_job", ["resumeId", "jobId"])
    .index("by_provider", ["provider"])
    .index("by_date", ["analysisDate"]),

  // Skills taxonomy and market data
  skills: defineTable({
    name: v.string(),
    category: v.string(), // "technical", "soft", "domain", "leadership"
    subcategory: v.optional(v.string()),
    description: v.string(),
    demand: v.number(), // 0-100, market demand score
    growth: v.number(), // -100 to 100, growth trend
    relatedSkills: v.array(v.string()),
    industryRelevance: v.array(v.string()),
    // NEW: Added for vendor abstraction compatibility
    marketValue: v.optional(v.number()),
    alternatives: v.optional(v.array(v.string())),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_category", ["category"])
    .index("by_demand", ["demand"])
    .index("by_name", ["name"])
    .index("by_growth", ["growth"]),

  // Job market trends and insights
  marketInsights: defineTable({
    role: v.string(),
    industry: v.string(),
    location: v.string(),
    demandTrend: v.string(), // "growing", "stable", "declining"
    salaryRange: v.object({
      min: v.number(),
      max: v.number(),
      median: v.number(),
      currency: v.string(),
    }),
    topSkills: v.array(v.string()),
    topCompanies: v.array(v.string()),
    growthRate: v.number(), // percentage
    dataSource: v.string(),
    // NEW: Added for vendor abstraction compatibility
    demand: v.optional(v.object({
      level: v.string(), // "high", "medium", "low"
      score: v.number(), // 0-100
      trend: v.string(), // "growing", "stable", "declining"
      forecast: v.optional(v.string()),
    })),
    trends: v.optional(v.array(v.object({
      trend: v.string(),
      description: v.string(),
      impact: v.string(), // "positive", "negative", "neutral"
      confidence: v.number(), // 0-1
    }))),
    lastUpdated: v.number(),
  }).index("by_role", ["role"])
    .index("by_industry", ["industry"])
    .index("by_location", ["location"])
    .index("by_demand_trend", ["demandTrend"]),

  // NEW: Vendor configuration and health monitoring
  vendorConfigs: defineTable({
    service: v.string(), // "database", "fileStorage", "analysis", "realTime", "auth"
    provider: v.string(), // "convex", "postgres", "aws-s3", "openai", etc.
    config: v.any(), // Provider-specific configuration
    isActive: v.boolean(),
    healthStatus: v.string(), // "healthy", "degraded", "down"
    lastHealthCheck: v.number(),
    performanceMetrics: v.optional(v.object({
      responseTime: v.number(),
      errorRate: v.number(),
      throughput: v.number(),
      cost: v.optional(v.number()),
    })),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_service", ["service"])
    .index("by_provider", ["provider"])
    .index("by_health", ["healthStatus"]),

  // NEW: Migration tracking
  migrations: defineTable({
    service: v.string(),
    fromProvider: v.string(),
    toProvider: v.string(),
    status: v.string(), // "pending", "in-progress", "completed", "failed"
    progress: v.number(), // 0-100
    startedAt: v.number(),
    completedAt: v.optional(v.number()),
    errorMessage: v.optional(v.string()),
    metadata: v.optional(v.any()),
  }).index("by_service", ["service"])
    .index("by_status", ["status"])
    .index("by_date", ["startedAt"]),
});
```

## Convex Functions

### User Management
```typescript
// convex/users.ts
export const createUser = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
    currentRole: v.string(),
    // UPDATED: Support multiple target roles
    targetRoles: v.array(v.object({
      role: v.string(),
      industry: v.string(),
      priority: v.string(),
      targetTimeline: v.optional(v.number()),
      isActive: v.boolean(),
      addedAt: v.number(),
    })),
    experience: v.number(),
    company: v.optional(v.string()),
    location: v.optional(v.string()),
    // UPDATED: Abstracted social links
    socialLinks: v.optional(v.array(v.object({
      platform: v.string(),
      url: v.string(),
      isPublic: v.boolean(),
      addedAt: v.number(),
    }))),
  },
  handler: async (ctx, args) => {
    const userId = await ctx.db.insert("users", {
      ...args,
      emailVerified: false,
      mfaEnabled: false,
      linkedAccounts: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    return userId;
  },
});

export const getUser = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();
  },
});

export const updateUser = mutation({
  args: {
    userId: v.id("users"),
    updates: v.any(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      ...args.updates,
      updatedAt: Date.now(),
    });
  },
});
```

### Resume Management
```typescript
// convex/resumes.ts
export const createResume = mutation({
  args: {
    userId: v.id("users"),
    name: v.string(),
    personalInfo: v.any(),
    experience: v.array(v.any()),
    skills: v.array(v.any()),
    education: v.array(v.any()),
    projects: v.array(v.any()),
    template: v.string(),
  },
  handler: async (ctx, args) => {
    const resumeId = await ctx.db.insert("resumes", {
      ...args,
      isPublic: false,
      fileId: undefined,
      extractedText: undefined,
      lastAnalyzed: undefined,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    return resumeId;
  },
});

export const getUserResumes = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("resumes")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

export const updateResume = mutation({
  args: {
    resumeId: v.id("resumes"),
    updates: v.any(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.resumeId, {
      ...args.updates,
      updatedAt: Date.now(),
    });
  },
});

export const deleteResume = mutation({
  args: { resumeId: v.id("resumes") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.resumeId);
  },
});
```

### Job Management
```typescript
// convex/jobs.ts
export const createJobPosting = mutation({
  args: {
    userId: v.id("users"),
    title: v.string(),
    company: v.string(),
    location: v.string(),
    description: v.string(),
    requirements: v.array(v.string()),
    skills: v.array(v.string()),
    experienceLevel: v.string(),
    industry: v.string(),
    jobType: v.string(),
    companyUrl: v.optional(v.string()),
    remotePolicy: v.optional(v.string()),
    jobUrl: v.optional(v.string()),
    salary: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const jobId = await ctx.db.insert("jobPostings", {
      ...args,
      status: "interested",
      bookmarkedAt: Date.now(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    return jobId;
  },
});

export const getUserJobs = query({
  args: {
    userId: v.id("users"),
    filters: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    let jobsQuery = ctx.db
      .query("jobPostings")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId));

    const jobs = await jobsQuery.order("desc").collect();

    // Apply filters
    if (args.filters) {
      return jobs.filter(job => {
        if (args.filters.status && job.status !== args.filters.status) return false;
        if (args.filters.company && !job.company.toLowerCase().includes(args.filters.company.toLowerCase())) return false;
        if (args.filters.experienceLevel && job.experienceLevel !== args.filters.experienceLevel) return false;
        if (args.filters.industry && job.industry !== args.filters.industry) return false;
        if (args.filters.query) {
          const query = args.filters.query.toLowerCase();
          if (!job.title.toLowerCase().includes(query) &&
              !job.company.toLowerCase().includes(query) &&
              !job.description.toLowerCase().includes(query)) return false;
        }
        return true;
      });
    }

    return jobs;
  },
});

export const updateJobStatus = mutation({
  args: {
    jobId: v.id("jobPostings"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.jobId, {
      status: args.status,
      updatedAt: Date.now(),
    });
  },
});

export const deleteJob = mutation({
  args: { jobId: v.id("jobPostings") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.jobId);
  },
});
```

### Development Plan Management
```typescript
// convex/plans.ts
export const createDevelopmentPlan = mutation({
  args: {
    userId: v.id("users"),
    targetRoleId: v.string(), // References a role from user's targetRoles array
    targetCompany: v.optional(v.string()),
    targetTimeline: v.number(),
    skillsToDevelop: v.array(v.any()),
    projectsToBuild: v.array(v.any()),
    milestones: v.array(v.any()),
  },
  handler: async (ctx, args) => {
    const planId = await ctx.db.insert("developmentPlans", {
      ...args,
      status: "active",
      progress: {
        overallProgress: 0,
        skillsProgress: {},
        projectsProgress: {},
        milestonesCompleted: [],
        timeRemaining: args.targetTimeline * 30, // Convert months to days
        onTrack: true,
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    return planId;
  },
});

export const getUserPlans = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("developmentPlans")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

export const updatePlanProgress = mutation({
  args: {
    planId: v.id("developmentPlans"),
    progress: v.any(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.planId, {
      progress: args.progress,
      updatedAt: Date.now(),
    });
  },
});
```

### Analysis Engine
```typescript
// convex/analysis.ts
export const analyzeResumeJob = mutation({
  args: {
    userId: v.id("users"),
    resumeId: v.id("resumes"),
    jobId: v.id("jobPostings"),
    provider: v.optional(v.string()),
    model: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Get resume and job data
    const resume = await ctx.db.get(args.resumeId);
    const job = await ctx.db.get(args.jobId);

    if (!resume || !job) {
      throw new Error("Resume or job not found");
    }

    const startTime = Date.now();

    // Perform analysis
    const analysis = await performAnalysis(resume, job);

    const processingTime = Date.now() - startTime;

    // Store analysis results
    const analysisId = await ctx.db.insert("analyses", {
      userId: args.userId,
      resumeId: args.resumeId,
      jobId: args.jobId,
      ...analysis,
      confidence: 0.85, // Default confidence
      analysisDate: Date.now(),
      provider: args.provider || "convex",
      model: args.model || "default",
      processingTime,
      createdAt: Date.now(),
    });

    return analysisId;
  },
});

export const getAnalysis = query({
  args: { analysisId: v.id("analyses") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.analysisId);
  },
});

export const getUserAnalyses = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("analyses")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

async function performAnalysis(resume: any, job: any) {
  // Skills matching
  const skillsMatch = resume.skills.map((skill: any) => {
    const match = job.skills.some((jobSkill: string) =>
      jobSkill.toLowerCase().includes(skill.name.toLowerCase())
    );
    return {
      skill: skill.name,
      match,
      relevance: match ? 0.8 + (skill.proficiency * 0.04) : 0.2,
    };
  });

  // Calculate match percentage
  const matchedSkills = skillsMatch.filter((s: any) => s.match).length;
  const totalSkills = job.skills.length;
  const matchPercentage = totalSkills > 0 ? (matchedSkills / totalSkills) * 100 : 0;

  // Identify gaps
  const gaps = job.skills
    .filter((jobSkill: string) => 
      !resume.skills.some((resumeSkill: any) =>
        resumeSkill.name.toLowerCase().includes(jobSkill.toLowerCase())
      )
    )
    .map((skill: string) => ({
      category: "skills",
      item: skill,
      importance: "high",
      impact: "significant",
    }));

  // Generate recommendations
  const recommendations = gaps.map((gap: any) => ({
    type: "skill",
    title: `Develop ${gap.item} skills`,
    description: `Focus on building ${gap.item} skills to better match this role`,
    priority: "high",
    effort: "medium",
    timeline: 12, // weeks
  }));

  return {
    matchPercentage,
    skillsMatch,
    experienceMatch: [],
    gaps,
    recommendations,
    insights: [
      {
        category: "overview",
        insight: `Your resume matches ${matchPercentage.toFixed(1)}% of the job requirements`,
        actionable: true,
      },
    ],
  };
}
```

### Vendor Management
```typescript
// convex/vendors.ts
export const createVendorConfig = mutation({
  args: {
    service: v.string(),
    provider: v.string(),
    config: v.any(),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    const configId = await ctx.db.insert("vendorConfigs", {
      ...args,
      healthStatus: "healthy",
      lastHealthCheck: Date.now(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    return configId;
  },
});

export const updateVendorHealth = mutation({
  args: {
    configId: v.id("vendorConfigs"),
    healthStatus: v.string(),
    performanceMetrics: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.configId, {
      healthStatus: args.healthStatus,
      lastHealthCheck: Date.now(),
      performanceMetrics: args.performanceMetrics,
      updatedAt: Date.now(),
    });
  },
});

export const getVendorConfigs = query({
  args: { service: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (args.service) {
      return await ctx.db
        .query("vendorConfigs")
        .withIndex("by_service", (q) => q.eq("service", args.service))
        .collect();
    }
    return await ctx.db.query("vendorConfigs").collect();
  },
});

export const createMigration = mutation({
  args: {
    service: v.string(),
    fromProvider: v.string(),
    toProvider: v.string(),
  },
  handler: async (ctx, args) => {
    const migrationId = await ctx.db.insert("migrations", {
      ...args,
      status: "pending",
      progress: 0,
      startedAt: Date.now(),
    });
    return migrationId;
  },
});

export const updateMigrationStatus = mutation({
  args: {
    migrationId: v.id("migrations"),
    status: v.string(),
    progress: v.number(),
    errorMessage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const updates: any = {
      status: args.status,
      progress: args.progress,
      updatedAt: Date.now(),
    };
    
    if (args.status === "completed" || args.status === "failed") {
      updates.completedAt = Date.now();
    }
    
    if (args.errorMessage) {
      updates.errorMessage = args.errorMessage;
    }
    
    await ctx.db.patch(args.migrationId, updates);
  },
});
```

## Real-Time Features

### Live Updates
```typescript
// convex/subscriptions.ts
export const subscribeToUserData = subscription({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("resumes")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .order("desc");
  },
});

export const subscribeToJobUpdates = subscription({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("jobPostings")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .order("desc");
  },
});
```

## File Storage

### Resume File Uploads
```typescript
// convex/files.ts
export const generateUploadUrl = mutation({
  args: { fileName: v.string() },
  handler: async (ctx, args) => {
    return await ctx.storage.generateUploadUrl(args.fileName);
  },
});

export const saveResumeFile = mutation({
  args: {
    storageId: v.id("_storage"),
    resumeId: v.id("resumes"),
  },
  handler: async (ctx, args) => {
    // Associate file with resume
    await ctx.db.patch(args.resumeId, {
      fileId: args.storageId,
      updatedAt: Date.now(),
    });
  },
});
```

## Performance Optimizations

### Indexing Strategy
- **User-specific queries** are indexed by `userId`
- **Search queries** use compound indexes for efficient filtering
- **Time-based queries** use `createdAt` and `updatedAt` indexes

### Caching Strategy
- **Convex automatically caches** query results
- **Real-time subscriptions** provide live updates
- **Optimistic updates** for better UX

### Query Optimization
- **Pagination** for large result sets
- **Selective field loading** to reduce data transfer
- **Efficient filtering** using indexed queries

## Security & Privacy

### Data Access Control
- **User isolation** - users can only access their own data
- **Row-level security** enforced in all queries
- **Input validation** on all mutations

### Authentication Integration
- **Clerk integration** for secure user management
- **JWT token validation** for API access
- **Session management** with automatic expiration

### Data Privacy
- **GDPR compliance** with data export/deletion
- **Encrypted storage** for sensitive information
- **Audit logging** for data access tracking

## Monitoring & Analytics

### Convex Dashboard
- **Query performance** monitoring
- **Error tracking** and alerting
- **Usage analytics** and metrics
- **Database health** monitoring

### Custom Metrics
- **User engagement** tracking
- **Feature usage** analytics
- **Performance monitoring** for analysis engine
- **Error rate** tracking

## Future Scalability

### Multi-Tenant Architecture
- **Organization-based** data isolation
- **Team collaboration** features
- **Enterprise features** and integrations

### Advanced Analytics
- **Machine learning** integration
- **Predictive modeling** for career paths
- **Market intelligence** and trends

### API Development
- **Public API** for third-party integrations
- **Webhook support** for real-time updates
- **Rate limiting** and usage quotas

This Convex architecture provides a solid foundation for CareerOS MVP while maintaining the flexibility to scale and add advanced features as the platform grows.
