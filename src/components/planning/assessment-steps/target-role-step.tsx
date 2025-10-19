import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Target, Building2 } from "lucide-react";
import { TransitionAssessmentData } from "../transition-assessment-flow";

interface TargetRoleStepProps {
  data: TransitionAssessmentData;
  onNext: (data: Partial<TransitionAssessmentData>) => void;
  onBack?: () => void;
  isLoading: boolean;
}

export function TargetRoleStep({ data, onNext }: TargetRoleStepProps) {
  const handleChange = (field: keyof TransitionAssessmentData, value: string) => {
    onNext({ [field]: value });
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <Target className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">What's your target role?</h2>
        <p className="mt-2 text-gray-600">
          Tell us about the role you're aiming for next in your career
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="target-role" className="flex items-center gap-2">
            <Target className="h-4 w-4 text-gray-500" />
            Target Role Title *
          </Label>
          <Input
            id="target-role"
            placeholder="e.g., Engineering Manager, Senior Designer, Solutions Architect"
            value={data.targetRole || ''}
            onChange={(e) => handleChange('targetRole', e.target.value)}
            className="text-lg"
            autoFocus
          />
          <p className="text-sm text-gray-500">
            The job title you're working towards
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="target-industry" className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-gray-500" />
            Target Industry
          </Label>
          <Input
            id="target-industry"
            placeholder="e.g., Technology, Healthcare, Finance"
            value={data.targetIndustry || ''}
            onChange={(e) => handleChange('targetIndustry', e.target.value)}
            className="text-lg"
          />
          <p className="text-sm text-gray-500">
            The industry you want to work in (leave blank if staying in same industry)
          </p>
        </div>
      </div>

      {data.currentRole && data.targetRole && (
        <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-4 mt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Your Transition</p>
              <p className="text-lg font-semibold text-blue-600">{data.currentRole}</p>
            </div>
            <div className="text-gray-400 text-2xl">→</div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">Target</p>
              <p className="text-lg font-semibold text-green-600">{data.targetRole}</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-6">
        <p className="text-sm text-green-900">
          <strong>Next step:</strong> We'll analyze the differences between your current
          and target roles to identify the type of transition you're making.
        </p>
      </div>
    </div>
  );
}
