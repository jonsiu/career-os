import { DatabaseProvider, FileStorageProvider, AnalysisProvider, RealTimeProvider, AuthProvider } from './types';
import { ConvexDatabaseProvider } from './providers/convex-database';
import { ConvexFileStorageProvider } from './providers/convex-file-storage';
import { ConvexAnalysisProvider } from './providers/convex-analysis';
import { ConvexRealTimeProvider } from './providers/convex-real-time';
import { ClerkAuthProvider } from './providers/clerk-auth';

// Service factory that provides vendor-abstracted implementations
export class ServiceFactory {
  private static instance: ServiceFactory;
  private databaseProvider: DatabaseProvider;
  private fileStorageProvider: FileStorageProvider;
  private analysisProvider: AnalysisProvider;
  private realTimeProvider: RealTimeProvider;
  private authProvider: AuthProvider;

  private constructor() {
    // Initialize with Convex providers by default
    this.databaseProvider = new ConvexDatabaseProvider();
    this.fileStorageProvider = new ConvexFileStorageProvider();
    this.analysisProvider = new ConvexAnalysisProvider();
    this.realTimeProvider = new ConvexRealTimeProvider();
    this.authProvider = new ClerkAuthProvider();
  }

  public static getInstance(): ServiceFactory {
    if (!ServiceFactory.instance) {
      ServiceFactory.instance = new ServiceFactory();
    }
    return ServiceFactory.instance;
  }

  // Getter methods for each service
  public getDatabase(): DatabaseProvider {
    return this.databaseProvider;
  }

  public getFileStorage(): FileStorageProvider {
    return this.fileStorageProvider;
  }

  public getAnalysis(): AnalysisProvider {
    return this.analysisProvider;
  }

  public getRealTime(): RealTimeProvider {
    return this.realTimeProvider;
  }

  public getAuth(): AuthProvider {
    return this.authProvider;
  }

  // Methods to switch providers (useful for testing or switching services)
  public setDatabaseProvider(provider: DatabaseProvider): void {
    this.databaseProvider = provider;
  }

  public setFileStorageProvider(provider: FileStorageProvider): void {
    this.fileStorageProvider = provider;
  }

  public setAnalysisProvider(provider: AnalysisProvider): void {
    this.analysisProvider = provider;
  }

  public setRealTimeProvider(provider: RealTimeProvider): void {
    this.realTimeProvider = provider;
  }

  public setAuthProvider(provider: AuthProvider): void {
    this.authProvider = provider;
  }

  // Reset to default providers
  public resetToDefaults(): void {
    this.databaseProvider = new ConvexDatabaseProvider();
    this.fileStorageProvider = new ConvexFileStorageProvider();
    this.analysisProvider = new ConvexAnalysisProvider();
    this.realTimeProvider = new ConvexRealTimeProvider();
    this.authProvider = new ClerkAuthProvider();
  }
}

// Export singleton instance
export const serviceFactory = ServiceFactory.getInstance();

// Convenience exports for direct access
export const database = serviceFactory.getDatabase();
export const fileStorage = serviceFactory.getFileStorage();
export const analysis = serviceFactory.getAnalysis();
export const realTime = serviceFactory.getRealTime();
export const auth = serviceFactory.getAuth();
