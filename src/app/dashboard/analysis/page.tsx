"use client";

import { useUser } from "@clerk/nextjs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, TrendingUp, Target, Lightbulb, Clock, CheckCircle } from "lucide-react";

export default function AnalysisPage() {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <BarChart3 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
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

      {/* Coming Soon Section */}
      <Card className="border-2 border-dashed border-gray-300 bg-gray-50">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <BarChart3 className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle className="text-xl">Analysis Engine Coming Soon</CardTitle>
          <CardDescription>
            Our AI-powered career analysis tools are being developed
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            This section will provide comprehensive career insights including skills matching, 
            experience assessment, and personalized recommendations for your career transition.
          </p>
          <div className="flex justify-center">
            <Button disabled variant="outline">
              <Clock className="h-4 w-4 mr-2" />
              Coming in Day 3
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Feature Preview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Skills Matching
            </CardTitle>
            <CardDescription>
              AI-powered skills analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Get detailed insights into how your skills align with target roles and identify areas for development.
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              Experience Assessment
            </CardTitle>
            <CardDescription>
              Career progression analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Evaluate your experience level and readiness for management transitions with detailed gap analysis.
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-600" />
              Smart Recommendations
            </CardTitle>
            <CardDescription>
              Personalized career guidance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Receive tailored recommendations for skill development, learning resources, and career planning.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Get Ready for Analysis</h2>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" disabled>
            <CheckCircle className="h-4 w-4 mr-2" />
            Upload Resume First
          </Button>
          <Button variant="outline" disabled>
            <CheckCircle className="h-4 w-4 mr-2" />
            Add Job Postings
          </Button>
          <Button variant="outline" disabled>
            <CheckCircle className="h-4 w-4 mr-2" />
            Run Analysis
          </Button>
        </div>
        <p className="text-sm text-gray-600 mt-3">
          Complete your profile and add content to get the most out of our analysis tools.
        </p>
      </div>
    </div>
  );
}
