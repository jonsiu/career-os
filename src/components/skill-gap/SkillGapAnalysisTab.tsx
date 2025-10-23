"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lightbulb, Plus, RefreshCw } from "lucide-react";
import { SkillGapWizard } from "./SkillGapWizard";
import { AnalysisResults, SkillGapAnalysisData } from "./AnalysisResults";
import { useToast } from "@/hooks/use-toast";

interface SkillGapAnalysisTabProps {
  userId: string;
}

export function SkillGapAnalysisTab({ userId }: SkillGapAnalysisTabProps) {
  const { toast } = useToast();
  const [showWizard, setShowWizard] = useState(false);
  const [analyses, setAnalyses] = useState<SkillGapAnalysisData[]>([]);
  const [currentAnalysis, setCurrentAnalysis] = useState<SkillGapAnalysisData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [resumeId, setResumeId] = useState<string | null>(null);

  const loadAnalyses = useCallback(async () => {
    try {
      setIsLoading(true);

      // Fetch user's resumes to get the most recent one
      const resumesResponse = await fetch('/api/resumes');
      if (resumesResponse.ok) {
        const resumesData = await resumesResponse.json();
        if (resumesData.resumes && resumesData.resumes.length > 0) {
          setResumeId(resumesData.resumes[0].id);
        }
      }

      // Fetch skill gap analyses
      const analysesResponse = await fetch('/api/skill-gap/history');
      if (analysesResponse.ok) {
        const analysesData = await analysesResponse.json();
        setAnalyses(analysesData.analyses || []);

        // Set the most recent analysis as current
        if (analysesData.analyses && analysesData.analyses.length > 0) {
          setCurrentAnalysis(analysesData.analyses[0]);
        }
      }
    } catch (error) {
      console.error('Failed to load analyses:', error);
      toast({
        title: 'Failed to load analyses',
        description: 'Could not load your skill gap analyses. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadAnalyses();
  }, [loadAnalyses]);

  const handleStartNewAnalysis = () => {
    if (!resumeId) {
      toast({
        title: 'No resume found',
        description: 'Please upload a resume first before running skill gap analysis.',
        variant: 'destructive',
      });
      return;
    }
    setShowWizard(true);
  };

  const handleAnalysisComplete = async (analysisId: string) => {
    setShowWizard(false);

    // Fetch the newly created analysis
    try {
      const response = await fetch(`/api/skill-gap/${analysisId}`);
      if (response.ok) {
        const data = await response.json();
        setCurrentAnalysis(data.analysis);
        setAnalyses(prev => [data.analysis, ...prev]);

        toast({
          title: 'Analysis complete',
          description: 'Your skill gap analysis has been completed successfully.',
        });
      }
    } catch (error) {
      console.error('Failed to fetch analysis:', error);
      // Reload all analyses as fallback
      loadAnalyses();
    }
  };

  const handleCancelWizard = () => {
    setShowWizard(false);
  };

  const handleReanalyze = () => {
    setShowWizard(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Loading...</h3>
        </div>
      </div>
    );
  }

  // Show wizard in full screen mode
  if (showWizard && resumeId) {
    return (
      <SkillGapWizard
        userId={userId}
        resumeId={resumeId}
        onComplete={handleAnalysisComplete}
        onCancel={handleCancelWizard}
      />
    );
  }

  // Show empty state if no analyses exist
  if (!currentAnalysis && analyses.length === 0) {
    return (
      <Card className="border-2 border-dashed border-gray-300">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Lightbulb className="h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Identify Your Skill Gaps
          </h3>
          <p className="text-gray-600 text-center max-w-md mb-6">
            Compare your current skills against your target role requirements and get a
            prioritized learning roadmap with course recommendations.
          </p>
          <Button onClick={handleStartNewAnalysis} size="lg">
            <Plus className="h-5 w-5 mr-2" />
            Start Skill Gap Analysis
          </Button>
          {!resumeId && (
            <p className="text-sm text-orange-600 mt-4">
              Note: Please upload a resume first to run skill gap analysis.
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  // Show current analysis results
  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Skill Gap Analysis</h2>
          <p className="text-gray-600">
            Identify and prioritize skills needed for your career transition
          </p>
        </div>
        <div className="flex gap-2">
          {analyses.length > 0 && (
            <Button variant="outline" onClick={() => loadAnalyses()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          )}
          <Button onClick={handleStartNewAnalysis}>
            <Plus className="h-4 w-4 mr-2" />
            New Analysis
          </Button>
        </div>
      </div>

      {/* Analysis history selector */}
      {analyses.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Previous Analyses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 overflow-x-auto">
              {analyses.map((analysis) => (
                <Button
                  key={analysis.id}
                  variant={currentAnalysis?.id === analysis.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCurrentAnalysis(analysis)}
                  className="whitespace-nowrap"
                >
                  {analysis.targetRole} - {new Date(analysis.createdAt).toLocaleDateString()}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current analysis results */}
      {currentAnalysis && (
        <AnalysisResults
          analysis={currentAnalysis}
          onReanalyze={handleReanalyze}
        />
      )}
    </div>
  );
}
