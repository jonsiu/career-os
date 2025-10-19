import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  Calendar,
  Users,
  Target,
  Edit3,
  Trash2,
  ArrowRight,
} from "lucide-react";

interface TransitionPlan {
  id: string;
  userId: string;
  title: string;
  description?: string;
  transitionTypes?: string[];
  primaryTransitionType?: string;
  currentRole?: string;
  targetRole?: string;
  currentIndustry?: string;
  targetIndustry?: string;
  bridgeRoles?: string[];
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
  progressPercentage?: number;
  goals: string[];
  timeline: number;
  milestones: Array<{
    id: string;
    title: string;
    status: string;
  }>;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

interface TransitionPlanCardProps {
  plan: TransitionPlan;
  onSelect: (plan: TransitionPlan) => void;
  onEdit?: (plan: TransitionPlan) => void;
  onDelete?: (planId: string) => void;
  isSelected?: boolean;
}

export function TransitionPlanCard({
  plan,
  onSelect,
  onEdit,
  onDelete,
  isSelected = false,
}: TransitionPlanCardProps) {
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const progress = plan.progressPercentage || 0;
  const completedMilestones = plan.milestones?.filter(m => m.status === 'completed').length || 0;

  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-lg ${
        isSelected ? 'ring-2 ring-blue-500' : ''
      }`}
      onClick={() => onSelect(plan)}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{plan.title}</CardTitle>
            {plan.description && (
              <p className="text-sm text-gray-600 mt-1">{plan.description}</p>
            )}
          </div>
          <div className="flex gap-1 ml-2">
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(plan);
                }}
              >
                <Edit3 className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm('Are you sure you want to delete this plan?')) {
                    onDelete(plan.id);
                  }
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Transition Route */}
        {plan.currentRole && plan.targetRole && (
          <div className="flex items-center gap-2 mt-3 text-sm">
            <span className="font-medium text-gray-700">{plan.currentRole}</span>
            <ArrowRight className="h-4 w-4 text-gray-400" />
            <span className="font-medium text-blue-600">{plan.targetRole}</span>
          </div>
        )}

        {/* Badges */}
        <div className="flex flex-wrap gap-2 mt-3">
          {plan.transitionTypes?.map((type) => (
            <Badge key={type} className={getTransitionTypeColor(type)}>
              {type.replace('cross-', '')}
            </Badge>
          ))}
          <Badge className={getStatusColor(plan.status)}>{plan.status}</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-2 bg-blue-50 rounded-lg">
            <Calendar className="mx-auto h-5 w-5 text-blue-600 mb-1" />
            <div className="text-sm font-bold text-blue-600">
              {plan.estimatedTimeline
                ? `${plan.estimatedTimeline.minMonths}-${plan.estimatedTimeline.maxMonths}mo`
                : `${plan.timeline}mo`}
            </div>
            <div className="text-xs text-gray-600">Timeline</div>
          </div>

          <div className="text-center p-2 bg-purple-50 rounded-lg">
            <Target className="mx-auto h-5 w-5 text-purple-600 mb-1" />
            <div className="text-sm font-bold text-purple-600">
              {completedMilestones}/{plan.milestones?.length || 0}
            </div>
            <div className="text-xs text-gray-600">Milestones</div>
          </div>

          <div className="text-center p-2 bg-green-50 rounded-lg">
            <TrendingUp className="mx-auto h-5 w-5 text-green-600 mb-1" />
            <div className="text-sm font-bold text-green-600">{progress}%</div>
            <div className="text-xs text-gray-600">Progress</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Overall Progress</span>
            <span className="font-medium text-gray-900">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Bridge Roles */}
        {plan.bridgeRoles && plan.bridgeRoles.length > 0 && (
          <div className="border-t pt-3">
            <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
              <Users className="h-3 w-3" />
              <span className="font-medium">Bridge Roles</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {plan.bridgeRoles.map((role, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="text-xs"
                >
                  {role}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Benchmarking Info */}
        {plan.benchmarkData && (
          <div className="border-t pt-3">
            <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
              <Users className="h-3 w-3" />
              <span className="font-medium">Similar Transitions</span>
            </div>
            <p className="text-sm text-gray-700">
              Average: <strong>{plan.benchmarkData.averageTimeline}</strong>
              {plan.benchmarkData.successRate && (
                <> • Success Rate: <strong>{plan.benchmarkData.successRate}%</strong></>
              )}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
