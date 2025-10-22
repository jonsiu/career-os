"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Circle, Triangle, CheckCircle2, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SkillGap {
  skillName: string;
  importance: number;
  currentLevel: number;
  targetLevel: number;
  gapType: 'critical' | 'nice-to-have' | 'transferable';
}

export interface SkillsMatrixProps {
  criticalGaps: SkillGap[];
  niceToHaveGaps: SkillGap[];
  transferableSkills: SkillGap[];
  className?: string;
}

const PROFICIENCY_LEVELS = [
  { value: 0, label: 'None' },
  { value: 25, label: 'Basic' },
  { value: 50, label: 'Intermediate' },
  { value: 75, label: 'Advanced' },
  { value: 100, label: 'Expert' },
];

const getColorClass = (gapType: SkillGap['gapType']): string => {
  switch (gapType) {
    case 'critical':
      return 'bg-red-100 text-red-800 border-red-300';
    case 'nice-to-have':
      return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    case 'transferable':
      return 'bg-green-100 text-green-800 border-green-300';
  }
};

const getIcon = (gapType: SkillGap['gapType']) => {
  const iconClass = "h-4 w-4";
  switch (gapType) {
    case 'critical':
      return <Circle className={iconClass} aria-label="Critical gap" />;
    case 'nice-to-have':
      return <Triangle className={iconClass} aria-label="Nice to have gap" />;
    case 'transferable':
      return <CheckCircle2 className={iconClass} aria-label="Transferable skill" />;
  }
};

const getLevelLabel = (level: number): string => {
  if (level === 0) return 'None';
  if (level <= 25) return 'Basic';
  if (level <= 50) return 'Intermediate';
  if (level <= 75) return 'Advanced';
  return 'Expert';
};

export function SkillsMatrix({
  criticalGaps,
  niceToHaveGaps,
  transferableSkills,
  className
}: SkillsMatrixProps) {
  const allSkills = [
    ...criticalGaps.map(skill => ({ ...skill, gapType: 'critical' as const })),
    ...niceToHaveGaps.map(skill => ({ ...skill, gapType: 'nice-to-have' as const })),
    ...transferableSkills.map(skill => ({ ...skill, gapType: 'transferable' as const })),
  ];

  // Group skills by category for better organization
  const groupedSkills = allSkills.reduce((acc, skill) => {
    if (!acc[skill.gapType]) {
      acc[skill.gapType] = [];
    }
    acc[skill.gapType].push(skill);
    return acc;
  }, {} as Record<string, SkillGap[]>);

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Skills Matrix
          <Info className="h-4 w-4 text-muted-foreground" />
        </CardTitle>
        <CardDescription>
          Visual comparison of your current skills vs. target role requirements
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Legend */}
        <div className="flex flex-wrap gap-4 mb-6 pb-4 border-b" role="list" aria-label="Legend">
          <div className="flex items-center gap-2" role="listitem">
            <Circle className="h-4 w-4 text-red-600" aria-hidden="true" />
            <span className="text-sm text-muted-foreground">Critical Gap</span>
          </div>
          <div className="flex items-center gap-2" role="listitem">
            <Triangle className="h-4 w-4 text-yellow-600" aria-hidden="true" />
            <span className="text-sm text-muted-foreground">Nice to Have</span>
          </div>
          <div className="flex items-center gap-2" role="listitem">
            <CheckCircle2 className="h-4 w-4 text-green-600" aria-hidden="true" />
            <span className="text-sm text-muted-foreground">Transferable</span>
          </div>
        </div>

        {/* Desktop View: Grid */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full border-collapse" role="table" aria-label="Skills proficiency matrix">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3 font-semibold text-sm" scope="col">Skill</th>
                {PROFICIENCY_LEVELS.map((level) => (
                  <th
                    key={level.value}
                    className="text-center p-3 font-semibold text-sm"
                    scope="col"
                  >
                    {level.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.entries(groupedSkills).map(([gapType, skills]) => (
                skills.map((skill, index) => (
                  <tr
                    key={`${gapType}-${index}`}
                    className="border-b hover:bg-muted/50 transition-colors"
                  >
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        {getIcon(skill.gapType)}
                        <span className="font-medium text-sm">{skill.skillName}</span>
                      </div>
                    </td>
                    {PROFICIENCY_LEVELS.map((level) => {
                      const isCurrent = skill.currentLevel >= level.value &&
                                      skill.currentLevel < level.value + 25;
                      const isTarget = skill.targetLevel >= level.value &&
                                     skill.targetLevel < level.value + 25;

                      return (
                        <td
                          key={level.value}
                          className="p-3 text-center"
                        >
                          <div className="flex flex-col items-center gap-1">
                            {isCurrent && (
                              <Badge
                                variant="outline"
                                className="text-xs bg-blue-50 border-blue-300"
                              >
                                Current
                              </Badge>
                            )}
                            {isTarget && (
                              <Badge
                                variant="outline"
                                className={cn("text-xs", getColorClass(skill.gapType))}
                              >
                                Target
                              </Badge>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))
              ))}
            </tbody>
          </table>
        </div>

        {/* Tablet/Mobile View: List */}
        <div className="lg:hidden space-y-4">
          {Object.entries(groupedSkills).map(([gapType, skills]) => (
            <div key={gapType} className="space-y-3">
              {skills.map((skill, index) => (
                <div
                  key={`${gapType}-${index}`}
                  className={cn(
                    "p-4 rounded-lg border-2",
                    getColorClass(skill.gapType)
                  )}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {getIcon(skill.gapType)}
                      <h4 className="font-semibold text-sm">{skill.skillName}</h4>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Current:</span>
                      <Badge variant="outline" className="bg-blue-50 border-blue-300">
                        {getLevelLabel(skill.currentLevel)}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Target:</span>
                      <Badge variant="outline" className={getColorClass(skill.gapType)}>
                        {getLevelLabel(skill.targetLevel)}
                      </Badge>
                    </div>

                    {/* Progress bar */}
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={cn(
                            "h-2 rounded-full transition-all",
                            skill.gapType === 'critical' ? 'bg-red-500' :
                            skill.gapType === 'nice-to-have' ? 'bg-yellow-500' :
                            'bg-green-500'
                          )}
                          style={{ width: `${skill.currentLevel}%` }}
                          role="progressbar"
                          aria-valuenow={skill.currentLevel}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-label={`${skill.skillName} current proficiency`}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>0%</span>
                        <span className="font-medium">
                          {skill.currentLevel}% → {skill.targetLevel}%
                        </span>
                        <span>100%</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Empty State */}
        {allSkills.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Info className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No skill data available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
