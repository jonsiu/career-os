import { AuthProvider, User } from '../types';

export class ClerkAuthProvider implements AuthProvider {
  async getCurrentUser(): Promise<User | null> {
    // TODO: Implement actual Clerk user retrieval
    // For now, return null
    return null;
  }

  async signIn(email: string, password: string): Promise<User> {
    // TODO: Implement actual Clerk sign in
    throw new Error('Not implemented yet');
  }

  async signUp(email: string, password: string, userData: Partial<User>): Promise<User> {
    // TODO: Implement actual Clerk sign up
    throw new Error('Not implemented yet');
  }

  async signOut(): Promise<void> {
    // TODO: Implement actual Clerk sign out
    throw new Error('Not implemented yet');
  }

  async isAuthenticated(): Promise<boolean> {
    // TODO: Implement actual Clerk authentication check
    return false;
  }
}
