"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Circle, Triangle, CheckCircle2, Info, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SkillGapItem {
  skillName: string;
  category: string;
  currentLevel: number; // 0-100
  requiredLevel: number; // 0-100
  importance: 'critical' | 'high' | 'medium' | 'low';
  gapType: 'critical' | 'nice-to-have' | 'transferable';
}

export interface SkillGapMatrixProps {
  skills: SkillGapItem[];
  className?: string;
}

const IMPORTANCE_COLORS = {
  critical: 'bg-red-100 border-red-400 text-red-800',
  high: 'bg-orange-100 border-orange-400 text-orange-800',
  medium: 'bg-yellow-100 border-yellow-400 text-yellow-800',
  low: 'bg-blue-100 border-blue-400 text-blue-800',
};

const GAP_TYPE_ICONS = {
  critical: Circle,
  'nice-to-have': Triangle,
  transferable: CheckCircle2,
};

const GAP_TYPE_LABELS = {
  critical: 'Critical Gap',
  'nice-to-have': 'Nice to Have',
  transferable: 'Transferable',
};

const getLevelCategory = (level: number): string => {
  if (level === 0) return 'None';
  if (level < 25) return 'Beginner';
  if (level < 50) return 'Basic';
  if (level < 75) return 'Intermediate';
  if (level < 90) return 'Advanced';
  return 'Expert';
};

