import { ServiceFactory } from './service-factory';

// Create service factory instance
const serviceFactory = ServiceFactory.getInstance();

// Export service instances
export const database = serviceFactory.createDatabaseProvider();
export const fileStorage = serviceFactory.createFileStorageProvider();
export const analysis = serviceFactory.createAnalysisProvider();

// Export types
export * from './types';
export * from './service-factory';
