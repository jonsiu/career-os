"use client";

import { useState, useEffect, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart3, 
  TrendingUp, 
  Target, 
  Lightbulb, 
  Clock, 
  AlertCircle,
  Star,
  Calendar,
  BookOpen,
  Loader2,
  RefreshCw,
  Briefcase
} from "lucide-react";
import { database, analysis } from "@/lib/abstractions";
import { Resume, Job, AnalysisResult } from "@/lib/abstractions/types";

interface ResumeJobAnalysisProps {
  resumeId?: string;
  jobId?: string;
  onAnalysisComplete?: (result: AnalysisResult) => void;
}

export function ResumeJobAnalysis({ resumeId, jobId, onAnalysisComplete }: ResumeJobAnalysisProps) {
  const { user, isLoaded } = useUser();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedResume, setSelectedResume] = useState<string>(resumeId || '');
  const [selectedJob, setSelectedJob] = useState<string>(jobId || '');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadUserData = useCallback(async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      const [userResumes, userJobs] = await Promise.all([
        database.getUserResumes(user.id),
        database.getUserJobs(user.id)
      ]);
      setResumes(userResumes);
      setJobs(userJobs);
      
      if (userResumes.length > 0 && !selectedResume) {
        setSelectedResume(userResumes[0].id);
      }
      if (userJobs.length > 0 && !selectedJob) {
        setSelectedJob(userJobs[0].id);
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user, selectedResume, selectedJob]);

  useEffect(() => {
    if (user?.id && isLoaded) {
      loadUserData();
    }
  }, [user?.id, isLoaded, loadUserData]);

  const runAnalysis = async () => {
    if (!selectedResume || !selectedJob) {
      alert('Please select both a resume and a job for analysis');
      return;
    }

    try {
      setIsAnalyzing(true);
      const resume = resumes.find(r => r.id === selectedResume);
      const job = jobs.find(j => j.id === selectedJob);
      
      if (!resume || !job) {
        throw new Error('Resume or job not found');
      }

      const result = await analysis.analyzeResume(resume, job);
      setAnalysisResult(result);
      
      if (onAnalysisComplete) {
        onAnalysisComplete(result);
      }
    } catch (error) {
      console.error('Analysis failed:', error);
      alert('Analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getMatchBadgeVariant = (level: string) => {
    switch (level) {
      case 'excellent': return 'default';
      case 'good': return 'secondary';
      case 'partial': return 'outline';
      case 'missing': return 'destructive';
      default: return 'outline';
    }
  };

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 text-gray-400 mb-4 animate-spin" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Loading...</h3>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Please sign in</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Resume-Job Analysis</h1>
        <p className="mt-2 text-gray-600">
          AI-powered analysis of how well your resume matches specific job opportunities
        </p>
      </div>

      {/* Selection Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            Select Resume & Job
          </CardTitle>
          <CardDescription>
            Choose a resume and job posting to analyze the match
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Resume</label>
              <select
                value={selectedResume}
                onChange={(e) => setSelectedResume(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              >
                <option value="">Select a resume</option>
                {resumes.map((resume) => (
                  <option key={resume.id} value={resume.id}>
                    {resume.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Job Posting</label>
              <select
                value={selectedJob}
                onChange={(e) => setSelectedJob(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              >
                <option value="">Select a job</option>
                {jobs.map((job) => (
                  <option key={job.id} value={job.id}>
                    {job.title} at {job.company}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <Button 
            onClick={runAnalysis}
            disabled={!selectedResume || !selectedJob || isAnalyzing}
            className="w-full md:w-auto"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Analyzing...
              </>
            ) : (
              <>
                <BarChart3 className="h-4 w-4 mr-2" />
                Run Analysis
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {analysisResult && (
        <div className="space-y-6">
          {/* Overall Match Score */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Overall Match Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                <div className="text-6xl font-bold text-green-600">
                  {analysisResult.matchScore}%
                </div>
                <Progress value={analysisResult.matchScore} className="h-3" />
                <p className="text-gray-600">{analysisResult.summary}</p>
              </div>
            </CardContent>
          </Card>

          {/* Skills Match */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-600" />
                Skills Match Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analysisResult.skillsMatch.map((skill, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge variant={getMatchBadgeVariant(skill.matchLevel)}>
                        {skill.matchLevel}
                      </Badge>
                      <span className="font-medium">{skill.skill}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>Confidence: {Math.round(skill.confidence * 100)}%</span>
                      <span>Relevance: {Math.round(skill.relevance * 100)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Experience Match */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-600" />
                Experience Level Assessment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {analysisResult.experienceMatch.level.toUpperCase()}
                  </div>
                  <div className="text-sm text-gray-600">Your Level</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {analysisResult.experienceMatch.yearsActual}
                  </div>
                  <div className="text-sm text-gray-600">Years Experience</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {Math.round(analysisResult.experienceMatch.confidence * 100)}%
                  </div>
                  <div className="text-sm text-gray-600">Confidence</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Skills Gaps */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-600" />
                Skills Gaps & Development Areas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analysisResult.gaps.map((gap, index) => (
                  <div key={index} className="border-l-4 border-orange-500 pl-4 py-2">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{gap.skill}</h4>
                      <Badge variant="outline" className={getImportanceColor(gap.importance)}>
                        {gap.importance} priority
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div>
                        <Clock className="h-4 w-4 inline mr-1" />
                        {gap.timeToLearn} months to learn
                      </div>
                      <div>
                        <BookOpen className="h-4 w-4 inline mr-1" />
                        {gap.resources.length} resources
                      </div>
                      <div>
                        <Star className="h-4 w-4 inline mr-1" />
                        Priority #{gap.priority}
                      </div>
                    </div>
                    <div className="mt-2">
                      <div className="text-sm font-medium text-gray-700 mb-1">Learning Resources:</div>
                      <div className="flex flex-wrap gap-2">
                        {gap.resources.map((resource, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {resource}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-600" />
                Personalized Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analysisResult.recommendations.map((rec, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{rec.title}</h4>
                      <div className="flex gap-2">
                        <Badge variant="outline" className={getImportanceColor(rec.impact)}>
                          {rec.impact} impact
                        </Badge>
                        <Badge variant="outline" className={getImportanceColor(rec.effort)}>
                          {rec.effort} effort
                        </Badge>
                      </div>
                    </div>
                    <p className="text-gray-600 mb-3">{rec.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {rec.timeline} months
                      </span>
                      <span className="flex items-center gap-1">
                        <Target className="h-4 w-4" />
                        {rec.type}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button 
              onClick={() => {
                console.log('🔄 Re-run analysis clicked');
                runAnalysis();
              }} 
              variant="outline"
              disabled={isAnalyzing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isAnalyzing ? 'animate-spin' : ''}`} />
              {isAnalyzing ? 'Analyzing...' : 'Re-run Analysis'}
            </Button>
            <Button onClick={() => {
              // For now, just show an alert. In the future, this could open a detailed modal or new page
              alert('Detailed report feature coming soon! This will show a comprehensive breakdown of the analysis.');
            }}>
              <BookOpen className="h-4 w-4 mr-2" />
              View Detailed Report
            </Button>
          </div>
        </div>
      )}

      {/* No Data State */}
      {!isLoading && resumes.length === 0 && (
        <Card className="border-2 border-dashed border-gray-300 bg-gray-50">
          <CardContent className="text-center py-12">
            <BarChart3 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Resumes Available</h3>
            <p className="text-gray-600 mb-4">
              You need to create or upload a resume first to run analysis.
            </p>
            <Button asChild>
              <a href="/dashboard/resume">Create Resume</a>
            </Button>
          </CardContent>
        </Card>
      )}

      {!isLoading && jobs.length === 0 && (
        <Card className="border-2 border-dashed border-gray-300 bg-gray-50">
          <CardContent className="text-center py-12">
            <Briefcase className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Jobs Available</h3>
            <p className="text-gray-600 mb-4">
              You need to add job postings first to run analysis.
            </p>
            <Button asChild>
              <a href="/dashboard/jobs">Add Jobs</a>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
