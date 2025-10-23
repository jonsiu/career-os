"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Clock,
  TrendingUp,
  Zap,
  Info,
  ChevronDown,
  ChevronUp,
  Filter,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface RoadmapSkill {
  skillName: string;
  priorityScore: number; // 0-100
  timeEstimate: number; // hours
  importance: number; // 0-100
  phase: number; // 1, 2, or 3
  category?: string;
  isQuickWin?: boolean; // high priority, low time
}

export interface PrioritizedRoadmapProps {
  skills: RoadmapSkill[];
  className?: string;
}

type SortOption = 'priority' | 'time' | 'phase';
type FilterCategory = 'all' | string;

const PHASES = [
  { number: 1, title: 'Immediate Focus', subtitle: '0-3 months', color: 'text-red-600 bg-red-50 border-red-300' },
  { number: 2, title: 'Short-term Goals', subtitle: '3-6 months', color: 'text-yellow-600 bg-yellow-50 border-yellow-300' },
  { number: 3, title: 'Long-term Investment', subtitle: '6-12 months', color: 'text-blue-600 bg-blue-50 border-blue-300' },
];

const getPriorityBadgeVariant = (score: number): { color: string; label: string } => {
  if (score >= 80) return { color: 'bg-red-100 text-red-800 border-red-300', label: 'Critical' };
  if (score >= 60) return { color: 'bg-orange-100 text-orange-800 border-orange-300', label: 'High' };
  if (score >= 40) return { color: 'bg-yellow-100 text-yellow-800 border-yellow-300', label: 'Medium' };
  return { color: 'bg-blue-100 text-blue-800 border-blue-300', label: 'Low' };
};

const formatTime = (hours: number): string => {
  if (hours < 10) return `${hours}h`;
  if (hours < 100) return `${Math.round(hours)}h`;
  const weeks = Math.round(hours / 10);
  return `${weeks}w`;
};

