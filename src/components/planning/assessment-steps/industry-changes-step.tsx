import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Building, TrendingUp, Users, Code } from "lucide-react";
import { TransitionAssessmentData } from "../transition-assessment-flow";

interface IndustryChangesStepProps {
  data: TransitionAssessmentData;
  onNext: (data: Partial<TransitionAssessmentData>) => void;
  onBack?: () => void;
  isLoading: boolean;
}

export function IndustryChangesStep({ data }: IndustryChangesStepProps) {
  const [changingIndustry, setChangingIndustry] = useState(data.changingIndustry || false);
  const [changingFunction, setChangingFunction] = useState(data.changingFunction || false);

  // Update the parent data object directly (it's passed by reference)
  useEffect(() => {
    data.changingIndustry = changingIndustry;
    data.changingFunction = changingFunction;
  }, [changingIndustry, changingFunction, data]);

  const industryChangeDetected =
    data.currentIndustry &&
    data.targetIndustry &&
    data.currentIndustry.toLowerCase() !== data.targetIndustry.toLowerCase();

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
          <TrendingUp className="h-8 w-8 text-purple-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">What's changing in your transition?</h2>
        <p className="mt-2 text-gray-600">
          Help us understand the scope of your career change
        </p>
      </div>

      <div className="space-y-6">
        {/* Industry Change */}
        <div className="border rounded-lg p-4 hover:border-purple-300 transition-colors">
          <div className="flex items-start gap-3">
            <Checkbox
              id="changing-industry"
              checked={changingIndustry}
              onCheckedChange={(checked) => setChangingIndustry(checked as boolean)}
              className="mt-1"
            />
            <div className="flex-1">
              <Label
                htmlFor="changing-industry"
                className="text-base font-medium cursor-pointer flex items-center gap-2"
              >
                <Building className="h-5 w-5 text-purple-600" />
                Changing Industry
              </Label>
              <p className="text-sm text-gray-600 mt-1">
                Moving to a different industry or sector (e.g., from Finance to Technology)
              </p>
              {industryChangeDetected && (
                <div className="mt-2 text-sm bg-purple-50 text-purple-700 px-3 py-1 rounded">
                  Detected: {data.currentIndustry} → {data.targetIndustry}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Function Change */}
        <div className="border rounded-lg p-4 hover:border-purple-300 transition-colors">
          <div className="flex items-start gap-3">
            <Checkbox
              id="changing-function"
              checked={changingFunction}
              onCheckedChange={(checked) => setChangingFunction(checked as boolean)}
              className="mt-1"
            />
            <div className="flex-1">
              <Label
                htmlFor="changing-function"
                className="text-base font-medium cursor-pointer flex items-center gap-2"
              >
                <Code className="h-5 w-5 text-purple-600" />
                Changing Function
              </Label>
              <p className="text-sm text-gray-600 mt-1">
                Moving to a different job function (e.g., from Technical to Management)
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mt-6">
        <div className="flex items-start gap-3">
          <Users className="h-5 w-5 text-purple-600 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-purple-900 mb-1">Transition Type Preview</p>
            <p className="text-sm text-purple-700">
              {!changingIndustry && !changingFunction && (
                <>You're making a <strong>cross-role transition</strong> - staying in the same industry and function, but advancing to a new role level.</>
              )}
              {changingIndustry && !changingFunction && (
                <>You're making a <strong>cross-industry transition</strong> - moving to a new industry while maintaining similar job functions.</>
              )}
              {!changingIndustry && changingFunction && (
                <>You're making a <strong>cross-function transition</strong> - changing your job function while staying in the same industry.</>
              )}
              {changingIndustry && changingFunction && (
                <>You're making a <strong>hybrid transition</strong> - changing both industry and function. This is the most challenging transition type.</>
              )}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
        <p className="text-sm text-blue-900">
          <strong>Coming next:</strong> We'll use AI to analyze your transition and create
          a personalized roadmap based on your specific path.
        </p>
      </div>
    </div>
  );
}
