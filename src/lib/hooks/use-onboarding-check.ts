import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { database } from "@/lib/abstractions";

interface OnboardingStatus {
  needsOnboarding: boolean;
  isLoading: boolean;
  error: string | null;
}

export function useOnboardingCheck(): OnboardingStatus {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!isLoaded || !user) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Check if user has completed onboarding
        const onboardingState = await database.getUserOnboardingState(user.id);
        
        if (onboardingState && (onboardingState.skipped || onboardingState.currentStep === 'complete')) {
          // User has completed or skipped onboarding
          setNeedsOnboarding(false);
        } else {
          // User needs to complete onboarding (including new users with no onboarding state)
          setNeedsOnboarding(true);
          // Redirect to onboarding page
          router.push('/onboarding');
        }
      } catch (err) {
        console.error('Error checking onboarding status:', err);
        setError(err instanceof Error ? err.message : 'Failed to check onboarding status');
        // On error, assume onboarding is needed to be safe
        setNeedsOnboarding(true);
        router.push('/onboarding');
      } finally {
        setIsLoading(false);
      }
    };

    checkOnboardingStatus();
  }, [isLoaded, user, router]);

  return {
    needsOnboarding,
    isLoading,
    error
  };
}
