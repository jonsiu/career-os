"use client";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";

export interface SkillProgressBarProps {
  skillName: string;
  currentLevel: number; // 0-100
  targetLevel: number; // 0-100
  gapType?: 'critical' | 'nice-to-have' | 'transferable';
  showLevelIndicators?: boolean;
  className?: string;
}

const LEVEL_THRESHOLDS = [
  { value: 0, label: 'None', color: 'text-gray-500' },
  { value: 20, label: 'Beginner', color: 'text-red-600' },
  { value: 40, label: 'Basic', color: 'text-orange-600' },
  { value: 60, label: 'Intermediate', color: 'text-yellow-600' },
  { value: 80, label: 'Advanced', color: 'text-blue-600' },
  { value: 95, label: 'Expert', color: 'text-green-600' },
];

const getLevelLabel = (value: number): { label: string; color: string } => {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (value >= LEVEL_THRESHOLDS[i].value) {
      return {
        label: LEVEL_THRESHOLDS[i].label,
        color: LEVEL_THRESHOLDS[i].color,
      };
    }
  }
  return LEVEL_THRESHOLDS[0];
};

const getGapColor = (gapType?: string): string => {
  switch (gapType) {
    case 'critical':
      return 'bg-red-500';
    case 'nice-to-have':
      return 'bg-yellow-500';
    case 'transferable':
      return 'bg-green-500';
    default:
      return 'bg-blue-500';
  }
};

const getGapBorderColor = (gapType?: string): string => {
  switch (gapType) {
    case 'critical':
      return 'border-red-300 bg-red-50';
    case 'nice-to-have':
      return 'border-yellow-300 bg-yellow-50';
    case 'transferable':
      return 'border-green-300 bg-green-50';
    default:
      return 'border-blue-300 bg-blue-50';
  }
};

export function SkillProgressBar({
  skillName,
  currentLevel,
  targetLevel,
  gapType,
  showLevelIndicators = true,
  className
}: SkillProgressBarProps) {
  const currentLevelInfo = getLevelLabel(currentLevel);
  const targetLevelInfo = getLevelLabel(targetLevel);
  const gap = targetLevel - currentLevel;
  const progressColor = getGapColor(gapType);
  const borderColor = getGapBorderColor(gapType);

  return (
    <div className={cn("space-y-3", className)}>
      {/* Header with skill name and info tooltip */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h4 className="font-semibold text-sm">{skillName}</h4>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="text-muted-foreground hover:text-foreground">
                  <Info className="h-4 w-4" aria-label="Skill information" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <div className="space-y-1">
                  <p className="font-semibold">{skillName}</p>
                  <p className="text-xs">Current: {currentLevel}% ({currentLevelInfo.label})</p>
                  <p className="text-xs">Target: {targetLevel}% ({targetLevelInfo.label})</p>
                  <p className="text-xs">Gap: {gap}%</p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {gapType && (
          <Badge variant="outline" className={cn("text-xs", borderColor)}>
            {gapType === 'critical' ? 'Critical' :
             gapType === 'nice-to-have' ? 'Nice-to-Have' :
             'Transferable'}
          </Badge>
        )}
      </div>

      {/* Progress bar with level indicators */}
      <div className="relative">
        {/* Background track */}
        <div className="w-full h-8 bg-gray-200 rounded-full relative overflow-hidden">
          {/* Current level fill */}
          <div
            className={cn(
              "h-full transition-all duration-500 ease-out rounded-full",
              progressColor
            )}
            style={{ width: `${currentLevel}%` }}
            role="progressbar"
            aria-valuenow={currentLevel}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${skillName} current proficiency: ${currentLevel}%`}
          >
            {/* Current level percentage label */}
            {currentLevel > 15 && (
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-bold text-white">
                {currentLevel}%
              </span>
            )}
          </div>

          {/* Target level marker */}
          {targetLevel > currentLevel && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className="absolute top-0 h-full w-1 bg-gray-800 cursor-help"
                    style={{ left: `${targetLevel}%` }}
                    aria-label={`Target level: ${targetLevel}%`}
                  >
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">Target: {targetLevel}% ({targetLevelInfo.label})</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        {/* Level indicators below bar */}
        {showLevelIndicators && (
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            {LEVEL_THRESHOLDS.slice(1).map((threshold) => (
              <TooltipProvider key={threshold.value}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      className="flex flex-col items-center cursor-help"
                      style={{ width: `${100 / (LEVEL_THRESHOLDS.length - 1)}%` }}
                    >
                      <div className="w-px h-2 bg-gray-300 mb-1" />
                      <span className={cn(
                        "text-[10px]",
                        currentLevel >= threshold.value && threshold.color
                      )}>
                        {threshold.label}
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">{threshold.label}: {threshold.value}%+</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        )}
      </div>

      {/* Level summary */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-4">
          <div>
            <span className="text-muted-foreground">Current: </span>
            <span className={cn("font-semibold", currentLevelInfo.color)}>
              {currentLevelInfo.label}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">Target: </span>
            <span className={cn("font-semibold", targetLevelInfo.color)}>
              {targetLevelInfo.label}
            </span>
          </div>
        </div>
        <div>
          <span className="text-muted-foreground">Gap: </span>
          <span className="font-semibold text-foreground">{gap}%</span>
        </div>
      </div>
    </div>
  );
}
