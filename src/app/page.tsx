"use client";

import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Briefcase, 
  BarChart3, 
  Target,
  Zap,
  Shield
} from "lucide-react";
import { database } from "@/lib/abstractions";
import { ConvexDatabaseProvider } from "@/lib/abstractions/providers/convex-database";

export default function HomePage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    const checkUserAndRedirect = async () => {
      if (!isLoaded || !user) return;

      try {
        // Check if user has completed onboarding
        console.log('Database object:', database);
        console.log('Available methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(database)));
        
        // Try direct instantiation as fallback
        const dbProvider = new ConvexDatabaseProvider();
        const onboardingState = await dbProvider.getUserOnboardingState(user.id);
        
        if (onboardingState && (onboardingState.skipped || onboardingState.currentStep === 'complete')) {
          // User has completed or skipped onboarding, redirect to dashboard
          router.push('/dashboard');
        } else {
          // User needs to complete onboarding (including new users with no onboarding state)
          router.push('/onboarding');
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error);
        // On error, redirect to onboarding to be safe
        router.push('/onboarding');
      }
    };

    checkUserAndRedirect();
  }, [isLoaded, user, router]);

  // Show loading state while checking user status
  if (isLoaded && user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600">Setting up your account...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Grow Your Career,{" "}
              <span className="text-blue-600">Your Way</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              CareerOS is your personal career development platform. Develop your skills, 
              explore opportunities, get growth-focused insights, and build systems for long-term success.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/sign-up">
                <Button size="lg" className="px-8 py-3">
                  Get Started Free
                </Button>
              </Link>
              <Link href="/sign-in">
                <Button size="lg" variant="outline" className="px-8 py-3">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Everything you need to develop your career
            </h2>
            <p className="text-xl text-gray-600">
              From skill development to career growth, we&apos;ve got you covered
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Smart Resume Builder</h3>
              <p className="text-gray-600">
                Develop your professional story with growth-focused suggestions and career capital building.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Briefcase className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Opportunity Explorer</h3>
              <p className="text-gray-600">
                Discover career opportunities, track your growth journey, and explore multiple career paths.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <BarChart3 className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Growth Analysis</h3>
              <p className="text-gray-600">
                Discover your growth potential, skill development opportunities, and career capital building insights.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-orange-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Target className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Skill Development</h3>
              <p className="text-gray-600">
                Build your career capital through deliberate practice and continuous skill development.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-indigo-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Zap className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Progress Tracking</h3>
              <p className="text-gray-600">
                Monitor your growth journey with compound progress tracking and habit formation.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-red-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Shield className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Privacy First</h3>
              <p className="text-gray-600">
                Your data is secure and private. We never share your information.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to grow your career potential?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of professionals who are already using CareerOS to develop their skills and build career capital.
          </p>
          <Link href="/sign-up">
            <Button size="lg" variant="secondary" className="px-8 py-3">
              Start Your Free Journey
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
