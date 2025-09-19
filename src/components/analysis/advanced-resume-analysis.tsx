"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  CheckCircle, 
  AlertCircle,
  Lightbulb,
  Users,
  BarChart3,
  Loader2,
  Eye,
  Brain,
  Award,
  Zap,
  Shield,
  Globe,
  FileText,
  Star
} from "lucide-react";
import { AdvancedResumeAnalysis } from "@/lib/abstractions/providers/advanced-resume-analysis";
import { analysis } from "@/lib/abstractions";
import { Resume } from "@/lib/abstractions/types";

interface AdvancedResumeAnalysisProps {
  resumeId: string;
  onCoachingPrompt?: () => void;
}

export function AdvancedResumeAnalysisComponent({ resumeId, onCoachingPrompt }: AdvancedResumeAnalysisProps) {
  const [analysis, setAnalysis] = useState<AdvancedResumeAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAdvancedAnalysis();
  }, [resumeId]);

  const loadAdvancedAnalysis = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Get resume data first
      const resume = await analysis.getResumeById(resumeId);
      if (!resume) {
        throw new Error('Resume not found');
      }
      
      // Perform advanced analysis
      const advancedAnalysis = await analysis.performAdvancedResumeAnalysis(resume);
      setAnalysis(advancedAnalysis);
    } catch (err) {
      console.error('Failed to load advanced analysis:', err);
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

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'contentQuality': return <FileText className="h-4 w-4" />;
      case 'structuralIntegrity': return <Target className="h-4 w-4" />;
      case 'professionalPresentation': return <Award className="h-4 w-4" />;
      case 'skillsAlignment': return <Zap className="h-4 w-4" />;
      case 'experienceDepth': return <Users className="h-4 w-4" />;
      case 'careerProgression': return <TrendingUp className="h-4 w-4" />;
      case 'atsOptimization': return <Shield className="h-4 w-4" />;
      case 'industryRelevance': return <Globe className="h-4 w-4" />;
      default: return <BarChart3 className="h-4 w-4" />;
    }
  };

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'contentQuality': return 'Content Quality';
      case 'structuralIntegrity': return 'Structural Integrity';
      case 'professionalPresentation': return 'Professional Presentation';
      case 'skillsAlignment': return 'Skills Alignment';
      case 'experienceDepth': return 'Experience Depth';
      case 'careerProgression': return 'Career Progression';
      case 'atsOptimization': return 'ATS Optimization';
      case 'industryRelevance': return 'Industry Relevance';
      default: return category;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Advanced Resume Analysis
          </CardTitle>
          <CardDescription>
            Performing comprehensive analysis using academic research frameworks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Analyzing resume with advanced algorithms...</span>
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
          <Button onClick={loadAdvancedAnalysis} variant="outline">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!analysis) return null;

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Advanced Resume Analysis
          </CardTitle>
          <CardDescription>
            Comprehensive analysis based on academic research and HR best practices
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-6">
            <div className="text-center">
              <div className={`text-4xl font-bold ${getScoreColor(analysis.overallScore)}`}>
                {analysis.overallScore}
              </div>
              <div className="text-sm text-gray-600">out of 100</div>
              <Badge variant={getScoreBadgeVariant(analysis.overallScore)} className="mt-2">
                {getScoreLabel(analysis.overallScore)}
              </Badge>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">Industry Benchmark</div>
              <div className="text-lg font-semibold">{analysis.benchmarking.industryAverage}</div>
              <div className="text-sm text-gray-500">
                You're in the {analysis.benchmarking.percentile}th percentile
              </div>
            </div>
          </div>
          
          <Progress value={analysis.overallScore} className="mb-4" />
          
          {analysis.recruiterPerspective.firstImpression.score < 70 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-blue-900">Coaching Recommended</span>
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

      {/* Category Scores */}
      <Card>
        <CardHeader>
          <CardTitle>Category Analysis</CardTitle>
          <CardDescription>
            Detailed breakdown across 8 key evaluation categories
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(analysis.categoryScores).map(([category, score]) => (
              <div key={category} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(category)}
                    <span className="font-medium">{getCategoryName(category)}</span>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${getScoreColor(score.score)}`}>
                      {Math.round((score.score / score.maxScore) * 100)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {score.score}/{score.maxScore}
                    </div>
                  </div>
                </div>
                <Progress 
                  value={(score.score / score.maxScore) * 100} 
                  className="mb-2" 
                />
                <div className="text-xs text-gray-600">
                  {score.insights.slice(0, 2).map((insight, index) => (
                    <div key={index} className="truncate">• {insight}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Analysis Tabs */}
      <Tabs defaultValue="insights" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="recruiter">Recruiter View</TabsTrigger>
          <TabsTrigger value="benchmarking">Benchmarking</TabsTrigger>
        </TabsList>

        <TabsContent value="insights" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Strengths */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-700">
                  <TrendingUp className="h-5 w-5" />
                  Strengths
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysis.detailedInsights.strengths.map((strength, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="text-sm font-medium">{strength.description}</span>
                        <div className="text-xs text-gray-500 mt-1">
                          {strength.evidence.slice(0, 2).map((evidence, i) => (
                            <div key={i}>• {evidence}</div>
                          ))}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Weaknesses */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-700">
                  <TrendingDown className="h-5 w-5" />
                  Areas for Improvement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysis.detailedInsights.weaknesses.map((weakness, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="text-sm font-medium">{weakness.description}</span>
                        <div className="text-xs text-gray-500 mt-1">
                          Improvement potential: {weakness.improvementPotential}%
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="recommendations" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Advanced Recommendations
              </CardTitle>
              <CardDescription>
                Prioritized, actionable recommendations based on academic research
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analysis.recommendations.map((rec, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium">{rec.title}</h4>
                      <div className="flex gap-2">
                        <Badge variant={rec.priority === 'critical' ? 'destructive' : rec.priority === 'high' ? 'default' : 'secondary'}>
                          {rec.priority}
                        </Badge>
                        <Badge variant="outline">
                          {rec.expectedImpact}% impact
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{rec.description}</p>
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Specific Actions:</div>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {rec.specificActions.slice(0, 3).map((action, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-blue-600 mt-1">•</span>
                            <span>{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                      <span>Timeline: {rec.timeline}</span>
                      <span>Effort: {rec.effortRequired}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recruiter" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  First Impression
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-4">
                  <div className={`text-3xl font-bold ${getScoreColor(analysis.recruiterPerspective.firstImpression.score)}`}>
                    {analysis.recruiterPerspective.firstImpression.score}
                  </div>
                  <div className="text-sm text-gray-600">First Impression Score</div>
                </div>
                <div className="text-sm text-gray-600">
                  <div className="font-medium mb-2">Decision Time: {analysis.recruiterPerspective.firstImpression.timeToDecision}</div>
                  <div className="space-y-1">
                    {analysis.recruiterPerspective.firstImpression.factors.map((factor, index) => (
                      <div key={index}>• {factor}</div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Interview Likelihood
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-4">
                  <div className={`text-3xl font-bold ${getScoreColor(analysis.recruiterPerspective.interviewLikelihood.probability)}`}>
                    {analysis.recruiterPerspective.interviewLikelihood.probability}%
                  </div>
                  <div className="text-sm text-gray-600">Interview Probability</div>
                </div>
                <div className="text-sm text-gray-600">
                  <div className="font-medium mb-2">Key Factors:</div>
                  <div className="space-y-1">
                    {analysis.recruiterPerspective.interviewLikelihood.factors.map((factor, index) => (
                      <div key={index}>• {factor}</div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="benchmarking" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Industry Comparison
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Industry Average</span>
                    <span className="font-medium">{analysis.benchmarking.industryAverage}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Your Score</span>
                    <span className="font-medium">{analysis.overallScore}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Percentile</span>
                    <span className="font-medium">{analysis.benchmarking.percentile}th</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Peer Comparison
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Level</span>
                    <span className="font-medium">{analysis.benchmarking.peerComparison.level}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Peer Average</span>
                    <span className="font-medium">{analysis.benchmarking.peerComparison.averageScore}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Your Score</span>
                    <span className="font-medium">{analysis.benchmarking.peerComparison.yourScore}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Gap</span>
                    <span className={`font-medium ${analysis.benchmarking.peerComparison.gap >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {analysis.benchmarking.peerComparison.gap >= 0 ? '+' : ''}{analysis.benchmarking.peerComparison.gap}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
