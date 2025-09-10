"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Briefcase,
  Save
} from "lucide-react";
import { database } from "@/lib/abstractions";
import { Job } from "@/lib/abstractions/types";

interface JobBookmarkProps {
  userId: string;
  onJobCreated?: (job: Job) => void;
}

interface JobFormData {
  title: string;
  company: string;
  description: string;
  requirements: string[];
  location: string;
  salary: string;
  status: 'saved' | 'applied' | 'interviewing' | 'offered' | 'rejected';
  notes: string;
  url: string;
  postedDate: string;
}

const statusOptions = [
  { value: 'saved', label: 'Saved', color: 'bg-gray-100 text-gray-800' },
  { value: 'applied', label: 'Applied', color: 'bg-blue-100 text-blue-800' },
  { value: 'interviewing', label: 'Interviewing', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'offered', label: 'Offered', color: 'bg-green-100 text-green-800' },
  { value: 'rejected', label: 'Rejected', color: 'bg-red-100 text-red-800' },
];

export function JobBookmark({ userId, onJobCreated }: JobBookmarkProps) {
  const [formData, setFormData] = useState<JobFormData>({
    title: '',
    company: '',
    description: '',
    requirements: [],
    location: '',
    salary: '',
    status: 'saved',
    notes: '',
    url: '',
    postedDate: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requirementsInput, setRequirementsInput] = useState('');

  const handleInputChange = (field: keyof JobFormData, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addRequirement = () => {
    if (requirementsInput.trim()) {
      setFormData(prev => ({
        ...prev,
        requirements: [...prev.requirements, requirementsInput.trim()]
      }));
      setRequirementsInput('');
    }
  };

  const removeRequirement = (index: number) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.company.trim()) {
      alert('Please fill in the required fields (Title and Company)');
      return;
    }

    try {
      setIsSubmitting(true);
      
      const job = await database.createJob({
        userId,
        title: formData.title,
        company: formData.company,
        description: formData.description,
        requirements: formData.requirements,
        location: formData.location,
        salary: formData.salary,
        status: formData.status,
        metadata: {
          notes: formData.notes,
          url: formData.url,
          postedDate: formData.postedDate,
          bookmarkedAt: new Date().toISOString(),
        }
      });

      // Reset form
      setFormData({
        title: '',
        company: '',
        description: '',
        requirements: [],
        location: '',
        salary: '',
        status: 'saved',
        notes: '',
        url: '',
        postedDate: '',
      });

      if (onJobCreated) {
        onJobCreated(job);
      }

    } catch (error) {
      console.error('Failed to create job:', error);
      alert('Failed to save job. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addRequirement();
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-green-600" />
          Bookmark Job
        </CardTitle>
        <CardDescription>
          Save job opportunities and track your applications
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Job Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Job Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Software Engineer"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">Company *</Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => handleInputChange('company', e.target.value)}
                  placeholder="Tech Corp"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="San Francisco, CA"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="salary">Salary Range</Label>
                <Input
                  id="salary"
                  value={formData.salary}
                  onChange={(e) => handleInputChange('salary', e.target.value)}
                  placeholder="$80,000 - $120,000"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="url">Job Posting URL</Label>
              <Input
                id="url"
                type="url"
                value={formData.url}
                onChange={(e) => handleInputChange('url', e.target.value)}
                placeholder="https://company.com/careers/job-title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="postedDate">Posted Date</Label>
              <Input
                id="postedDate"
                type="date"
                value={formData.postedDate}
                onChange={(e) => handleInputChange('postedDate', e.target.value)}
              />
            </div>
          </div>

          {/* Requirements */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Requirements</h3>
            
            <div className="space-y-2">
              <Label>Add Requirements</Label>
              <div className="flex gap-2">
                <Input
                  value={requirementsInput}
                  onChange={(e) => setRequirementsInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="e.g., 3+ years React experience"
                />
                <Button 
                  type="button" 
                  onClick={addRequirement}
                  variant="outline"
                  size="sm"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {formData.requirements.length > 0 && (
              <div className="space-y-2">
                <Label>Current Requirements</Label>
                <div className="flex flex-wrap gap-2">
                  {formData.requirements.map((req, index) => (
                    <Badge 
                      key={index} 
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {req}
                      <button
                        type="button"
                        onClick={() => removeRequirement(index)}
                        className="ml-1 hover:text-red-600"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Job Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Paste the job description here..."
              rows={4}
            />
          </div>

          {/* Status and Notes */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Application Status</h3>
            
            <div className="space-y-2">
              <Label>Status</Label>
              <div className="flex flex-wrap gap-2">
                {statusOptions.map((status) => (
                  <button
                    key={status.value}
                    type="button"
                    onClick={() => handleInputChange('status', status.value)}
                    className={`
                      px-3 py-1 rounded-full text-sm font-medium border
                      ${formData.status === status.value
                        ? `${status.color} border-transparent`
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }
                    `}
                  >
                    {status.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Add your thoughts, application notes, or reminders..."
                rows={3}
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Job
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
