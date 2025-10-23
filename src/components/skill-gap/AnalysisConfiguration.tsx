"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Clock, BookOpen, Target } from "lucide-react";

interface AnalysisConfigurationProps {
  userAvailability: number;
  focusAreas?: string[];
  preferredLearningFormats?: string[];
  onChange: (config: {
    userAvailability?: number;
    focusAreas?: string[];
    preferredLearningFormats?: string[];
  }) => void;
}

const SKILL_CATEGORIES = [
  { id: 'technical', label: 'Technical Skills' },
  { id: 'soft-skills', label: 'Soft Skills' },
  { id: 'domain', label: 'Domain Knowledge' },
  { id: 'leadership', label: 'Leadership & Management' },
  { id: 'tools', label: 'Tools & Technologies' },
];

const LEARNING_FORMATS = [
  { id: 'online-courses', label: 'Online Courses' },
  { id: 'books', label: 'Books & Reading' },
  { id: 'mentorship', label: 'Mentorship' },
  { id: 'projects', label: 'Hands-on Projects' },
  { id: 'certifications', label: 'Certifications' },
];

export function AnalysisConfiguration({
  userAvailability,
  focusAreas = [],
  preferredLearningFormats = [],
  onChange,
}: AnalysisConfigurationProps) {
  const handleAvailabilityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    onChange({ userAvailability: value });
  };

  const handleFocusAreaToggle = (categoryId: string) => {
    const newFocusAreas = focusAreas.includes(categoryId)
      ? focusAreas.filter((id) => id !== categoryId)
      : [...focusAreas, categoryId];
    onChange({ focusAreas: newFocusAreas });
  };

  const handleLearningFormatToggle = (formatId: string) => {
    const newFormats = preferredLearningFormats.includes(formatId)
      ? preferredLearningFormats.filter((id) => id !== formatId)
      : [...preferredLearningFormats, formatId];
    onChange({ preferredLearningFormats: newFormats });
  };

  // Calculate estimated timeline based on availability
  const getTimelineEstimate = () => {
    if (!userAvailability || userAvailability <= 0) return null;

    if (userAvailability < 5) {
      return '12-18 months for substantial progress';
    } else if (userAvailability < 10) {
      return '6-12 months for substantial progress';
    } else if (userAvailability < 20) {
      return '3-6 months for substantial progress';
    } else {
      return '2-4 months for substantial progress';
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Configure Your Analysis</h3>
        <p className="text-sm text-gray-600">
          Help us tailor your skill gap analysis and learning roadmap to your situation.
        </p>
      </div>

      {/* Weekly Availability */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-blue-600" />
          <h4 className="font-medium text-gray-900">Weekly Learning Time</h4>
        </div>

        <div className="space-y-2">
          <Label htmlFor="availability">
            How many hours per week can you dedicate to learning?
          </Label>
          <div className="flex items-center gap-4">
            <Input
              id="availability"
              type="number"
              min="1"
              max="168"
              value={userAvailability || ''}
              onChange={handleAvailabilityChange}
              placeholder="e.g., 10"
              className="max-w-xs"
            />
            <span className="text-sm text-gray-600">hours/week</span>
          </div>

          {userAvailability > 0 && userAvailability <= 168 && (
            <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-900">
                <strong>Estimated timeline:</strong> {getTimelineEstimate()}
              </p>
            </div>
          )}

          {userAvailability > 168 && (
            <p className="text-sm text-red-600">
              Please enter a valid number between 1 and 168 hours per week.
            </p>
          )}
        </div>
      </div>

      {/* Focus Areas (Optional) */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-purple-600" />
          <h4 className="font-medium text-gray-900">Focus Areas (Optional)</h4>
        </div>

        <p className="text-sm text-gray-600">
          Select specific skill categories you want to prioritize in your analysis.
          Leave unselected to analyze all areas equally.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {SKILL_CATEGORIES.map((category) => (
            <div key={category.id} className="flex items-center space-x-2">
              <Checkbox
                id={`focus-${category.id}`}
                checked={focusAreas.includes(category.id)}
                onCheckedChange={() => handleFocusAreaToggle(category.id)}
              />
              <label
                htmlFor={`focus-${category.id}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                {category.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Preferred Learning Formats (Optional) */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-green-600" />
          <h4 className="font-medium text-gray-900">Preferred Learning Formats (Optional)</h4>
        </div>

        <p className="text-sm text-gray-600">
          Select your preferred learning methods to help us recommend the best resources for you.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {LEARNING_FORMATS.map((format) => (
            <div key={format.id} className="flex items-center space-x-2">
              <Checkbox
                id={`format-${format.id}`}
                checked={preferredLearningFormats.includes(format.id)}
                onCheckedChange={() => handleLearningFormatToggle(format.id)}
              />
              <label
                htmlFor={`format-${format.id}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                {format.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Info Box */}
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h4 className="text-sm font-medium text-gray-900 mb-2">What happens next?</h4>
        <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
          <li>We'll extract skills from your resume</li>
          <li>Compare them with your target role requirements from O*NET</li>
          <li>Use AI to identify transferable skills and learning pathways</li>
          <li>Generate a prioritized roadmap based on impact and your availability</li>
          <li>Recommend courses and resources to close skill gaps</li>
        </ul>
        <p className="text-xs text-gray-500 mt-3">
          This analysis typically takes 10-30 seconds to complete.
        </p>
      </div>
    </div>
  );
}
