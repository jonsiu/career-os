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
  Star,
  Clock,
  Download,
  RefreshCw,
  History
} from "lucide-react";
import { ResumeQualityScore } from "@/lib/abstractions/types";
import { AdvancedResumeAnalysis } from "@/lib/abstractions/providers/advanced-resume-analysis";
import { analysis } from "@/lib/abstractions";

interface ResumeReportCardProps {
  resumeId: string;
  onCoachingPrompt?: () => void;
}

export function ResumeReportCard({ resumeId, onCoachingPrompt }: ResumeReportCardProps) {
  const [basicAnalysis, setBasicAnalysis] = useState<ResumeQualityScore | null>(null);
  const [advancedAnalysis, setAdvancedAnalysis] = useState<AdvancedResumeAnalysis | null>(null);
  const [analysisStats, setAnalysisStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'detailed' | 'history' | 'suggestions'>('overview');

  useEffect(() => {
    loadReportCard();
  }, [resumeId]);

  const loadReportCard = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Load basic analysis
      const resume = await analysis.getResumeById(resumeId);
      if (!resume) {
        throw new Error('Resume not found');
      }
      
      const basicResult = await analysis.scoreResumeQuality(resume);
      setBasicAnalysis(basicResult);
      
      // Load analysis stats
      const stats = await analysis.getAnalysisStats(resumeId);
      setAnalysisStats(stats);
      
    } catch (err) {
      console.error('Failed to load report card:', err);
      setError(err instanceof Error ? err.message : 'Failed to load analysis');
    } finally {
      setIsLoading(false);
    }
  };

  const loadAdvancedAnalysis = async () => {
    try {
      const resume = await analysis.getResumeById(resumeId);
      if (!resume) {
        throw new Error('Resume not found');
      }
      
      const advancedResult = await analysis.performAdvancedResumeAnalysis(resume);
      setAdvancedAnalysis(advancedResult);
    } catch (err) {
      console.error('Failed to load advanced analysis:', err);
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

  const getGrade = (score: number) => {
    if (score >= 90) return "A+";
    if (score >= 85) return "A";
    if (score >= 80) return "A-";
    if (score >= 75) return "B+";
    if (score >= 70) return "B";
    if (score >= 65) return "B-";
    if (score >= 60) return "C+";
    if (score >= 55) return "C";
    if (score >= 50) return "C-";
    if (score >= 45) return "D+";
    if (score >= 40) return "D";
    return "F";
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Resume Report Card
          </CardTitle>
          <CardDescription>
            Generating your comprehensive resume analysis report
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
          <Button onClick={loadReportCard} variant="outline">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!basicAnalysis) return null;

  return (
    <div className="space-y-6">
      {/* Report Card Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Resume Report Card
              </CardTitle>
              <CardDescription>
                Comprehensive analysis of your resume quality and performance
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button onClick={loadReportCard} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Overall Grade */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{getGrade(basicAnalysis.overallScore)}</div>
                <div className="text-xs opacity-90">Grade</div>
              </div>
            </div>
            <div className={`text-4xl font-bold ${getScoreColor(basicAnalysis.overallScore)}`}>
              {basicAnalysis.overallScore}
            </div>
            <div className="text-sm text-gray-600 mb-2">out of 100</div>
            <Badge variant={getScoreBadgeVariant(basicAnalysis.overallScore)} className="text-sm">
              {getScoreLabel(basicAnalysis.overallScore)}
            </Badge>
          </div>

          {/* Progress Bar */}
          <Progress value={basicAnalysis.overallScore} className="mb-4" />

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {analysisStats?.totalAnalyses || 0}
              </div>
              <div className="text-sm text-gray-600">Analyses</div>
            </div>
            <div>
              <div className={`text-2xl font-bold ${analysisStats?.scoreTrend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {analysisStats?.scoreTrend >= 0 ? '+' : ''}{analysisStats?.scoreTrend || 0}
              </div>
              <div className="text-sm text-gray-600">Trend</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {analysisStats?.improvementCount || 0}
              </div>
              <div className="text-sm text-gray-600">Improvements</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Card Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="detailed" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Detailed
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            History
          </TabsTrigger>
          <TabsTrigger value="suggestions" className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            Suggestions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Score Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Score Breakdown
                </CardTitle>
                <CardDescription>
                  Performance across key evaluation categories
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(basicAnalysis.scoreBreakdown).map(([category, score]) => (
                    <div key={category} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium capitalize">
                          {category.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        <span className={`text-sm font-bold ${getScoreColor(score as number)}`}>
                          {score}/25
                        </span>
                      </div>
                      <Progress value={(score as number / 25) * 100} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Strengths & Weaknesses */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-700">
                    <TrendingUp className="h-5 w-5" />
                    Strengths
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {basicAnalysis.strengths.map((strength, index) => (
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
                    {basicAnalysis.weaknesses.map((weakness, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{weakness}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="detailed" className="mt-6">
          {!advancedAnalysis ? (
            <Card>
              <CardContent className="py-8">
                <div className="text-center">
                  <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Advanced Analysis</h3>
                  <p className="text-gray-600 mb-4">
                    Get detailed insights with our research-based analysis framework
                  </p>
                  <Button onClick={loadAdvancedAnalysis}>
                    <Brain className="h-4 w-4 mr-2" />
                    Run Advanced Analysis
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Advanced Analysis Results */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    Advanced Analysis Results
                  </CardTitle>
                  <CardDescription>
                    Research-based evaluation across 8 comprehensive categories
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(advancedAnalysis.categoryScores).map(([category, score]) => (
                      <div key={category} className="text-center p-4 border rounded-lg">
                        <div className={`text-2xl font-bold ${getScoreColor(score.score)}`}>
                          {Math.round((score.score / score.maxScore) * 100)}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          {category.replace(/([A-Z])/g, ' $1').trim()}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Analysis History
              </CardTitle>
              <CardDescription>
                Track your resume improvement over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              {analysisStats?.analyses && analysisStats.analyses.length > 0 ? (
                <div className="space-y-4">
                  {analysisStats.analyses.map((analysis: any, index: number) => (
                    <div key={analysis._id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className={`text-2xl font-bold ${getScoreColor(analysis.overallScore)}`}>
                          {analysis.overallScore}
                        </div>
                        <div>
                          <div className="font-medium">
                            {new Date(analysis.createdAt).toLocaleDateString()}
                          </div>
                          <div className="text-sm text-gray-600">
                            {analysis.analysisType} analysis
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={getScoreBadgeVariant(analysis.overallScore)}>
                          {getScoreLabel(analysis.overallScore)}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No History Yet</h3>
                  <p className="text-gray-600">
                    Your analysis history will appear here as you make improvements to your resume.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="suggestions" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Improvement Suggestions
              </CardTitle>
              <CardDescription>
                Prioritized recommendations to enhance your resume
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {basicAnalysis.recommendations.map((rec, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium">{rec.title}</h4>
                      <Badge variant={rec.priority === 'high' ? 'destructive' : rec.priority === 'medium' ? 'default' : 'secondary'}>
                        {rec.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{rec.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Category: {rec.category}</span>
                      <span>Impact: {rec.impact}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Coaching Prompt */}
      {basicAnalysis.coachingPrompt && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
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
          </CardContent>
        </Card>
      )}
    </div>
  );
}
