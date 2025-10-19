import { useEffect, useState } from "react";
import { Loader2, Sparkles, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TransitionAssessmentData } from "../transition-assessment-flow";
import { useToast } from "@/hooks/use-toast";

interface AIAnalysisStepProps {
  data: TransitionAssessmentData;
  onNext: (data: Partial<TransitionAssessmentData>) => void;
  onBack: () => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  userId: string;
}

interface AnalysisProgress {
  step: string;
  completed: boolean;
}

export function AIAnalysisStep({
  data,
  onNext,
  onBack,
  isLoading,
  setIsLoading,
}: AIAnalysisStepProps) {
  const { toast } = useToast();
  const [progress, setProgress] = useState<AnalysisProgress[]>([
    { step: 'Analyzing current role and skills...', completed: false },
    { step: 'Identifying transition type...', completed: false },
    { step: 'Detecting skill gaps...', completed: false },
    { step: 'Estimating timeline...', completed: false },
    { step: 'Generating recommendations...', completed: false },
  ]);

  useEffect(() => {
    performAIAnalysis();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const performAIAnalysis = async () => {
    setIsLoading(true);

    try {
      // Simulate progressive analysis steps
      for (let i = 0; i < progress.length; i++) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setProgress((prev) =>
          prev.map((item, index) =>
            index === i ? { ...item, completed: true } : item
          )
        );
      }

      // Call the actual AI analysis API
      const response = await fetch('/api/transitions/identify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentRole: data.currentRole,
          currentIndustry: data.currentIndustry,
          targetRole: data.targetRole,
          targetIndustry: data.targetIndustry,
          changingIndustry: data.changingIndustry,
          changingFunction: data.changingFunction,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze transition');
      }

      const analysisResult = await response.json();

      // Update assessment data with AI results
      onNext({
        transitionTypes: analysisResult.transitionTypes,
        primaryTransitionType: analysisResult.primaryTransitionType,
        estimatedTimeline: analysisResult.estimatedTimeline,
        benchmarkData: analysisResult.benchmarkData,
        bridgeRoles: analysisResult.bridgeRoles,
        skillGaps: analysisResult.skillGaps,
      });

    } catch (error) {
      console.error('AI analysis failed:', error);
      toast({
        title: 'Analysis failed',
        description: 'Unable to complete AI analysis. Please try again.',
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };

  const allStepsComplete = progress.every((step) => step.completed);

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center mb-4">
          {allStepsComplete ? (
            <CheckCircle className="h-8 w-8 text-green-600" />
          ) : (
            <Sparkles className="h-8 w-8 text-purple-600 animate-pulse" />
          )}
        </div>
        <h2 className="text-2xl font-bold text-gray-900">
          {allStepsComplete ? 'Analysis Complete!' : 'Analyzing Your Transition...'}
        </h2>
        <p className="mt-2 text-gray-600">
          {allStepsComplete
            ? 'We\'ve identified your transition type and created recommendations'
            : 'Our AI is analyzing your career transition path'}
        </p>
      </div>

      <div className="space-y-4">
        {progress.map((item, index) => (
          <div
            key={index}
            className={`flex items-center gap-3 p-4 rounded-lg border transition-all ${
              item.completed
                ? 'bg-green-50 border-green-200'
                : 'bg-gray-50 border-gray-200'
            }`}
          >
            {item.completed ? (
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
            ) : (
              <Loader2 className="h-5 w-5 text-purple-600 animate-spin flex-shrink-0" />
            )}
            <span className={`text-sm font-medium ${
              item.completed ? 'text-green-900' : 'text-gray-700'
            }`}>
              {item.step}
            </span>
          </div>
        ))}
      </div>

      {allStepsComplete && (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6 mt-6">
          <div className="flex items-start gap-3">
            <Sparkles className="h-6 w-6 text-purple-600 flex-shrink-0 mt-1" />
            <div>
              <p className="font-medium text-purple-900 mb-2">Analysis Ready</p>
              <p className="text-sm text-purple-700">
                We've analyzed your transition from <strong>{data.currentRole}</strong> to{' '}
                <strong>{data.targetRole}</strong> and generated personalized recommendations
                for your journey.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-3 mt-6">
        <Button onClick={onBack} variant="outline" className="flex-1" disabled={isLoading}>
          Back
        </Button>
        <Button
          onClick={() => onNext({})}
          className="flex-1"
          disabled={!allStepsComplete || isLoading}
        >
          View Results
        </Button>
      </div>
    </div>
  );
}
