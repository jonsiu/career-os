import { DatabaseProvider, CreateUserInput, CreateResumeInput, CreateJobInput, CreateAnalysisInput, CreatePlanInput, User, Resume, Job, Analysis, Plan, CreateSkillInput, Skill, SkillResource, CreateJobCategoryInput, JobCategory } from '../types';
import { convexClient, api } from '../../convex-client';
import { Id } from '../../../../convex/_generated/dataModel';

// Convex implementation of the DatabaseProvider interface
export class ConvexDatabaseProvider implements DatabaseProvider {
  
  // User operations
  async createUser(user: CreateUserInput): Promise<User> {
    try {
      const result = await convexClient.mutation(api.users.create, {
        clerkUserId: user.clerkUserId || 'temp', // TODO: Get from auth context
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        metadata: user.metadata,
      });

      if (!result) {
        throw new Error('Failed to create user');
      }

      // Get the created user to return full user object
      const createdUser = await convexClient.query(api.users.getById, { id: result });
      
      if (!createdUser) {
        throw new Error('Failed to retrieve created user');
      }

      return {
        id: createdUser._id,
        email: createdUser.email,
        name: createdUser.name,
        avatar: createdUser.avatar,
        createdAt: new Date(createdUser.createdAt),
        updatedAt: new Date(createdUser.updatedAt),
        metadata: createdUser.metadata,
      };
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async getUserById(id: string): Promise<User | null> {
    try {
      const result = await convexClient.query(api.users.getById, { id: id as Id<"users"> });
      
      if (!result) {
        return null;
      }
      
      return {
        id: result._id,
        email: result.email,
        name: result.name,
        avatar: result.avatar,
        createdAt: new Date(result.createdAt),
        updatedAt: new Date(result.updatedAt),
        metadata: result.metadata,
      };
    } catch (error) {
      console.error('Error getting user by ID:', error);
      return null;
    }
  }

  async getUserByClerkId(clerkUserId: string): Promise<User | null> {
    try {
      const result = await convexClient.query(api.users.getByClerkUserId, { 
        clerkUserId 
      });
      
      if (!result) {
        return null;
      }
      
      return {
        id: result._id,
        email: result.email,
        name: result.name,
        avatar: result.avatar,
        createdAt: new Date(result.createdAt),
        updatedAt: new Date(result.updatedAt),
        metadata: result.metadata,
      };
    } catch (error) {
      console.error('Error getting user by Clerk ID:', error);
      return null;
    }
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    try {
      const result = await convexClient.mutation(api.users.update, {
        id: id as Id<"users">,
        updates: {
          name: updates.name,
          avatar: updates.avatar,
          metadata: updates.metadata,
        },
      });
      
      if (!result) {
        throw new Error('Failed to update user');
      }
      
      return {
        id: result._id,
        email: result.email,
        name: result.name,
        avatar: result.avatar,
        createdAt: new Date(result.createdAt),
        updatedAt: new Date(result.updatedAt),
        metadata: result.metadata,
      };
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  async deleteUser(id: string): Promise<void> {
    try {
      await convexClient.mutation(api.users.remove, { id: id as Id<"users"> });
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  // Resume operations
  async createResume(resume: CreateResumeInput): Promise<Resume> {
    try {
      // First, get the user by Clerk user ID to get the Convex user ID
      const user = await convexClient.query(api.users.getByClerkUserId, { 
        clerkUserId: resume.userId 
      });
      
      if (!user) {
        throw new Error(`User not found for Clerk user ID: ${resume.userId}`);
      }

      const result = await convexClient.mutation(api.resumes.create, {
        userId: user._id,
        title: resume.title,
        content: resume.content,
        filePath: resume.filePath,
        metadata: resume.metadata,
      });

      if (!result) {
        throw new Error('Failed to create resume');
      }

      // Get the created resume to return full resume object
      const createdResume = await convexClient.query(api.resumes.getById, { id: result as Id<"resumes"> });
      
      if (!createdResume) {
        throw new Error('Failed to retrieve created resume');
      }

      return {
        id: createdResume._id,
        userId: createdResume.userId,
        title: createdResume.title,
        content: createdResume.content,
        filePath: createdResume.filePath,
        createdAt: new Date(createdResume.createdAt),
        updatedAt: new Date(createdResume.updatedAt),
        metadata: createdResume.metadata,
      };
    } catch (error) {
      console.error('Error creating resume:', error);
      throw error;
    }
  }

  // AI-powered resume parsing
  async parseResumeContent(content: string): Promise<{
    personalInfo: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      location: string;
      summary: string;
    };
    experience: Array<{
      title: string;
      company: string;
      location: string;
      startDate: string;
      endDate: string;
      current: boolean;
      description: string;
    }>;
    education: Array<{
      degree: string;
      institution: string;
      location: string;
      startDate: string;
      endDate: string;
      current: boolean;
      gpa?: string;
      description: string;
    }>;
    skills: Array<{
      name: string;
      level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    }>;
    projects: Array<{
      name: string;
      description: string;
      technologies: string[];
      url?: string;
      startDate: string;
      endDate: string;
      current: boolean;
    }>;
  }> {
    try {
      console.log('🤖 ConvexDatabaseProvider: Parsing resume content with AI...');
      const parsedData = await convexClient.action(api.resumes.parseResumeWithAI, {
        content: content
      });
      console.log('✅ ConvexDatabaseProvider: AI parsing completed successfully');
      return parsedData;
    } catch (error) {
      console.error('❌ ConvexDatabaseProvider: AI parsing failed:', error);
      throw error;
    }
  }

  async getResumeById(id: string): Promise<Resume | null> {
    try {
      const result = await convexClient.query(api.resumes.getById, { id: id as Id<"resumes"> });
      
      if (!result) {
        return null;
      }
      
      return {
        id: result._id,
        userId: result.userId,
        title: result.title,
        content: result.content,
        filePath: result.filePath,
        createdAt: new Date(result.createdAt),
        updatedAt: new Date(result.updatedAt),
        metadata: result.metadata,
      };
    } catch (error) {
      console.error('Error getting resume by ID:', error);
      return null;
    }
  }

  async getUserResumes(userId: string): Promise<Resume[]> {
    try {
      // First, get the user by Clerk user ID to get the Convex user ID
      const user = await convexClient.query(api.users.getByClerkUserId, { 
        clerkUserId: userId 
      });
      
      if (!user) {
        console.warn(`User not found for Clerk user ID: ${userId}`);
        return [];
      }

      // Now use the Convex user ID to get resumes
      const results = await convexClient.query(api.resumes.getByUserId, { 
        userId: user._id 
      });
      
      return results.map(result => ({
        id: result._id,
        userId: result.userId,
        title: result.title,
        content: result.content,
        filePath: result.filePath,
        metadata: result.metadata,
        createdAt: new Date(result.createdAt),
        updatedAt: new Date(result.updatedAt),
      }));
    } catch (error) {
      console.error('Error getting user resumes:', error);
      throw error;
    }
  }

  async updateResume(id: string, updates: Partial<Resume>): Promise<Resume> {
    try {
      const result = await convexClient.mutation(api.resumes.update, {
        id: id as Id<"resumes">,
        updates: {
          title: updates.title,
          content: updates.content,
          filePath: updates.filePath,
          metadata: updates.metadata,
        },
      });
      
      if (!result) {
        throw new Error('Failed to update resume');
      }
      
      return {
        id: result._id,
        userId: result.userId,
        title: result.title,
        content: result.content,
        filePath: result.filePath,
        createdAt: new Date(result.createdAt),
        updatedAt: new Date(result.updatedAt),
        metadata: result.metadata,
      };
    } catch (error) {
      console.error('Error updating resume:', error);
      throw error;
    }
  }

  async deleteResume(id: string): Promise<void> {
    try {
      await convexClient.mutation(api.resumes.remove, { id: id as Id<"resumes"> });
    } catch (error) {
      console.error('Error deleting resume:', error);
      throw error;
    }
  }

  // Job operations
  async createJob(job: CreateJobInput): Promise<Job> {
    try {
      // First, get the user by Clerk user ID to get the Convex user ID
      const user = await convexClient.query(api.users.getByClerkUserId, { 
        clerkUserId: job.userId 
      });
      
      if (!user) {
        throw new Error(`User not found for Clerk user ID: ${job.userId}`);
      }

      const result = await convexClient.mutation(api.jobs.create, {
        userId: user._id,
        title: job.title,
        company: job.company,
        description: job.description,
        descriptionHtml: job.descriptionHtml,
        requirements: job.requirements,
        location: job.location,
        salary: job.salary,
        postedDate: job.postedDate,
        category: job.category,
        url: job.url,
        status: job.status,
        metadata: job.metadata,
      });

      if (!result) {
        throw new Error('Failed to create job');
      }

      // Get the created job to return full job object
      const createdJob = await convexClient.query(api.jobs.getById, { id: result as Id<"jobs"> });
      
      if (!createdJob) {
        throw new Error('Failed to retrieve created job');
      }

      return {
        id: createdJob._id,
        userId: createdJob.userId,
        title: createdJob.title,
        company: createdJob.company,
        description: createdJob.description,
        descriptionHtml: createdJob.descriptionHtml,
        requirements: createdJob.requirements,
        location: createdJob.location,
        salary: createdJob.salary,
        postedDate: createdJob.postedDate,
        category: createdJob.category,
        url: createdJob.url,
        status: createdJob.status,
        metadata: createdJob.metadata,
        createdAt: new Date(createdJob.createdAt),
        updatedAt: new Date(createdJob.updatedAt),
      };
    } catch (error) {
      console.error('Error creating job:', error);
      throw error;
    }
  }

  async getJobById(id: string): Promise<Job | null> {
    try {
      const result = await convexClient.query(api.jobs.getById, { id: id as Id<"jobs"> });
      
      if (!result) {
        return null;
      }
      
      return {
        id: result._id,
        userId: result.userId,
        title: result.title,
        company: result.company,
        description: result.description,
        descriptionHtml: result.descriptionHtml,
        requirements: result.requirements,
        location: result.location,
        salary: result.salary,
        postedDate: result.postedDate,
        category: result.category,
        url: result.url,
        status: result.status,
        createdAt: new Date(result.createdAt),
        updatedAt: new Date(result.updatedAt),
        metadata: result.metadata,
      };
    } catch (error) {
      console.error('Error getting job by ID:', error);
      return null;
    }
  }

  async getUserJobs(userId: string): Promise<Job[]> {
    try {
      // First, get the user by Clerk user ID to get the Convex user ID
      const user = await convexClient.query(api.users.getByClerkUserId, { 
        clerkUserId: userId 
      });
      
      if (!user) {
        console.warn(`User not found for Clerk user ID: ${userId}`);
        return [];
      }

      // Now use the Convex user ID to get jobs
      const results = await convexClient.query(api.jobs.getByUserId, { 
        userId: user._id 
      });
      
      return results.map(result => ({
        id: result._id,
        userId: result.userId,
        title: result.title,
        company: result.company,
        description: result.description,
        descriptionHtml: result.descriptionHtml,
        requirements: result.requirements,
        location: result.location,
        salary: result.salary,
        postedDate: result.postedDate,
        category: result.category,
        url: result.url,
        status: result.status,
        metadata: result.metadata,
        createdAt: new Date(result.createdAt),
        updatedAt: new Date(result.updatedAt),
      }));
    } catch (error) {
      console.error('Error getting user jobs:', error);
      throw error;
    }
  }

  async updateJob(id: string, updates: Partial<Job>): Promise<Job> {
    try {
      const result = await convexClient.mutation(api.jobs.update, {
        id: id as Id<"jobs">,
        updates: {
          title: updates.title,
          company: updates.company,
          description: updates.description,
          descriptionHtml: updates.descriptionHtml,
          requirements: updates.requirements,
          location: updates.location,
          salary: updates.salary,
          postedDate: updates.postedDate,
          category: updates.category,
          url: updates.url,
          status: updates.status,
          metadata: updates.metadata,
        },
      });
      
      if (!result) {
        throw new Error('Failed to update job');
      }
      
      return {
        id: result._id,
        userId: result.userId,
        title: result.title,
        company: result.company,
        description: result.description,
        descriptionHtml: result.descriptionHtml,
        requirements: result.requirements,
        location: result.location,
        salary: result.salary,
        postedDate: result.postedDate,
        category: result.category,
        url: result.url,
        status: result.status,
        createdAt: new Date(result.createdAt),
        updatedAt: new Date(result.updatedAt),
        metadata: result.metadata,
      };
    } catch (error) {
      console.error('Error updating job:', error);
      throw error;
    }
  }

  async deleteJob(id: string): Promise<void> {
    try {
      await convexClient.mutation(api.jobs.remove, { id: id as Id<"jobs"> });
    } catch (error) {
      console.error('Error deleting job:', error);
      throw error;
    }
  }

  // Job Category operations
  async createJobCategory(category: CreateJobCategoryInput): Promise<JobCategory> {
    try {
      // First, get the user by Clerk user ID to get the Convex user ID
      const user = await convexClient.query(api.users.getByClerkUserId, { 
        clerkUserId: category.userId 
      });
      
      if (!user) {
        throw new Error(`User not found for Clerk user ID: ${category.userId}`);
      }

      const result = await convexClient.mutation(api.jobCategories.create, {
        userId: user._id,
        name: category.name,
        description: category.description,
        targetRole: category.targetRole,
        targetCompanies: category.targetCompanies,
        targetLocations: category.targetLocations,
        status: category.status,
      });

      if (!result) {
        throw new Error('Failed to create job category');
      }

      // Get the created category to return full category object
      const createdCategory = await convexClient.query(api.jobCategories.getById, { id: result as Id<"jobCategories"> });
      
      if (!createdCategory) {
        throw new Error('Failed to retrieve created job category');
      }

      return {
        id: createdCategory._id,
        userId: createdCategory.userId,
        name: createdCategory.name,
        description: createdCategory.description,
        targetRole: createdCategory.targetRole,
        targetCompanies: createdCategory.targetCompanies,
        targetLocations: createdCategory.targetLocations,
        status: createdCategory.status,
        createdAt: new Date(createdCategory.createdAt),
        updatedAt: new Date(createdCategory.updatedAt),
      };
    } catch (error) {
      console.error('Error creating job category:', error);
      throw error;
    }
  }

  async getJobCategoryById(id: string): Promise<JobCategory | null> {
    try {
      const result = await convexClient.query(api.jobCategories.getById, { id: id as Id<"jobCategories"> });
      
      if (!result) {
        return null;
      }
      
      return {
        id: result._id,
        userId: result.userId,
        name: result.name,
        description: result.description,
        targetRole: result.targetRole,
        targetCompanies: result.targetCompanies,
        targetLocations: result.targetLocations,
        status: result.status,
        createdAt: new Date(result.createdAt),
        updatedAt: new Date(result.updatedAt),
      };
    } catch (error) {
      console.error('Error getting job category by ID:', error);
      return null;
    }
  }

  async getUserJobCategories(userId: string): Promise<JobCategory[]> {
    try {
      // First, get the user by Clerk user ID to get the Convex user ID
      const user = await convexClient.query(api.users.getByClerkUserId, { 
        clerkUserId: userId 
      });
      
      if (!user) {
        console.warn(`User not found for Clerk user ID: ${userId}`);
        return [];
      }

      // Now use the Convex user ID to get job categories
      const results = await convexClient.query(api.jobCategories.getByUserId, { 
        userId: user._id 
      });
      
      return results.map(result => ({
        id: result._id,
        userId: result.userId,
        name: result.name,
        description: result.description,
        targetRole: result.targetRole,
        targetCompanies: result.targetCompanies,
        targetLocations: result.targetLocations,
        status: result.status,
        createdAt: new Date(result.createdAt),
        updatedAt: new Date(result.updatedAt),
      }));
    } catch (error) {
      console.error('Error getting user job categories:', error);
      throw error;
    }
  }

  async updateJobCategory(id: string, updates: Partial<JobCategory>): Promise<JobCategory> {
    try {
      const result = await convexClient.mutation(api.jobCategories.update, {
        id: id as Id<"jobCategories">,
        updates: {
          name: updates.name,
          description: updates.description,
          targetRole: updates.targetRole,
          targetCompanies: updates.targetCompanies,
          targetLocations: updates.targetLocations,
          status: updates.status,
        },
      });
      
      if (!result) {
        throw new Error('Failed to update job category');
      }
      
      return {
        id: result._id,
        userId: result.userId,
        name: result.name,
        description: result.description,
        targetRole: result.targetRole,
        targetCompanies: result.targetCompanies,
        targetLocations: result.targetLocations,
        status: result.status,
        createdAt: new Date(result.createdAt),
        updatedAt: new Date(result.updatedAt),
      };
    } catch (error) {
      console.error('Error updating job category:', error);
      throw error;
    }
  }

  async deleteJobCategory(id: string): Promise<void> {
    try {
      await convexClient.mutation(api.jobCategories.remove, { id: id as Id<"jobCategories"> });
    } catch (error) {
      console.error('Error deleting job category:', error);
      throw error;
    }
  }

  // Analysis operations
  async createAnalysis(analysis: CreateAnalysisInput): Promise<Analysis> {
    try {
      // First, get the user by Clerk user ID to get the Convex user ID
      const user = await convexClient.query(api.users.getByClerkUserId, { 
        clerkUserId: analysis.userId 
      });
      
      if (!user) {
        throw new Error(`User not found for Clerk user ID: ${analysis.userId}`);
      }

      const result = await convexClient.mutation(api.analyses.create, {
        userId: user._id,
        resumeId: analysis.resumeId as Id<"resumes">,
        jobId: analysis.jobId as Id<"jobs">,
        type: analysis.type,
        result: analysis.result,
        metadata: analysis.metadata,
      });
      
      if (!result) {
        throw new Error('Failed to create analysis');
      }

      // Get the created analysis to return full analysis object
      const createdAnalysis = await convexClient.query(api.analyses.getById, { id: result as Id<"analyses"> });
      
      if (!createdAnalysis) {
        throw new Error('Failed to retrieve created analysis');
      }
      
      return {
        id: createdAnalysis._id,
        userId: createdAnalysis.userId,
        resumeId: createdAnalysis.resumeId,
        jobId: createdAnalysis.jobId,
        type: createdAnalysis.type,
        result: createdAnalysis.result,
        createdAt: new Date(createdAnalysis.createdAt),
        updatedAt: new Date(createdAnalysis.updatedAt),
        metadata: createdAnalysis.metadata,
      };
    } catch (error) {
      console.error('Error creating analysis:', error);
      throw error;
    }
  }

  async getAnalysisById(id: string): Promise<Analysis | null> {
    try {
      const result = await convexClient.query(api.analyses.getById, { id: id as Id<"analyses"> });
      
      if (!result) {
        return null;
      }
      
      return {
        id: result._id,
        userId: result.userId,
        resumeId: result.resumeId,
        jobId: result.jobId,
        type: result.type,
        result: result.result,
        createdAt: new Date(result.createdAt),
        updatedAt: new Date(result.updatedAt),
        metadata: result.metadata,
      };
    } catch (error) {
      console.error('Error getting analysis by ID:', error);
      return null;
    }
  }

  async getUserAnalyses(userId: string): Promise<Analysis[]> {
    try {
      // First, get the user by Clerk user ID to get the Convex user ID
      const user = await convexClient.query(api.users.getByClerkUserId, { 
        clerkUserId: userId 
      });
      
      if (!user) {
        console.warn(`User not found for Clerk user ID: ${userId}`);
        return [];
      }

      // Now use the Convex user ID to get analyses
      const results = await convexClient.query(api.analyses.getByUserId, { 
        userId: user._id 
      });
      
      return results.map(result => ({
        id: result._id,
        userId: result.userId,
        resumeId: result.resumeId,
        jobId: result.jobId,
        type: result.type,
        result: result.result,
        createdAt: new Date(result.createdAt),
        updatedAt: new Date(result.updatedAt),
        metadata: result.metadata,
      }));
    } catch (error) {
      console.error('Error getting user analyses:', error);
      return [];
    }
  }

  async updateAnalysis(id: string, updates: Partial<Analysis>): Promise<Analysis> {
    try {
      const result = await convexClient.mutation(api.analyses.update, {
        id: id as Id<"analyses">,
        updates: {
          result: updates.result,
          metadata: updates.metadata,
        },
      });
      
      if (!result) {
        throw new Error('Failed to update analysis');
      }
      
      return {
        id: result._id,
        userId: result.userId,
        resumeId: result.resumeId,
        jobId: result.jobId,
        type: result.type,
        result: result.result,
        createdAt: new Date(result.createdAt),
        updatedAt: new Date(result.updatedAt),
        metadata: result.metadata,
      };
    } catch (error) {
      console.error('Error updating analysis:', error);
      throw error;
    }
  }

  // Plan operations
  async createPlan(plan: CreatePlanInput): Promise<Plan> {
    try {
      // First, get the user by Clerk user ID to get the Convex user ID
      const user = await convexClient.query(api.users.getByClerkUserId, { 
        clerkUserId: plan.userId 
      });
      
      if (!user) {
        throw new Error(`User not found for Clerk user ID: ${plan.userId}`);
      }

      const result = await convexClient.mutation(api.plans.create, {
        userId: user._id,
        title: plan.title,
        description: plan.description,
        goals: plan.goals,
        timeline: plan.timeline,
        milestones: plan.milestones,
        status: plan.status,
        metadata: plan.metadata,
      });
      
      if (!result) {
        throw new Error('Failed to create plan');
      }

      // Get the created plan to return full plan object
      const createdPlan = await convexClient.query(api.plans.getById, { id: result as Id<"plans"> });
      
      if (!createdPlan) {
        throw new Error('Failed to retrieve created plan');
      }
      
      return {
        id: createdPlan._id,
        userId: createdPlan.userId,
        title: createdPlan.title,
        description: createdPlan.description,
        goals: createdPlan.goals,
        timeline: createdPlan.timeline,
        milestones: createdPlan.milestones,
        status: createdPlan.status,
        createdAt: new Date(createdPlan.createdAt),
        updatedAt: new Date(createdPlan.updatedAt),
        metadata: createdPlan.metadata,
      };
    } catch (error) {
      console.error('Error creating plan:', error);
      throw error;
    }
  }

  async getPlanById(id: string): Promise<Plan | null> {
    try {
      const result = await convexClient.query(api.plans.getById, { id: id as Id<"plans"> });
      
      if (!result) {
        return null;
      }
      
      return {
        id: result._id,
        userId: result.userId,
        title: result.title,
        description: result.description,
        goals: result.goals,
        timeline: result.timeline,
        milestones: result.milestones,
        status: result.status,
        createdAt: new Date(result.createdAt),
        updatedAt: new Date(result.updatedAt),
        metadata: result.metadata,
      };
    } catch (error) {
      console.error('Error getting plan by ID:', error);
      return null;
    }
  }

  async getUserPlans(userId: string): Promise<Plan[]> {
    try {
      // First, get the user by Clerk user ID to get the Convex user ID
      const user = await convexClient.query(api.users.getByClerkUserId, { 
        clerkUserId: userId 
      });
      
      if (!user) {
        console.warn(`User not found for Clerk user ID: ${userId}`);
        return [];
      }

      // Now use the Convex user ID to get plans
      const results = await convexClient.query(api.plans.getByUserId, { 
        userId: user._id 
      });
      
      return results.map(result => ({
        id: result._id,
        userId: result.userId,
        title: result.title,
        description: result.description,
        goals: result.goals,
        timeline: result.timeline,
        milestones: result.milestones,
        status: result.status,
        createdAt: new Date(result.createdAt),
        updatedAt: new Date(result.updatedAt),
        metadata: result.metadata,
      }));
    } catch (error) {
      console.error('Error getting user plans:', error);
      return [];
    }
  }

  async updatePlan(id: string, updates: Partial<Plan>): Promise<Plan> {
    try {
      const result = await convexClient.mutation(api.plans.update, {
        id: id as Id<"plans">,
        updates: {
          title: updates.title,
          description: updates.description,
          goals: updates.goals,
          timeline: updates.timeline,
          milestones: updates.milestones,
          status: updates.status,
          metadata: updates.metadata,
        },
      });
      
      if (!result) {
        throw new Error('Failed to update plan');
      }
      
      return {
        id: result._id,
        userId: result.userId,
        title: result.title,
        description: result.description,
        goals: result.goals,
        timeline: result.timeline,
        milestones: result.milestones,
        status: result.status,
        createdAt: new Date(result.createdAt),
        updatedAt: new Date(result.updatedAt),
        metadata: result.metadata,
      };
    } catch (error) {
      console.error('Error updating plan:', error);
      throw error;
    }
  }

  async deletePlan(id: string): Promise<void> {
    try {
      await convexClient.mutation(api.plans.remove, { id: id as Id<"plans"> });
    } catch (error) {
      console.error('Error deleting plan:', error);
      throw error;
    }
  }

  // Skills operations
  async createSkill(skill: CreateSkillInput): Promise<Skill> {
    try {
      // First, get the user by Clerk user ID to get the Convex user ID
      const user = await convexClient.query(api.users.getByClerkUserId, { 
        clerkUserId: skill.userId 
      });
      
      if (!user) {
        throw new Error('User not found');
      }

      const result = await convexClient.mutation(api.skills.createSkill, {
        userId: user._id,
        name: skill.name,
        category: skill.category,
        currentLevel: skill.currentLevel,
        targetLevel: skill.targetLevel,
        progress: skill.progress,
        timeSpent: skill.timeSpent,
        estimatedTimeToTarget: skill.estimatedTimeToTarget,
        priority: skill.priority,
        status: skill.status,
        resources: skill.resources,
        notes: skill.notes,
        metadata: skill.metadata,
      });

      if (!result) {
        throw new Error('Failed to create skill');
      }

      // Get the created skill to return full skill object
      const createdSkill = await convexClient.query(api.skills.getSkill, { skillId: result });
      
      if (!createdSkill) {
        throw new Error('Failed to retrieve created skill');
      }

      return {
        id: createdSkill._id,
        userId: createdSkill.userId,
        name: createdSkill.name,
        category: createdSkill.category,
        currentLevel: createdSkill.currentLevel,
        targetLevel: createdSkill.targetLevel,
        progress: createdSkill.progress,
        timeSpent: createdSkill.timeSpent,
        estimatedTimeToTarget: createdSkill.estimatedTimeToTarget,
        priority: createdSkill.priority,
        status: createdSkill.status,
        resources: createdSkill.resources,
        notes: createdSkill.notes,
        metadata: createdSkill.metadata,
        createdAt: new Date(createdSkill.createdAt),
        updatedAt: new Date(createdSkill.updatedAt),
      };
    } catch (error) {
      console.error('Error creating skill:', error);
      throw error;
    }
  }

  async getSkillById(id: string): Promise<Skill | null> {
    try {
      const result = await convexClient.query(api.skills.getSkill, { skillId: id as Id<"skills"> });
      
      if (!result) {
        return null;
      }
      
      return {
        id: result._id,
        userId: result.userId,
        name: result.name,
        category: result.category,
        currentLevel: result.currentLevel,
        targetLevel: result.targetLevel,
        progress: result.progress,
        timeSpent: result.timeSpent,
        estimatedTimeToTarget: result.estimatedTimeToTarget,
        priority: result.priority,
        status: result.status,
        resources: result.resources,
        notes: result.notes,
        metadata: result.metadata,
        createdAt: new Date(result.createdAt),
        updatedAt: new Date(result.updatedAt),
      };
    } catch (error) {
      console.error('Error getting skill by ID:', error);
      return null;
    }
  }

  async getUserSkills(userId: string): Promise<Skill[]> {
    try {
      // First, get the user by Clerk user ID to get the Convex user ID
      const user = await convexClient.query(api.users.getByClerkUserId, { 
        clerkUserId: userId 
      });
      
      if (!user) {
        console.warn(`User not found for Clerk user ID: ${userId}`);
        return [];
      }

      // Now use the Convex user ID to get skills
      const results = await convexClient.query(api.skills.getUserSkills, { 
        userId: user._id 
      });
      
      return results.map(result => ({
        id: result._id,
        userId: result.userId,
        name: result.name,
        category: result.category,
        currentLevel: result.currentLevel,
        targetLevel: result.targetLevel,
        progress: result.progress,
        timeSpent: result.timeSpent,
        estimatedTimeToTarget: result.estimatedTimeToTarget,
        priority: result.priority,
        status: result.status,
        resources: result.resources,
        notes: result.notes,
        metadata: result.metadata,
        createdAt: new Date(result.createdAt),
        updatedAt: new Date(result.updatedAt),
      }));
    } catch (error) {
      console.error('Error getting user skills:', error);
      return [];
    }
  }

  async getUserSkillsByCategory(userId: string, category: string): Promise<Skill[]> {
    try {
      // First, get the user by Clerk user ID to get the Convex user ID
      const user = await convexClient.query(api.users.getByClerkUserId, { 
        clerkUserId: userId 
      });
      
      if (!user) {
        console.warn(`User not found for Clerk user ID: ${userId}`);
        return [];
      }

      // Now use the Convex user ID to get skills by category
      const results = await convexClient.query(api.skills.getUserSkillsByCategory, { 
        userId: user._id,
        category
      });
      
      return results.map(result => ({
        id: result._id,
        userId: result.userId,
        name: result.name,
        category: result.category,
        currentLevel: result.currentLevel,
        targetLevel: result.targetLevel,
        progress: result.progress,
        timeSpent: result.timeSpent,
        estimatedTimeToTarget: result.estimatedTimeToTarget,
        priority: result.priority,
        status: result.status,
        resources: result.resources,
        notes: result.notes,
        metadata: result.metadata,
        createdAt: new Date(result.createdAt),
        updatedAt: new Date(result.updatedAt),
      }));
    } catch (error) {
      console.error('Error getting user skills by category:', error);
      return [];
    }
  }

  async getUserSkillsByStatus(userId: string, status: Skill['status']): Promise<Skill[]> {
    try {
      // First, get the user by Clerk user ID to get the Convex user ID
      const user = await convexClient.query(api.users.getByClerkUserId, { 
        clerkUserId: userId 
      });
      
      if (!user) {
        console.warn(`User not found for Clerk user ID: ${userId}`);
        return [];
      }

      // Now use the Convex user ID to get skills by status
      const results = await convexClient.query(api.skills.getUserSkillsByStatus, { 
        userId: user._id,
        status
      });
      
      return results.map(result => ({
        id: result._id,
        userId: result.userId,
        name: result.name,
        category: result.category,
        currentLevel: result.currentLevel,
        targetLevel: result.targetLevel,
        progress: result.progress,
        timeSpent: result.timeSpent,
        estimatedTimeToTarget: result.estimatedTimeToTarget,
        priority: result.priority,
        status: result.status,
        resources: result.resources,
        notes: result.notes,
        metadata: result.metadata,
        createdAt: new Date(result.createdAt),
        updatedAt: new Date(result.updatedAt),
      }));
    } catch (error) {
      console.error('Error getting user skills by status:', error);
      return [];
    }
  }

  async updateSkill(id: string, updates: Partial<Skill>): Promise<Skill> {
    try {
      const result = await convexClient.mutation(api.skills.updateSkill, {
        skillId: id as Id<"skills">,
        name: updates.name,
        category: updates.category,
        currentLevel: updates.currentLevel,
        targetLevel: updates.targetLevel,
        progress: updates.progress,
        timeSpent: updates.timeSpent,
        estimatedTimeToTarget: updates.estimatedTimeToTarget,
        priority: updates.priority,
        status: updates.status,
        resources: updates.resources,
        notes: updates.notes,
        metadata: updates.metadata,
      });
      
      if (!result) {
        throw new Error('Failed to update skill');
      }
      
      // Get the updated skill to return full skill object
      const updatedSkill = await convexClient.query(api.skills.getSkill, { skillId: result });
      
      if (!updatedSkill) {
        throw new Error('Failed to retrieve updated skill');
      }

      return {
        id: updatedSkill._id,
        userId: updatedSkill.userId,
        name: updatedSkill.name,
        category: updatedSkill.category,
        currentLevel: updatedSkill.currentLevel,
        targetLevel: updatedSkill.targetLevel,
        progress: updatedSkill.progress,
        timeSpent: updatedSkill.timeSpent,
        estimatedTimeToTarget: updatedSkill.estimatedTimeToTarget,
        priority: updatedSkill.priority,
        status: updatedSkill.status,
        resources: updatedSkill.resources,
        notes: updatedSkill.notes,
        metadata: updatedSkill.metadata,
        createdAt: new Date(updatedSkill.createdAt),
        updatedAt: new Date(updatedSkill.updatedAt),
      };
    } catch (error) {
      console.error('Error updating skill:', error);
      throw error;
    }
  }

  async deleteSkill(id: string): Promise<void> {
    try {
      await convexClient.mutation(api.skills.deleteSkill, { skillId: id as Id<"skills"> });
    } catch (error) {
      console.error('Error deleting skill:', error);
      throw error;
    }
  }

  async updateSkillProgress(id: string, progress: number, timeSpent?: number, status?: Skill['status']): Promise<Skill> {
    try {
      const result = await convexClient.mutation(api.skills.updateSkillProgress, {
        skillId: id as Id<"skills">,
        progress,
        timeSpent,
        status,
      });
      
      if (!result) {
        throw new Error('Failed to update skill progress');
      }
      
      // Get the updated skill to return full skill object
      const updatedSkill = await convexClient.query(api.skills.getSkill, { skillId: result });
      
      if (!updatedSkill) {
        throw new Error('Failed to retrieve updated skill');
      }

      return {
        id: updatedSkill._id,
        userId: updatedSkill.userId,
        name: updatedSkill.name,
        category: updatedSkill.category,
        currentLevel: updatedSkill.currentLevel,
        targetLevel: updatedSkill.targetLevel,
        progress: updatedSkill.progress,
        timeSpent: updatedSkill.timeSpent,
        estimatedTimeToTarget: updatedSkill.estimatedTimeToTarget,
        priority: updatedSkill.priority,
        status: updatedSkill.status,
        resources: updatedSkill.resources,
        notes: updatedSkill.notes,
        metadata: updatedSkill.metadata,
        createdAt: new Date(updatedSkill.createdAt),
        updatedAt: new Date(updatedSkill.updatedAt),
      };
    } catch (error) {
      console.error('Error updating skill progress:', error);
      throw error;
    }
  }

  async addSkillResource(id: string, resource: SkillResource): Promise<Skill> {
    try {
      const result = await convexClient.mutation(api.skills.addSkillResource, {
        skillId: id as Id<"skills">,
        resource: {
          name: resource.name,
          type: resource.type,
          url: resource.url,
          estimatedHours: resource.estimatedHours,
          completed: resource.completed,
        },
      });
      
      if (!result) {
        throw new Error('Failed to add skill resource');
      }
      
      // Get the updated skill to return full skill object
      const updatedSkill = await convexClient.query(api.skills.getSkill, { skillId: result });
      
      if (!updatedSkill) {
        throw new Error('Failed to retrieve updated skill');
      }

      return {
        id: updatedSkill._id,
        userId: updatedSkill.userId,
        name: updatedSkill.name,
        category: updatedSkill.category,
        currentLevel: updatedSkill.currentLevel,
        targetLevel: updatedSkill.targetLevel,
        progress: updatedSkill.progress,
        timeSpent: updatedSkill.timeSpent,
        estimatedTimeToTarget: updatedSkill.estimatedTimeToTarget,
        priority: updatedSkill.priority,
        status: updatedSkill.status,
        resources: updatedSkill.resources,
        notes: updatedSkill.notes,
        metadata: updatedSkill.metadata,
        createdAt: new Date(updatedSkill.createdAt),
        updatedAt: new Date(updatedSkill.updatedAt),
      };
    } catch (error) {
      console.error('Error adding skill resource:', error);
      throw error;
    }
  }

  async updateResourceCompletion(id: string, resourceIndex: number, completed: boolean): Promise<Skill> {
    try {
      const result = await convexClient.mutation(api.skills.updateResourceCompletion, {
        skillId: id as Id<"skills">,
        resourceIndex,
        completed,
      });
      
      if (!result) {
        throw new Error('Failed to update resource completion');
      }
      
      // Get the updated skill to return full skill object
      const updatedSkill = await convexClient.query(api.skills.getSkill, { skillId: result });
      
      if (!updatedSkill) {
        throw new Error('Failed to retrieve updated skill');
      }

      return {
        id: updatedSkill._id,
        userId: updatedSkill.userId,
        name: updatedSkill.name,
        category: updatedSkill.category,
        currentLevel: updatedSkill.currentLevel,
        targetLevel: updatedSkill.targetLevel,
        progress: updatedSkill.progress,
        timeSpent: updatedSkill.timeSpent,
        estimatedTimeToTarget: updatedSkill.estimatedTimeToTarget,
        priority: updatedSkill.priority,
        status: updatedSkill.status,
        resources: updatedSkill.resources,
        notes: updatedSkill.notes,
        metadata: updatedSkill.metadata,
        createdAt: new Date(updatedSkill.createdAt),
        updatedAt: new Date(updatedSkill.updatedAt),
      };
    } catch (error) {
      console.error('Error updating resource completion:', error);
      throw error;
    }
  }

  // Onboarding operations
  async updateUserOnboardingState(clerkUserId: string, onboardingState: {
    currentStep: string;
    completedSteps: string[];
    skipped?: boolean;
    completedAt?: number;
    stepData?: any;
  }): Promise<void> {
    try {
      // First, get the user by Clerk user ID to get the Convex user ID
      const user = await convexClient.query(api.users.getByClerkUserId, { 
        clerkUserId 
      });
      
      if (!user) {
        throw new Error(`User not found for Clerk user ID: ${clerkUserId}`);
      }

      await convexClient.mutation(api.users.updateOnboardingState, {
        id: user._id,
        onboardingState: {
          currentStep: onboardingState.currentStep,
          completedSteps: onboardingState.completedSteps,
          skipped: onboardingState.skipped || false,
          completedAt: onboardingState.completedAt,
          jobInterests: onboardingState.stepData?.jobInterests?.targetRoles,
          targetRoles: onboardingState.stepData?.jobInterests?.targetRoles,
          industries: onboardingState.stepData?.jobInterests?.industries,
          careerLevel: onboardingState.stepData?.jobInterests?.careerLevel,
          yearsOfExperience: onboardingState.stepData?.jobInterests?.yearsOfExperience,
        }
      });
    } catch (error) {
      console.error('Error updating user onboarding state:', error);
      throw error;
    }
  }

  async getUserOnboardingState(clerkUserId: string): Promise<{
    currentStep: string;
    completedSteps: string[];
    skipped: boolean;
    completedAt?: number;
    jobInterests?: string[];
    targetRoles?: string[];
    industries?: string[];
    careerLevel?: string;
    yearsOfExperience?: string;
  } | null> {
    try {
      const user = await convexClient.query(api.users.getByClerkUserId, { 
        clerkUserId 
      });
      
      if (!user || !user.onboardingState) {
        return null;
      }

      return {
        currentStep: user.onboardingState.currentStep,
        completedSteps: user.onboardingState.completedSteps,
        skipped: user.onboardingState.skipped,
        completedAt: user.onboardingState.completedAt,
        jobInterests: user.onboardingState.jobInterests,
        targetRoles: user.onboardingState.targetRoles,
        industries: user.onboardingState.industries,
        careerLevel: user.onboardingState.careerLevel,
        yearsOfExperience: user.onboardingState.yearsOfExperience,
      };
    } catch (error) {
      console.error('Error getting user onboarding state:', error);
      return null;
    }
  }
}
