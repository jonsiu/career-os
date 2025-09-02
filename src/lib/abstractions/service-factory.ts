import { DatabaseProvider, FileStorageProvider, AnalysisProvider } from './types';
import { ConvexDatabaseProvider } from './providers/convex-database';
import { ConvexFileStorageProvider } from './providers/convex-file-storage';
import { ConvexAnalysisProvider } from './providers/convex-analysis';
import { OpenAIAnalysisProvider } from './providers/openai-analysis';

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

  // Create analysis provider - use OpenAI for better accuracy
  createAnalysisProvider(): AnalysisProvider {
    // Check if OpenAI API key is available
    if (process.env.OPENAI_API_KEY) {
      console.log('Using OpenAI GPT-4 for resume parsing and analysis');
      return new OpenAIAnalysisProvider();
    } else {
      console.log('OpenAI API key not found, falling back to rule-based analysis');
      return new ConvexAnalysisProvider();
    }
  }
}
