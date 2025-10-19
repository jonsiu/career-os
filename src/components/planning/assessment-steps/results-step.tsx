import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, Calendar, Users, AlertCircle } from "lucide-react";
import { TransitionAssessmentData } from "../transition-assessment-flow";

interface ResultsStepProps {
  data: TransitionAssessmentData;
  onNext: (data: Partial<TransitionAssessmentData>) => void;
  onBack: () => void;
  isLoading: boolean;
}

export function ResultsStep({ data, onNext, onBack }: ResultsStepProps) {
  const getTransitionTypeColor = (type: string) => {
    switch (type) {
      case 'cross-role':
        return 'bg-blue-100 text-blue-800';
      case 'cross-industry':
        return 'bg-purple-100 text-purple-800';
      case 'cross-function':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTransitionTypeName = (type: string) => {
    switch (type) {
      case 'cross-role':
        return 'Cross-Role';
      case 'cross-industry':
        return 'Cross-Industry';
      case 'cross-function':
        return 'Cross-Function';
      default:
        return type;
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-100 to-blue-100 rounded-full flex items-center justify-center mb-4">
          <TrendingUp className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Your Transition Analysis</h2>
        <p className="mt-2 text-gray-600">
          Here's what we discovered about your career path
        </p>
      </div>

      {/* Transition Types */}
      <div className="border rounded-lg p-6 bg-gradient-to-br from-blue-50 to-purple-50">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          Transition Type
        </h3>
        <div className="flex flex-wrap gap-2 mb-4">
          {data.transitionTypes?.map((type) => (
            <Badge
              key={type}
              className={`${getTransitionTypeColor(type)} text-base px-4 py-2`}
            >
              {getTransitionTypeName(type)}
            </Badge>
          ))}
        </div>
        {data.primaryTransitionType && (
          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <p className="text-sm text-gray-600 mb-1">Primary Challenge</p>
            <p className="text-lg font-semibold text-blue-900">
              {getTransitionTypeName(data.primaryTransitionType)}
            </p>
          </div>
        )}
      </div>

      {/* Timeline Estimate */}
      {data.estimatedTimeline && (
        <div className="border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-purple-600" />
            Estimated Timeline
          </h3>
          <div className="flex items-center gap-4 mb-4">
            <div className="text-center flex-1">
              <div className="text-3xl font-bold text-purple-600">
                {data.estimatedTimeline.minMonths}-{data.estimatedTimeline.maxMonths}
              </div>
              <div className="text-sm text-gray-600">Months</div>
            </div>
          </div>
          <div className="bg-purple-50 rounded-lg p-3">
            <p className="text-sm font-medium text-purple-900 mb-2">Timeline Factors:</p>
            <ul className="space-y-1">
              {data.estimatedTimeline.factors?.map((factor, index) => (
                <li key={index} className="text-sm text-purple-700 flex items-start gap-2">
                  <span className="text-purple-400 mt-0.5">•</span>
                  <span>{factor}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Benchmarking Data */}
      {data.benchmarkData && (
        <div className="border rounded-lg p-6 bg-green-50">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="h-5 w-5 text-green-600" />
            Similar Transitions
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-4 border border-green-200">
              <p className="text-sm text-gray-600 mb-1">Average Timeline</p>
              <p className="text-xl font-bold text-green-600">
                {data.benchmarkData.averageTimeline}
              </p>
            </div>
            {data.benchmarkData.successRate && (
              <div className="bg-white rounded-lg p-4 border border-green-200">
                <p className="text-sm text-gray-600 mb-1">Success Rate</p>
                <p className="text-xl font-bold text-green-600">
                  {data.benchmarkData.successRate}%
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bridge Roles */}
      {data.bridgeRoles && data.bridgeRoles.length > 0 && (
        <div className="border rounded-lg p-6 bg-orange-50">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-600" />
            Recommended Bridge Roles
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Consider these intermediate roles to make your transition easier:
          </p>
          <div className="flex flex-wrap gap-2">
            {data.bridgeRoles.map((role, index) => (
              <Badge
                key={index}
                className="bg-orange-100 text-orange-800 text-sm px-3 py-1"
              >
                {role}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-3 mt-6">
        <Button onClick={onBack} variant="outline" className="flex-1">
          Back
        </Button>
        <Button onClick={() => onNext({})} className="flex-1">
          Customize Plan
        </Button>
      </div>
    </div>
  );
}
