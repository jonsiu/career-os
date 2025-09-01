# 🔄 Vendor Abstraction Example Usage

This document demonstrates how to use the abstraction interfaces to switch between different vendors without changing your application code.

## Basic Setup

```typescript
import { ServiceFactory, ServiceConfig } from './service-factory';
import { DatabaseProvider } from './database-interface';
import { AnalysisEngine } from './analysis-engine-interface';

// Configuration for different environments
const developmentConfig: ServiceConfig = {
  database: {
    provider: 'convex',
    url: process.env.CONVEX_URL,
    apiKey: process.env.CONVEX_API_KEY
  },
  fileStorage: {
    provider: 'convex',
    maxFileSize: 10 * 1024 * 1024 // 10MB
  },
  analysis: {
    provider: 'openai',
    apiKey: process.env.OPENAI_API_KEY,
    model: 'gpt-4'
  },
  realTime: {
    provider: 'convex',
    endpoint: process.env.CONVEX_URL
  },
  auth: {
    provider: 'clerk',
    publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
    secretKey: process.env.CLERK_SECRET_KEY
  }
};

const productionConfig: ServiceConfig = {
  database: {
    provider: 'postgres',
    url: process.env.DATABASE_URL,
    credentials: {
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD
    }
  },
  fileStorage: {
    provider: 'aws-s3',
    bucket: process.env.S3_BUCKET,
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
  },
  analysis: {
    provider: 'anthropic',
    apiKey: process.env.ANTHROPIC_API_KEY,
    model: 'claude-3-sonnet'
  },
  realTime: {
    provider: 'pusher',
    appId: process.env.PUSHER_APP_ID,
    apiKey: process.env.PUSHER_API_KEY,
    cluster: process.env.PUSHER_CLUSTER
  },
  auth: {
    provider: 'auth0',
    domain: process.env.AUTH0_DOMAIN,
    clientId: process.env.AUTH0_CLIENT_ID,
    clientSecret: process.env.AUTH0_CLIENT_SECRET
  }
};

// Create service factory
const serviceFactory = new ServiceFactory(
  process.env.NODE_ENV === 'production' ? productionConfig : developmentConfig
);
```

## Application Code (Vendor Agnostic)

```typescript
// Your application code remains the same regardless of vendor
class ResumeService {
  private db: DatabaseProvider;
  private analysis: AnalysisEngine;

  constructor(serviceFactory: ServiceFactory) {
    this.db = await serviceFactory.createDatabaseProvider();
    this.analysis = await serviceFactory.createAnalysisEngine();
  }

  async analyzeResume(resumeId: string, jobId: string): Promise<AnalysisResult> {
    // Get resume and job data
    const resume = await this.db.getResume(resumeId);
    const job = await this.db.getJob(jobId);

    if (!resume || !job) {
      throw new Error('Resume or job not found');
    }

    // Perform analysis using the abstracted engine
    const analysis = await this.analysis.analyzeResumeJob(resume, job);

    // Store analysis results
    const analysisId = await this.db.createAnalysis({
      userId: resume.userId,
      resumeId,
      jobId,
      ...analysis
    });

    return analysis;
  }

  async getUserResumes(userId: string): Promise<Resume[]> {
    return await this.db.getUserResumes(userId);
  }

  async updateResume(resumeId: string, updates: Partial<Resume>): Promise<void> {
    await this.db.updateResume(resumeId, updates);
  }
}
```

## Switching Vendors

### From Convex to PostgreSQL

```typescript
// Before (Convex)
const config: ServiceConfig = {
  database: {
    provider: 'convex',
    url: process.env.CONVEX_URL
  }
  // ... other config
};

// After (PostgreSQL) - Only config changes, no code changes needed!
const config: ServiceConfig = {
  database: {
    provider: 'postgres',
    url: process.env.DATABASE_URL,
    credentials: {
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD
    }
  }
  // ... other config
};
```

### From OpenAI to Anthropic

```typescript
// Before (OpenAI)
const config: ServiceConfig = {
  analysis: {
    provider: 'openai',
    apiKey: process.env.OPENAI_API_KEY,
    model: 'gpt-4'
  }
  // ... other config
};

// After (Anthropic) - Only config changes!
const config: ServiceConfig = {
  analysis: {
    provider: 'anthropic',
    apiKey: process.env.ANTHROPIC_API_KEY,
    model: 'claude-3-sonnet'
  }
  // ... other config
};
```

### From Clerk to Auth0

```typescript
// Before (Clerk)
const config: ServiceConfig = {
  auth: {
    provider: 'clerk',
    publishableKey: process.env.CLERK_PUBLISHABLE_KEY
  }
  // ... other config
};

// After (Auth0) - Only config changes!
const config: ServiceConfig = {
  auth: {
    provider: 'auth0',
    domain: process.env.AUTH0_DOMAIN,
    clientId: process.env.AUTH0_CLIENT_ID
  }
  // ... other config
};
```

## React Hooks Usage

```typescript
// Custom hooks that work with any vendor
import { useAuth } from './hooks/useAuth';
import { useDatabase } from './hooks/useDatabase';
import { useRealTime } from './hooks/useRealTime';

function ResumeComponent() {
  const { user } = useAuth();
  const { resumes, loading, error } = useDatabase('resumes', { userId: user?.id });
  const { subscribe } = useRealTime();

  useEffect(() => {
    if (user) {
      const subscription = subscribe(`resumes:${user.id}`, (updatedResume) => {
        // Handle real-time resume updates
        console.log('Resume updated:', updatedResume);
      });

      return () => subscription.unsubscribe();
    }
  }, [user, subscribe]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {resumes.map(resume => (
        <ResumeCard key={resume.id} resume={resume} />
      ))}
    </div>
  );
}
```

