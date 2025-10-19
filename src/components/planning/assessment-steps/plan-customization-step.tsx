import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Settings, Save, CheckCircle } from "lucide-react";
import { TransitionAssessmentData } from "../transition-assessment-flow";

interface PlanCustomizationStepProps {
  data: TransitionAssessmentData;
  onNext: (data: Partial<TransitionAssessmentData>) => void;
  onBack: () => void;
  isLoading: boolean;
}

export function PlanCustomizationStep({ data, onNext, onBack }: PlanCustomizationStepProps) {
  const [planTitle, setPlanTitle] = useState(
    data.planTitle || `${data.currentRole} to ${data.targetRole}`
  );
  const [customTimeline, setCustomTimeline] = useState(
    data.customTimeline || data.estimatedTimeline?.maxMonths || 12
  );
  const [selectedSkills, setSelectedSkills] = useState<string[]>(
    data.selectedSkills || data.skillGaps?.filter(s => s.criticalityLevel === 'critical').map(s => s.name) || []
  );

  useEffect(() => {
    // Auto-select critical skills by default
    if (!data.selectedSkills && data.skillGaps) {
      const criticalSkills = data.skillGaps
        .filter(s => s.criticalityLevel === 'critical')
        .map(s => s.name);
      setSelectedSkills(criticalSkills);
    }
  }, [data.skillGaps, data.selectedSkills]);

  const toggleSkill = (skillName: string) => {
    setSelectedSkills(prev =>
      prev.includes(skillName)
        ? prev.filter(s => s !== skillName)
        : [...prev, skillName]
    );
  };

  const handleComplete = () => {
    onNext({
      planTitle,
      customTimeline,
      selectedSkills,
    });
  };

  const getCriticalityColor = (level: string) => {
    switch (level) {
      case 'critical':
        return 'text-red-700 bg-red-50 border-red-200';
      case 'important':
        return 'text-orange-700 bg-orange-50 border-orange-200';
      case 'nice-to-have':
        return 'text-blue-700 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-4">
          <Settings className="h-8 w-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Customize Your Plan</h2>
        <p className="mt-2 text-gray-600">
          Adjust your plan settings and select which skills to prioritize
        </p>
      </div>

      <div className="space-y-6">
        {/* Plan Title */}
        <div className="space-y-2">
          <Label htmlFor="plan-title">Plan Name</Label>
          <Input
            id="plan-title"
            placeholder="e.g., Plan A: IC to Manager"
            value={planTitle}
            onChange={(e) => setPlanTitle(e.target.value)}
            className="text-lg"
          />
          <p className="text-sm text-gray-500">
            Give your transition plan a memorable name
          </p>
        </div>

        {/* Timeline Adjustment */}
        <div className="space-y-2">
          <Label htmlFor="custom-timeline">Target Timeline (months)</Label>
          <div className="flex items-center gap-4">
            <Input
              id="custom-timeline"
              type="number"
              min="3"
              max="36"
              value={customTimeline}
              onChange={(e) => setCustomTimeline(parseInt(e.target.value) || 12)}
              className="w-32"
            />
            <div className="text-sm text-gray-600">
              Recommended: {data.estimatedTimeline?.minMonths}-
              {data.estimatedTimeline?.maxMonths} months
            </div>
          </div>
        </div>

        {/* Skill Selection */}
        <div className="space-y-4">
          <div>
            <Label className="text-base">Select Skills to Focus On</Label>
            <p className="text-sm text-gray-500 mt-1">
              Choose which skills you want to include in your development plan
            </p>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {data.skillGaps?.map((skill) => (
              <div
                key={skill.name}
                className={`border rounded-lg p-3 ${getCriticalityColor(skill.criticalityLevel)}`}
              >
                <div className="flex items-start gap-3">
                  <Checkbox
                    id={`skill-${skill.name}`}
                    checked={selectedSkills.includes(skill.name)}
                    onCheckedChange={() => toggleSkill(skill.name)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <Label
                      htmlFor={`skill-${skill.name}`}
                      className="font-medium cursor-pointer flex items-center gap-2"
                    >
                      {skill.name}
                      <span className="text-xs uppercase font-semibold">
                        {skill.criticalityLevel}
                      </span>
                    </Label>
                    <div className="flex items-center gap-2 mt-1 text-xs">
                      <span>Current: {skill.currentLevel}</span>
                      <span>→</span>
                      <span>Target: {skill.targetLevel}</span>
                    </div>
                    {skill.transferableFrom && skill.transferableFrom.length > 0 && (
                      <p className="text-xs mt-1">
                        Transfers from: {skill.transferableFrom.join(', ')}
                      </p>
                    )}
                  </div>
                  {selectedSkills.includes(skill.name) && (
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900">Plan Summary</p>
              <p className="text-sm text-blue-700 mt-1">
                <strong>{planTitle}</strong> - {customTimeline} month timeline with{' '}
                {selectedSkills.length} skills to develop
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex gap-3 mt-6">
        <Button onClick={onBack} variant="outline" className="flex-1">
          Back
        </Button>
        <Button
          onClick={handleComplete}
          className="flex-1"
          disabled={!planTitle.trim() || selectedSkills.length === 0}
        >
          <Save className="h-4 w-4 mr-2" />
          Create Plan
        </Button>
      </div>
    </div>
  );
}
