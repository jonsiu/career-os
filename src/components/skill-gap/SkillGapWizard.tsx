"use client";

import { useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X, ArrowLeft, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { TargetRoleSelector } from "./TargetRoleSelector";
import { AnalysisConfiguration } from "./AnalysisConfiguration";

interface SkillGapWizardProps {
  userId: string;
  resumeId: string;
  onComplete: (analysisId: string) => void;
  onCancel: () => void;
}

export interface SkillGapWizardData {
  targetRole?: string;
  targetRoleONetCode?: string;
  userAvailability?: number;
  focusAreas?: string[];
  preferredLearningFormats?: string[];
}

const WIZARD_STEPS = [
  { id: 'target-role', title: 'Select Target Role', component: 'target-role' },
  { id: 'configuration', title: 'Configure Analysis', component: 'configuration' },
  { id: 'results', title: 'View Results', component: 'results' },
  { id: 'actions', title: 'Take Action', component: 'actions' }
];

export function SkillGapWizard({ userId, resumeId, onComplete, onCancel }: SkillGapWizardProps) {
  const { toast } = useToast();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [wizardData, setWizardData] = useState<SkillGapWizardData>({});
  const [isLoading, setIsLoading] = useState(false);

  const currentStep = WIZARD_STEPS[currentStepIndex];
  const progress = ((currentStepIndex + 1) / WIZARD_STEPS.length) * 100;

  const validateCurrentStep = (): boolean => {
    switch (currentStep.component) {
      case 'target-role':
        if (!wizardData.targetRole?.trim()) {
          toast({
            title: 'Target role required',
            description: 'Please select or enter your target role.',
            variant: 'destructive',
          });
          return false;
        }
        return true;
      case 'configuration':
        if (!wizardData.userAvailability || wizardData.userAvailability <= 0) {
          toast({
            title: 'Availability required',
            description: 'Please enter how many hours per week you can dedicate to learning.',
            variant: 'destructive',
          });
          return false;
        }
        if (wizardData.userAvailability > 168) {
          toast({
            title: 'Invalid availability',
            description: 'Please enter a valid number of hours per week (1-168).',
            variant: 'destructive',
          });
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const runAnalysis = async () => {
    try {
      setIsLoading(true);

      const response = await fetch('/api/skill-gap/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resumeId,
          targetRole: wizardData.targetRole,
          targetRoleONetCode: wizardData.targetRoleONetCode,
          userAvailability: wizardData.userAvailability,
          focusAreas: wizardData.focusAreas,
          preferredLearningFormats: wizardData.preferredLearningFormats,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Analysis failed');
      }

      const data = await response.json();

      toast({
        title: 'Analysis complete!',
        description: 'Your skill gap analysis is ready to view.',
      });

      onComplete(data.analysisId);
    } catch (error) {
      console.error('Failed to run analysis:', error);
      toast({
        title: 'Analysis failed',
        description: error instanceof Error ? error.message : 'Failed to analyze skill gaps. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = async (stepData?: Partial<SkillGapWizardData>) => {
    const newData = { ...wizardData, ...stepData };
    setWizardData(newData);

    if (!validateCurrentStep()) {
      return;
    }

    // If we're on configuration step, run the analysis
    if (currentStep.component === 'configuration') {
      await runAnalysis();
      // Don't advance - onComplete will handle navigation
      return;
    }

    if (currentStepIndex < WIZARD_STEPS.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
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

  const renderStep = () => {
    switch (currentStep.component) {
      case 'target-role':
        return (
          <TargetRoleSelector
            value={wizardData.targetRole || ''}
            onetCode={wizardData.targetRoleONetCode}
            onChange={(role, onetCode) =>
              setWizardData({ ...wizardData, targetRole: role, targetRoleONetCode: onetCode })
            }
          />
        );

      case 'configuration':
        return (
          <AnalysisConfiguration
            userAvailability={wizardData.userAvailability || 0}
            focusAreas={wizardData.focusAreas || []}
            preferredLearningFormats={wizardData.preferredLearningFormats || []}
            onChange={(config) =>
              setWizardData({ ...wizardData, ...config })
            }
          />
        );

      default:
        return (
          <div className="text-center py-8">
            <p className="text-gray-600">Step coming soon...</p>
          </div>
        );
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
                disabled={isLoading}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <div className="text-sm text-gray-600">
                Step {currentStepIndex + 1} of {WIZARD_STEPS.length}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {WIZARD_STEPS.map((step, index) => (
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
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {currentStep.title}
              </h2>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center space-y-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-600">Analyzing skill gaps...</p>
                  <p className="text-sm text-gray-500">This may take up to 30 seconds</p>
                </div>
              </div>
            ) : (
              <>
                {renderStep()}

                {/* Navigation Buttons */}
                <div className="flex gap-3 mt-8">
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
                    onClick={() => handleNext()}
                    className="flex-1"
                    disabled={isLoading}
                  >
                    {currentStep.component === 'configuration' ? 'Analyze' : 'Next'}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
