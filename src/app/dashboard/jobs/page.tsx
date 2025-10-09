"use client";

import { useState, useEffect, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import { JobBookmark } from "@/components/jobs/job-bookmark";
import { JobTracker } from "@/components/jobs/job-tracker";
import { JobCategoryManager } from "@/components/jobs/job-category-manager";
import { Job, JobCategory } from "@/lib/abstractions/types";
import { database } from "@/lib/abstractions";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Briefcase, Plus, Bookmark, Tag } from "lucide-react";

export default function JobsPage() {
  const { user, isLoaded } = useUser();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [categories, setCategories] = useState<JobCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'tracker' | 'add' | 'categories'>('tracker');
  const [editingJob, setEditingJob] = useState<Job | null>(null);

  const loadJobs = useCallback(async () => {
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
  }, [user?.id]);

  const loadCategories = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const userCategories = await database.getUserJobCategories(user.id);
      setCategories(userCategories);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id && isLoaded) {
      loadJobs();
      loadCategories();
    }
  }, [user?.id, isLoaded, loadJobs, loadCategories]);

  const handleJobCreated = (newJob: Job) => {
    setJobs(prev => [newJob, ...prev]);
    setActiveTab('tracker');
  };

  const handleJobDeleted = (jobId: string) => {
    setJobs(prev => prev.filter(job => job.id !== jobId));
  };

  const handleJobUpdated = (updatedJob: Job) => {
    setJobs(prev => prev.map(job => 
      job.id === updatedJob.id ? updatedJob : job
    ));
    setEditingJob(null);
    setActiveTab('tracker');
  };

  const handleEditJob = (job: Job) => {
    setEditingJob(job);
    setActiveTab('add');
  };

  const handleCancelEdit = () => {
    setEditingJob(null);
    setActiveTab('tracker');
  };

  const handleCategoryCreated = (newCategory: JobCategory) => {
    setCategories(prev => [newCategory, ...prev]);
  };

  const handleCategoryUpdated = (updatedCategory: JobCategory) => {
    setCategories(prev => prev.map(cat => 
      cat.id === updatedCategory.id ? updatedCategory : cat
    ));
  };

  const handleCategoryDeleted = (categoryId: string) => {
    setCategories(prev => prev.filter(cat => cat.id !== categoryId));
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
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'tracker' | 'add' | 'categories')}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="tracker" className="flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            Job Tracker ({jobs.length})
          </TabsTrigger>
          <TabsTrigger value="add" className="flex items-center gap-2">
            <Bookmark className="h-4 w-4" />
            Add Job
          </TabsTrigger>
          <TabsTrigger value="categories" className="flex items-center gap-2">
            <Tag className="h-4 w-4" />
            Categories ({categories.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tracker" className="mt-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading jobs...</p>
              </div>
            </div>
          ) : (
            <JobTracker
              jobs={jobs}
              categories={categories}
              userId={user.id}
              onJobDeleted={handleJobDeleted}
              onJobUpdated={handleJobUpdated}
              onJobCreated={handleJobCreated}
              onEditJob={handleEditJob}
              onCreateCategory={() => setActiveTab('categories')}
              onEditCategory={() => setActiveTab('categories')}
            />
          )}
        </TabsContent>

        <TabsContent value="add" className="mt-6">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {editingJob ? 'Edit Job' : 'Add New Job'}
              </h2>
              <p className="mt-2 text-gray-600">
                {editingJob ? 'Update job details and application status' : 'Save job opportunities and track your applications'}
              </p>
            </div>
            
            <JobBookmark
              userId={user.id}
              onJobCreated={handleJobCreated}
              onJobUpdated={handleJobUpdated}
              editingJob={editingJob}
              onCancelEdit={handleCancelEdit}
              inline={true}
            />
          </div>
        </TabsContent>

        <TabsContent value="categories" className="mt-6">
          <JobCategoryManager
            categories={categories}
            userId={user.id}
            onCategoryCreated={handleCategoryCreated}
            onCategoryUpdated={handleCategoryUpdated}
            onCategoryDeleted={handleCategoryDeleted}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}