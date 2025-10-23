"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Clock, Calendar, TrendingUp, Zap, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SkillEstimate {
  skillName: string;
  estimatedHours: number; // total hours to master
  weeksToComplete: number; // based on user availability
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  priorityScore: number; // 0-100
  isQuickWin?: boolean;
  learningPath?: string[];
}

export interface TimeToMasteryEstimatorProps {
  skills: SkillEstimate[];
  userAvailability: number; // hours per week
  className?: string;
}

const DIFFICULTY_COLORS = {
  beginner: 'bg-green-100 text-green-800 border-green-300',
  intermediate: 'bg-blue-100 text-blue-800 border-blue-300',
  advanced: 'bg-orange-100 text-orange-800 border-orange-300',
  expert: 'bg-red-100 text-red-800 border-red-300',
};

const DIFFICULTY_LABELS = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
  expert: 'Expert',
};

const formatHours = (hours: number): string => {
  if (hours < 1) return `${Math.round(hours * 60)} min`;
  if (hours < 10) return `${hours.toFixed(1)}h`;
  return `${Math.round(hours)}h`;
};

const formatWeeks = (weeks: number): string => {
  if (weeks < 1) return '< 1 week';
  if (weeks < 4) return `${Math.round(weeks)} ${weeks === 1 ? 'week' : 'weeks'}`;
  const months = Math.round(weeks / 4);
  return `${months} ${months === 1 ? 'month' : 'months'}`;
};