## Environment-Specific Configuration

```typescript
// config/environments/development.ts
export const developmentConfig: ServiceConfig = {
  database: {
    provider: 'convex',
    url: 'https://your-dev-convex-url.convex.cloud'
  },
  fileStorage: {
    provider: 'convex',
    maxFileSize: 5 * 1024 * 1024 // 5MB for dev
  },
  analysis: {
    provider: 'openai',
    model: 'gpt-3.5-turbo', // Cheaper model for dev
    maxTokens: 1000
  },
  realTime: {
    provider: 'convex'
  },
  auth: {
    provider: 'clerk',
    domain: 'dev.your-app.com'
  }
};

// config/environments/production.ts
export const productionConfig: ServiceConfig = {
  database: {
    provider: 'postgres',
    url: process.env.DATABASE_URL,
    ssl: true
  },
  fileStorage: {
    provider: 'aws-s3',
    bucket: 'careeros-production-files',
    region: 'us-east-1',
    cdn: true
  },
  analysis: {
    provider: 'anthropic',
    model: 'claude-3-sonnet',
    maxTokens: 4000
  },
  realTime: {
    provider: 'pusher',
    cluster: 'us2',
    encrypted: true
  },
  auth: {
    provider: 'auth0',
    domain: 'auth.your-app.com',
    mfaEnabled: true
  }
};

// config/environments/staging.ts
export const stagingConfig: ServiceConfig = {
  database: {
    provider: 'postgres',
    url: process.env.STAGING_DATABASE_URL
  },
  fileStorage: {
    provider: 'aws-s3',
    bucket: 'careeros-staging-files'
  },
  analysis: {
    provider: 'openai',
    model: 'gpt-4',
    maxTokens: 2000
  },
  realTime: {
    provider: 'socket.io',
    endpoint: 'https://staging.your-app.com'
  },
  auth: {
    provider: 'clerk',
    domain: 'staging.your-app.com'
  }
};
```

## Migration Strategy

```typescript
// Migration helper for switching vendors
class VendorMigration {
  constructor(
    private sourceFactory: ServiceFactory,
    private targetFactory: ServiceFactory
  ) {}

  async migrateData(): Promise<MigrationResult> {
    const sourceDb = await this.sourceFactory.createDatabaseProvider();
    const targetDb = await this.targetFactory.createDatabaseProvider();

    const results: MigrationResult = {
      users: 0,
      resumes: 0,
      jobs: 0,
      analyses: 0,
      errors: []
    };

    try {
      // Migrate users
      const users = await sourceDb.getAllUsers();
      for (const user of users) {
        await targetDb.createUser(user);
        results.users++;
      }

      // Migrate resumes
      const resumes = await sourceDb.getAllResumes();
      for (const resume of resumes) {
        await targetDb.createResume(resume);
        results.resumes++;
      }

      // Migrate jobs
      const jobs = await sourceDb.getAllJobs();
      for (const job of jobs) {
        await targetDb.createJobPosting(job);
        results.jobs++;
      }

      // Migrate analyses
      const analyses = await sourceDb.getAllAnalyses();
      for (const analysis of analyses) {
        await targetDb.createAnalysis(analysis);
        results.analyses++;
      }

    } catch (error) {
      results.errors.push(error.message);
    }

    return results;
  }
}

interface MigrationResult {
  users: number;
  resumes: number;
  jobs: number;
  analyses: number;
  errors: string[];
}
```

## Testing with Different Vendors

```typescript
// Test configuration for different vendors
const testConfigs = {
  convex: {
    database: { provider: 'convex' },
    fileStorage: { provider: 'convex' },
    analysis: { provider: 'openai' },
    realTime: { provider: 'convex' },
    auth: { provider: 'clerk' }
  },
  postgres: {
    database: { provider: 'postgres' },
    fileStorage: { provider: 'aws-s3' },
    analysis: { provider: 'anthropic' },
    realTime: { provider: 'pusher' },
    auth: { provider: 'auth0' }
  },
  firebase: {
    database: { provider: 'firebase' },
    fileStorage: { provider: 'firebase-storage' },
    analysis: { provider: 'google' },
    realTime: { provider: 'firebase' },
    auth: { provider: 'firebase' }
  }
};

// Test with different configurations
describe('ResumeService', () => {
  Object.entries(testConfigs).forEach(([vendor, config]) => {
    describe(`with ${vendor}`, () => {
      let service: ResumeService;

      beforeEach(async () => {
        const factory = new ServiceFactory(config as ServiceConfig);
        service = new ResumeService(factory);
      });

      it('should analyze resume', async () => {
        const result = await service.analyzeResume('resume-1', 'job-1');
        expect(result.matchPercentage).toBeGreaterThan(0);
      });
    });
  });
});
```

## Benefits of This Approach

1. **Vendor Independence**: Your application code doesn't depend on specific vendors
2. **Easy Migration**: Switch vendors by changing only configuration
3. **Testing Flexibility**: Test with different vendors easily
4. **Cost Optimization**: Use cheaper vendors for development/staging
5. **Risk Mitigation**: Avoid vendor lock-in
6. **Feature Comparison**: Easily compare features across vendors
7. **Gradual Migration**: Migrate one service at a time
8. **Environment Consistency**: Same code works across all environments

## Next Steps

1. Implement the actual provider classes for each vendor
2. Create migration scripts for data transfer
3. Set up monitoring and health checks
4. Document vendor-specific features and limitations
5. Create fallback strategies for vendor outages
