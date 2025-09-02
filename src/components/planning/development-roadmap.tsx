"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Target, 
  Calendar, 
  TrendingUp, 
  CheckCircle,
  Clock,
  Plus,
  Edit3,
  Trash2,
  Save,
  Loader2,
  BarChart3,
  Award,
  Users,
  BookOpen,
  ArrowRight,
  CalendarDays
} from "lucide-react";
import { database } from "@/lib/abstractions";
import { Plan, Milestone } from "@/lib/abstractions/types";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

interface DevelopmentRoadmapProps {
  onPlanCreated?: (plan: Plan) => void;
  onPlanUpdated?: (plan: Plan) => void;
}

interface RoadmapFormData {
  title: string;
  description: string;
  timeline: number; // months
  goals: string[];
  milestones: Array<{
    id: string;
    title: string;
    description: string;
    targetDate: Date;
    status: 'pending' | 'in-progress' | 'completed';
    dependencies: string[];
    effort: number; // hours
  }>;
}

export function DevelopmentRoadmap({ onPlanCreated, onPlanUpdated }: DevelopmentRoadmapProps) {
  const { user, isLoaded } = useUser();
  const { toast } = useToast();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [activePlan, setActivePlan] = useState<Plan | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState<RoadmapFormData>({
    title: '',
    description: '',
    timeline: 6,
    goals: [''],
    milestones: []
  });

  useEffect(() => {
    if (user?.id && isLoaded) {
      loadUserPlans();
    }
  }, [user?.id, isLoaded]);

  const loadUserPlans = async () => {
    try {
      setIsLoading(true);
      const userPlans = await database.getUserPlans(user!.id);
      setPlans(userPlans);
      
      if (userPlans.length > 0 && !activePlan) {
        setActivePlan(userPlans[0]);
      }
    } catch (error) {
      console.error('Failed to load plans:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof RoadmapFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addGoal = () => {
    setFormData(prev => ({
      ...prev,
      goals: [...prev.goals, '']
    }));
  };

  const updateGoal = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      goals: prev.goals.map((goal, i) => i === index ? value : goal)
    }));
  };

  const removeGoal = (index: number) => {
    setFormData(prev => ({
      ...prev,
      goals: prev.goals.filter((_, i) => i !== index)
    }));
  };

  const addMilestone = () => {
    const newMilestone = {
      id: Date.now().toString(),
      title: '',
      description: '',
      targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      status: 'pending' as const,
      dependencies: [],
      effort: 20,
    };

    setFormData(prev => ({
      ...prev,
      milestones: [...prev.milestones, newMilestone]
    }));
  };

  const updateMilestone = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      milestones: prev.milestones.map((milestone, i) => 
        i === index ? { ...milestone, [field]: value } : milestone
      )
    }));
  };

  const removeMilestone = (index: number) => {
    setFormData(prev => ({
      ...prev,
      milestones: prev.milestones.filter((_, i) => i !== index)
    }));
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      toast({
        title: 'Plan title missing',
        description: 'Please enter a plan title.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const planData = {
        userId: user!.id,
        title: formData.title,
        description: formData.description,
        goals: formData.goals.filter(goal => goal.trim()),
        timeline: formData.timeline,
        milestones: formData.milestones.map(milestone => ({
          ...milestone,
          targetDate: milestone.targetDate instanceof Date ? milestone.targetDate : new Date(milestone.targetDate)
        })),
        status: 'draft' as const,
        metadata: {
          createdWith: 'development-roadmap',
          lastSaved: new Date().toISOString(),
        }
      };

      if (activePlan) {
        // Update existing plan
        const updatedPlan = await database.updatePlan(activePlan.id, planData);
        setActivePlan(updatedPlan);
        if (onPlanUpdated) onPlanUpdated(updatedPlan);
        toast({
          title: 'Plan updated',
          description: `Plan "${updatedPlan.title}" updated successfully.`,
        });
      } else {
        // Create new plan
        const newPlan = await database.createPlan(planData);
        setPlans(prev => [newPlan, ...prev]);
        setActivePlan(newPlan);
        if (onPlanCreated) onPlanCreated(newPlan);
        toast({
          title: 'Plan created',
          description: `Plan "${newPlan.title}" created successfully.`,
        });
      }

      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save plan:', error);
      toast({
        title: 'Failed to save plan',
        description: 'Could not save plan. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const startNewPlan = () => {
    setFormData({
      title: '',
      description: '',
      timeline: 6,
      goals: [''],
      milestones: []
    });
    setActivePlan(null);
    setIsEditing(true);
  };

  const editExistingPlan = (plan: Plan) => {
    setFormData({
      title: plan.title,
      description: plan.description,
      timeline: plan.timeline,
      goals: plan.goals.length > 0 ? plan.goals : [''],
      milestones: plan.milestones.map(milestone => ({
        ...milestone,
        targetDate: new Date(milestone.targetDate)
      }))
    });
    setIsEditing(true);
  };

  const calculateProgress = (milestones: Milestone[]) => {
    if (milestones.length === 0) return 0;
    const completed = milestones.filter(m => m.status === 'completed').length;
    return Math.round((completed / milestones.length) * 100);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
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
          <Target className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Please sign in</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Development Roadmap</h1>
        <p className="mt-2 text-gray-600">
          Create and track your personalized career development plan
        </p>
      </div>

      {/* Plan Selection */}
      {plans.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              Select Development Plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {plans.map((plan) => (
                <Card 
                  key={plan.id} 
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    activePlan?.id === plan.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => setActivePlan(plan)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{plan.title}</h4>
                      <Badge variant="outline">{plan.status}</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{plan.description}</p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>{plan.timeline} months</span>
                      <span>{plan.milestones.length} milestones</span>
                    </div>
                    <div className="mt-3">
                      <Progress value={calculateProgress(plan.milestones)} className="h-2" />
                      <span className="text-xs text-gray-500 mt-1">
                        {calculateProgress(plan.milestones)}% complete
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Plan Editor */}
      {isEditing && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Edit3 className="h-5 w-5 text-green-600" />
              {activePlan ? 'Edit Plan' : 'Create New Plan'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="plan-title">Plan Title *</Label>
                <Input
                  id="plan-title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="e.g., Senior Developer to Tech Lead"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timeline">Timeline (months)</Label>
                <Input
                  id="timeline"
                  type="number"
                  min="1"
                  max="24"
                  value={formData.timeline}
                  onChange={(e) => handleInputChange('timeline', parseInt(e.target.value))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe your development goals and objectives..."
                rows={3}
              />
            </div>

            {/* Goals */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Development Goals</Label>
                <Button onClick={addGoal} size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Goal
                </Button>
              </div>
              <div className="space-y-3">
                {formData.goals.map((goal, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={goal}
                      onChange={(e) => updateGoal(index, e.target.value)}
                      placeholder={`Goal ${index + 1}`}
                    />
                    <Button
                      onClick={() => removeGoal(index)}
                      variant="ghost"
                      size="sm"
                      disabled={formData.goals.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Milestones */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Milestones</Label>
                <Button onClick={addMilestone} size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Milestone
                </Button>
              </div>
              <div className="space-y-4">
                {formData.milestones.map((milestone, index) => (
                  <Card key={milestone.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Milestone {index + 1}</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeMilestone(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Title</Label>
                          <Input
                            value={milestone.title}
                            onChange={(e) => updateMilestone(index, 'title', e.target.value)}
                            placeholder="e.g., Complete Leadership Course"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Effort (hours)</Label>
                          <Input
                            type="number"
                            min="1"
                            value={milestone.effort}
                            onChange={(e) => updateMilestone(index, 'effort', parseInt(e.target.value))}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Target Date</Label>
                          <Input
                            type="date"
                            value={milestone.targetDate.toISOString().split('T')[0]}
                            onChange={(e) => updateMilestone(index, 'targetDate', new Date(e.target.value))}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                          value={milestone.description}
                          onChange={(e) => updateMilestone(index, 'description', e.target.value)}
                          placeholder="Describe what needs to be accomplished..."
                          rows={2}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button onClick={handleSave} className="flex-1">
                <Save className="h-4 w-4 mr-2" />
                {activePlan ? 'Update Plan' : 'Create Plan'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setIsEditing(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Plan Viewer */}
      {activePlan && !isEditing && (
        <div className="space-y-6">
          {/* Plan Overview */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-blue-600" />
                    {activePlan.title}
                  </CardTitle>
                  <CardDescription>{activePlan.description}</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => setIsEditing(true)} variant="outline">
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button onClick={() => setIsEditing(false)}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Plan
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <CalendarDays className="mx-auto h-8 w-8 text-blue-600 mb-2" />
                  <div className="text-2xl font-bold text-blue-600">{activePlan.timeline}</div>
                  <div className="text-sm text-gray-600">Months</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <Award className="mx-auto h-8 w-8 text-green-600 mb-2" />
                  <div className="text-2xl font-bold text-green-600">{activePlan.goals.length}</div>
                  <div className="text-sm text-gray-600">Goals</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <BarChart3 className="mx-auto h-8 w-8 text-purple-600 mb-2" />
                  <div className="text-2xl font-bold text-purple-600">{activePlan.milestones.length}</div>
                  <div className="text-sm text-gray-600">Milestones</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <TrendingUp className="mx-auto h-8 w-8 text-orange-600 mb-2" />
                  <div className="text-2xl font-bold text-orange-600">
                    {calculateProgress(activePlan.milestones)}%
                  </div>
                  <div className="text-sm text-gray-600">Complete</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Overall Progress</span>
                  <span className="text-sm text-gray-500">
                    {calculateProgress(activePlan.milestones)}% complete
                  </span>
                </div>
                <Progress value={calculateProgress(activePlan.milestones)} className="h-3" />
              </div>
            </CardContent>
          </Card>

          {/* Goals */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-green-600" />
                Development Goals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {activePlan.goals.map((goal, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-gray-900">{goal}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Milestones */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-purple-600" />
                Milestones & Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activePlan.milestones.map((milestone, index) => (
                  <div key={milestone.id} className="border-l-4 border-blue-500 pl-4 py-3">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-medium text-gray-900">{milestone.title}</h4>
                        <p className="text-sm text-gray-600">{milestone.description}</p>
                      </div>
                      <div className="flex gap-2">
                        <Badge className={getStatusColor(milestone.status)}>
                          {milestone.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(milestone.targetDate).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {milestone.effort} hours
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* No Plans State */}
      {isLoaded && plans.length === 0 && !isEditing && (
        <Card className="border-2 border-dashed border-gray-300 bg-gray-50">
          <CardContent className="text-center py-12">
            <Target className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Development Plans Yet</h3>
            <p className="text-gray-600 mb-4">
              Create your first development roadmap to start tracking your career progress.
            </p>
            <Button onClick={startNewPlan}>
              <Plus className="h-4 w-4 mr-2" />
              Create First Plan
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-24" />
          <Skeleton className="h-40" />
        </div>
      )}

      {/* Start Editing State */}
      {isLoaded && plans.length > 0 && !activePlan && !isEditing && (
        <Card className="border-2 border-dashed border-gray-300 bg-gray-50">
          <CardContent className="text-center py-12">
            <Target className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to Plan?</h3>
            <p className="text-gray-600 mb-4">
              Select a plan to view or create a new one to get started.
            </p>
            <Button onClick={startNewPlan}>
              <Plus className="h-4 w-4 mr-2" />
              Create New Plan
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
