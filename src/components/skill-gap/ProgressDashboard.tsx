"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { RefreshCw, RotateCcw, TrendingUp, Target, CheckCircle2, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Id } from "@convex/_generated/dataModel";

interface Gap {
  skillName: string;
  onetCode?: string;
  importance: number;
  currentLevel: number;
  targetLevel: number;
  priorityScore: number;
  timeEstimate: number;
  marketDemand?: number;
}

interface TransferableSkill {
  skillName: string;
  currentLevel: number;
  applicability: number;
  transferExplanation: string;
  confidence: number;
}

interface RoadmapPhase {
  phase: number;
  skills: string[];
  estimatedDuration: number;
  milestoneTitle: string;
}

interface AnalysisMetadata {
  onetDataVersion: string;
  aiModel: string;
  affiliateClickCount: number;
  lastProgressUpdate: number;
}

interface Analysis {
  _id: Id<"skillGapAnalyses">;
  userId: Id<"users">;
  resumeId: Id<"resumes">;
  targetRole: string;
  targetRoleONetCode?: string;
  criticalGaps: Gap[];
  niceToHaveGaps: Gap[];
  transferableSkills: TransferableSkill[];
  prioritizedRoadmap: RoadmapPhase[];
  userAvailability: number;
  transitionType: string;
  completionProgress: number;
  contentHash: string;
  analysisVersion: string;
  metadata: AnalysisMetadata;
  createdAt: number;
  updatedAt: number;
}

interface HistoricalAnalysisSummary {
  id: string;
  targetRole: string;
  targetRoleONetCode?: string;
  transitionType: string;
  completionProgress: number;
  criticalGapsCount: number;
  niceToHaveGapsCount: number;
  transferableSkillsCount: number;
  roadmapPhases: number;
  userAvailability: number;
  analysisVersion: string;
  createdAt: number;
  updatedAt: number;
  metadata?: {
    onetDataVersion?: string;
    aiModel?: string;
    lastProgressUpdate?: number;
  };
}

interface ProgressDashboardProps {
  currentAnalysis: Analysis;
  onRerunComplete?: (newAnalysisId: string) => void;
}

