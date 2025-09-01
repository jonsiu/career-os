// Export all abstraction types and interfaces
export * from './types';

// Export the service factory and convenience exports
export { ServiceFactory, serviceFactory, database, fileStorage, analysis, realTime, auth } from './service-factory';

// Export provider implementations
export { ConvexDatabaseProvider } from './providers/convex-database';
export { ConvexFileStorageProvider } from './providers/convex-file-storage';
export { ConvexAnalysisProvider } from './providers/convex-analysis';
export { ConvexRealTimeProvider } from './providers/convex-real-time';
export { ClerkAuthProvider } from './providers/clerk-auth';
