import { ServiceFactory } from './service-factory';
import { ConvexDatabaseProvider } from './providers/convex-database';

// Create service factory instance
const serviceFactory = ServiceFactory.getInstance();

// Export service instances with direct instantiation for database
export const database = new ConvexDatabaseProvider();
export const fileStorage = serviceFactory.createFileStorageProvider();
export const analysis = serviceFactory.createAnalysisProvider();

// Export types
export * from './types';
export * from './service-factory';