export function SkillGapMatrix({ skills, className }: SkillGapMatrixProps) {
  // Group skills by category
  const skillsByCategory = skills.reduce((acc, skill) => {
    if (!acc[skill.category]) {
      acc[skill.category] = [];
    }
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<string, SkillGapItem[]>);

  // Sort categories by average gap (descending)
  const sortedCategories = Object.keys(skillsByCategory).sort((a, b) => {
    const avgGapA =
      skillsByCategory[a].reduce((sum, s) => sum + (s.requiredLevel - s.currentLevel), 0) /
      skillsByCategory[a].length;
    const avgGapB =
      skillsByCategory[b].reduce((sum, s) => sum + (s.requiredLevel - s.currentLevel), 0) /
      skillsByCategory[b].length;
    return avgGapB - avgGapA;
  });

  if (skills.length === 0) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader>
          <CardTitle>Skill Gap Matrix</CardTitle>
          <CardDescription>No skills to display</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <Info className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No skill gap data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Skill Gap Matrix
          <Info className="h-4 w-4 text-muted-foreground" />
        </CardTitle>
        <CardDescription>
          Current vs. required skill levels organized by category and importance
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Legend */}
        <div className="flex flex-wrap gap-4 mb-6 pb-4 border-b" role="list" aria-label="Legend">
          {Object.entries(GAP_TYPE_ICONS).map(([type, Icon]) => (
            <div key={type} className="flex items-center gap-2" role="listitem">
              <Icon
                className={cn(
                  "h-4 w-4",
                  type === 'critical' ? 'text-red-600' :
                  type === 'nice-to-have' ? 'text-yellow-600' :
                  'text-green-600'
                )}
                aria-hidden="true"
              />
              <span className="text-sm text-muted-foreground">
                {GAP_TYPE_LABELS[type as keyof typeof GAP_TYPE_LABELS]}
              </span>
            </div>
          ))}
        </div>

        {/* Matrix by Category */}
        <div className="space-y-6">
          {sortedCategories.map((category) => {
            const categorySkills = skillsByCategory[category];
            const avgGap =
              categorySkills.reduce((sum, s) => sum + (s.requiredLevel - s.currentLevel), 0) /
              categorySkills.length;

            return (
              <div key={category} className="space-y-3">
                {/* Category Header */}
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg text-foreground">{category}</h3>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {categorySkills.length} {categorySkills.length === 1 ? 'skill' : 'skills'}
                    </Badge>
                    <Badge variant="outline" className="text-xs text-red-600 border-red-300">
                      Avg Gap: {Math.round(avgGap)}%
                    </Badge>
                  </div>
                </div>

                {/* Skills Grid/Table */}
                <div className="grid gap-3">
                  {categorySkills.map((skill, index) => {
                    const GapIcon = GAP_TYPE_ICONS[skill.gapType];
                    const gap = skill.requiredLevel - skill.currentLevel;
                    const currentCategory = getLevelCategory(skill.currentLevel);
                    const requiredCategory = getLevelCategory(skill.requiredLevel);

                    return (
                      <TooltipProvider key={`${skill.skillName}-${index}`}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div
                              className={cn(
                                "border-2 rounded-lg p-4 transition-all hover:shadow-md cursor-help",
                                IMPORTANCE_COLORS[skill.importance]
                              )}
                            >
                              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                                {/* Skill Name and Icon */}
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                  <GapIcon
                                    className={cn(
                                      "h-5 w-5 flex-shrink-0",
                                      skill.gapType === 'critical' ? 'text-red-600' :
                                      skill.gapType === 'nice-to-have' ? 'text-yellow-600' :
                                      'text-green-600'
                                    )}
                                    aria-label={GAP_TYPE_LABELS[skill.gapType]}
                                  />
                                  <span className="font-medium text-sm truncate">
                                    {skill.skillName}
                                  </span>
                                </div>

                                {/* Current → Required */}
                                <div className="flex items-center gap-3 text-sm">
                                  <div className="flex items-center gap-1">
                                    <span className="text-muted-foreground text-xs">Current:</span>
                                    <Badge variant="outline" className="text-xs bg-blue-50 border-blue-300">
                                      {currentCategory}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground">
                                      ({skill.currentLevel}%)
                                    </span>
                                  </div>

                                  <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />

                                  <div className="flex items-center gap-1">
                                    <span className="text-muted-foreground text-xs">Required:</span>
                                    <Badge
                                      variant="outline"
                                      className={cn(
                                        "text-xs",
                                        skill.importance === 'critical' ? 'bg-red-50 border-red-300' :
                                        skill.importance === 'high' ? 'bg-orange-50 border-orange-300' :
                                        skill.importance === 'medium' ? 'bg-yellow-50 border-yellow-300' :
                                        'bg-blue-50 border-blue-300'
                                      )}
                                    >
                                      {requiredCategory}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground">
                                      ({skill.requiredLevel}%)
                                    </span>
                                  </div>
                                </div>

                                {/* Gap Badge */}
                                <Badge
                                  variant="outline"
                                  className={cn(
                                    "text-xs font-semibold whitespace-nowrap",
                                    gap > 50 ? 'bg-red-50 border-red-400 text-red-700' :
                                    gap > 30 ? 'bg-orange-50 border-orange-400 text-orange-700' :
                                    gap > 10 ? 'bg-yellow-50 border-yellow-400 text-yellow-700' :
                                    'bg-green-50 border-green-400 text-green-700'
                                  )}
                                >
                                  Gap: {gap}%
                                </Badge>
                              </div>

                              {/* Visual Gap Bar */}
                              <div className="mt-3">
                                <div className="w-full h-2 bg-white rounded-full relative overflow-hidden shadow-inner">
                                  {/* Current level */}
                                  <div
                                    className="absolute h-full bg-blue-500 rounded-full transition-all"
                                    style={{ width: `${skill.currentLevel}%` }}
                                    role="progressbar"
                                    aria-valuenow={skill.currentLevel}
                                    aria-valuemin={0}
                                    aria-valuemax={100}
                                    aria-label={`${skill.skillName} current level`}
                                  />
                                  {/* Required level marker */}
                                  <div
                                    className="absolute top-0 h-full w-1 bg-red-600"
                                    style={{ left: `${skill.requiredLevel}%` }}
                                    aria-label={`${skill.skillName} required level`}
                                  />
                                </div>
                              </div>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <div className="space-y-1">
                              <p className="font-semibold">{skill.skillName}</p>
                              <p className="text-xs">Category: {category}</p>
                              <p className="text-xs">Importance: {skill.importance}</p>
                              <p className="text-xs">Type: {GAP_TYPE_LABELS[skill.gapType]}</p>
                              <div className="pt-1 border-t border-gray-200 mt-1">
                                <p className="text-xs">Current: {skill.currentLevel}% ({currentCategory})</p>
                                <p className="text-xs">Required: {skill.requiredLevel}% ({requiredCategory})</p>
                                <p className="text-xs font-semibold">Gap to close: {gap}%</p>
                              </div>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Overall Summary */}
        <div className="mt-8 pt-6 border-t">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">{skills.length}</div>
              <div className="text-xs text-muted-foreground">Total Skills</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">
                {sortedCategories.length}
              </div>
              <div className="text-xs text-muted-foreground">Categories</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {skills.filter((s) => s.gapType === 'critical').length}
              </div>
              <div className="text-xs text-muted-foreground">Critical Gaps</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {skills.filter((s) => s.gapType === 'transferable').length}
              </div>
              <div className="text-xs text-muted-foreground">Transferable</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
