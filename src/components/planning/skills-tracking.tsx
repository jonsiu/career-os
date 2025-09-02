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
  Award, 
  TrendingUp, 
  Clock, 
  BookOpen,
  Plus,
  Edit3,
  Trash2,
  Save,
  Loader2,
  Star,
  Target,
  Calendar,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Filter
} from "lucide-react";
import { database } from "@/lib/abstractions";

interface Skill {
  id: string;
  name: string;
  category: string;
  currentLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  targetLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  progress: number; // 0-100
  timeSpent: number; // hours
  estimatedTimeToTarget: number; // hours
  priority: 'low' | 'medium' | 'high';
  status: 'learning' | 'practicing' | 'mastered' | 'not-started';
  resources: Array<{
    name: string;
    type: 'course' | 'book' | 'video' | 'project' | 'mentorship';
    url?: string;
    estimatedHours: number;
    completed: boolean;
  }>;
  notes: string;
  lastUpdated: Date;
}

interface SkillsTrackingProps {
  onSkillUpdated?: (skill: Skill) => void;
}

const skillCategories = [
  'Programming Languages',
  'Frameworks & Libraries',
  'Databases',
  'Cloud & DevOps',
  'Soft Skills',
  'Management',
  'Design & UX',
  'Data Science',
  'Security',
  'Testing'
];

const skillLevels = ['beginner', 'intermediate', 'advanced', 'expert'];

