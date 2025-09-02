"use client";

import { useUser } from "@clerk/nextjs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Target, Calendar, TrendingUp, BookOpen, Clock, CheckCircle } from "lucide-react";

export default function PlanPage() {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <Target className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Loading...</h3>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <Target className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Please sign in</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Career Development Plan</h1>
        <p className="mt-2 text-gray-600">
          Create and track your personalized career development roadmap
        </p>
      </div>

      {/* Coming Soon Section */}
      <Card className="border-2 border-dashed border-gray-300 bg-gray-50">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
            <Target className="h-6 w-6 text-orange-600" />
          </div>
          <CardTitle className="text-xl">Development Planning Coming Soon</CardTitle>
          <CardDescription>
            Our career development planning tools are being developed
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            This section will help you create personalized development plans with milestones, 
            timeline management, and progress tracking for your career goals.
          </p>
          <div className="flex justify-center">
            <Button disabled variant="outline">
              <Clock className="h-4 w-4 mr-2" />
              Coming in Day 4
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Feature Preview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              Timeline Planning
            </CardTitle>
            <CardDescription>
              6-month development roadmap
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Create structured timelines with milestones and deadlines for your career development goals.
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Progress Tracking
            </CardTitle>
            <CardDescription>
              Visual progress monitoring
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Track your development progress with visual indicators and milestone completion tracking.
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-purple-600" />
              Skills Development
            </CardTitle>
            <CardDescription>
              Learning resource management
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Access curated learning resources and track your skills development with time estimates.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Prepare for Planning</h2>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" disabled>
            <CheckCircle className="h-4 w-4 mr-2" />
            Complete Resume
          </Button>
          <Button variant="outline" disabled>
            <CheckCircle className="h-4 w-4 mr-2" />
            Run Career Analysis
          </Button>
          <Button variant="outline" disabled>
            <CheckCircle className="h-4 w-4 mr-2" />
            Create Development Plan
          </Button>
        </div>
        <p className="text-sm text-gray-600 mt-3">
          Build your foundation first to create the most effective development plan.
        </p>
      </div>

      {/* Sample Plan Structure */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">What Your Plan Will Include</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Phase 1: Foundation (Months 1-2)</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Skills assessment and gap analysis</li>
                <li>• Learning resource identification</li>
                <li>• Goal setting and milestone planning</li>
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Phase 2: Development (Months 3-4)</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Skill building and practice</li>
                <li>• Progress tracking and adjustments</li>
                <li>• Networking and mentorship</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
