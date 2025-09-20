import { DatabaseProvider, FileStorageProvider, AnalysisProvider } from './types';
import { ConvexDatabaseProvider } from './providers/convex-database';
import { ConvexFileStorageProvider } from './providers/convex-file-storage';
import { APIAnalysisProvider } from './providers/api-analysis';

// Service factory for creating provider instances
export class ServiceFactory {
  private static instance: ServiceFactory;
  
  private constructor() {}
  
  static getInstance(): ServiceFactory {
    if (!ServiceFactory.instance) {
      ServiceFactory.instance = new ServiceFactory();
    }
    return ServiceFactory.instance;
  }

  // Create database provider
  createDatabaseProvider(): DatabaseProvider {
    return new ConvexDatabaseProvider();
  }

  // Create file storage provider
  createFileStorageProvider(): FileStorageProvider {
    return new ConvexFileStorageProvider();
  }

  // Create analysis provider - use API-based provider for server-side processing
  createAnalysisProvider(): AnalysisProvider {
    console.log('✅ ServiceFactory: Using API-based analysis provider (server-side processing)');
    return new APIAnalysisProvider();
  }

  // Get database provider for AI parsing (server-side)
  getDatabaseProvider(): DatabaseProvider {
    return new ConvexDatabaseProvider();
  }
}
