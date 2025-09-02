import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { database } from '@/lib/abstractions';

export function useUserSync() {
  const { user, isLoaded } = useUser();
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSynced, setIsSynced] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded || !user) {
      setIsSynced(false);
      return;
    }

    const syncUser = async () => {
      try {
        setIsSyncing(true);
        setError(null);

        // Check if user exists in Convex database
        const existingUser = await database.getUserByClerkId(user.id);
        
        if (!existingUser) {
          // Create user in Convex database
          await database.createUser({
            clerkUserId: user.id,
            email: user.emailAddresses[0]?.emailAddress || '',
            name: user.fullName || user.firstName || 'User',
            avatar: user.imageUrl,
            metadata: {
              clerkUserId: user.id,
              emailVerified: user.emailAddresses[0]?.verification?.status === 'verified',
              mfaEnabled: user.twoFactorEnabled,
              // Use current timestamp for Convex compatibility
              createdAt: Date.now(),
            }
          });
        }

        setIsSynced(true);
      } catch (err) {
        console.error('Failed to sync user:', err);
        setError(err instanceof Error ? err.message : 'Failed to sync user');
      } finally {
        setIsSyncing(false);
      }
    };

    syncUser();
  }, [user, isLoaded]);

  return {
    isSyncing,
    isSynced,
    error,
    user
  };
}
