import { useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X, ArrowLeft, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Step components
import { CurrentRoleStep } from "./assessment-steps/current-role-step";
import { TargetRoleStep } from "./assessment-steps/target-role-step";
import { IndustryChangesStep } from "./assessment-steps/industry-changes-step";
import { AIAnalysisStep } from "./assessment-steps/ai-analysis-step";
import { ResultsStep } from "./assessment-steps/results-step";
import { PlanCustomizationStep } from "./assessment-steps/plan-customization-step";

interface TransitionAssessmentFlowProps {
  userId: string;
  onComplete: (transitionData: TransitionAssessmentData) => void;
  onCancel: () => void;
}

export interface TransitionAssessmentData {
  currentRole?: string;
  currentIndustry?: string;
  yearsOfExperience?: number;
  targetRole?: string;
  targetIndustry?: string;
  changingIndustry?: boolean;
  changingFunction?: boolean;
  transitionTypes?: string[];
  primaryTransitionType?: string;
  estimatedTimeline?: {
    minMonths: number;
    maxMonths: number;
    factors: string[];
  };
  benchmarkData?: {
    similarTransitions: string;
    averageTimeline: string;
    successRate?: number;
  };
  bridgeRoles?: string[];
  skillGaps?: Array<{
    name: string;
    criticalityLevel: 'critical' | 'important' | 'nice-to-have';
    currentLevel: string;
    targetLevel: string;
    transferableFrom?: string[];
  }>;
  planTitle?: string;
  selectedSkills?: string[];
  customTimeline?: number;
}

const ASSESSMENT_STEPS = [
  { id: 'current-role', title: 'Current Role', component: 'current-role' },
  { id: 'target-role', title: 'Target Role', component: 'target-role' },
  { id: 'industry-changes', title: 'Industry Changes', component: 'industry-changes' },
  { id: 'ai-analysis', title: 'AI Analysis', component: 'ai-analysis' },
  { id: 'results', title: 'Results', component: 'results' },
  { id: 'customization', title: 'Customization', component: 'customization' },
];

export function TransitionAssessmentFlow({
  userId,
  onComplete,
  onCancel
}: TransitionAssessmentFlowProps) {
  const { toast } = useToast();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [assessmentData, setAssessmentData] = useState<TransitionAssessmentData>({});
  const [isLoading, setIsLoading] = useState(false);

  const currentStep = ASSESSMENT_STEPS[currentStepIndex];
  const progress = ((currentStepIndex + 1) / ASSESSMENT_STEPS.length) * 100;

  const handleNext = async (stepData?: Partial<TransitionAssessmentData>) => {
    const newData = { ...assessmentData, ...stepData };
    setAssessmentData(newData);

    if (currentStepIndex < ASSESSMENT_STEPS.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      // Complete assessment
      onComplete(newData);
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel? Your progress will be lost.')) {
      onCancel();
    }
  };

  const validateCurrentStep = (): boolean => {
    switch (currentStep.component) {
      case 'current-role':
        if (!assessmentData.currentRole?.trim()) {
          toast({
            title: 'Current role required',
            description: 'Please enter your current role title.',
            variant: 'destructive',
          });
          return false;
        }
        return true;
      case 'target-role':
        if (!assessmentData.targetRole?.trim()) {
          toast({
            title: 'Target role required',
            description: 'Please enter your target role title.',
            variant: 'destructive',
          });
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleNextClick = async () => {
    if (!validateCurrentStep()) {
      return;
    }
    await handleNext();
  };

  const renderStep = () => {
    const commonProps = {
      data: assessmentData,
      onNext: handleNext,
      onBack: handleBack,
      isLoading,
      setIsLoading,
    };

    switch (currentStep.component) {
      case 'current-role':
        return <CurrentRoleStep {...commonProps} />;
      case 'target-role':
        return <TargetRoleStep {...commonProps} />;
      case 'industry-changes':
        return <IndustryChangesStep {...commonProps} />;
      case 'ai-analysis':
        return <AIAnalysisStep {...commonProps} userId={userId} />;
      case 'results':
        return <ResultsStep {...commonProps} />;
      case 'customization':
        return <PlanCustomizationStep {...commonProps} />;
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
                onClick={handleCancel}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-4 w-4 mr-2" />
                Exit
              </Button>
              <div className="text-sm text-gray-600">
                Step {currentStepIndex + 1} of {ASSESSMENT_STEPS.length}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {ASSESSMENT_STEPS.map((step, index) => (
                <div
                  key={step.id}
                  className={`w-2 h-2 rounded-full ${
                    index <= currentStepIndex
                      ? 'bg-blue-600'
                      : 'bg-gray-300'
                  }`}
                  title={step.title}
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
            {renderStep()}

            {/* Navigation Buttons (only shown if step doesn't handle its own navigation) */}
            {currentStep.component !== 'ai-analysis' &&
             currentStep.component !== 'results' &&
             currentStep.component !== 'customization' && (
              <div className="flex gap-3 mt-6">
                {currentStepIndex > 0 && (
                  <Button
                    onClick={handleBack}
                    variant="outline"
                    className="flex-1"
                    disabled={isLoading}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                )}
                <Button
                  onClick={handleNextClick}
                  className="flex-1"
                  disabled={isLoading}
                >
                  {currentStepIndex === ASSESSMENT_STEPS.length - 1 ? 'Complete' : 'Next'}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
