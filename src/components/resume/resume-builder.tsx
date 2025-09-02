"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronLeft, 
  ChevronRight, 
  Save, 
  Eye, 
  EyeOff,
  Plus,
  Trash2,
  User,
  Briefcase,
  GraduationCap,
  Award,
  FileText,
  CheckCircle,
  Loader2
} from "lucide-react";
import { Resume } from "@/lib/abstractions/types";
import React from "react";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@clerk/nextjs";

interface ResumeBuilderProps {
  userId: string;
  onResumeCreated?: (resume: Resume) => void;
  initialData?: Partial<Resume>;
}

interface ResumeFormData {
  title: string;
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    location: string;
    summary: string;
  };
  experience: Array<{
    id: string;
    title: string;
    company: string;
    location: string;
    startDate: string;
    endDate: string;
    current: boolean;
    description: string;
  }>;
  education: Array<{
    id: string;
    degree: string;
    institution: string;
    location: string;
    startDate: string;
    endDate: string;
    current: boolean;
    gpa?: string;
    description: string;
  }>;
  skills: Array<{
    id: string;
    name: string;
    level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  }>;
  projects: Array<{
    id: string;
    name: string;
    description: string;
    technologies: string[];
    url?: string;
    startDate: string;
    endDate: string;
    current: boolean;
  }>;
}

const steps = [
  { id: 'personal', title: 'Personal Info', icon: User },
  { id: 'experience', title: 'Experience', icon: Briefcase },
  { id: 'education', title: 'Education', icon: GraduationCap },
  { id: 'skills', title: 'Skills', icon: Award },
  { id: 'projects', title: 'Projects', icon: FileText },
  { id: 'preview', title: 'Preview', icon: Eye },
];

