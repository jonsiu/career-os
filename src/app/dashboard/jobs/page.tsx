"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { JobBookmark } from "@/components/jobs/job-bookmark";
import { JobList } from "@/components/jobs/job-list";
import { Job } from "@/lib/abstractions/types";
import { database } from "@/lib/abstractions";
import { Button } from "@/components/ui/button";
import { Briefcase, Plus, Bookmark } from "lucide-react";

export default function JobsPage() {
  const { user, isLoaded } = useUser();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'list' | 'add'>('list');

  useEffect(() => {
    if (user?.id && isLoaded) {
      loadJobs();
    }
  }, [user?.id, isLoaded]);

  const loadJobs = async () => {
    if (!user?.id) return;
    
    try {
      setIsLoading(true);
      const userJobs = await database.getUserJobs(user.id);
      setJobs(userJobs);
    } catch (error) {
      console.error('Failed to load jobs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleJobCreated = (newJob: Job) => {
    setJobs(prev => [newJob, ...prev]);
    setActiveTab('list');
  };

  const handleJobDeleted = (jobId: string) => {
    setJobs(prev => prev.filter(job => job.id !== jobId));
  };

  const handleJobUpdated = (updatedJob: Job) => {
    setJobs(prev => prev.map(job => 
      job.id === updatedJob.id ? updatedJob : job
    ));
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <Briefcase className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Loading...</h3>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <Briefcase className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Please sign in</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Job Tracker</h1>
          <p className="mt-2 text-gray-600">
            Save job opportunities and track your application progress
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => setActiveTab('list')}
            variant={activeTab === 'list' ? 'default' : 'outline'}
            className="flex items-center gap-2"
          >
            <Briefcase className="h-4 w-4" />
            My Jobs ({jobs.length})
          </Button>
          <Button 
            onClick={() => setActiveTab('add')}
            variant={activeTab === 'add' ? 'default' : 'outline'}
            className="flex items-center gap-2"
          >
            <Bookmark className="h-4 w-4" />
            Add Job
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('list')}
            className={`
              py-2 px-1 border-b-2 font-medium text-sm
              ${activeTab === 'list'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
            `}
          >
            My Jobs ({jobs.length})
          </button>
          <button
            onClick={() => setActiveTab('add')}
            className={`
              py-2 px-1 border-b-2 font-medium text-sm
              ${activeTab === 'add'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
            `}
          >
            Add New Job
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'list' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Your Job Applications</h2>
            <Button 
              variant="outline" 
              onClick={() => setActiveTab('add')}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Job
            </Button>
          </div>
          
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading jobs...</p>
              </div>
            </div>
          ) : (
            <JobList
              jobs={jobs}
              onJobDeleted={handleJobDeleted}
              onJobUpdated={handleJobUpdated}
            />
          )}
        </div>
      )}

      {activeTab === 'add' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Bookmark New Job</h2>
            <Button 
              variant="outline" 
              onClick={() => setActiveTab('list')}
            >
              Back to Jobs
            </Button>
          </div>
          <JobBookmark
            userId={user.id}
            onJobCreated={handleJobCreated}
          />
        </div>
      )}
    </div>
  );
}
