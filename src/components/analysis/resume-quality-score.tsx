"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  CheckCircle, 
  AlertCircle,
  Lightbulb,
  Users,
  BarChart3,
  Loader2
} from "lucide-react";
import { ResumeQualityScore } from "@/lib/abstractions/types";
import { analysis } from "@/lib/abstractions";

interface ResumeQualityScoreProps {
  resumeId: string;
  onCoachingPrompt?: () => void;
}

export function ResumeQualityScoreComponent({ resumeId, onCoachingPrompt }: ResumeQualityScoreProps) {
  const [score, setScore] = useState<ResumeQualityScore | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadResumeScore();
  }, [resumeId]);

  const loadResumeScore = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Get resume data first
      const resume = await analysis.getResumeById(resumeId);
      if (!resume) {
        throw new Error('Resume not found');
      }
      
      // Score the resume
      const qualityScore = await analysis.scoreResumeQuality(resume);
      setScore(qualityScore);
    } catch (err) {
      console.error('Failed to load resume score:', err);
      setError(err instanceof Error ? err.message : 'Failed to analyze resume');
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 70) return "text-blue-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return "Exceptional";
    if (score >= 80) return "Strong";
    if (score >= 70) return "Good";
    if (score >= 60) return "Fair";
    return "Needs Improvement";
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 80) return "default";
    if (score >= 70) return "secondary";
    if (score >= 60) return "outline";
    return "destructive";
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Resume Quality Analysis
          </CardTitle>
          <CardDescription>
            Analyzing your resume quality and providing improvement recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Analyzing resume...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            Analysis Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={loadResumeScore} variant="outline">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!score) return null;

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Resume Quality Score
          </CardTitle>
          <CardDescription>
            Comprehensive analysis of your resume quality
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-6">
            <div className="text-center">
              <div className={`text-4xl font-bold ${getScoreColor(score.overallScore)}`}>
                {score.overallScore}
              </div>
              <div className="text-sm text-gray-600">out of 100</div>
              <Badge variant={getScoreBadgeVariant(score.overallScore)} className="mt-2">
                {getScoreLabel(score.overallScore)}
              </Badge>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">Industry Benchmark</div>
              <div className="text-lg font-semibold">{score.industryBenchmark.average}</div>
              <div className="text-sm text-gray-500">
                You're in the {score.industryBenchmark.percentile}th percentile
              </div>
            </div>
          </div>
          
          <Progress value={score.overallScore} className="mb-4" />
          
          {score.coachingPrompt && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-blue-900">Ready for Coaching</span>
              </div>
              <p className="text-blue-800 text-sm mb-3">
                Your resume could benefit from personalized coaching to improve its impact and effectiveness.
              </p>
              <Button onClick={onCoachingPrompt} size="sm">
                Start Virtual HR Coach Session
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Score Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Score Breakdown</CardTitle>
          <CardDescription>
            Detailed analysis across key resume quality criteria
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                <span className="font-medium">Content Quality</span>
              </div>
              <div className="flex items-center gap-2">
                <Progress value={(score.scoreBreakdown.contentQuality / 25) * 100} className="w-24" />
                <span className="text-sm font-medium w-8">{score.scoreBreakdown.contentQuality}/25</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                <span className="font-medium">Structure & Format</span>
              </div>
              <div className="flex items-center gap-2">
                <Progress value={(score.scoreBreakdown.structureFormat / 20) * 100} className="w-24" />
                <span className="text-sm font-medium w-8">{score.scoreBreakdown.structureFormat}/20</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                <span className="font-medium">Keywords & Optimization</span>
              </div>
              <div className="flex items-center gap-2">
                <Progress value={(score.scoreBreakdown.keywordsOptimization / 20) * 100} className="w-24" />
                <span className="text-sm font-medium w-8">{score.scoreBreakdown.keywordsOptimization}/20</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span className="font-medium">Experience & Skills</span>
              </div>
              <div className="flex items-center gap-2">
                <Progress value={(score.scoreBreakdown.experienceSkills / 20) * 100} className="w-24" />
                <span className="text-sm font-medium w-8">{score.scoreBreakdown.experienceSkills}/20</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                <span className="font-medium">Career Narrative</span>
              </div>
              <div className="flex items-center gap-2">
                <Progress value={(score.scoreBreakdown.careerNarrative / 15) * 100} className="w-24" />
                <span className="text-sm font-medium w-8">{score.scoreBreakdown.careerNarrative}/15</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Strengths and Weaknesses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <TrendingUp className="h-5 w-5" />
              Strengths
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {score.strengths.map((strength, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{strength}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <TrendingDown className="h-5 w-5" />
              Areas for Improvement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {score.weaknesses.map((weakness, index) => (
                <li key={index} className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{weakness}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Recommendations
          </CardTitle>
          <CardDescription>
            Actionable steps to improve your resume quality
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {score.recommendations.map((rec, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium">{rec.title}</h4>
                  <Badge variant={rec.priority === 'high' ? 'destructive' : rec.priority === 'medium' ? 'default' : 'secondary'}>
                    {rec.priority}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-2">{rec.description}</p>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {rec.category}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {rec.impact} impact
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
