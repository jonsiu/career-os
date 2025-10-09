"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { OnboardingFlow } from "@/components/onboarding";
import { database } from "@/lib/abstractions";
import { useUserSync } from "@/lib/hooks/use-user-sync";
import { Loader2 } from "lucide-react";

export default function OnboardingPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(true);
  
  // Sync user to Convex database first
  const { isSyncing, isSynced, error: syncError } = useUserSync();
  const [shouldShowOnboarding, setShouldShowOnboarding] = useState(false);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      // Wait for user sync to complete first
      if (!isLoaded || !user || !isSynced) return;

      try {
        // Check if user has completed onboarding
        const onboardingState = await database.getUserOnboardingState(user.id);
        
        if (onboardingState && (onboardingState.skipped || onboardingState.currentStep === 'complete')) {
          // User has completed or skipped onboarding, redirect to dashboard
          router.push('/dashboard');
          return;
        }

        // User needs to complete onboarding
        setShouldShowOnboarding(true);
      } catch (error) {
        console.error('Error checking onboarding status:', error);
        // On error, show onboarding to be safe
        setShouldShowOnboarding(true);
      } finally {
        setIsCheckingOnboarding(false);
      }
    };

    checkOnboardingStatus();
  }, [isLoaded, user, isSynced, router]);

  const handleOnboardingComplete = () => {
    router.push('/dashboard');
  };

  const handleOnboardingSkip = () => {
    router.push('/dashboard');
  };

  if (!isLoaded || isSyncing || !isSynced || isCheckingOnboarding) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
          <p className="text-gray-600">Loading onboarding...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    router.push('/sign-in');
    return null;
  }

  if (syncError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-red-50">
        <div className="text-center space-y-4">
          <h3 className="text-lg font-medium text-red-900">Setup Error</h3>
          <p className="text-red-600">{syncError}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!shouldShowOnboarding) {
    return null; // Will redirect to dashboard
  }

  return (
    <OnboardingFlow
      userId={user.id}
      onComplete={handleOnboardingComplete}
      onSkip={handleOnboardingSkip}
    />
  );
}