export function SkillsTracking({ onSkillUpdated }: SkillsTrackingProps) {
  const { user, isLoaded } = useUser();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingSkill, setIsAddingSkill] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (user?.id && isLoaded) {
      loadUserSkills();
    }
  }, [user?.id, isLoaded]);

  const loadUserSkills = async () => {
    try {
      setIsLoading(true);
      // TODO: Replace with actual database call when schema is ready
      // const userSkills = await database.getUserSkills(user!.id);
      
      // Mock data for now
      const mockSkills: Skill[] = [
        {
          id: '1',
          name: 'React',
          category: 'Frameworks & Libraries',
          currentLevel: 'intermediate',
          targetLevel: 'advanced',
          progress: 65,
          timeSpent: 120,
          estimatedTimeToTarget: 80,
          priority: 'high',
          status: 'learning',
          resources: [
            {
              name: 'React Advanced Patterns',
              type: 'course',
              url: 'https://example.com/react-advanced',
              estimatedHours: 40,
              completed: false
            }
          ],
          notes: 'Focus on hooks and performance optimization',
          lastUpdated: new Date()
        },
        {
          id: '2',
          name: 'Leadership',
          category: 'Management',
          currentLevel: 'beginner',
          targetLevel: 'intermediate',
          progress: 25,
          timeSpent: 20,
          estimatedTimeToTarget: 60,
          priority: 'medium',
          status: 'learning',
          resources: [
            {
              name: 'Team Management Fundamentals',
              type: 'book',
              estimatedHours: 30,
              completed: false
            }
          ],
          notes: 'Start with small team projects',
          lastUpdated: new Date()
        }
      ];
      
      setSkills(mockSkills);
    } catch (error) {
      console.error('Failed to load skills:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addSkill = () => {
    const newSkill: Skill = {
      id: Date.now().toString(),
      name: '',
      category: 'Programming Languages',
      currentLevel: 'beginner',
      targetLevel: 'intermediate',
      progress: 0,
      timeSpent: 0,
      estimatedTimeToTarget: 40,
      priority: 'medium',
      status: 'not-started',
      resources: [],
      notes: '',
      lastUpdated: new Date()
    };
    setEditingSkill(newSkill);
    setIsAddingSkill(true);
  };

  const saveSkill = async () => {
    if (!editingSkill?.name.trim()) {
      alert('Please enter a skill name');
      return;
    }

    try {
      if (isAddingSkill) {
        // Add new skill
        setSkills(prev => [editingSkill, ...prev]);
        if (onSkillUpdated) onSkillUpdated(editingSkill);
      } else {
        // Update existing skill
        setSkills(prev => prev.map(skill => 
          skill.id === editingSkill.id ? editingSkill : skill
        ));
        if (onSkillUpdated) onSkillUpdated(editingSkill);
      }

      setEditingSkill(null);
      setIsAddingSkill(false);
    } catch (error) {
      console.error('Failed to save skill:', error);
      alert('Failed to save skill. Please try again.');
    }
  };

  const updateSkillProgress = (skillId: string, newProgress: number) => {
    setSkills(prev => prev.map(skill => 
      skill.id === skillId 
        ? { ...skill, progress: Math.min(100, Math.max(0, newProgress)), lastUpdated: new Date() }
        : skill
    ));
  };

  const addResource = (skillId: string) => {
    setSkills(prev => prev.map(skill => 
      skill.id === skillId 
        ? {
            ...skill,
            resources: [...skill.resources, {
              name: '',
              type: 'course',
              estimatedHours: 10,
              completed: false
            }]
          }
        : skill
    ));
  };

  const updateResource = (skillId: string, resourceIndex: number, field: string, value: any) => {
    setSkills(prev => prev.map(skill => 
      skill.id === skillId 
        ? {
            ...skill,
            resources: skill.resources.map((resource, index) => 
              index === resourceIndex 
                ? { ...resource, [field]: value }
                : resource
            )
          }
        : skill
    ));
  };

  const removeResource = (skillId: string, resourceIndex: number) => {
    setSkills(prev => prev.map(skill => 
      skill.id === skillId 
        ? {
            ...skill,
            resources: skill.resources.filter((_, index) => index !== resourceIndex)
          }
        : skill
    ));
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'expert': return 'bg-purple-100 text-purple-800';
      case 'advanced': return 'bg-blue-100 text-blue-800';
      case 'intermediate': return 'bg-green-100 text-green-800';
      case 'beginner': return 'bg-yellow-100 text-yellow-800';
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'mastered': return 'bg-green-100 text-green-800';
      case 'practicing': return 'bg-blue-100 text-blue-800';
      case 'learning': return 'bg-yellow-100 text-yellow-800';
      case 'not-started': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredSkills = skills.filter(skill => {
    const matchesCategory = filterCategory === 'all' || skill.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || skill.status === filterStatus;
    const matchesSearch = skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         skill.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesStatus && matchesSearch;
  });

  const totalSkills = skills.length;
  const skillsInProgress = skills.filter(s => s.status === 'learning' || s.status === 'practicing').length;
  const skillsCompleted = skills.filter(s => s.status === 'mastered').length;
  const averageProgress = totalSkills > 0 ? Math.round(skills.reduce((sum, s) => sum + s.progress, 0) / totalSkills) : 0;

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
          <Award className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Please sign in</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Skills Tracking</h1>
        <p className="mt-2 text-gray-600">
          Monitor your skills development progress and manage learning resources
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <Award className="mx-auto h-8 w-8 text-blue-600 mb-2" />
              <div className="text-2xl font-bold text-blue-600">{totalSkills}</div>
              <div className="text-sm text-gray-600">Total Skills</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <TrendingUp className="mx-auto h-8 w-8 text-green-600 mb-2" />
              <div className="text-2xl font-bold text-green-600">{skillsInProgress}</div>
              <div className="text-sm text-gray-600">In Progress</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <CheckCircle className="mx-auto h-8 w-8 text-purple-600 mb-2" />
              <div className="text-2xl font-bold text-purple-600">{skillsCompleted}</div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <Target className="mx-auto h-8 w-8 text-orange-600 mb-2" />
              <div className="text-2xl font-bold text-orange-600">{averageProgress}%</div>
              <div className="text-sm text-gray-600">Avg Progress</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Categories</option>
                {skillCategories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="not-started">Not Started</option>
                <option value="learning">Learning</option>
                <option value="practicing">Practicing</option>
                <option value="mastered">Mastered</option>
              </select>
              <Button onClick={addSkill}>
                <Plus className="h-4 w-4 mr-2" />
                Add Skill
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Skills List */}
      <div className="space-y-4">
        {filteredSkills.map((skill) => (
          <Card key={skill.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-medium text-gray-900">{skill.name}</h3>
                    <Badge className={getLevelColor(skill.currentLevel)}>
                      {skill.currentLevel}
                    </Badge>
                    <Badge className={getPriorityColor(skill.priority)}>
                      {skill.priority} priority
                    </Badge>
                    <Badge className={getStatusColor(skill.status)}>
                      {skill.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>{skill.category}</span>
                    <span>Target: {skill.targetLevel}</span>
                    <span>{skill.timeSpent}h spent</span>
                    <span>{skill.estimatedTimeToTarget}h to target</span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingSkill(skill)}
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Progress</span>
                  <span className="text-sm text-gray-500">{skill.progress}%</span>
                </div>
                <Progress value={skill.progress} className="h-3" />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateSkillProgress(skill.id, skill.progress - 10)}
                    disabled={skill.progress <= 0}
                  >
                    -10%
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateSkillProgress(skill.id, skill.progress + 10)}
                    disabled={skill.progress >= 100}
                  >
                    +10%
                  </Button>
                </div>
              </div>

              {/* Resources */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900">Learning Resources</h4>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => addResource(skill.id)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Resource
                  </Button>
                </div>
                <div className="space-y-2">
                  {skill.resources.map((resource, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <input
                        type="checkbox"
                        checked={resource.completed}
                        onChange={(e) => updateResource(skill.id, index, 'completed', e.target.checked)}
                        className="rounded"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{resource.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {resource.type}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            {resource.estimatedHours}h
                          </span>
                        </div>
                        {resource.url && (
                          <a
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline text-sm flex items-center gap-1"
                          >
                            View Resource <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeResource(skill.id, index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {skill.notes && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <h5 className="font-medium text-gray-900 mb-1">Notes</h5>
                  <p className="text-sm text-gray-700">{skill.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add/Edit Skill Modal */}
      {editingSkill && (
        <Card className="fixed inset-4 z-50 overflow-y-auto bg-white shadow-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Edit3 className="h-5 w-5 text-green-600" />
              {isAddingSkill ? 'Add New Skill' : 'Edit Skill'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="skill-name">Skill Name *</Label>
                <Input
                  id="skill-name"
                  value={editingSkill.name}
                  onChange={(e) => setEditingSkill({...editingSkill, name: e.target.value})}
                  placeholder="e.g., React, Leadership, AWS"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="skill-category">Category</Label>
                <select
                  id="skill-category"
                  value={editingSkill.category}
                  onChange={(e) => setEditingSkill({...editingSkill, category: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {skillCategories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="current-level">Current Level</Label>
                <select
                  id="current-level"
                  value={editingSkill.currentLevel}
                  onChange={(e) => setEditingSkill({...editingSkill, currentLevel: e.target.value as any})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {skillLevels.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="target-level">Target Level</Label>
                <select
                  id="target-level"
                  value={editingSkill.targetLevel}
                  onChange={(e) => setEditingSkill({...editingSkill, targetLevel: e.target.value as any})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {skillLevels.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <select
                  id="priority"
                  value={editingSkill.priority}
                  onChange={(e) => setEditingSkill({...editingSkill, priority: e.target.value as any})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  value={editingSkill.status}
                  onChange={(e) => setEditingSkill({...editingSkill, status: e.target.value as any})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="not-started">Not Started</option>
                  <option value="learning">Learning</option>
                  <option value="practicing">Practicing</option>
                  <option value="mastered">Mastered</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="estimated-time">Est. Time to Target (hours)</Label>
                <Input
                  id="estimated-time"
                  type="number"
                  min="1"
                  value={editingSkill.estimatedTimeToTarget}
                  onChange={(e) => setEditingSkill({...editingSkill, estimatedTimeToTarget: parseInt(e.target.value)})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={editingSkill.notes}
                onChange={(e) => setEditingSkill({...editingSkill, notes: e.target.value})}
                placeholder="Add notes about your learning approach, challenges, or specific focus areas..."
                rows={3}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button onClick={saveSkill} className="flex-1">
                <Save className="h-4 w-4 mr-2" />
                {isAddingSkill ? 'Add Skill' : 'Update Skill'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setEditingSkill(null);
                  setIsAddingSkill(false);
                }}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Skills State */}
      {!isLoading && skills.length === 0 && (
        <Card className="border-2 border-dashed border-gray-300 bg-gray-50">
          <CardContent className="text-center py-12">
            <Award className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Skills Tracked Yet</h3>
            <p className="text-gray-600 mb-4">
              Start tracking your skills development to monitor your progress and manage learning resources.
            </p>
            <Button onClick={addSkill}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Skill
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
