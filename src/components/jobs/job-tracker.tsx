"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { Job, JobCategory } from "@/lib/abstractions/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { JobBookmark } from "./job-bookmark";
import { 
  Search, 
  Filter,
  MapPin, 
  Building, 
  DollarSign, 
  ExternalLink,
  Edit,
  Trash2,
  MoreVertical,
  Briefcase,
  Plus,
  Calendar,
  Tag,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { database } from "@/lib/abstractions";

interface JobTrackerProps {
  jobs: Job[];
  categories: JobCategory[];
  userId: string;
  onJobDeleted: (jobId: string) => void;
  onJobUpdated: (job: Job) => void;
  onJobCreated: (job: Job) => void;
  onEditJob?: (job: Job) => void;
  onCreateCategory?: () => void;
  onEditCategory?: (category: JobCategory) => void;
}

const statusConfig = {
  saved: { label: 'Saved', color: 'bg-gray-100 text-gray-800' },
  applied: { label: 'Applied', color: 'bg-blue-100 text-blue-800' },
  interviewing: { label: 'Interviewing', color: 'bg-yellow-100 text-yellow-800' },
  offered: { label: 'Offered', color: 'bg-green-100 text-green-800' },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800' },
};

const categoryStatusConfig = {
  active: { label: 'Active', color: 'bg-green-100 text-green-800' },
  paused: { label: 'Paused', color: 'bg-yellow-100 text-yellow-800' },
  completed: { label: 'Completed', color: 'bg-gray-100 text-gray-800' },
};

export function JobTracker({ 
  jobs, 
  categories, 
  userId,
  onJobDeleted, 
  onJobUpdated, 
  onJobCreated,
  onEditJob,
  onCreateCategory,
  onEditCategory 
}: JobTrackerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [locationFilter, setLocationFilter] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'company' | 'title'>('date');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(true);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);

  const filteredJobs = useMemo(() => {
    let filtered = jobs;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(job => 
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.requirements.some(req => req.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(job => job.status === statusFilter);
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(job => job.category === categoryFilter);
    }

    // Location filter
    if (locationFilter) {
      filtered = filtered.filter(job => 
        job.location?.toLowerCase().includes(locationFilter.toLowerCase())
      );
    }

    // Sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        case 'company':
          return a.company.localeCompare(b.company);
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    return filtered;
  }, [jobs, searchTerm, statusFilter, categoryFilter, locationFilter, sortBy]);

  // Auto-select first job when jobs are loaded
  useEffect(() => {
    if (filteredJobs.length > 0 && !selectedJob && !editingJob) {
      setSelectedJob(filteredJobs[0]);
    }
  }, [filteredJobs, selectedJob, editingJob]);

  const handleDelete = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this job? This action cannot be undone.')) {
      return;
    }

    try {
      setDeletingId(jobId);
      await database.deleteJob(jobId);
      onJobDeleted(jobId);
      if (selectedJob?.id === jobId) {
        setSelectedJob(null);
      }
    } catch (error) {
      console.error('Failed to delete job:', error);
      alert('Failed to delete job. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleStatusChange = async (job: Job, newStatus: Job['status']) => {
    try {
      const updatedJob = await database.updateJob(job.id, { status: newStatus });
      onJobUpdated(updatedJob);
      if (selectedJob?.id === job.id) {
        setSelectedJob(updatedJob);
      }
    } catch (error) {
      console.error('Failed to update job status:', error);
      alert('Failed to update job status. Please try again.');
    }
  };

  const handleEditJob = (job: Job) => {
    setEditingJob(job);
    setSelectedJob(job);
  };

  const handleCancelEdit = () => {
    setEditingJob(null);
  };

  const handleJobCreated = (newJob: Job) => {
    onJobCreated(newJob);
    setSelectedJob(newJob);
    setEditingJob(null);
  };

  const handleJobUpdated = (updatedJob: Job) => {
    onJobUpdated(updatedJob);
    setSelectedJob(updatedJob);
    setEditingJob(null);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusCount = (status: string) => {
    if (status === 'all') return jobs.length;
    return jobs.filter(job => job.status === status).length;
  };

  const getCategoryCount = (categoryId: string) => {
    if (categoryId === 'all') return jobs.length;
    return jobs.filter(job => job.category === categoryId).length;
  };

  const getCategoryById = (categoryId: string) => {
    return categories.find(cat => cat.id === categoryId);
  };

  return (
    <div className="flex h-[calc(100vh-200px)] bg-white rounded-lg border">
      {/* Left Sidebar - Job List */}
      <div className="w-1/3 border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Jobs</h2>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center gap-1"
              >
                {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                {showPreview ? 'Hide' : 'Show'} Preview
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onCreateCategory}
                className="flex items-center gap-1"
              >
                <Plus className="h-4 w-4" />
                Category
              </Button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search jobs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Advanced Filters - Collapsible */}
          <div className="border-t border-gray-200 pt-3">
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="flex items-center justify-between w-full text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              <span className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Advanced Filters
              </span>
              {showAdvancedFilters ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>
            
            {showAdvancedFilters && (
              <div className="space-y-3 mt-3">
                {/* Status Filter */}
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-2 block">Status</label>
                  <div className="flex flex-wrap gap-1">
                    {['all', ...Object.keys(statusConfig)].map((status) => (
                      <button
                        key={status}
                        onClick={() => setStatusFilter(status)}
                        className={`
                          px-2 py-1 text-xs rounded-full border
                          ${statusFilter === status
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-300 bg-white text-gray-600 hover:bg-gray-50'
                          }
                        `}
                      >
                        {status === 'all' ? 'All' : statusConfig[status as keyof typeof statusConfig].label}
                        <span className="ml-1 text-gray-500">({getStatusCount(status)})</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Category Filter */}
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-2 block">Category</label>
                  <div className="flex flex-wrap gap-1">
                    <button
                      onClick={() => setCategoryFilter('all')}
                      className={`
                        px-2 py-1 text-xs rounded-full border
                        ${categoryFilter === 'all'
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 bg-white text-gray-600 hover:bg-gray-50'
                        }
                      `}
                    >
                      All ({getCategoryCount('all')})
                    </button>
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => setCategoryFilter(category.id)}
                        className={`
                          px-2 py-1 text-xs rounded-full border
                          ${categoryFilter === category.id
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-300 bg-white text-gray-600 hover:bg-gray-50'
                          }
                        `}
                      >
                        {category.name} ({getCategoryCount(category.id)})
                      </button>
                    ))}
                  </div>
                </div>

                {/* Location Filter */}
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-2 block">Location</label>
                  <Input
                    placeholder="Filter by location..."
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                    className="text-sm"
                  />
                </div>

                {/* Sort Options */}
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-2 block">Sort by</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'date' | 'company' | 'title')}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="date">Date</option>
                    <option value="company">Company</option>
                    <option value="title">Title</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Job List */}
        <div className="flex-1 overflow-y-auto">
          {filteredJobs.length === 0 ? (
            <div className="p-4 text-center">
              {searchTerm || statusFilter !== 'all' || categoryFilter !== 'all' || locationFilter ? (
                <>
                  <Briefcase className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">No jobs match your filters</p>
                </>
              ) : (
                <>
                  <Briefcase className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs saved yet</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Start by installing our browser extension to easily save jobs from LinkedIn and other job sites.
                  </p>
                  <div className="space-y-2">
                    <Button 
                      onClick={onCreateCategory}
                      variant="outline" 
                      size="sm"
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Job Category First
                    </Button>
                    <p className="text-xs text-gray-500">
                      Or install the browser extension to start saving jobs
                    </p>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-1 p-2">
              {filteredJobs.map((job) => (
                <div
                  key={job.id}
                  onClick={() => setSelectedJob(job)}
                  className={`
                    p-3 rounded-lg cursor-pointer transition-colors
                    ${selectedJob?.id === job.id
                      ? 'bg-blue-50 border border-blue-200'
                      : 'hover:bg-gray-50 border border-transparent'
                    }
                  `}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">{job.title}</h3>
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <Building className="h-3 w-3" />
                        {job.company}
                      </p>
                      {job.location && (
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {job.location}
                        </p>
                      )}
                      {job.category && (
                        <div className="flex items-center gap-1 mt-1">
                          <Tag className="h-3 w-3 text-gray-400" />
                          <span className="text-xs text-gray-500">
                            {getCategoryById(job.category)?.name || job.category}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge className={`text-xs ${statusConfig[job.status].color}`}>
                        {statusConfig[job.status].label}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {formatDate(job.updatedAt)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Panel - Job Preview */}
      {showPreview && (
        <div className="flex-1 flex flex-col">
          {editingJob ? (
            /* Inline Edit Mode */
            <div className="flex-1 flex flex-col">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {editingJob.id ? 'Edit Job' : 'Add New Job'}
                  </h2>
                  <Button 
                    variant="outline" 
                    onClick={handleCancelEdit}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                <JobBookmark
                  userId={userId}
                  onJobCreated={handleJobCreated}
                  onJobUpdated={handleJobUpdated}
                  editingJob={editingJob}
                  onCancelEdit={handleCancelEdit}
                  inline={true}
                />
              </div>
            </div>
          ) : selectedJob ? (
            <>
              {/* Job Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">{selectedJob.title}</h1>
                    <div className="flex items-center gap-4 text-gray-600 mb-4">
                      <div className="flex items-center gap-1">
                        <Building className="h-4 w-4" />
                        {selectedJob.company}
                      </div>
                      {selectedJob.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {selectedJob.location}
                        </div>
                      )}
                      {selectedJob.salary && (
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          {selectedJob.salary}
                        </div>
                      )}
                      {selectedJob.postedDate && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Posted {selectedJob.postedDate}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={statusConfig[selectedJob.status].color}>
                        {statusConfig[selectedJob.status].label}
                      </Badge>
                      {selectedJob.category && (
                        <Badge variant="outline">
                          {getCategoryById(selectedJob.category)?.name || selectedJob.category}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEditJob(selectedJob)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      {selectedJob.url ? (
                        <DropdownMenuItem asChild>
                          <a
                            href={selectedJob.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center w-full"
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            View Original
                          </a>
                        </DropdownMenuItem>
                      ) : null}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => handleDelete(selectedJob.id)}
                        className="text-red-600 focus:text-red-600"
                        disabled={deletingId === selectedJob.id}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        {deletingId === selectedJob.id ? 'Deleting...' : 'Delete'}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Job Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {/* Requirements */}
                {selectedJob.requirements.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Requirements</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedJob.requirements.map((req, index) => (
                        <Badge key={index} variant="outline">
                          {req}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Description */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                  <div className="prose prose-sm max-w-none">
                    {selectedJob.descriptionHtml ? (
                      <div 
                        dangerouslySetInnerHTML={{ __html: selectedJob.descriptionHtml }}
                        className="text-gray-700 leading-relaxed"
                      />
                    ) : (
                      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {selectedJob.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="p-6 border-t border-gray-200">
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => handleStatusChange(selectedJob, 'applied')}
                    disabled={selectedJob.status === 'applied'}
                    className="flex-1"
                  >
                    Mark Applied
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => handleStatusChange(selectedJob, 'interviewing')}
                    disabled={selectedJob.status === 'interviewing'}
                    className="flex-1"
                  >
                    Interviewing
                  </Button>
                  {selectedJob.url && (
                    <Button asChild variant="default" className="flex-1">
                      <a
                        href={selectedJob.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Apply Now
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Briefcase className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a job to view details</h3>
                <p className="text-gray-600">
                  Choose a job from the list to see its full description and details
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
