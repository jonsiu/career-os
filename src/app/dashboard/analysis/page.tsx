import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart3, 
  TrendingUp, 
  Target, 
  Clock, 
  Loader2,
} from "lucide-react";
import { ResumeJobAnalysis } from "@/components/analysis/resume-job-analysis";
import { CareerCoachAnalysis } from "@/components/analysis/career-coach-analysis";
import { AnalysisResult, CareerAnalysis } from "@/lib/abstractions/types";

export default function AnalysisPage() {
  const { user, isLoaded } = useUser();
  const [activeTab, setActiveTab] = useState("resume-job");
  const [lastResumeAnalysis, setLastResumeAnalysis] = useState<AnalysisResult | null>(null);
  const [lastCareerAnalysis, setLastCareerAnalysis] = useState<CareerAnalysis | null>(null);

  const handleResumeAnalysisComplete = (result: AnalysisResult) => {
    setLastResumeAnalysis(result);
  };

  const handleCareerAnalysisComplete = (result: CareerAnalysis) => {
    setLastCareerAnalysis(result);
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
          <BarChart3 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Please sign in</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Career Analysis</h1>
        <p className="mt-2 text-gray-600">
          AI-powered insights and recommendations for your career development
        </p>
      </div>

      {/* Quick Stats */}
      {(lastResumeAnalysis || lastCareerAnalysis) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {lastResumeAnalysis && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600">
                      {lastResumeAnalysis.matchScore}%
                    </div>
                    <div className="text-sm text-gray-600">Resume Match</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {lastCareerAnalysis && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {lastCareerAnalysis.timeToTarget}
                    </div>
                    <div className="text-sm text-gray-600">Months to Target</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Target className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">
                    {lastResumeAnalysis?.gaps.length || lastCareerAnalysis?.risks.length || 0}
                  </div>
                  <div className="text-sm text-gray-600">Areas to Improve</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Analysis Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="resume-job" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Resume-Job Analysis
          </TabsTrigger>
          <TabsTrigger value="career-coach" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Career Coach
          </TabsTrigger>
        </TabsList>

        <TabsContent value="resume-job" className="mt-6">
          <ResumeJobAnalysis onAnalysisComplete={handleResumeAnalysisComplete} />
        </TabsContent>

        <TabsContent value="career-coach" className="mt-6">
          <CareerCoachAnalysis onAnalysisComplete={handleCareerAnalysisComplete} />
        </TabsContent>
      </Tabs>

      {/* Recent Analysis History */}
      {(lastResumeAnalysis || lastCareerAnalysis) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-gray-600" />
              Recent Analysis
            </CardTitle>
            <CardDescription>
              Your latest analysis results and insights
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {lastResumeAnalysis && (
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                    <div>
                      <div className="font-medium text-gray-900">Resume-Job Analysis</div>
                      <div className="text-sm text-gray-600">
                        Match Score: {lastResumeAnalysis.matchScore}% • 
                        {lastResumeAnalysis.gaps.length} skills gaps identified
                      </div>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setActiveTab("resume-job")}
                  >
                    View Details
                  </Button>
                </div>
              )}

              {lastCareerAnalysis && (
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <div>
                      <div className="font-medium text-gray-900">Career Transition Analysis</div>
                      <div className="text-sm text-gray-600">
                        {lastCareerAnalysis.currentLevel} → {lastCareerAnalysis.targetLevel} • 
                        {lastCareerAnalysis.timeToTarget} months timeline
                      </div>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setActiveTab("career-coach")}
                  >
                    View Details
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