export function ProgressDashboard({ currentAnalysis, onRerunComplete }: ProgressDashboardProps) {
  const { toast } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isRerunning, setIsRerunning] = useState(false);
  const [historicalAnalyses, setHistoricalAnalyses] = useState<HistoricalAnalysisSummary[]>([]);
  const [selectedHistoricalId, setSelectedHistoricalId] = useState<string | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  // Calculate progress metrics
  const totalGaps = currentAnalysis.criticalGaps.length + currentAnalysis.niceToHaveGaps.length;
  const closedGaps = Math.round((currentAnalysis.completionProgress / 100) * totalGaps);
  const progressPercentage = currentAnalysis.completionProgress;

  // Calculate date since analysis
  const daysSinceAnalysis = Math.floor(
    (Date.now() - currentAnalysis.createdAt) / (1000 * 60 * 60 * 24)
  );

  // Get motivational message based on progress
  const getMotivationalMessage = (progress: number): string => {
    if (progress === 100) return "Congratulations! You've closed all skill gaps!";
    if (progress >= 76) return "Almost there! Keep up the excellent work!";
    if (progress >= 26) return "Great progress! You're on the right track!";
    return "Keep learning! Every step counts!";
  };

  // Fetch historical analyses on mount
  useEffect(() => {
    fetchHistoricalAnalyses();
  }, []);

  const fetchHistoricalAnalyses = async () => {
    try {
      setIsLoadingHistory(true);
      const response = await fetch('/api/skill-gap/history');

      if (!response.ok) {
        throw new Error('Failed to fetch historical analyses');
      }

      const data = await response.json();
      setHistoricalAnalyses(data.analyses || []);
    } catch (error) {
      console.error('Error fetching historical analyses:', error);
      toast({
        title: 'Failed to load historical analyses',
        description: error instanceof Error ? error.message : 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleRefreshProgress = async () => {
    try {
      setIsRefreshing(true);

      const response = await fetch('/api/skill-gap/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          analysisId: currentAnalysis._id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to refresh progress');
      }

      const data = await response.json();

      toast({
        title: 'Progress updated',
        description: `You've made ${data.progressChange >= 0 ? '+' : ''}${data.progressChange}% progress!`,
      });

      // Trigger page refresh or state update
      if (typeof window !== 'undefined') {
        window.location.reload();
      }
    } catch (error) {
      console.error('Error refreshing progress:', error);
      toast({
        title: 'Failed to refresh progress',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleRerunAnalysis = async () => {
    try {
      setIsRerunning(true);

      const response = await fetch('/api/skill-gap/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resumeId: currentAnalysis.resumeId,
          targetRole: currentAnalysis.targetRole,
          targetRoleONetCode: currentAnalysis.targetRoleONetCode,
          userAvailability: currentAnalysis.userAvailability,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to re-run analysis');
      }

      const data = await response.json();

      if (data.contentHashChanged === false) {
        toast({
          title: 'Resume unchanged',
          description: 'Your resume content has not changed. Showing cached results.',
        });
      } else {
        toast({
          title: 'Analysis complete!',
          description: 'Your skill gap analysis has been updated.',
        });

        if (onRerunComplete) {
          onRerunComplete(data.analysisId);
        } else if (typeof window !== 'undefined') {
          window.location.reload();
        }
      }
    } catch (error) {
      console.error('Error re-running analysis:', error);
      toast({
        title: 'Analysis failed',
        description: error instanceof Error ? error.message : 'Failed to re-run analysis. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsRerunning(false);
    }
  };

  // Calculate gap closure trajectory data
  const getTrajectoryData = () => {
    // Filter historical analyses for the same target role
    const roleAnalyses = historicalAnalyses.filter(
      (analysis) => analysis.targetRole === currentAnalysis.targetRole
    );

    // Include current analysis in trajectory
    const allAnalyses = [
      ...roleAnalyses,
      {
        id: currentAnalysis._id,
        completionProgress: currentAnalysis.completionProgress,
        createdAt: currentAnalysis.createdAt,
      },
    ].sort((a, b) => a.createdAt - b.createdAt);

    return allAnalyses;
  };

  const trajectoryData = getTrajectoryData();

  // Calculate comparison with earliest analysis
  const getComparison = () => {
    if (trajectoryData.length < 2) return null;

    const earliest = trajectoryData[0];
    const current = trajectoryData[trajectoryData.length - 1];

    return {
      progressChange: current.completionProgress - earliest.completionProgress,
      daysBetween: Math.floor((current.createdAt - earliest.createdAt) / (1000 * 60 * 60 * 24)),
    };
  };

  const comparison = getComparison();

  return (
    <div className="space-y-6">
      {/* Summary Metrics Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            Progress Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Main Progress Metric */}
          <div className="text-center space-y-2">
            <div className="text-4xl font-bold text-gray-900">
              {closedGaps} of {totalGaps}
            </div>
            <p className="text-gray-600">
              You've closed {closedGaps} of {totalGaps} skill gaps since{' '}
              {new Date(currentAnalysis.createdAt).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
              })}
            </p>
            <div className="flex items-center justify-center gap-2 text-2xl font-semibold text-blue-600">
              <TrendingUp className="h-6 w-6" />
              {progressPercentage}%
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <Progress value={progressPercentage} className="h-4" />
            <div className="flex justify-between text-sm text-gray-500">
              <span>Started {daysSinceAnalysis} days ago</span>
              <span>{totalGaps - closedGaps} gaps remaining</span>
            </div>
          </div>

          {/* Motivational Message */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 text-center">
            <p className="text-lg font-semibold text-blue-900">
              {getMotivationalMessage(progressPercentage)}
            </p>
          </div>

          {/* Gap Breakdown */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-red-50 rounded-lg p-4 border border-red-200">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-sm font-medium text-gray-700">Critical Gaps</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {currentAnalysis.criticalGaps.length}
              </div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <span className="text-sm font-medium text-gray-700">Nice-to-Have</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {currentAnalysis.niceToHaveGaps.length}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={handleRefreshProgress}
              disabled={isRefreshing}
              variant="outline"
              className="flex-1"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh Progress
            </Button>
            <Button
              onClick={handleRerunAnalysis}
              disabled={isRerunning}
              className="flex-1"
            >
              <RotateCcw className={`h-4 w-4 mr-2 ${isRerunning ? 'animate-spin' : ''}`} />
              Re-run Analysis
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Gap Closure Trajectory */}
      {trajectoryData.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Gap Closure Trajectory
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Simple trajectory visualization */}
              <div className="relative pt-4 pb-2">
                {trajectoryData.map((point, index) => {
                  const isLast = index === trajectoryData.length - 1;
                  const progress = point.completionProgress;
                  const date = new Date(point.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  });

                  return (
                    <div key={point.id || index} className="mb-6 last:mb-0">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0">
                          {isLast ? (
                            <CheckCircle2 className="h-8 w-8 text-green-600 fill-green-100" />
                          ) : (
                            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                              <div className="h-4 w-4 rounded-full bg-blue-600" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-gray-900">{date}</span>
                            <span className="text-sm font-semibold text-blue-600">{progress}%</span>
                          </div>
                          <Progress value={progress} className="h-2" />
                        </div>
                      </div>
                      {!isLast && (
                        <div className="ml-4 w-0.5 h-6 bg-gray-200 my-1" />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Comparison Metrics */}
              {comparison && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Progress Improvement</p>
                      <p className="text-2xl font-bold text-green-700">
                        +{comparison.progressChange}%
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Over</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {comparison.daysBetween} days
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Historical Analyses */}
      {!isLoadingHistory && historicalAnalyses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-purple-600" />
              Historical Analyses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {historicalAnalyses
                .filter((analysis) => analysis.id !== currentAnalysis._id)
                .slice(0, 5)
                .map((analysis) => (
                  <div
                    key={analysis.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      selectedHistoricalId === analysis.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() =>
                      setSelectedHistoricalId(
                        selectedHistoricalId === analysis.id ? null : analysis.id
                      )
                    }
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{analysis.targetRole}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(analysis.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-blue-600">
                          {analysis.completionProgress}%
                        </p>
                        <p className="text-xs text-gray-500">
                          {analysis.criticalGapsCount + analysis.niceToHaveGapsCount} gaps
                        </p>
                      </div>
                    </div>

                    {/* Comparison Details (shown when selected) */}
                    {selectedHistoricalId === analysis.id && (
                      <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
                        <div className="grid grid-cols-3 gap-2 text-sm">
                          <div>
                            <p className="text-gray-500">Critical</p>
                            <p className="font-medium text-red-600">
                              {analysis.criticalGapsCount}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500">Nice-to-Have</p>
                            <p className="font-medium text-yellow-600">
                              {analysis.niceToHaveGapsCount}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500">Transferable</p>
                            <p className="font-medium text-green-600">
                              {analysis.transferableSkillsCount}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                          <span className="text-xs text-gray-500">
                            Compared to current ({currentAnalysis.completionProgress}%)
                          </span>
                          <span
                            className={`text-sm font-semibold ${
                              currentAnalysis.completionProgress > analysis.completionProgress
                                ? 'text-green-600'
                                : currentAnalysis.completionProgress < analysis.completionProgress
                                ? 'text-red-600'
                                : 'text-gray-600'
                            }`}
                          >
                            {currentAnalysis.completionProgress > analysis.completionProgress
                              ? `+${currentAnalysis.completionProgress - analysis.completionProgress}%`
                              : currentAnalysis.completionProgress < analysis.completionProgress
                              ? `${currentAnalysis.completionProgress - analysis.completionProgress}%`
                              : 'No change'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