export function ResumeBuilder({ userId, onResumeCreated, initialData }: ResumeBuilderProps) {
  const { user } = useUser();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<ResumeFormData>({
    title: initialData?.title || 'My Professional Resume',
    personalInfo: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      location: '',
      summary: '',
    },
    experience: [],
    education: [],
    skills: [],
    projects: [],
  });

  // Auto-save every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (formData.title && formData.personalInfo.firstName) {
        saveDraft();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [formData]);

  const saveDraft = async () => {
    try {
      const resumeData = {
        userId,
        title: formData.title,
        content: JSON.stringify(formData),
        metadata: {
          type: 'builder',
          lastSaved: new Date().toISOString(),
          step: currentStep,
        }
      };

      // TODO: Implement draft saving
      console.log('Auto-saving draft:', resumeData);
    } catch (error) {
      console.error('Failed to save draft:', error);
    }
  };

  const handleInputChange = (section: keyof ResumeFormData, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleArrayChange = (section: keyof ResumeFormData, index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: prev[section].map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const addArrayItem = (section: keyof ResumeFormData) => {
    const newItem = getDefaultItem(section);
    setFormData(prev => ({
      ...prev,
      [section]: [...prev[section], newItem]
    }));
  };

  const removeArrayItem = (section: keyof ResumeFormData, index: number) => {
    setFormData(prev => ({
      ...prev,
      [section]: prev[section].filter((_, i) => i !== index)
    }));
  };

  const getDefaultItem = (section: keyof ResumeFormData) => {
    switch (section) {
      case 'experience':
        return {
          id: Date.now().toString(),
          title: '',
          company: '',
          location: '',
          startDate: '',
          endDate: '',
          current: false,
          description: '',
        };
      case 'education':
        return {
          id: Date.now().toString(),
          degree: '',
          institution: '',
          location: '',
          startDate: '',
          endDate: '',
          current: false,
          gpa: '',
          description: '',
        };
      case 'skills':
        return {
          id: Date.now().toString(),
          name: '',
          level: 'intermediate' as const,
        };
      case 'projects':
        return {
          id: Date.now().toString(),
          name: '',
          description: '',
          technologies: [],
          url: '',
          startDate: '',
          endDate: '',
          current: false,
        };
      default:
        return {};
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      const resume = {
        userId,
        title: formData.title,
        content: JSON.stringify(formData),
        metadata: {
          type: 'builder',
          createdWith: 'resume-builder',
          lastSaved: new Date().toISOString(),
        }
      };

      // TODO: Implement actual save
      console.log('Saving resume:', resume);
      
      if (onResumeCreated) {
        // For now, create a mock resume object
        const mockResume: Resume = {
          id: `resume_${Date.now()}`,
          userId,
          title: formData.title,
          content: JSON.stringify(formData),
          createdAt: new Date(),
          updatedAt: new Date(),
          metadata: resume.metadata,
        };
        onResumeCreated(mockResume);
      }
    } catch (error) {
      console.error('Failed to save resume:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0: // Personal Info
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={formData.personalInfo.firstName}
                  onChange={(e) => handleInputChange('personalInfo', 'firstName', e.target.value)}
                  placeholder="John"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.personalInfo.lastName}
                  onChange={(e) => handleInputChange('personalInfo', 'lastName', e.target.value)}
                  placeholder="Doe"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.personalInfo.email}
                  onChange={(e) => handleInputChange('personalInfo', 'email', e.target.value)}
                  placeholder="john.doe@email.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.personalInfo.phone}
                  onChange={(e) => handleInputChange('personalInfo', 'phone', e.target.value)}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.personalInfo.location}
                onChange={(e) => handleInputChange('personalInfo', 'location', e.target.value)}
                placeholder="San Francisco, CA"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="summary">Professional Summary *</Label>
              <Textarea
                id="summary"
                value={formData.personalInfo.summary}
                onChange={(e) => handleInputChange('personalInfo', 'summary', e.target.value)}
                placeholder="Brief overview of your professional background, key skills, and career objectives..."
                rows={4}
              />
            </div>
          </div>
        );

      case 1: // Experience
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Work Experience</h3>
              <Button onClick={() => addArrayItem('experience')} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Experience
              </Button>
            </div>

            {formData.experience.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Briefcase className="mx-auto h-12 w-12 mb-4" />
                <p>No work experience added yet.</p>
                <p className="text-sm">Click "Add Experience" to get started.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {formData.experience.map((exp, index) => (
                  <Card key={exp.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Experience #{index + 1}</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeArrayItem('experience', index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Job Title *</Label>
                          <Input
                            value={exp.title}
                            onChange={(e) => handleArrayChange('experience', index, 'title', e.target.value)}
                            placeholder="Software Engineer"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Company *</Label>
                          <Input
                            value={exp.company}
                            onChange={(e) => handleArrayChange('experience', index, 'company', e.target.value)}
                            placeholder="Tech Corp"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Location</Label>
                          <Input
                            value={exp.location}
                            onChange={(e) => handleArrayChange('experience', index, 'location', e.target.value)}
                            placeholder="San Francisco, CA"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Start Date *</Label>
                          <Input
                            type="date"
                            value={exp.startDate}
                            onChange={(e) => handleArrayChange('experience', index, 'startDate', e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>End Date</Label>
                          <Input
                            type="date"
                            value={exp.endDate}
                            onChange={(e) => handleArrayChange('experience', index, 'endDate', e.target.value)}
                            disabled={exp.current}
                          />
                        </div>
                        <div className="flex items-center space-x-2 pt-6">
                          <input
                            type="checkbox"
                            id={`current-${exp.id}`}
                            checked={exp.current}
                            onChange={(e) => handleArrayChange('experience', index, 'current', e.target.checked)}
                          />
                          <Label htmlFor={`current-${exp.id}`}>Current Position</Label>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Description *</Label>
                        <Textarea
                          value={exp.description}
                          onChange={(e) => handleArrayChange('experience', index, 'description', e.target.value)}
                          placeholder="Describe your responsibilities, achievements, and key contributions..."
                          rows={3}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        );

      case 2: // Education
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Education</h3>
              <Button onClick={() => addArrayItem('education')} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Education
              </Button>
            </div>

            {formData.education.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <GraduationCap className="mx-auto h-12 w-12 mb-4" />
                <p>No education added yet.</p>
                <p className="text-sm">Click "Add Education" to get started.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {formData.education.map((edu, index) => (
                  <Card key={edu.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Education #{index + 1}</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeArrayItem('education', index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Degree *</Label>
                          <Input
                            value={edu.degree}
                            onChange={(e) => handleArrayChange('education', index, 'degree', e.target.value)}
                            placeholder="Bachelor of Science in Computer Science"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Institution *</Label>
                          <Input
                            value={edu.institution}
                            onChange={(e) => handleArrayChange('education', index, 'institution', e.target.value)}
                            placeholder="University of California"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Location</Label>
                          <Input
                            value={edu.location}
                            onChange={(e) => handleArrayChange('education', index, 'location', e.target.value)}
                            placeholder="Berkeley, CA"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>GPA</Label>
                          <Input
                            value={edu.gpa}
                            onChange={(e) => handleArrayChange('education', index, 'gpa', e.target.value)}
                            placeholder="3.8"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Start Date *</Label>
                          <Input
                            type="date"
                            value={edu.startDate}
                            onChange={(e) => handleArrayChange('education', index, 'startDate', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>End Date</Label>
                          <Input
                            type="date"
                            value={edu.endDate}
                            onChange={(e) => handleArrayChange('education', index, 'endDate', e.target.value)}
                            disabled={edu.current}
                          />
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`edu-current-${edu.id}`}
                          checked={edu.current}
                          onChange={(e) => handleArrayChange('education', index, 'current', e.target.checked)}
                        />
                        <Label htmlFor={`edu-current-${edu.id}`}>Currently Enrolled</Label>
                      </div>

                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                          value={edu.description}
                          onChange={(e) => handleArrayChange('education', index, 'description', e.target.value)}
                          placeholder="Relevant coursework, honors, activities..."
                          rows={3}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        );

      case 3: // Skills
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Skills</h3>
              <Button onClick={() => addArrayItem('skills')} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Skill
              </Button>
            </div>

            {formData.skills.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Award className="mx-auto h-12 w-12 mb-4" />
                <p>No skills added yet.</p>
                <p className="text-sm">Click "Add Skill" to get started.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {formData.skills.map((skill, index) => (
                  <Card key={skill.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-4">
                        <div className="flex-1 space-y-2">
                          <Label>Skill Name *</Label>
                          <Input
                            value={skill.name}
                            onChange={(e) => handleArrayChange('skills', index, 'name', e.target.value)}
                            placeholder="JavaScript"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Level</Label>
                          <select
                            value={skill.level}
                            onChange={(e) => handleArrayChange('skills', index, 'level', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="beginner">Beginner</option>
                            <option value="intermediate">Intermediate</option>
                            <option value="advanced">Advanced</option>
                            <option value="expert">Expert</option>
                          </select>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeArrayItem('skills', index)}
                          className="mt-6"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        );

      case 4: // Projects
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Projects</h3>
              <Button onClick={() => addArrayItem('projects')} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Project
              </Button>
            </div>

            {formData.projects.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileText className="mx-auto h-12 w-12 mb-4" />
                <p>No projects added yet.</p>
                <p className="text-sm">Click "Add Project" to get started.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {formData.projects.map((project, index) => (
                  <Card key={project.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Project #{index + 1}</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeArrayItem('projects', index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Project Name *</Label>
                          <Input
                            value={project.name}
                            onChange={(e) => handleArrayChange('projects', index, 'name', e.target.value)}
                            placeholder="E-commerce Platform"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>URL</Label>
                          <Input
                            value={project.url}
                            onChange={(e) => handleArrayChange('projects', index, 'url', e.target.value)}
                            placeholder="https://github.com/username/project"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Start Date</Label>
                          <Input
                            type="date"
                            value={project.startDate}
                            onChange={(e) => handleArrayChange('projects', index, 'startDate', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>End Date</Label>
                          <Input
                            type="date"
                            value={project.endDate}
                            onChange={(e) => handleArrayChange('projects', index, 'endDate', e.target.value)}
                            disabled={project.current}
                          />
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`project-current-${project.id}`}
                          checked={project.current}
                          onChange={(e) => handleArrayChange('projects', index, 'current', e.target.checked)}
                        />
                        <Label htmlFor={`project-current-${project.id}`}>Currently Working On</Label>
                      </div>

                      <div className="space-y-2">
                        <Label>Technologies</Label>
                        <Input
                          value={project.technologies.join(', ')}
                          onChange={(e) => handleArrayChange('projects', index, 'technologies', e.target.value.split(',').map(t => t.trim()).filter(Boolean))}
                          placeholder="React, Node.js, MongoDB (comma-separated)"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Description *</Label>
                        <Textarea
                          value={project.description}
                          onChange={(e) => handleArrayChange('projects', index, 'description', e.target.value)}
                          placeholder="Describe the project, your role, technologies used, and outcomes..."
                          rows={3}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        );

      case 5: // Preview
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Resume Preview</h3>
              <Button
                variant="outline"
                onClick={() => setShowPreview(!showPreview)}
              >
                {showPreview ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                {showPreview ? 'Hide Preview' : 'Show Preview'}
              </Button>
            </div>

            {showPreview && (
              <Card className="border-2">
                <CardContent className="p-6">
                  <div className="space-y-6">
                    {/* Header */}
                    <div className="text-center border-b pb-4">
                      <h1 className="text-2xl font-bold text-gray-900">
                        {formData.personalInfo.firstName} {formData.personalInfo.lastName}
                      </h1>
                      <p className="text-gray-600 mt-1">{formData.personalInfo.email}</p>
                      {formData.personalInfo.phone && (
                        <p className="text-gray-600">{formData.personalInfo.phone}</p>
                      )}
                      {formData.personalInfo.location && (
                        <p className="text-gray-600">{formData.personalInfo.location}</p>
                      )}
                    </div>

                    {/* Summary */}
                    {formData.personalInfo.summary && (
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-2">Summary</h2>
                        <p className="text-gray-700">{formData.personalInfo.summary}</p>
                      </div>
                    )}

                    {/* Experience */}
                    {formData.experience.length > 0 && (
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-3">Experience</h2>
                        <div className="space-y-4">
                          {formData.experience.map((exp, index) => (
                            <div key={exp.id} className="border-l-4 border-blue-500 pl-4">
                              <h3 className="font-semibold text-gray-900">{exp.title}</h3>
                              <p className="text-gray-600">{exp.company}</p>
                              <p className="text-sm text-gray-500">
                                {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                              </p>
                              <p className="text-gray-700 mt-2">{exp.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Education */}
                    {formData.education.length > 0 && (
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-3">Education</h2>
                        <div className="space-y-4">
                          {formData.education.map((edu, index) => (
                            <div key={edu.id} className="border-l-4 border-green-500 pl-4">
                              <h3 className="font-semibold text-gray-900">{edu.degree}</h3>
                              <p className="text-gray-600">{edu.institution}</p>
                              <p className="text-sm text-gray-500">
                                {edu.startDate} - {edu.current ? 'Present' : edu.endDate}
                              </p>
                              {edu.gpa && <p className="text-sm text-gray-500">GPA: {edu.gpa}</p>}
                              {edu.description && (
                                <p className="text-gray-700 mt-2">{edu.description}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Skills */}
                    {formData.skills.length > 0 && (
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-3">Skills</h2>
                        <div className="flex flex-wrap gap-2">
                          {formData.skills.map((skill) => (
                            <Badge key={skill.id} variant="secondary">
                              {skill.name} ({skill.level})
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Projects */}
                    {formData.projects.length > 0 && (
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-3">Projects</h2>
                        <div className="space-y-4">
                          {formData.projects.map((project, index) => (
                            <div key={project.id} className="border-l-4 border-purple-500 pl-4">
                              <h3 className="font-semibold text-gray-900">{project.name}</h3>
                              {project.url && (
                                <a href={project.url} className="text-blue-600 hover:underline text-sm">
                                  {project.url}
                                </a>
                              )}
                              <p className="text-sm text-gray-500">
                                {project.startDate} - {project.current ? 'Present' : project.endDate}
                              </p>
                              <p className="text-gray-700 mt-2">{project.description}</p>
                              {project.technologies.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {project.technologies.map((tech) => (
                                    <Badge key={tech} variant="outline" className="text-xs">
                                      {tech}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="text-center">
              <Button onClick={handleSave} disabled={isSaving} size="lg">
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Resume
                  </>
                )}
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`
                flex items-center justify-center w-10 h-10 rounded-full border-2 text-sm font-medium
                ${index <= currentStep 
                  ? 'border-blue-600 bg-blue-600 text-white' 
                  : 'border-gray-300 text-gray-500'
                }
              `}>
                {index < currentStep ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <step.icon className="h-5 w-5" />
                )}
              </div>
              {index < steps.length - 1 && (
                <div className={`
                  w-16 h-0.5 mx-2
                  ${index < currentStep ? 'bg-blue-600' : 'bg-gray-300'}
                `} />
              )}
            </div>
          ))}
        </div>
        
        <div className="flex justify-between text-sm text-gray-600">
          {steps.map((step) => (
            <span key={step.id} className="text-center flex-1">
              {step.title}
            </span>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {steps[currentStep].icon && React.createElement(steps[currentStep].icon, { className: "h-5 w-5" })}
            {steps[currentStep].title}
          </CardTitle>
          <CardDescription>
            {currentStep === 0 && "Let's start with your basic information"}
            {currentStep === 1 && "Add your work experience and achievements"}
            {currentStep === 2 && "Include your educational background"}
            {currentStep === 3 && "List your key skills and proficiency levels"}
            {currentStep === 4 && "Showcase your projects and contributions"}
            {currentStep === 5 && "Review and save your resume"}
          </CardDescription>
        </CardHeader>
        <CardContent className="min-h-[400px]">
          {renderStep()}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 0}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>

        <div className="flex gap-2">
          {currentStep < steps.length - 1 ? (
            <Button onClick={nextStep}>
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Resume
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
