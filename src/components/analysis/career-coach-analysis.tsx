"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  TrendingUp, 
  Target, 
  Lightbulb, 
  Clock, 
  CheckCircle,
  AlertCircle,
  Star,
  Calendar,
  BookOpen,
  Loader2,
  RefreshCw,
  Users,
  Award,
  BarChart3,
  ArrowRight
} from "lucide-react";
import { analysis } from "@/lib/abstractions";
import { User, CareerAnalysis, SkillsGap, Recommendation } from "@/lib/abstractions/types";

interface CareerCoachAnalysisProps {
  targetRole?: string;
  onAnalysisComplete?: (result: CareerAnalysis) => void;
}

export function CareerCoachAnalysis({ targetRole, onAnalysisComplete }: CareerCoachAnalysisProps) {
  const { user, isLoaded } = useUser();
  const [targetRoleInput, setTargetRoleInput] = useState(targetRole || '');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [careerAnalysis, setCareerAnalysis] = useState<CareerAnalysis | null>(null);
  const [currentStep, setCurrentStep] = useState<'input' | 'analysis' | 'results'>('input');

  const runCareerAnalysis = async () => {
    if (!targetRoleInput.trim()) {
      alert('Please enter a target role');
      return;
    }

    try {
      setIsAnalyzing(true);
      setCurrentStep('analysis');
      
      // Mock user data for now - in real implementation, this would come from the database
      const mockUser: User = {
        id: user!.id,
        email: user!.emailAddresses[0]?.emailAddress || '',
        name: user!.fullName || 'User',
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: {
          currentRole: 'Senior Software Engineer',
          yearsExperience: 5,
          skills: ['JavaScript', 'React', 'Node.js', 'Python'],
          interests: ['Management', 'Leadership', 'Team Building']
        }
      };

      const result = await analysis.analyzeCareerTransition(mockUser, targetRoleInput);
      setCareerAnalysis(result);
      setCurrentStep('results');
      
      if (onAnalysisComplete) {
        onAnalysisComplete(result);
      }
    } catch (error) {
      console.error('Career analysis failed:', error);
      alert('Analysis failed. Please try again.');
      setCurrentStep('input');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getRiskColor = (risk: string) => {
    if (risk.includes('Lack of') || risk.includes('Weak')) return 'text-red-600';
    if (risk.includes('Limited') || risk.includes('Basic')) return 'text-yellow-600';
    return 'text-orange-600';
  };

  const getOpportunityColor = (opportunity: string) => {
    if (opportunity.includes('Strong') || opportunity.includes('Excellent')) return 'text-green-600';
    if (opportunity.includes('Good') || opportunity.includes('Solid')) return 'text-blue-600';
    return 'text-purple-600';
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
        <h1 className="text-3xl font-bold text-gray-900">Career Coach Analysis</h1>
        <p className="mt-2 text-gray-600">
          AI-powered insights for your career transition and management readiness
        </p>
      </div>

      {/* Input Step */}
      {currentStep === 'input' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              Define Your Career Goal
            </CardTitle>
            <CardDescription>
              Tell us about the role you want to transition to
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="target-role">Target Role *</Label>
              <Input
                id="target-role"
                value={targetRoleInput}
                onChange={(e) => setTargetRoleInput(e.target.value)}
                placeholder="e.g., Engineering Manager, Product Manager, Tech Lead"
                className="text-lg"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <Users className="mx-auto h-8 w-8 text-blue-600 mb-2" />
                <div className="text-sm font-medium text-gray-900">Management</div>
                <div className="text-xs text-gray-600">Team leadership</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <TrendingUp className="mx-auto h-8 w-8 text-green-600 mb-2" />
                <div className="text-sm font-medium text-gray-900">Growth</div>
                <div className="text-xs text-gray-600">Career advancement</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <Award className="mx-auto h-8 w-8 text-purple-600 mb-2" />
                <div className="text-sm font-medium text-gray-900">Recognition</div>
                <div className="text-xs text-gray-600">Professional achievement</div>
              </div>
            </div>

            <Button 
              onClick={runCareerAnalysis}
              disabled={!targetRoleInput.trim()}
              className="w-full md:w-auto"
              size="lg"
            >
              <TrendingUp className="h-5 w-5 mr-2" />
              Analyze Career Transition
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Analysis Step */}
      {currentStep === 'analysis' && (
        <Card>
          <CardContent className="text-center py-16">
            <Loader2 className="mx-auto h-16 w-16 text-blue-600 mb-6 animate-spin" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Analyzing Your Career Path</h3>
            <p className="text-gray-600 mb-4">
              Our AI is evaluating your current skills, experience, and the transition path to "{targetRoleInput}"
            </p>
            <div className="flex justify-center space-x-2">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Step */}
      {currentStep === 'results' && careerAnalysis && (
        <div className="space-y-6">
          {/* Transition Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Career Transition Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                    <span className="font-medium">Current Level:</span>
                    <Badge variant="outline">{careerAnalysis.currentLevel}</Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                    <span className="font-medium">Target Level:</span>
                    <Badge variant="default">{careerAnalysis.targetLevel}</Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
                    <span className="font-medium">Timeline:</span>
                    <Badge variant="secondary">{careerAnalysis.timeToTarget} months</Badge>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Transition Path</h4>
                  <div className="space-y-2">
                    {careerAnalysis.transitionPath.map((step, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </div>
                        <span className="text-gray-700">{step}</span>
                        {index < careerAnalysis.transitionPath.length - 1 && (
                          <ArrowRight className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Risks and Opportunities */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  Potential Risks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {careerAnalysis.risks.map((risk, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className={getRiskColor(risk)}>{risk}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-green-600" />
                  Your Strengths
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {careerAnalysis.opportunities.map((opportunity, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className={getOpportunityColor(opportunity)}>{opportunity}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Development Roadmap */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-purple-600" />
                Development Roadmap
              </CardTitle>
              <CardDescription>
                Key milestones and timeline for your transition
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {careerAnalysis.keyMilestones.map((milestone, index) => (
                  <div key={milestone.id} className="flex items-start gap-4 p-4 border rounded-lg">
                    <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{milestone.title}</h4>
                      <p className="text-sm text-gray-600 mb-2">{milestone.description}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {milestone.targetDate.toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {milestone.effort} hours
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {milestone.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Action Plan */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-600" />
                Immediate Action Plan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600 mb-2">Month 1-2</div>
                    <div className="text-sm text-gray-700">Foundation Building</div>
                    <div className="text-xs text-gray-600 mt-1">Skills assessment & gap analysis</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 mb-2">Month 3-6</div>
                    <div className="text-sm text-gray-700">Skill Development</div>
                    <div className="text-xs text-gray-600 mt-1">Learning & practice</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600 mb-2">Month 7-12</div>
                    <div className="text-sm text-gray-700">Application</div>
                    <div className="text-xs text-gray-600 mt-1">Real-world experience</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button onClick={() => setCurrentStep('input')} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Analyze Different Role
            </Button>
            <Button>
              <BookOpen className="h-4 w-4 mr-2" />
              Download Action Plan
            </Button>
            <Button>
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Follow-up
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
