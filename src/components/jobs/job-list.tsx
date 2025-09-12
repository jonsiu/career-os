"use client";

import { useState, useMemo } from "react";
import { Job } from "@/lib/abstractions/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  Briefcase
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { database } from "@/lib/abstractions";

interface JobListProps {
  jobs: Job[];
  onJobDeleted: (jobId: string) => void;
  onJobUpdated: (job: Job) => void;
  onEditJob?: (job: Job) => void;
}

const statusConfig = {
  saved: { label: 'Saved', color: 'bg-gray-100 text-gray-800' },
  applied: { label: 'Applied', color: 'bg-blue-100 text-blue-800' },
  interviewing: { label: 'Interviewing', color: 'bg-yellow-100 text-yellow-800' },
  offered: { label: 'Offered', color: 'bg-green-100 text-green-800' },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800' },
};

export function JobList({ jobs, onJobDeleted, onJobUpdated, onEditJob }: JobListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [locationFilter, setLocationFilter] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'company' | 'title'>('date');
  const [deletingId, setDeletingId] = useState<string | null>(null);

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
  }, [jobs, searchTerm, statusFilter, locationFilter, sortBy]);

  const handleDelete = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this job? This action cannot be undone.')) {
      return;
    }

    try {
      setDeletingId(jobId);
      await database.deleteJob(jobId);
      onJobDeleted(jobId);
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
    } catch (error) {
      console.error('Failed to update job status:', error);
      alert('Failed to update job status. Please try again.');
    }
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

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search jobs by title, company, or requirements..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap gap-4 items-center">
          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Status:</span>
            <div className="flex gap-1">
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

          {/* Location Filter */}
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-gray-500" />
            <Input
              placeholder="Filter by location..."
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="w-40"
            />
          </div>

          {/* Sort Options */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'company' | 'title')}
              className="px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="date">Date</option>
              <option value="company">Company</option>
              <option value="title">Title</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-600">
        Showing {filteredJobs.length} of {jobs.length} jobs
      </div>

      {/* Jobs Grid */}
      {filteredJobs.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <Briefcase className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
          <p className="text-gray-600">
            {searchTerm || statusFilter !== 'all' || locationFilter
              ? 'Try adjusting your search or filters'
              : 'Start by bookmarking your first job opportunity'
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJobs.map((job) => (
            <Card key={job.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg font-semibold text-gray-900 truncate">
                      {job.title}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <Building className="h-4 w-4" />
                      {job.company}
                    </CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEditJob?.(job)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      {job.metadata?.url ? (
                        <DropdownMenuItem asChild>
                          <a
                            href={String(job.metadata.url)}
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
                        onClick={() => handleDelete(job.id)}
                        className="text-red-600 focus:text-red-600"
                        disabled={deletingId === job.id}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        {deletingId === job.id ? 'Deleting...' : 'Delete'}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {/* Status Badge */}
                  <div className="flex items-center justify-between">
                    <Badge className={statusConfig[job.status].color}>
                      {statusConfig[job.status].label}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {formatDate(job.updatedAt)}
                    </span>
                  </div>

                  {/* Location and Salary */}
                  <div className="space-y-2">
                    {job.location && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4" />
                        {job.location}
                      </div>
                    )}
                    {job.salary && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <DollarSign className="h-4 w-4" />
                        {job.salary}
                      </div>
                    )}
                  </div>

                  {/* Requirements Preview */}
                  {job.requirements.length > 0 ? (
                    <div className="space-y-2">
                      <span className="text-xs font-medium text-gray-700">Requirements:</span>
                      <div className="flex flex-wrap gap-1">
                        {job.requirements.slice(0, 3).map((req, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {req}
                          </Badge>
                        ))}
                        {job.requirements.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{job.requirements.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  ) : null}

                  {/* Description Preview */}
                  {job.description && (
                    <div className="text-sm text-gray-600">
                      <p className="line-clamp-2">
                        {job.description.length > 100 
                          ? `${job.description.substring(0, 100)}...` 
                          : job.description
                        }
                      </p>
                    </div>
                  )}

                  {/* Quick Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleStatusChange(job, 'applied')}
                      disabled={job.status === 'applied'}
                    >
                      Mark Applied
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleStatusChange(job, 'interviewing')}
                      disabled={job.status === 'interviewing'}
                    >
                      Interviewing
                    </Button>
                  </div>

                  {/* External Link */}
                  {job.metadata?.url ? (
                    <div className="pt-2 border-t">
                      <a
                        href={String(job.metadata.url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        <ExternalLink className="h-4 w-4" />
                        View Original Posting
                      </a>
                    </div>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
