import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Award,
  TrendingUp,
  CheckCircle,
  Clock,
  ExternalLink,
} from "lucide-react";
import { CourseRecommendations } from "./course-recommendations";

interface SkillGap {
  id?: string;
  name: string;
  criticalityLevel: 'critical' | 'important' | 'nice-to-have';
  currentLevel: string;
  targetLevel: string;
  transferableFrom?: string[];
  onetCode?: string;
  estimatedLearningTime?: {
    minWeeks: number;
    maxWeeks: number;
  };
  progress?: number;
  affiliateCourses?: Array<{
    provider: string;
    title: string;
    url: string;
    affiliateLink: string;
    price?: number;
  }>;
}

interface SkillGapAnalysisProps {
  skills: SkillGap[];
  planId: string;
  onSkillUpdate?: (skillId: string, progress: number) => void;
}

export function SkillGapAnalysis({ skills, planId, onSkillUpdate }: SkillGapAnalysisProps) {
  const [expandedSkills, setExpandedSkills] = useState<Set<string>>(new Set());
  const [skillCourses, setSkillCourses] = useState<Record<string, SkillGap['affiliateCourses']>>({});
  const [loadingCourses, setLoadingCourses] = useState<Set<string>>(new Set());

  const getCriticalityColor = (level: string) => {
    switch (level) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'important':
        return 'bg-orange-100 text-orange-800';
      case 'nice-to-have':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCriticalityIcon = (level: string) => {
    switch (level) {
      case 'critical':
        return '🔴';
      case 'important':
        return '🟡';
      case 'nice-to-have':
        return '🔵';
      default:
        return '⚪';
    }
  };

  const groupedSkills = {
    critical: skills.filter(s => s.criticalityLevel === 'critical'),
    important: skills.filter(s => s.criticalityLevel === 'important'),
    'nice-to-have': skills.filter(s => s.criticalityLevel === 'nice-to-have'),
  };

  const toggleSkillExpand = async (skillName: string) => {
    const newExpanded = new Set(expandedSkills);
    if (newExpanded.has(skillName)) {
      newExpanded.delete(skillName);
    } else {
      newExpanded.add(skillName);

      // Load courses if not already loaded
      if (!skillCourses[skillName]) {
        await loadCoursesForSkill(skillName);
      }
    }
    setExpandedSkills(newExpanded);
  };

  const loadCoursesForSkill = async (skillName: string) => {
    setLoadingCourses(prev => new Set(prev).add(skillName));

    try {
      const response = await fetch('/api/transitions/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skillName,
          planId,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSkillCourses(prev => ({ ...prev, [skillName]: data.courses }));
      }
    } catch (error) {
      console.error('Failed to load courses:', error);
    } finally {
      setLoadingCourses(prev => {
        const newSet = new Set(prev);
        newSet.delete(skillName);
        return newSet;
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Award className="h-6 w-6 text-blue-600" />
          Skill Gap Analysis
        </h2>
        <p className="mt-2 text-gray-600">
          Skills you need to develop for your transition, organized by priority
        </p>
      </div>

      {/* Critical Skills */}
      {groupedSkills.critical.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            {getCriticalityIcon('critical')} Critical Skills
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            These skills are essential for your target role and should be your top priority
          </p>
          <div className="space-y-3">
            {groupedSkills.critical.map((skill) => (
              <SkillCard
                key={skill.name}
                skill={skill}
                isExpanded={expandedSkills.has(skill.name)}
                onToggle={() => toggleSkillExpand(skill.name)}
                onProgressUpdate={onSkillUpdate}
                courses={skillCourses[skill.name]}
                isLoadingCourses={loadingCourses.has(skill.name)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Important Skills */}
      {groupedSkills.important.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            {getCriticalityIcon('important')} Important Skills
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            These skills will significantly improve your success in the target role
          </p>
          <div className="space-y-3">
            {groupedSkills.important.map((skill) => (
              <SkillCard
                key={skill.name}
                skill={skill}
                isExpanded={expandedSkills.has(skill.name)}
                onToggle={() => toggleSkillExpand(skill.name)}
                onProgressUpdate={onSkillUpdate}
                courses={skillCourses[skill.name]}
                isLoadingCourses={loadingCourses.has(skill.name)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Nice-to-Have Skills */}
      {groupedSkills['nice-to-have'].length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            {getCriticalityIcon('nice-to-have')} Nice-to-Have Skills
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            These skills can enhance your profile but aren't required for the transition
          </p>
          <div className="space-y-3">
            {groupedSkills['nice-to-have'].map((skill) => (
              <SkillCard
                key={skill.name}
                skill={skill}
                isExpanded={expandedSkills.has(skill.name)}
                onToggle={() => toggleSkillExpand(skill.name)}
                onProgressUpdate={onSkillUpdate}
                courses={skillCourses[skill.name]}
                isLoadingCourses={loadingCourses.has(skill.name)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface SkillCardProps {
  skill: SkillGap;
  isExpanded: boolean;
  onToggle: () => void;
  onProgressUpdate?: (skillId: string, progress: number) => void;
  courses?: SkillGap['affiliateCourses'];
  isLoadingCourses: boolean;
}

function SkillCard({
  skill,
  isExpanded,
  onToggle,
  onProgressUpdate,
  courses,
  isLoadingCourses,
}: SkillCardProps) {
  const getCriticalityColor = (level: string) => {
    switch (level) {
      case 'critical':
        return 'border-red-200 bg-red-50';
      case 'important':
        return 'border-orange-200 bg-orange-50';
      case 'nice-to-have':
        return 'border-blue-200 bg-blue-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const progress = skill.progress || 0;

  return (
    <Card className={`border-2 ${getCriticalityColor(skill.criticalityLevel)}`}>
      <CardHeader className="cursor-pointer" onClick={onToggle}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              {skill.name}
              <Badge className="bg-white text-gray-700 border">
                {skill.criticalityLevel}
              </Badge>
              {skill.onetCode && (
                <CheckCircle className="h-4 w-4 text-green-600" title="Validated by O*NET" />
              )}
            </CardTitle>
            <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
              <span>Current: <strong>{skill.currentLevel}</strong></span>
              <span>→</span>
              <span>Target: <strong>{skill.targetLevel}</strong></span>
              {skill.estimatedLearningTime && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {skill.estimatedLearningTime.minWeeks}-{skill.estimatedLearningTime.maxWeeks} weeks
                  </span>
                </>
              )}
            </div>
          </div>
          <Button variant="ghost" size="sm">
            {isExpanded ? 'Hide Details' : 'Show Details'}
          </Button>
        </div>

        {/* Transferable Skills */}
        {skill.transferableFrom && skill.transferableFrom.length > 0 && (
          <div className="mt-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-green-600" />
            <span className="text-sm text-green-700">
              Transfers from: <strong>{skill.transferableFrom.join(', ')}</strong>
            </span>
          </div>
        )}

        {/* Progress Bar */}
        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Progress</span>
            <span className="font-medium">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </CardHeader>

      {/* Expanded Content */}
      {isExpanded && (
        <CardContent className="pt-0">
          {/* Course Recommendations */}
          <div className="mt-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">
              Recommended Learning Resources
            </h4>
            {isLoadingCourses ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-sm text-gray-600 mt-2">Loading courses...</p>
              </div>
            ) : courses && courses.length > 0 ? (
              <CourseRecommendations courses={courses} skillName={skill.name} />
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">
                No courses found. Try searching on learning platforms directly.
              </p>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