export function TimeToMasteryEstimator({
  skills,
  userAvailability,
  className
}: TimeToMasteryEstimatorProps) {
  // Calculate cumulative timeline
  const totalHours = skills.reduce((sum, skill) => sum + skill.estimatedHours, 0);
  const totalWeeks = Math.ceil(totalHours / userAvailability);

  // Group skills by time range
  const shortTerm = skills.filter(s => s.weeksToComplete <= 4);
  const mediumTerm = skills.filter(s => s.weeksToComplete > 4 && s.weeksToComplete <= 12);
  const longTerm = skills.filter(s => s.weeksToComplete > 12);

  // Calculate cumulative progress for timeline visualization
  let cumulativeHours = 0;
  const timelineSkills = [...skills]
    .sort((a, b) => b.priorityScore - a.priorityScore)
    .map(skill => {
      const startHours = cumulativeHours;
      cumulativeHours += skill.estimatedHours;
      return {
        ...skill,
        startWeek: Math.floor(startHours / userAvailability),
        endWeek: Math.ceil(cumulativeHours / userAvailability),
      };
    });

  if (skills.length === 0) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader>
          <CardTitle>Time to Mastery Estimator</CardTitle>
          <CardDescription>No skills to estimate</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No skill estimates available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Time to Mastery Estimator
          <Info className="h-4 w-4 text-muted-foreground" />
        </CardTitle>
        <CardDescription>
          Estimated time to master skills at {userAvailability} hours/week
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
          <div className="text-center">
            <Clock className="h-6 w-6 mx-auto mb-1 text-blue-600" />
            <div className="text-2xl font-bold text-foreground">{formatHours(totalHours)}</div>
            <div className="text-xs text-muted-foreground">Total Time</div>
          </div>
          <div className="text-center">
            <Calendar className="h-6 w-6 mx-auto mb-1 text-indigo-600" />
            <div className="text-2xl font-bold text-foreground">{formatWeeks(totalWeeks)}</div>
            <div className="text-xs text-muted-foreground">Completion</div>
          </div>
          <div className="text-center">
            <Zap className="h-6 w-6 mx-auto mb-1 text-yellow-600" />
            <div className="text-2xl font-bold text-foreground">{shortTerm.length}</div>
            <div className="text-xs text-muted-foreground">Quick Wins</div>
          </div>
          <div className="text-center">
            <TrendingUp className="h-6 w-6 mx-auto mb-1 text-green-600" />
            <div className="text-2xl font-bold text-foreground">{skills.length}</div>
            <div className="text-xs text-muted-foreground">Skills Total</div>
          </div>
        </div>

        {/* Time Range Breakdown */}
        <div className="space-y-4">
          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
            Time Range Distribution
          </h3>
          <div className="grid gap-3">
            {/* Short Term (0-4 weeks) */}
            {shortTerm.length > 0 && (
              <div className="border rounded-lg p-4 bg-green-50/50 border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-green-600" />
                    <span className="font-semibold text-sm">Short-term (0-4 weeks)</span>
                  </div>
                  <Badge variant="outline" className="text-xs bg-white">
                    {shortTerm.length} skills
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  {shortTerm.map(s => s.skillName).join(', ')}
                </div>
              </div>
            )}

            {/* Medium Term (1-3 months) */}
            {mediumTerm.length > 0 && (
              <div className="border rounded-lg p-4 bg-blue-50/50 border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    <span className="font-semibold text-sm">Medium-term (1-3 months)</span>
                  </div>
                  <Badge variant="outline" className="text-xs bg-white">
                    {mediumTerm.length} skills
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  {mediumTerm.map(s => s.skillName).join(', ')}
                </div>
              </div>
            )}

            {/* Long Term (3+ months) */}
            {longTerm.length > 0 && (
              <div className="border rounded-lg p-4 bg-orange-50/50 border-orange-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-orange-600" />
                    <span className="font-semibold text-sm">Long-term (3+ months)</span>
                  </div>
                  <Badge variant="outline" className="text-xs bg-white">
                    {longTerm.length} skills
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  {longTerm.map(s => s.skillName).join(', ')}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Individual Skill Estimates */}
        <div className="space-y-4">
          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
            Individual Estimates
          </h3>
          <div className="space-y-3">
            {timelineSkills.map((skill, index) => (
              <TooltipProvider key={`${skill.skillName}-${index}`}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="border rounded-lg p-4 hover:shadow-md transition-all cursor-help">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        {/* Skill Name and Quick Win Badge */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-sm truncate">{skill.skillName}</h4>
                            {skill.isQuickWin && (
                              <Badge className="bg-purple-100 text-purple-800 border-purple-300 text-xs">
                                <Zap className="h-3 w-3 mr-1 inline" />
                                Quick Win
                              </Badge>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                            <Badge
                              variant="outline"
                              className={cn("text-xs", DIFFICULTY_COLORS[skill.difficulty])}
                            >
                              {DIFFICULTY_LABELS[skill.difficulty]}
                            </Badge>
                            <span>Priority: {skill.priorityScore}</span>
                          </div>
                        </div>

                        {/* Time Estimates */}
                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <Clock className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                            <div className="text-sm font-semibold">{formatHours(skill.estimatedHours)}</div>
                            <div className="text-xs text-muted-foreground">Total Time</div>
                          </div>
                          <div className="text-center">
                            <Calendar className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                            <div className="text-sm font-semibold">{formatWeeks(skill.weeksToComplete)}</div>
                            <div className="text-xs text-muted-foreground">Duration</div>
                          </div>
                        </div>
                      </div>

                      {/* Visual Timeline Bar */}
                      <div className="mt-3">
                        <div className="w-full h-2 bg-gray-200 rounded-full relative overflow-hidden">
                          <div
                            className={cn(
                              "absolute h-full rounded-full transition-all",
                              skill.isQuickWin ? 'bg-purple-500' :
                              skill.difficulty === 'beginner' ? 'bg-green-500' :
                              skill.difficulty === 'intermediate' ? 'bg-blue-500' :
                              skill.difficulty === 'advanced' ? 'bg-orange-500' :
                              'bg-red-500'
                            )}
                            style={{
                              left: `${(skill.startWeek / totalWeeks) * 100}%`,
                              width: `${((skill.endWeek - skill.startWeek) / totalWeeks) * 100}%`
                            }}
                            role="progressbar"
                            aria-valuenow={skill.startWeek}
                            aria-valuemin={0}
                            aria-valuemax={totalWeeks}
                            aria-label={`${skill.skillName} timeline: week ${skill.startWeek} to ${skill.endWeek}`}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                          <span>Week {skill.startWeek}</span>
                          <span>Week {skill.endWeek}</span>
                        </div>
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <div className="space-y-1">
                      <p className="font-semibold">{skill.skillName}</p>
                      <p className="text-xs">Estimated time: {formatHours(skill.estimatedHours)}</p>
                      <p className="text-xs">Weeks to complete: {formatWeeks(skill.weeksToComplete)}</p>
                      <p className="text-xs">Difficulty: {DIFFICULTY_LABELS[skill.difficulty]}</p>
                      <p className="text-xs">Timeline: Week {skill.startWeek} → {skill.endWeek}</p>
                      {skill.learningPath && skill.learningPath.length > 0 && (
                        <div className="pt-1 border-t border-gray-200 mt-1">
                          <p className="text-xs font-semibold">Learning Path:</p>
                          <ul className="text-xs list-disc list-inside">
                            {skill.learningPath.map((step, i) => (
                              <li key={i}>{step}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        </div>

        {/* Availability Info */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-muted-foreground">
              <p>
                <strong>Your availability:</strong> {userAvailability} hours per week
              </p>
              <p className="mt-1">
                Estimates are based on average learning times and may vary based on your prior experience,
                learning velocity, and the quality of learning resources.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
