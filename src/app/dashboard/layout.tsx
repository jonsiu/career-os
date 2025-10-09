"use client";

import { MainNav } from "@/components/layout/main-nav";
import { SignedIn } from "@clerk/nextjs";
import { useUserSync } from "@/lib/hooks/use-user-sync";
import { useOnboardingCheck } from "@/lib/hooks/use-onboarding-check";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isSyncing, error: syncError } = useUserSync();
  const { isLoading: isCheckingOnboarding, error: onboardingError } = useOnboardingCheck();

  // Show loading state while syncing user or checking onboarding
  if (isSyncing || isCheckingOnboarding) {
    return (
      <SignedIn>
        <div className="min-h-screen bg-gray-50">
          <MainNav />
          <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="px-4 py-6 sm:px-0">
              <div className="flex items-center justify-center min-h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Setting up your account...</h3>
                  <p className="text-gray-600">Please wait while we configure your workspace.</p>
                </div>
              </div>
            </div>
          </main>
        </div>
      </SignedIn>
    );
  }

  // Show error state if sync or onboarding check failed
  if (syncError || onboardingError) {
    return (
      <SignedIn>
        <div className="min-h-screen bg-gray-50">
          <MainNav />
          <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="px-4 py-6 sm:px-0">
              <div className="flex items-center justify-center min-h-64">
                <div className="text-center">
                  <h3 className="text-lg font-medium text-red-900 mb-2">Setup Error</h3>
                  <p className="text-red-600 mb-4">{syncError || onboardingError}</p>
                  <button 
                    onClick={() => window.location.reload()} 
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          </main>
        </div>
      </SignedIn>
    );
  }

  return (
    <SignedIn>
      <div className="min-h-screen bg-gray-50">
        <MainNav />
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            {children}
          </div>
        </main>
      </div>
    </SignedIn>
  );
}