export function PrioritizedRoadmap({ skills, className }: PrioritizedRoadmapProps) {
  const [sortBy, setSortBy] = useState<SortOption>('priority');
  const [filterCategory, setFilterCategory] = useState<FilterCategory>('all');
  const [expandedPhases, setExpandedPhases] = useState<Set<number>>(new Set([1, 2, 3]));

  // Get unique categories
  const categories = Array.from(new Set(skills.map(s => s.category).filter(Boolean)));

  // Filter skills
  const filteredSkills = skills.filter(skill =>
    filterCategory === 'all' || skill.category === filterCategory
  );

  // Sort skills
  const sortedSkills = [...filteredSkills].sort((a, b) => {
    switch (sortBy) {
      case 'priority':
        return b.priorityScore - a.priorityScore;
      case 'time':
        return a.timeEstimate - b.timeEstimate;
      case 'phase':
        return a.phase - b.phase;
      default:
        return 0;
    }
  });

  // Group by phase
  const skillsByPhase = sortedSkills.reduce((acc, skill) => {
    if (!acc[skill.phase]) {
      acc[skill.phase] = [];
    }
    acc[skill.phase].push(skill);
    return acc;
  }, {} as Record<number, RoadmapSkill[]>);

  const togglePhase = (phaseNumber: number) => {
    const newExpanded = new Set(expandedPhases);
    if (newExpanded.has(phaseNumber)) {
      newExpanded.delete(phaseNumber);
    } else {
      newExpanded.add(phaseNumber);
    }
    setExpandedPhases(newExpanded);
  };

  if (skills.length === 0) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader>
          <CardTitle>Prioritized Learning Roadmap</CardTitle>
          <CardDescription>No skills to display</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <Info className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No roadmap data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Prioritized Learning Roadmap
          <Info className="h-4 w-4 text-muted-foreground" />
        </CardTitle>
        <CardDescription>
          Your personalized learning path based on impact, time, and market demand
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6 pb-4 border-b">
          {/* Sort Options */}
          <div className="flex gap-2 flex-wrap">
            <span className="text-sm text-muted-foreground self-center">Sort by:</span>
            <Button
              variant={sortBy === 'priority' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSortBy('priority')}
              className="text-xs"
            >
              <TrendingUp className="h-3 w-3 mr-1" />
              Priority
            </Button>
            <Button
              variant={sortBy === 'time' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSortBy('time')}
              className="text-xs"
            >
              <Clock className="h-3 w-3 mr-1" />
              Time
            </Button>
            <Button
              variant={sortBy === 'phase' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSortBy('phase')}
              className="text-xs"
            >
              Phase
            </Button>
          </div>

          {/* Filter by Category */}
          {categories.length > 0 && (
            <div className="flex gap-2 flex-wrap sm:ml-auto">
              <span className="text-sm text-muted-foreground self-center">
                <Filter className="h-3 w-3 inline mr-1" />
                Category:
              </span>
              <Button
                variant={filterCategory === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterCategory('all')}
                className="text-xs"
              >
                All
              </Button>
              {categories.map((cat) => (
                <Button
                  key={cat}
                  variant={filterCategory === cat ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterCategory(cat || 'all')}
                  className="text-xs"
                >
                  {cat}
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* Timeline */}
        <div className="space-y-8">
          {PHASES.map((phase) => {
            const phaseSkills = skillsByPhase[phase.number] || [];
            const isExpanded = expandedPhases.has(phase.number);

            if (phaseSkills.length === 0) return null;

            return (
              <div key={phase.number} className="relative">
                {/* Phase Header */}
                <button
                  onClick={() => togglePhase(phase.number)}
                  className="w-full text-left mb-4 group"
                  aria-expanded={isExpanded}
                  aria-controls={`phase-${phase.number}-content`}
                >
                  <div className={cn(
                    "flex items-center justify-between p-4 rounded-lg border-2 transition-colors",
                    phase.color,
                    "hover:opacity-80"
                  )}>
                    <div>
                      <div className="flex items-center gap-3">
                        <Badge className={cn("text-xs font-bold", phase.color)}>
                          Phase {phase.number}
                        </Badge>
                        <h3 className="font-semibold text-lg">{phase.title}</h3>
                      </div>
                      <p className="text-sm mt-1 opacity-70">{phase.subtitle}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="text-xs">
                        {phaseSkills.length} {phaseSkills.length === 1 ? 'skill' : 'skills'}
                      </Badge>
                      {isExpanded ? (
                        <ChevronUp className="h-5 w-5" />
                      ) : (
                        <ChevronDown className="h-5 w-5" />
                      )}
                    </div>
                  </div>
                </button>

                {/* Skill Cards */}
                {isExpanded && (
                  <div
                    id={`phase-${phase.number}-content`}
                    className="space-y-3 ml-4 border-l-2 border-gray-300 pl-6"
                  >
                    {phaseSkills.map((skill, index) => {
                      const priority = getPriorityBadgeVariant(skill.priorityScore);

                      return (
                        <div
                          key={`${skill.skillName}-${index}`}
                          className="relative bg-white rounded-lg border p-4 hover:shadow-md transition-shadow"
                        >
                          {/* Timeline dot */}
                          <div className="absolute -left-[28px] top-6 w-4 h-4 bg-white border-2 border-gray-400 rounded-full" />

                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                            <div className="flex-1">
                              <div className="flex items-start gap-2 mb-2">
                                <h4 className="font-semibold text-base">{skill.skillName}</h4>
                                {skill.isQuickWin && (
                                  <Badge className="bg-purple-100 text-purple-800 border-purple-300 text-xs">
                                    <Zap className="h-3 w-3 mr-1 inline" />
                                    Quick Win
                                  </Badge>
                                )}
                              </div>

                              {skill.category && (
                                <span className="text-xs text-muted-foreground">
                                  {skill.category}
                                </span>
                              )}
                            </div>

                            <div className="flex flex-wrap gap-2">
                              <Badge
                                variant="outline"
                                className={cn("text-xs", priority.color)}
                              >
                                {priority.label}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                <Clock className="h-3 w-3 mr-1" />
                                {formatTime(skill.timeEstimate)}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                Score: {Math.round(skill.priorityScore)}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Summary Stats */}
        <div className="mt-8 pt-6 border-t">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">{sortedSkills.length}</div>
              <div className="text-xs text-muted-foreground">Total Skills</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">
                {sortedSkills.filter(s => s.isQuickWin).length}
              </div>
              <div className="text-xs text-muted-foreground">Quick Wins</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">
                {Math.round(sortedSkills.reduce((sum, s) => sum + s.timeEstimate, 0))}h
              </div>
              <div className="text-xs text-muted-foreground">Total Time</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">
                {Math.round(sortedSkills.reduce((sum, s) => sum + s.priorityScore, 0) / sortedSkills.length)}
              </div>
              <div className="text-xs text-muted-foreground">Avg Priority</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
