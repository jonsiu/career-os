import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X, ArrowLeft } from "lucide-react";
import { WelcomeStep } from "./welcome-step";
import { ResumeUploadStep } from "./resume-upload-step";
import { JobInterestsStep } from "./job-interests-step";
import { BrowserExtensionStep } from "./browser-extension-step";
import { CompletionStep } from "./completion-step";
import { database } from "@/lib/abstractions";
import { Resume } from "@/lib/abstractions/types";
import { useToast } from "@/hooks/use-toast";

interface OnboardingFlowProps {
  userId: string;
  onComplete: () => void;
  onSkip: () => void;
}

interface JobInterestsData {
  targetRoles: string[];
  industries: string[];
  locations: string[];
  experienceLevel: string;
}

interface OnboardingData {
  resume?: Resume;
  jobInterests?: JobInterestsData;
  extensionInstalled?: boolean;
}

const ONBOARDING_STEPS = [
  { id: 'welcome', title: 'Welcome', component: 'welcome' },
  { id: 'resume', title: 'Upload Resume', component: 'resume' },
  { id: 'interests', title: 'Job Interests', component: 'interests' },
  { id: 'extension', title: 'Browser Extension', component: 'extension' },
  { id: 'complete', title: 'Complete', component: 'complete' }
];

export function OnboardingFlow({ userId, onComplete, onSkip }: OnboardingFlowProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({});
  const [isLoading, setIsLoading] = useState(false);

  const currentStep = ONBOARDING_STEPS[currentStepIndex];
  const progress = ((currentStepIndex + 1) / ONBOARDING_STEPS.length) * 100;

  // Load existing onboarding state
  useEffect(() => {
    const loadOnboardingState = async () => {
      try {
        const user = await database.getUserByClerkId(userId);
        if (user?.onboardingState) {
          const stepIndex = ONBOARDING_STEPS.findIndex(step => step.id === user.onboardingState.currentStep);
          if (stepIndex !== -1) {
            setCurrentStepIndex(stepIndex);
          }
        }
      } catch (error) {
        console.error('Failed to load onboarding state:', error);
      }
    };

    loadOnboardingState();
  }, [userId]);

  const updateOnboardingState = async (stepId: string, data?: any) => {
    try {
      setIsLoading(true);
      await database.updateUserOnboardingState(userId, {
        currentStep: stepId,
        completedSteps: ONBOARDING_STEPS.slice(0, currentStepIndex + 1).map(s => s.id),
        stepData: { ...onboardingData, ...data }
      });
    } catch (error) {
      console.error('Failed to update onboarding state:', error);
      toast({
        title: 'Error',
        description: 'Failed to save progress. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = async (data?: any) => {
    const newData = { ...onboardingData, ...data };
    setOnboardingData(newData);

    if (currentStepIndex < ONBOARDING_STEPS.length - 1) {
      const nextStepIndex = currentStepIndex + 1;
      const nextStep = ONBOARDING_STEPS[nextStepIndex];
      
      await updateOnboardingState(nextStep.id, newData);
      setCurrentStepIndex(nextStepIndex);
    } else {
      // Complete onboarding
      await completeOnboarding(newData);
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleSkip = async () => {
    await completeOnboarding(onboardingData, true);
  };

  const completeOnboarding = async (data: OnboardingData, skipped = false) => {
    try {
      setIsLoading(true);
      
      await database.updateUserOnboardingState(userId, {
        currentStep: 'complete',
        completedSteps: ONBOARDING_STEPS.map(s => s.id),
        skipped,
        completedAt: Date.now(),
        ...data
      });

      toast({
        title: 'Onboarding Complete!',
        description: skipped 
          ? 'You can complete onboarding later from your dashboard.' 
          : 'Welcome to CareerOS! You\'re ready to get started.',
      });

      onComplete();
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
      toast({
        title: 'Error',
        description: 'Failed to complete onboarding. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep.component) {
      case 'welcome':
        return (
          <WelcomeStep 
            onNext={() => handleNext()} 
            onSkip={handleSkip}
          />
        );
      
      case 'resume':
        return (
          <ResumeUploadStep
            userId={userId}
            onNext={(resume) => handleNext({ resume })}
            onBack={handleBack}
          />
        );
      
      case 'interests':
        return (
          <JobInterestsStep
            onNext={(jobInterests) => handleNext({ jobInterests })}
            onBack={handleBack}
          />
        );
      
      case 'extension':
        return (
          <BrowserExtensionStep
            onNext={() => handleNext({ extensionInstalled: true })}
            onBack={handleBack}
            onSkip={() => handleNext({ extensionInstalled: false })}
          />
        );
      
      case 'complete':
        return (
          <CompletionStep
            onComplete={onComplete}
            resumeTitle={onboardingData.resume?.title}
            targetRoles={onboardingData.jobInterests?.targetRoles}
            extensionInstalled={onboardingData.extensionInstalled}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSkip}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-4 w-4 mr-2" />
                Exit
              </Button>
              <div className="text-sm text-gray-600">
                Step {currentStepIndex + 1} of {ONBOARDING_STEPS.length}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {ONBOARDING_STEPS.map((step, index) => (
                <div
                  key={step.id}
                  className={`w-2 h-2 rounded-full ${
                    index <= currentStepIndex 
                      ? 'bg-blue-600' 
                      : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
          
          <div className="mt-3">
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-8">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center space-y-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-600">Saving your progress...</p>
                </div>
              </div>
            ) : (
              renderStep()
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
