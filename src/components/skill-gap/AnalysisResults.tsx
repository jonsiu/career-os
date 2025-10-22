"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SkillsMatrix, type SkillGap } from "./SkillsMatrix";
import { RadarChart, type SkillDimension } from "./RadarChart";
import { PrioritizedRoadmap, type RoadmapSkill } from "./PrioritizedRoadmap";
import {
  BarChart3,
  Target,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Info,
  BookmarkPlus,
  Map,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

export interface AnalysisData {
  id?: string;
  targetRole: string;
  targetRoleONetCode?: string;
  criticalGaps: Array<{
    skillName: string;
    importance: number;
    currentLevel: number;
    targetLevel: number;
    priorityScore: number;
    timeEstimate: number;
    marketDemand: number;
  }>;
  niceToHaveGaps: Array<{
    skillName: string;
    importance: number;
    currentLevel: number;
    targetLevel: number;
    priorityScore: number;
    timeEstimate: number;
  }>;
  transferableSkills: Array<{
    skillName: string;
    currentLevel: number;
    applicability: number;
    transferExplanation: string;
    confidence: number;
  }>;
  prioritizedRoadmap: Array<{
    phase: number;
    skills: string[];
    estimatedDuration: number;
    milestoneTitle: string;
  }>;
  transitionType?: string;
  completionProgress?: number;
}

// Export as alias for compatibility with SkillGapAnalysisTab
export type SkillGapAnalysisData = AnalysisData;

export interface AnalysisResultsProps {
  analysis?: AnalysisData; // Support both "analysis" and "data" props
  data?: AnalysisData;
  className?: string;
  onReanalyze?: () => void;
}

export function AnalysisResults({ analysis, data, className, onReanalyze }: AnalysisResultsProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isAddingToSkillsTracker, setIsAddingToSkillsTracker] = useState(false);
  const [isCreatingPlan, setIsCreatingPlan] = useState(false);

  // Support both prop names for backwards compatibility
  const analysisData = analysis || data;

  if (!analysisData) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Info className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-muted-foreground">No analysis data available</p>
        </CardContent>
      </Card>
    );
  }

  // One-click: Add all gaps to Skills Tracker
  const handleAddToSkillsTracker = async () => {
    if (!analysisData.id) {
      toast({
        title: "Error",
        description: "Analysis ID is missing. Cannot add skills to tracker.",
        variant: "destructive",
      });
      return;
    }

    setIsAddingToSkillsTracker(true);
    try {
      const allGaps = [
        ...analysisData.criticalGaps.map(gap => ({
          ...gap,
          category: 'Critical',
        })),
        ...analysisData.niceToHaveGaps.map(gap => ({
          ...gap,
          category: 'Nice to Have',
        })),
      ];

      // Make API call to add skills to tracker
      const response = await fetch('/api/skills/batch-create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          analysisId: analysisData.id,
          skills: allGaps.map(gap => ({
            name: gap.skillName,
            category: gap.category,
            currentLevel: getLevelFromScore(gap.currentLevel),
            targetLevel: getLevelFromScore(gap.targetLevel),
            status: 'not-started',
            estimatedTimeToTarget: gap.timeEstimate,
            priority: getPriorityFromScore(gap.priorityScore),
            progress: 0,
            timeSpent: 0,
            resources: [],
            notes: `Added from Skill Gap Analysis for ${analysisData.targetRole}`,
          })),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to add skills to tracker');
      }

      const result = await response.json();

      toast({
        title: "Skills Added to Tracker",
        description: `Successfully added ${result.count || allGaps.length} skills to your Skills Tracker.`,
        action: (
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/dashboard/plan?tab=skills')}
          >
            View Skills
          </Button>
        ),
      });
    } catch (error) {
      console.error('Error adding skills to tracker:', error);
      toast({
        title: "Failed to Add Skills",
        description: error instanceof Error ? error.message : "Could not add skills to tracker. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAddingToSkillsTracker(false);
    }
  };

  // One-click: Create Career Plan from roadmap
  const handleCreateCareerPlan = async () => {
    if (!analysisData.id) {
      toast({
        title: "Error",
        description: "Analysis ID is missing. Cannot create career plan.",
        variant: "destructive",
      });
      return;
    }

    setIsCreatingPlan(true);
    try {
      // Calculate timeline in months based on roadmap
      const totalWeeks = analysisData.prioritizedRoadmap.reduce(
        (sum, phase) => sum + phase.estimatedDuration,
        0
      );
      const timeline = Math.ceil(totalWeeks / 4); // Convert weeks to months

      // Make API call to create career plan
      const response = await fetch('/api/plans/create-from-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          analysisId: analysisData.id,
          title: `Transition to ${analysisData.targetRole}`,
          description: `Career development plan generated from skill gap analysis for ${analysisData.targetRole} role.`,
          goals: [
            ...analysisData.criticalGaps.map(gap => `Master ${gap.skillName}`),
            `Successfully transition to ${analysisData.targetRole}`,
          ].slice(0, 5), // Limit to top 5 goals
          timeline,
          milestones: analysisData.prioritizedRoadmap.map((phase, index) => ({
            title: phase.milestoneTitle,
            description: `Complete skills: ${phase.skills.join(', ')}`,
            targetDate: new Date(Date.now() + (phase.estimatedDuration * 7 * 24 * 60 * 60 * 1000)).toISOString(),
            status: 'pending',
            dependencies: [],
            effort: phase.estimatedDuration * 10, // Rough estimate: 10 hours per week
          })),
          status: 'draft',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create career plan');
      }

      const result = await response.json();

      toast({
        title: "Career Plan Created",
        description: `Successfully created career plan "${result.plan?.title || 'Transition Plan'}".`,
        action: (
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/dashboard/plan?tab=roadmap')}
          >
            View Plan
          </Button>
        ),
      });
    } catch (error) {
      console.error('Error creating career plan:', error);
      toast({
        title: "Failed to Create Plan",
        description: error instanceof Error ? error.message : "Could not create career plan. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingPlan(false);
    }
  };

  // Transform data for SkillsMatrix
  const matrixCriticalGaps: SkillGap[] = analysisData.criticalGaps.map(gap => ({
    skillName: gap.skillName,
    importance: gap.importance,
    currentLevel: gap.currentLevel,
    targetLevel: gap.targetLevel,
    gapType: 'critical' as const,
  }));

  const matrixNiceToHaveGaps: SkillGap[] = analysisData.niceToHaveGaps.map(gap => ({
    skillName: gap.skillName,
    importance: gap.importance,
    currentLevel: gap.currentLevel,
    targetLevel: gap.targetLevel,
    gapType: 'nice-to-have' as const,
  }));

  const matrixTransferableSkills: SkillGap[] = analysisData.transferableSkills.map(skill => ({
    skillName: skill.skillName,
    importance: skill.applicability,
    currentLevel: skill.currentLevel,
    targetLevel: skill.currentLevel, // Transferable skills are already at target
    gapType: 'transferable' as const,
  }));

  // Transform data for RadarChart - group skills by category
  const radarDimensions: SkillDimension[] = [
    {
      name: 'Technical Skills',
      currentValue: calculateAverageLevel(
        [...analysisData.criticalGaps, ...analysisData.niceToHaveGaps].filter(s =>
          s.skillName.toLowerCase().includes('programming') ||
          s.skillName.toLowerCase().includes('software') ||
          s.skillName.toLowerCase().includes('technical')
        ),
        'current'
      ),
      targetValue: calculateAverageLevel(
        [...analysisData.criticalGaps, ...analysisData.niceToHaveGaps].filter(s =>
          s.skillName.toLowerCase().includes('programming') ||
          s.skillName.toLowerCase().includes('software') ||
          s.skillName.toLowerCase().includes('technical')
        ),
        'target'
      ),
    },
    {
      name: 'Soft Skills',
      currentValue: calculateAverageLevel(
        [...analysisData.criticalGaps, ...analysisData.niceToHaveGaps].filter(s =>
          s.skillName.toLowerCase().includes('communication') ||
          s.skillName.toLowerCase().includes('leadership') ||
          s.skillName.toLowerCase().includes('collaboration')
        ),
        'current'
      ),
      targetValue: calculateAverageLevel(
        [...analysisData.criticalGaps, ...analysisData.niceToHaveGaps].filter(s =>
          s.skillName.toLowerCase().includes('communication') ||
          s.skillName.toLowerCase().includes('leadership') ||
          s.skillName.toLowerCase().includes('collaboration')
        ),
        'target'
      ),
    },
    {
      name: 'Domain Knowledge',
      currentValue: calculateAverageLevel(
        [...analysisData.criticalGaps, ...analysisData.niceToHaveGaps].filter(s =>
          s.skillName.toLowerCase().includes('business') ||
          s.skillName.toLowerCase().includes('industry') ||
          s.skillName.toLowerCase().includes('domain')
        ),
        'current'
      ),
      targetValue: calculateAverageLevel(
        [...analysisData.criticalGaps, ...analysisData.niceToHaveGaps].filter(s =>
          s.skillName.toLowerCase().includes('business') ||
          s.skillName.toLowerCase().includes('industry') ||
          s.skillName.toLowerCase().includes('domain')
        ),
        'target'
      ),
    },
    {
      name: 'Tools & Technologies',
      currentValue: calculateAverageLevel(
        [...analysisData.criticalGaps, ...analysisData.niceToHaveGaps].filter(s =>
          s.skillName.toLowerCase().includes('tool') ||
          s.skillName.toLowerCase().includes('platform') ||
          s.skillName.toLowerCase().includes('system')
        ),
        'current'
      ),
      targetValue: calculateAverageLevel(
        [...analysisData.criticalGaps, ...analysisData.niceToHaveGaps].filter(s =>
          s.skillName.toLowerCase().includes('tool') ||
          s.skillName.toLowerCase().includes('platform') ||
          s.skillName.toLowerCase().includes('system')
        ),
        'target'
      ),
    },
    {
      name: 'Management',
      currentValue: calculateAverageLevel(
        [...analysisData.criticalGaps, ...analysisData.niceToHaveGaps].filter(s =>
          s.skillName.toLowerCase().includes('management') ||
          s.skillName.toLowerCase().includes('planning') ||
          s.skillName.toLowerCase().includes('strategy')
        ),
        'current'
      ),
      targetValue: calculateAverageLevel(
        [...analysisData.criticalGaps, ...analysisData.niceToHaveGaps].filter(s =>
          s.skillName.toLowerCase().includes('management') ||
          s.skillName.toLowerCase().includes('planning') ||
          s.skillName.toLowerCase().includes('strategy')
        ),
        'target'
      ),
    },
  ];

  // Transform data for PrioritizedRoadmap
  const roadmapSkills: RoadmapSkill[] = [
    ...analysisData.criticalGaps.map(gap => ({
      skillName: gap.skillName,
      priorityScore: gap.priorityScore,
      timeEstimate: gap.timeEstimate,
      importance: gap.importance,
      phase: determinePhase(gap.timeEstimate, gap.priorityScore),
      category: 'Critical',
      isQuickWin: gap.priorityScore >= 70 && gap.timeEstimate <= 40,
    })),
    ...analysisData.niceToHaveGaps.map(gap => ({
      skillName: gap.skillName,
      priorityScore: gap.priorityScore,
      timeEstimate: gap.timeEstimate,
      importance: gap.importance,
      phase: determinePhase(gap.timeEstimate, gap.priorityScore),
      category: 'Nice to Have',
      isQuickWin: gap.priorityScore >= 60 && gap.timeEstimate <= 30,
    })),
  ];

  const totalGaps = analysisData.criticalGaps.length + analysisData.niceToHaveGaps.length;
  const totalTransferable = analysisData.transferableSkills.length;
  const avgPriority = roadmapSkills.length > 0
    ? Math.round(roadmapSkills.reduce((sum, s) => sum + s.priorityScore, 0) / roadmapSkills.length)
    : 0;

  return (
    <div className={cn("w-full space-y-6", className)}>
      {/* Integration Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            Quick Actions
          </CardTitle>
          <CardDescription>
            Integrate this analysis with your career development workflow
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleAddToSkillsTracker}
              disabled={isAddingToSkillsTracker || totalGaps === 0}
              className="flex-1"
              variant="outline"
            >
              {isAddingToSkillsTracker ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding to Tracker...
                </>
              ) : (
                <>
                  <BookmarkPlus className="h-4 w-4 mr-2" />
                  Add All Gaps to Skills Tracker ({totalGaps})
                </>
              )}
            </Button>
            <Button
              onClick={handleCreateCareerPlan}
              disabled={isCreatingPlan || analysisData.prioritizedRoadmap.length === 0}
              className="flex-1"
            >
              {isCreatingPlan ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating Plan...
                </>
              ) : (
                <>
                  <Map className="h-4 w-4 mr-2" />
                  Create Career Plan from Roadmap
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Analysis Results Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 mb-6">
          <TabsTrigger value="overview" className="text-xs sm:text-sm">
            <BarChart3 className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="matrix" className="text-xs sm:text-sm">
            <Target className="h-4 w-4 mr-2" />
            Skills Matrix
          </TabsTrigger>
          <TabsTrigger value="radar" className="text-xs sm:text-sm">
            <TrendingUp className="h-4 w-4 mr-2" />
            Radar Chart
          </TabsTrigger>
          <TabsTrigger value="roadmap" className="text-xs sm:text-sm">
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Roadmap
          </TabsTrigger>
          <TabsTrigger value="resources" className="text-xs sm:text-sm">
            <Info className="h-4 w-4 mr-2" />
            Resources
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Analysis Overview</CardTitle>
              <CardDescription>
                Skill gap analysis for: <strong>{analysisData.targetRole}</strong>
                {analysisData.targetRoleONetCode && (
                  <span className="text-xs ml-2">({analysisData.targetRoleONetCode})</span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="p-6 border rounded-lg bg-red-50 border-red-200">
                  <div className="flex items-center justify-between mb-2">
                    <AlertCircle className="h-8 w-8 text-red-600" />
                    <Badge className="bg-red-100 text-red-800 border-red-300">
                      Critical
                    </Badge>
                  </div>
                  <div className="text-3xl font-bold text-red-900">
                    {analysisData.criticalGaps.length}
                  </div>
                  <div className="text-sm text-red-700">Critical Gaps</div>
                  <div className="text-xs text-red-600 mt-2">
                    Must-have skills for the role
                  </div>
                </div>

                <div className="p-6 border rounded-lg bg-yellow-50 border-yellow-200">
                  <div className="flex items-center justify-between mb-2">
                    <Info className="h-8 w-8 text-yellow-600" />
                    <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
                      Optional
                    </Badge>
                  </div>
                  <div className="text-3xl font-bold text-yellow-900">
                    {analysisData.niceToHaveGaps.length}
                  </div>
                  <div className="text-sm text-yellow-700">Nice-to-Have</div>
                  <div className="text-xs text-yellow-600 mt-2">
                    Beneficial but not required
                  </div>
                </div>

                <div className="p-6 border rounded-lg bg-green-50 border-green-200">
                  <div className="flex items-center justify-between mb-2">
                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                    <Badge className="bg-green-100 text-green-800 border-green-300">
                      Ready
                    </Badge>
                  </div>
                  <div className="text-3xl font-bold text-green-900">
                    {analysisData.transferableSkills.length}
                  </div>
                  <div className="text-sm text-green-700">Transferable Skills</div>
                  <div className="text-xs text-green-600 mt-2">
                    Skills you already have
                  </div>
                </div>
              </div>

              {/* Transition Type */}
              {analysisData.transitionType && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-5 w-5 text-blue-600" />
                    <span className="font-semibold text-blue-900">Transition Type</span>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800 border-blue-300 capitalize">
                    {analysisData.transitionType}
                  </Badge>
                </div>
              )}

              {/* Key Insights */}
              <div className="space-y-3">
                <h3 className="font-semibold text-lg mb-3">Key Insights</h3>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    You have <strong>{totalTransferable}</strong> transferable skills that apply
                    to your target role of <strong>{analysisData.targetRole}</strong>.
                  </p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    There are <strong>{totalGaps}</strong> total skill gaps to address, with{' '}
                    <strong>{analysisData.criticalGaps.length}</strong> being critical priorities.
                  </p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Your average skill priority score is <strong>{avgPriority}</strong>/100,
                    indicating {avgPriority >= 70 ? 'high' : avgPriority >= 40 ? 'moderate' : 'manageable'}{' '}
                    overall learning requirements.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="matrix">
          <SkillsMatrix
            criticalGaps={matrixCriticalGaps}
            niceToHaveGaps={matrixNiceToHaveGaps}
            transferableSkills={matrixTransferableSkills}
          />
        </TabsContent>

        <TabsContent value="radar">
          <RadarChart dimensions={radarDimensions} />
        </TabsContent>

        <TabsContent value="roadmap">
          <PrioritizedRoadmap skills={roadmapSkills} />
        </TabsContent>

        <TabsContent value="resources">
          <Card>
            <CardHeader>
              <CardTitle>Learning Resources</CardTitle>
              <CardDescription>
                Curated courses and materials for your skill gaps
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <Info className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Course recommendations will be available soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Helper function to calculate average level for a category
function calculateAverageLevel(
  skills: Array<{ currentLevel: number; targetLevel: number }>,
  type: 'current' | 'target'
): number {
  if (skills.length === 0) return 50; // Default middle value

  const sum = skills.reduce((acc, skill) =>
    acc + (type === 'current' ? skill.currentLevel : skill.targetLevel), 0
  );

  return Math.round(sum / skills.length);
}

// Helper function to determine phase based on time and priority
function determinePhase(timeEstimate: number, priorityScore: number): number {
  // High priority or quick tasks go to Phase 1 (Immediate)
  if (priorityScore >= 70 || timeEstimate <= 40) return 1;

  // Medium priority and time go to Phase 2 (Short-term)
  if (priorityScore >= 50 || timeEstimate <= 120) return 2;

  // Everything else is Phase 3 (Long-term)
  return 3;
}

// Helper function to convert score (0-100) to skill level
function getLevelFromScore(score: number): 'beginner' | 'intermediate' | 'advanced' | 'expert' {
  if (score >= 80) return 'expert';
  if (score >= 60) return 'advanced';
  if (score >= 30) return 'intermediate';
  return 'beginner';
}

// Helper function to convert priority score to priority level
function getPriorityFromScore(score: number): 'low' | 'medium' | 'high' {
  if (score >= 70) return 'high';
  if (score >= 40) return 'medium';
  return 'low';
}
