import { DatabaseProvider, CreateUserInput, CreateResumeInput, CreateJobInput, CreateAnalysisInput, CreatePlanInput, User, Resume, Job, Analysis, Plan, CreateSkillInput, Skill, SkillResource } from '../types';
import { convexClient, api } from '../../convex-client';

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
      const result = await convexClient.query(api.users.getById, { id: id as any });
      
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
        id: id as any,
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
      await convexClient.mutation(api.users.remove, { id: id as any });
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
      const createdResume = await convexClient.query(api.resumes.getById, { id: result as any });
      
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

  async getResumeById(id: string): Promise<Resume | null> {
    try {
      const result = await convexClient.query(api.resumes.getById, { id: id as any });
      
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
        id: id as any,
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
      await convexClient.mutation(api.resumes.remove, { id: id as any });
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
        requirements: job.requirements,
        location: job.location,
        salary: job.salary,
        status: job.status,
        metadata: job.metadata,
      });

      if (!result) {
        throw new Error('Failed to create job');
      }

      // Get the created job to return full job object
      const createdJob = await convexClient.query(api.jobs.getById, { id: result as any });
      
      if (!createdJob) {
        throw new Error('Failed to retrieve created job');
      }

      return {
        id: createdJob._id,
        userId: createdJob.userId,
        title: createdJob.title,
        company: createdJob.company,
        description: createdJob.description,
        requirements: createdJob.requirements,
        location: createdJob.location,
        salary: createdJob.salary,
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
      const result = await convexClient.query(api.jobs.getById, { id: id as any });
      
      if (!result) {
        return null;
      }
      
      return {
        id: result._id,
        userId: result.userId,
        title: result.title,
        company: result.company,
        description: result.description,
        requirements: result.requirements,
        location: result.location,
        salary: result.salary,
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
        requirements: result.requirements,
        location: result.location,
        salary: result.salary,
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
        id: id as any,
        updates: {
          title: updates.title,
          company: updates.company,
          description: updates.description,
          requirements: updates.requirements,
          location: updates.location,
          salary: updates.salary,
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
        requirements: result.requirements,
        location: result.location,
        salary: result.salary,
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
      await convexClient.mutation(api.jobs.remove, { id: id as any });
    } catch (error) {
      console.error('Error deleting job:', error);
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
        resumeId: analysis.resumeId as any,
        jobId: analysis.jobId as any,
        type: analysis.type,
        result: analysis.result,
        metadata: analysis.metadata,
      });
      
      if (!result) {
        throw new Error('Failed to create analysis');
      }

      // Get the created analysis to return full analysis object
      const createdAnalysis = await convexClient.query(api.analyses.getById, { id: result as any });
      
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
      const result = await convexClient.query(api.analyses.getById, { id: id as any });
      
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
        id: id as any,
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
      const createdPlan = await convexClient.query(api.plans.getById, { id: result as any });
      
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
      const result = await convexClient.query(api.plans.getById, { id: id as any });
      
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
        id: id as any,
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
      await convexClient.mutation(api.plans.remove, { id: id as any });
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
      const result = await convexClient.query(api.skills.getSkill, { skillId: id as any });
      
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
        skillId: id as any,
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
      await convexClient.mutation(api.skills.deleteSkill, { skillId: id as any });
    } catch (error) {
      console.error('Error deleting skill:', error);
      throw error;
    }
  }

  async updateSkillProgress(id: string, progress: number, timeSpent?: number, status?: Skill['status']): Promise<Skill> {
    try {
      const result = await convexClient.mutation(api.skills.updateSkillProgress, {
        skillId: id as any,
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
        skillId: id as any,
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
        skillId: id as any,
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
}
