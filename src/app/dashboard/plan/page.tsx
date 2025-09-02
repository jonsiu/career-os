"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Target, 
  Calendar, 
  TrendingUp, 
  BookOpen, 
  Clock, 
  CheckCircle,
  AlertCircle,
  Star,
  Award,
  BarChart3,
  Users,
  ArrowRight
} from "lucide-react";
import { DevelopmentRoadmap } from "@/components/planning/development-roadmap";
import { SkillsTracking } from "@/components/planning/skills-tracking";
import { Plan } from "@/lib/abstractions/types";

export default function PlanPage() {
  const { user, isLoaded } = useUser();
  const [activeTab, setActiveTab] = useState("roadmap");
  const [userPlans, setUserPlans] = useState<Plan[]>([]);
  const [lastUpdatedPlan, setLastUpdatedPlan] = useState<Plan | null>(null);

  const handlePlanCreated = (plan: Plan) => {
    setUserPlans(prev => [plan, ...prev]);
    setLastUpdatedPlan(plan);
  };

  const handlePlanUpdated = (plan: Plan) => {
    setUserPlans(prev => prev.map(p => p.id === plan.id ? plan : p));
    setLastUpdatedPlan(plan);
  };

  const handleStartPlanning = () => {
    setActiveTab("roadmap");
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
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

      {/* Quick Stats */}
      {userPlans.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <Target className="mx-auto h-8 w-8 text-blue-600 mb-2" />
                <div className="text-2xl font-bold text-blue-600">{userPlans.length}</div>
                <div className="text-sm text-gray-600">Active Plans</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <Calendar className="mx-auto h-8 w-8 text-green-600 mb-2" />
                <div className="text-2xl font-bold text-green-600">
                  {userPlans.reduce((sum, plan) => sum + plan.timeline, 0)}
                </div>
                <div className="text-sm text-gray-600">Total Months</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <BarChart3 className="mx-auto h-8 w-8 text-purple-600 mb-2" />
                <div className="text-2xl font-bold text-purple-600">
                  {userPlans.reduce((sum, plan) => sum + plan.milestones.length, 0)}
                </div>
                <div className="text-sm text-gray-600">Total Milestones</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <Award className="mx-auto h-8 w-8 text-orange-600 mb-2" />
                <div className="text-2xl font-bold text-orange-600">
                  {userPlans.reduce((sum, plan) => sum + plan.goals.length, 0)}
                </div>
                <div className="text-sm text-gray-600">Total Goals</div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Development Planning Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="roadmap" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Development Roadmap
          </TabsTrigger>
          <TabsTrigger value="skills" className="flex items-center gap-2">
            <Award className="h-4 w-4" />
            Skills Tracking
          </TabsTrigger>
        </TabsList>

        <TabsContent value="roadmap" className="mt-6">
          <DevelopmentRoadmap 
            onPlanCreated={handlePlanCreated}
            onPlanUpdated={handlePlanUpdated}
          />
        </TabsContent>

        <TabsContent value="skills" className="mt-6">
          <SkillsTracking />
        </TabsContent>
      </Tabs>

      {/* Recent Activity */}
      {lastUpdatedPlan && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-gray-600" />
              Recent Activity
            </CardTitle>
            <CardDescription>
              Your latest development plan updates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Target className="h-5 w-5 text-blue-600" />
                  <div>
                    <div className="font-medium text-gray-900">{lastUpdatedPlan.title}</div>
                    <div className="text-sm text-gray-600">
                      {lastUpdatedPlan.goals.length} goals • {lastUpdatedPlan.milestones.length} milestones
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline">{lastUpdatedPlan.status}</Badge>
                  <Badge variant="secondary">{lastUpdatedPlan.timeline} months</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Getting Started Guide - Only show when no plans exist */}
      {userPlans.length === 0 && (
        <Card className="border-2 border-dashed border-gray-300 bg-gray-50">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Target className="h-6 w-6 text-blue-600" />
            </div>
            <CardTitle className="text-xl">Ready to Start Planning?</CardTitle>
            <CardDescription>
              Create your first development roadmap to begin your career journey
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
              <div className="text-center p-4 bg-white rounded-lg">
                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-2">
                  1
                </div>
                <h4 className="font-medium text-gray-900 mb-1">Set Goals</h4>
                <p className="text-sm text-gray-600">Define your career objectives and timeline</p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg">
                <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-2">
                  2
                </div>
                <h4 className="font-medium text-gray-900 mb-1">Create Milestones</h4>
                <p className="text-sm text-gray-600">Break down your goals into actionable steps</p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg">
                <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-2">
                  3
                </div>
                <h4 className="font-medium text-gray-900 mb-1">Track Progress</h4>
                <p className="text-sm text-gray-600">Monitor your development and celebrate wins</p>
              </div>
            </div>
            <div className="flex justify-center">
              <button
                onClick={handleStartPlanning}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
              >
                <Target className="h-5 w-5" />
                Start Planning
              </button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
