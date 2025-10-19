import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Target, Plus, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { database } from "@/lib/abstractions";
import { TransitionAssessmentFlow, TransitionAssessmentData } from "./transition-assessment-flow";
import { TransitionPlanCard } from "./transition-plan-card";
import { SkillGapAnalysis } from "./skill-gap-analysis";
import { BenchmarkingDisplay } from "./benchmarking-display";

interface TransitionPlan {
  id: string;
  userId: string;
  title: string;
  description?: string;
  transitionTypes?: string[];
  primaryTransitionType?: string;
  currentRole?: string;
  targetRole?: string;
  currentIndustry?: string;
  targetIndustry?: string;
  bridgeRoles?: string[];
  estimatedTimeline?: {
    minMonths: number;
    maxMonths: number;
    factors: string[];
  };
  benchmarkData?: {
    similarTransitions: string;
    averageTimeline: string;
    successRate?: number;
  };
  progressPercentage?: number;
  careerCapitalAssessment?: {
    uniqueSkills: string[];
    rareSkillCombinations: string[];
    competitiveAdvantages: string[];
  };
  goals: string[];
  timeline: number;
  milestones: any[];
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export function TransitionPlanningTab() {
  const { user, isLoaded } = useUser();
  const { toast } = useToast();
  const [transitionPlans, setTransitionPlans] = useState<TransitionPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<TransitionPlan | null>(null);
  const [showAssessment, setShowAssessment] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [skillGaps, setSkillGaps] = useState<any[]>([]);

  useEffect(() => {
    if (user?.id && isLoaded) {
      loadTransitionPlans();
    }
  }, [user?.id, isLoaded]);

  useEffect(() => {
    if (selectedPlan?.id) {
      loadSkillGaps(selectedPlan.id);
    }
  }, [selectedPlan]);

  const loadTransitionPlans = async () => {
    try {
      setIsLoading(true);
      // Get all user plans
      const allPlans = await database.getUserPlans(user!.id);
      // Filter for plans that have transition metadata
      const transPlans = allPlans.filter((plan: any) =>
        plan.transitionTypes || plan.primaryTransitionType
      ) as TransitionPlan[];
      setTransitionPlans(transPlans);

      if (transPlans.length > 0 && !selectedPlan) {
        setSelectedPlan(transPlans[0]);
      }
    } catch (error) {
      console.error('Failed to load transition plans:', error);
      toast({
        title: 'Failed to load plans',
        description: 'Could not load your transition plans. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadSkillGaps = async (planId: string) => {
    try {
      // Load skills associated with this transition plan
      const skills = await database.getUserSkills(user!.id);
      const planSkills = skills.filter((skill: any) => skill.transitionPlanId === planId);
      setSkillGaps(planSkills);
    } catch (error) {
      console.error('Failed to load skill gaps:', error);
    }
  };

  const handleAssessmentComplete = async (assessmentData: TransitionAssessmentData) => {
    try {
      // Create transition plan from assessment data
      const planData = {
        userId: user!.id,
        title: assessmentData.planTitle || `${assessmentData.currentRole} to ${assessmentData.targetRole}`,
        description: `Transition from ${assessmentData.currentRole} to ${assessmentData.targetRole}`,
        transitionTypes: assessmentData.transitionTypes,
        primaryTransitionType: assessmentData.primaryTransitionType,
        currentRole: assessmentData.currentRole,
        targetRole: assessmentData.targetRole,
        currentIndustry: assessmentData.currentIndustry,
        targetIndustry: assessmentData.targetIndustry,
        bridgeRoles: assessmentData.bridgeRoles,
        estimatedTimeline: assessmentData.estimatedTimeline,
        benchmarkData: assessmentData.benchmarkData,
        progressPercentage: 0,
        goals: assessmentData.selectedSkills?.map(skill => `Develop ${skill} skills`) || [],
        timeline: assessmentData.customTimeline || assessmentData.estimatedTimeline?.maxMonths || 12,
        milestones: [],
        status: 'active',
      };

      const newPlan = await database.createPlan(planData);

      // Create skills from selected skill gaps
      if (assessmentData.skillGaps && assessmentData.selectedSkills) {
        const selectedSkillGaps = assessmentData.skillGaps.filter(
          sg => assessmentData.selectedSkills?.includes(sg.name)
        );

        for (const skillGap of selectedSkillGaps) {
          await database.createSkill({
            userId: user!.id,
            name: skillGap.name,
            category: 'Transition Skill',
            currentLevel: skillGap.currentLevel,
            targetLevel: skillGap.targetLevel,
            progress: 0,
            timeSpent: 0,
            estimatedTimeToTarget: (skillGap.estimatedLearningTime?.maxWeeks || 4) * 10,
            priority: skillGap.criticalityLevel === 'critical' ? 'high' : 'medium',
            status: 'not-started',
            resources: [],
            notes: '',
            transitionPlanId: newPlan.id,
            criticalityLevel: skillGap.criticalityLevel,
            transferableFrom: skillGap.transferableFrom,
          });
        }
      }

      toast({
        title: 'Transition plan created!',
        description: `Your ${assessmentData.primaryTransitionType} plan has been created.`,
      });

      setShowAssessment(false);
      await loadTransitionPlans();
    } catch (error) {
      console.error('Failed to create transition plan:', error);
      toast({
        title: 'Failed to create plan',
        description: 'Could not create your transition plan. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDeletePlan = async (planId: string) => {
    try {
      await database.deletePlan(planId);
      toast({
        title: 'Plan deleted',
        description: 'Your transition plan has been deleted.',
      });
      await loadTransitionPlans();
    } catch (error) {
      console.error('Failed to delete plan:', error);
      toast({
        title: 'Failed to delete plan',
        description: 'Could not delete the plan. Please try again.',
        variant: 'destructive',
      });
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

  // Show assessment flow
  if (showAssessment) {
    return (
      <TransitionAssessmentFlow
        userId={user.id}
        onComplete={handleAssessmentComplete}
        onCancel={() => setShowAssessment(false)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Transition Planning</h2>
          <p className="mt-2 text-gray-600">
            Create and track personalized roadmaps for your career transitions
          </p>
        </div>
        <Button onClick={() => setShowAssessment(true)} size="lg">
          <Plus className="h-5 w-5 mr-2" />
          Start Assessment
        </Button>
      </div>

      {/* Plans Grid */}
      {isLoading ? (
        <div className="text-center py-12">
          <Loader2 className="mx-auto h-12 w-12 text-gray-400 mb-4 animate-spin" />
          <p className="text-gray-600">Loading your transition plans...</p>
        </div>
      ) : transitionPlans.length === 0 ? (
        <Card className="border-2 border-dashed border-gray-300 bg-gray-50">
          <CardContent className="text-center py-12">
            <Target className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Transition Plans Yet
            </h3>
            <p className="text-gray-600 mb-6">
              Start by creating your first transition plan with our AI-powered assessment
            </p>
            <Button onClick={() => setShowAssessment(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Start Your First Assessment
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Plans List */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Transition Plans</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {transitionPlans.map((plan) => (
                <TransitionPlanCard
                  key={plan.id}
                  plan={plan}
                  onSelect={setSelectedPlan}
                  onDelete={handleDeletePlan}
                  isSelected={selectedPlan?.id === plan.id}
                />
              ))}
            </div>
          </div>

          {/* Selected Plan Details */}
          {selectedPlan && (
            <div className="space-y-6">
              {/* Benchmarking */}
              {selectedPlan.benchmarkData && selectedPlan.estimatedTimeline && (
                <BenchmarkingDisplay
                  benchmarkData={selectedPlan.benchmarkData}
                  userTimeline={{
                    minMonths: selectedPlan.estimatedTimeline.minMonths,
                    maxMonths: selectedPlan.estimatedTimeline.maxMonths,
                  }}
                />
              )}

              {/* Skill Gap Analysis */}
              {skillGaps.length > 0 && (
                <SkillGapAnalysis
                  skills={skillGaps}
                  planId={selectedPlan.id}
                />
              )}

              {/* Career Capital Assessment */}
              {selectedPlan.careerCapitalAssessment && (
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Your Career Capital
                    </h3>
                    <div className="space-y-4">
                      {selectedPlan.careerCapitalAssessment.uniqueSkills.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-2">Unique Skills</p>
                          <div className="flex flex-wrap gap-2">
                            {selectedPlan.careerCapitalAssessment.uniqueSkills.map((skill, i) => (
                              <span key={i} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
