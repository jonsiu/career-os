import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Briefcase, Building2, Calendar } from "lucide-react";
import { TransitionAssessmentData } from "../transition-assessment-flow";

interface CurrentRoleStepProps {
  data: TransitionAssessmentData;
  onNext: (data: Partial<TransitionAssessmentData>) => void;
  onBack?: () => void;
  isLoading: boolean;
}

export function CurrentRoleStep({ data }: CurrentRoleStepProps) {
  // Use local state instead of calling onNext on every change
  const [currentRole, setCurrentRole] = useState(data.currentRole || '');
  const [currentIndustry, setCurrentIndustry] = useState(data.currentIndustry || '');
  const [yearsOfExperience, setYearsOfExperience] = useState(data.yearsOfExperience || 0);

  // Update the parent data object directly (it's passed by reference)
  useEffect(() => {
    data.currentRole = currentRole || undefined;
    data.currentIndustry = currentIndustry || undefined;
    data.yearsOfExperience = yearsOfExperience || undefined;
  }, [currentRole, currentIndustry, yearsOfExperience, data]);

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <Briefcase className="h-8 w-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Tell us about your current role</h2>
        <p className="mt-2 text-gray-600">
          This helps us understand your starting point and identify transferable skills
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="current-role" className="flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-gray-500" />
            Current Role Title *
          </Label>
          <Input
            id="current-role"
            placeholder="e.g., Software Engineer, Product Manager, Designer"
            value={currentRole}
            onChange={(e) => setCurrentRole(e.target.value)}
            className="text-lg"
            autoFocus
          />
          <p className="text-sm text-gray-500">
            Enter your current job title or closest equivalent
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="current-industry" className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-gray-500" />
            Current Industry
          </Label>
          <Input
            id="current-industry"
            placeholder="e.g., Technology, Healthcare, Finance"
            value={currentIndustry}
            onChange={(e) => setCurrentIndustry(e.target.value)}
            className="text-lg"
          />
          <p className="text-sm text-gray-500">
            The industry or sector you currently work in
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="years-experience" className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            Years of Experience
          </Label>
          <Input
            id="years-experience"
            type="number"
            min="0"
            max="50"
            placeholder="e.g., 5"
            value={yearsOfExperience || ''}
            onChange={(e) => setYearsOfExperience(parseInt(e.target.value) || 0)}
            className="text-lg"
          />
          <p className="text-sm text-gray-500">
            Total years of professional experience in your current role or similar roles
          </p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
        <p className="text-sm text-blue-900">
          <strong>Why we ask:</strong> Understanding your current position helps us identify
          which skills transfer to your target role and which gaps you'll need to fill.
        </p>
      </div>
    </div>
  );
}
