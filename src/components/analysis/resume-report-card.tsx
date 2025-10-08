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
  const [advancedAnalysis, setAdvancedAnalysis] = useState<AdvancedResumeAnalysis | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [analysisStats, setAnalysisStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingAI, setLoadingAI] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'detailed' | 'history' | 'suggestions'>('overview');
  const [suggestionMode, setSuggestionMode] = useState<'advanced' | 'ai'>('advanced');

  useEffect(() => {
    loadReportCard();
  }, [resumeId]);

  const loadReportCard = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Load advanced analysis as primary analysis
      const resume = await analysis.getResumeById(resumeId);
      if (!resume) {
        throw new Error('Resume not found');
      }
      
      // Check if we have cached advanced analysis
      const cachedAdvanced = await analysis.getCachedAnalysisResult(resumeId, 'advanced');
      if (cachedAdvanced) {
        setAdvancedAnalysis(cachedAdvanced);
      } else {
        // Load fresh advanced analysis and save it
        const advancedResult = await analysis.performAdvancedResumeAnalysis(resume);
        setAdvancedAnalysis(advancedResult);
        
        // Save the analysis result for tracking
        try {
          const contentHash = await analysis.calculateContentHash(resume);
          await analysis.saveAnalysisResult(resumeId, 'advanced', advancedResult, contentHash);
        } catch (saveError) {
          console.warn('Failed to save analysis result:', saveError);
        }
      }
      
      // Check if we have cached AI analysis
      const cachedAI = await analysis.getCachedAnalysisResult(resumeId, 'ai-powered');
      if (cachedAI) {
        setAiAnalysis(cachedAI);
      }
      
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

  const loadAIAnalysis = async () => {
    try {
      setLoadingAI(true);
      const resume = await analysis.getResumeById(resumeId);
      if (!resume) {
        throw new Error('Resume not found');
      }
      
      const aiResult = await (analysis as any).performAIPoweredAnalysis(resume);
      setAiAnalysis(aiResult);
    } catch (err) {
      console.error('Failed to load AI analysis:', err);
    } finally {
      setLoadingAI(false);
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

  // Generate actionable suggestions based on analysis results
  const generateActionableSuggestions = (analysis: AdvancedResumeAnalysis) => {
    const suggestions = [];
    
    // Analyze each category and generate specific suggestions
    Object.entries(analysis.categoryScores).forEach(([category, score]) => {
      const percentage = Math.round((score.score / score.maxScore) * 100);
      
      if (percentage < 60) {
        // Low scoring categories need high priority suggestions
        switch (category) {
          case 'contentQuality':
            suggestions.push({
              title: 'Enhance Content Quality',
              description: 'Your resume content needs significant improvement in clarity, specificity, and impact.',
              priority: 'high' as const,
              actions: [
                'Add quantified achievements with specific numbers and percentages',
                'Use strong action verbs (led, implemented, increased, reduced)',
                'Replace generic descriptions with specific accomplishments',
                'Include metrics for all major achievements (e.g., "increased sales by 25%")'
              ],
              impact: 'High - Content quality is crucial for ATS systems and human reviewers'
            });
            break;
          case 'structuralIntegrity':
            suggestions.push({
              title: 'Improve Resume Structure',
              description: 'Your resume structure and organization need improvement for better readability.',
              priority: 'high' as const,
              actions: [
                'Use consistent formatting throughout the document',
                'Organize sections in logical order (Contact, Summary, Experience, Education)',
                'Use bullet points for easy scanning',
                'Ensure proper spacing and margins for readability'
              ],
              impact: 'High - Poor structure makes it difficult for recruiters to find key information'
            });
            break;
          case 'skillsAlignment':
            suggestions.push({
              title: 'Align Skills with Target Roles',
              description: 'Your skills section needs better alignment with industry requirements.',
              priority: 'medium' as const,
              actions: [
                'Research job descriptions for your target roles',
                'Add relevant technical and soft skills',
                'Include industry-specific certifications',
                'Prioritize skills mentioned in job postings'
              ],
              impact: 'Medium - Better skill alignment increases ATS matching scores'
            });
            break;
          case 'atsOptimization':
            suggestions.push({
              title: 'Optimize for ATS Systems',
              description: 'Your resume needs better ATS optimization for automated screening.',
              priority: 'high' as const,
              actions: [
                'Use standard section headings (Experience, Education, Skills)',
                'Avoid graphics, tables, or complex formatting',
                'Include relevant keywords from job descriptions',
                'Use a simple, clean font like Arial or Calibri'
              ],
              impact: 'High - ATS optimization is critical for passing initial screening'
            });
            break;
        }
      } else if (percentage < 80) {
        // Medium scoring categories need medium priority suggestions
        switch (category) {
          case 'experienceDepth':
            suggestions.push({
              title: 'Deepen Experience Descriptions',
              description: 'Your experience descriptions could be more detailed and impactful.',
              priority: 'medium' as const,
              actions: [
                'Add more context about your role and responsibilities',
                'Include specific projects and their outcomes',
                'Highlight leadership and collaboration examples',
                'Show progression and growth in your career'
              ],
              impact: 'Medium - Deeper experience descriptions help recruiters understand your value'
            });
            break;
          case 'careerProgression':
            suggestions.push({
              title: 'Highlight Career Progression',
              description: 'Better showcase your career advancement and increasing responsibilities.',
              priority: 'medium' as const,
              actions: [
                'Emphasize promotions and role changes',
                'Show increasing scope of responsibilities',
                'Highlight leadership development',
                'Include relevant training and development'
              ],
              impact: 'Medium - Clear progression shows career growth potential'
            });
            break;
        }
      }
    });
    
    // Add general suggestions based on overall score
    if (analysis.overallScore < 70) {
      suggestions.push({
        title: 'Consider Professional Resume Review',
        description: 'Your resume would benefit from professional review and coaching.',
        priority: 'high' as const,
        actions: [
          'Engage with our virtual HR coach for personalized guidance',
          'Get feedback from industry professionals',
          'Consider professional resume writing services',
          'Practice with mock interviews to refine your pitch'
        ],
        impact: 'High - Professional guidance can significantly improve your resume quality'
      });
    }
    
    return suggestions;
  };

  if (!advancedAnalysis) return null;

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
              {!aiAnalysis && (
                <Button 
                  onClick={loadAIAnalysis} 
                  variant="outline" 
                  size="sm"
                  disabled={loadingAI}
                  className="border-purple-200 text-purple-700 hover:bg-purple-50"
                >
                  {loadingAI ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      AI Analyzing...
                    </>
                  ) : (
                    <>
                      <Brain className="h-4 w-4 mr-2" />
                      AI Analysis
                    </>
                  )}
                </Button>
              )}
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
                <div className="text-2xl font-bold">{getGrade(advancedAnalysis.overallScore)}</div>
                <div className="text-xs opacity-90">Grade</div>
              </div>
            </div>
            <div className={`text-4xl font-bold ${getScoreColor(advancedAnalysis.overallScore)}`}>
              {advancedAnalysis.overallScore}
            </div>
            <div className="text-sm text-gray-600 mb-2">out of 100</div>
            <div className="flex items-center justify-center gap-2 mb-2">
              <Badge variant={getScoreBadgeVariant(advancedAnalysis.overallScore)} className="text-sm">
                {getScoreLabel(advancedAnalysis.overallScore)}
              </Badge>
              <Badge variant="outline" className="text-xs">Advanced Analysis</Badge>
              {aiAnalysis && (
                <Badge variant="default" className="text-xs bg-purple-600">AI Enhanced</Badge>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <Progress value={advancedAnalysis.overallScore} className="mb-4" />

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
            {/* Summary Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Analysis Summary
                </CardTitle>
                <CardDescription>
                  Key insights and overall performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600 mb-2">
                      {advancedAnalysis.overallScore}/100
                    </div>
                    <div className="text-sm text-gray-600">
                      Overall Resume Score
                    </div>
                    <Badge variant={getScoreBadgeVariant(advancedAnalysis.overallScore)} className="mt-2">
                      {getScoreLabel(advancedAnalysis.overallScore)}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="p-3 bg-green-50 rounded-lg">
                      <div className="text-lg font-bold text-green-600">
                        {advancedAnalysis.detailedInsights.strengths.length}
                      </div>
                      <div className="text-xs text-green-700">Strengths</div>
                    </div>
                    <div className="p-3 bg-red-50 rounded-lg">
                      <div className="text-lg font-bold text-red-600">
                        {advancedAnalysis.detailedInsights.weaknesses.length}
                      </div>
                      <div className="text-xs text-red-700">Areas to Improve</div>
                    </div>
                  </div>

                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="text-sm font-medium text-blue-900 mb-1">Top Strength</div>
                    <div className="text-sm text-blue-700">
                      {advancedAnalysis.detailedInsights.strengths[0]?.description || 'No strengths identified'}
                    </div>
                  </div>

                  <div className="p-3 bg-orange-50 rounded-lg">
                    <div className="text-sm font-medium text-orange-900 mb-1">Priority Improvement</div>
                    <div className="text-sm text-orange-700">
                      {advancedAnalysis.detailedInsights.weaknesses[0]?.description || 'No weaknesses identified'}
                    </div>
                  </div>
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
                    {advancedAnalysis.detailedInsights.strengths.map((strength, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                          <div className="font-medium">{strength.description}</div>
                          <div className="text-xs text-gray-600 mt-1">{strength.category}</div>
                        </div>
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
                    {advancedAnalysis.detailedInsights.weaknesses.map((weakness, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                          <div className="font-medium">{weakness.description}</div>
                          <div className="text-xs text-gray-600 mt-1">{weakness.category}</div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="detailed" className="mt-6">
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
                        {Math.round((score.score / score.maxScore) * 100)}%
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        {category.replace(/([A-Z])/g, ' $1').trim()}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {score.score}/{score.maxScore} points
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Detailed Score Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Detailed Score Breakdown
                </CardTitle>
                <CardDescription>
                  Comprehensive analysis across all evaluation categories
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(advancedAnalysis.categoryScores).map(([category, categoryData]) => (
                    <div key={category} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium capitalize">
                          {category.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        <span className={`text-sm font-bold ${getScoreColor(categoryData.score)}`}>
                          {Math.round((categoryData.score / categoryData.maxScore) * 100)}% ({categoryData.score}/{categoryData.maxScore})
                        </span>
                      </div>
                      <Progress value={(categoryData.score / categoryData.maxScore) * 100} className="h-2" />
                      <div className="text-xs text-gray-500">
                        {categoryData.score >= categoryData.maxScore * 0.8 ? 'Excellent' :
                         categoryData.score >= categoryData.maxScore * 0.6 ? 'Good' :
                         categoryData.score >= categoryData.maxScore * 0.4 ? 'Fair' : 'Needs Improvement'}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
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
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5" />
                    Improvement Suggestions
                  </CardTitle>
                  <CardDescription>
                    Prioritized recommendations to enhance your resume
                  </CardDescription>
                </div>
                {aiAnalysis && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Analysis Mode:</span>
                    <div className="flex border rounded-lg">
                      <button
                        onClick={() => setSuggestionMode('advanced')}
                        className={`px-3 py-1 text-xs rounded-l-lg ${
                          suggestionMode === 'advanced' 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        Advanced
                      </button>
                      <button
                        onClick={() => setSuggestionMode('ai')}
                        className={`px-3 py-1 text-xs rounded-r-lg ${
                          suggestionMode === 'ai' 
                            ? 'bg-purple-600 text-white' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        AI-Powered
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {suggestionMode === 'advanced' ? (
                  // Enhanced suggestions based on analysis results
                  generateActionableSuggestions(advancedAnalysis).map((suggestion, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium">{suggestion.title}</h4>
                        <Badge variant={suggestion.priority === 'high' ? 'destructive' : suggestion.priority === 'medium' ? 'default' : 'secondary'}>
                          {suggestion.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{suggestion.description}</p>
                      <div className="space-y-2">
                        <h5 className="text-sm font-medium text-gray-700">Action Items:</h5>
                        <ul className="space-y-1">
                          {suggestion.actions.map((action, actionIndex) => (
                            <li key={actionIndex} className="text-sm text-gray-600 flex items-start gap-2">
                              <span className="text-blue-600 mt-1">•</span>
                              {action}
                            </li>
                          ))}
                        </ul>
                      </div>
                      {suggestion.impact && (
                        <div className="mt-3 p-2 bg-blue-50 rounded text-xs text-blue-700">
                          <strong>Expected Impact:</strong> {suggestion.impact}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  // AI-powered suggestions
                  (aiAnalysis?.recommendations || []).map((rec: any, index: number) => (
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
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Coaching Prompt */}
      {(advancedAnalysis.overallScore < 70 || (aiAnalysis && aiAnalysis.overallScore < 70)) && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-blue-900">Ready for Growth</span>
            </div>
            <p className="text-blue-800 text-sm mb-3">
              Your resume shows great potential for skill development and career capital building.
            </p>
            <Button onClick={onCoachingPrompt} size="sm">
              Start Growth Coaching Session
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
