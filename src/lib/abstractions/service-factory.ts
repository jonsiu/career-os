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
    console.log('🔍 ServiceFactory: Checking for OpenAI API key...');
    console.log('🔍 ServiceFactory: OPENAI_API_KEY exists:', !!process.env.OPENAI_API_KEY);
    console.log('🔍 ServiceFactory: OPENAI_API_KEY length:', process.env.OPENAI_API_KEY?.length || 0);
    
    if (process.env.OPENAI_API_KEY) {
      console.log('✅ ServiceFactory: Using OpenAI GPT-4 for resume parsing and analysis');
      return new OpenAIAnalysisProvider();
    } else {
      console.log('⚠️ ServiceFactory: OpenAI API key not found, falling back to rule-based analysis');
      return new ConvexAnalysisProvider();
    }
  }

  // Get database provider for AI parsing (server-side)
  getDatabaseProvider(): DatabaseProvider {
    return new ConvexDatabaseProvider();
  }
}
