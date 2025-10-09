import { DatabaseProvider, FileStorageProvider, AnalysisProvider } from './types';
import { ConvexDatabaseProvider } from './providers/convex-database';
import { ConvexFileStorageProvider } from './providers/convex-file-storage';
import { ConvexAnalysisProvider } from './providers/convex-analysis';
import { AnthropicAnalysisProvider } from './providers/anthropic-analysis';

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

  // Create analysis provider - use Convex-based provider for server-side processing
  createAnalysisProvider(): AnalysisProvider {
    console.log('✅ ServiceFactory: Using Convex-based analysis provider (server-side processing)');
    return new ConvexAnalysisProvider();
  }

  // Create AI-powered analysis provider - use Anthropic for enhanced AI analysis
  createAIAnalysisProvider(): AnalysisProvider {
    console.log('✅ ServiceFactory: Using Anthropic-based AI analysis provider');
    return new AnthropicAnalysisProvider();
  }

  // Get database provider for AI parsing (server-side)
  getDatabaseProvider(): DatabaseProvider {
    return new ConvexDatabaseProvider();
  }
}
