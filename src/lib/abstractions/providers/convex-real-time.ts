import { RealTimeProvider } from '../types';

export class ConvexRealTimeProvider implements RealTimeProvider {
  subscribeToUserData(userId: string, callback: (data: any) => void): () => void {
    // TODO: Implement actual Convex subscription
    // For now, return a no-op unsubscribe function
    return () => {};
  }

  subscribeToResumeUpdates(userId: string, callback: (resume: any) => void): () => void {
    // TODO: Implement actual Convex subscription
    return () => {};
  }

  subscribeToJobUpdates(userId: string, callback: (job: any) => void): () => void {
    // TODO: Implement actual Convex subscription
    return () => {};
  }

  subscribeToAnalysisUpdates(userId: string, callback: (analysis: any) => void): () => void {
    // TODO: Implement actual Convex subscription
    return () => {};
  }
}
