"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { ResumeUpload } from "@/components/resume/resume-upload";
import { ResumeBuilder } from "@/components/resume/resume-builder";
import { ResumeList } from "@/components/resume/resume-list";
import { Resume } from "@/lib/abstractions/types";
import { database } from "@/lib/abstractions";
import { Button } from "@/components/ui/button";
import { Plus, FileText, Upload, Edit3 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";


export default function ResumePage() {
  const { user, isLoaded } = useUser();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'list' | 'upload' | 'builder'>('list');
  const [viewingResume, setViewingResume] = useState<Resume | null>(null);
  const [editingResume, setEditingResume] = useState<Resume | null>(null);


  useEffect(() => {
    if (user?.id && isLoaded) {
      loadResumes();
    }
  }, [user?.id, isLoaded]);

  const loadResumes = async () => {
    if (!user?.id) return;
    
    try {
      setIsLoading(true);
      const userResumes = await database.getUserResumes(user.id);
      setResumes(userResumes);
    } catch (error) {
      console.error('Failed to load resumes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResumeCreated = (newResume: Resume) => {
    setResumes(prev => [newResume, ...prev]);
    setActiveTab('list');
  };

  const handleResumeDeleted = (resumeId: string) => {
    setResumes(prev => prev.filter(resume => resume.id !== resumeId));
  };

  const handleResumeUpdated = (updatedResume: Resume) => {
    setResumes(prev => prev.map(resume => 
      resume.id === updatedResume.id ? updatedResume : resume
    ));
  };

  const handleResumeView = (resume: Resume) => {
    setViewingResume(resume);
  };

  const handleCloseView = () => {
    setViewingResume(null);
  };

  const handleResumeEdit = (resume: Resume) => {
    setEditingResume(resume);
    setActiveTab('builder');
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Loading...</h3>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Please sign in</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Resume Manager</h1>
          <p className="mt-2 text-gray-600">
            Upload, create, and manage your professional resumes
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => setActiveTab('upload')}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            Upload
          </Button>
          <Button 
            onClick={() => setActiveTab('builder')}
            className="flex items-center gap-2"
          >
            <Edit3 className="h-4 w-4" />
            Create New
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
            My Resumes ({resumes.length})
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`
              py-2 px-1 border-b-2 font-medium text-sm
              ${activeTab === 'upload'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
            `}
          >
            Upload Resume
          </button>
          <button
            onClick={() => setActiveTab('builder')}
            className={`
              py-2 px-1 border-b-2 font-medium text-sm
              ${activeTab === 'builder'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
            `}
          >
            Resume Builder
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'list' && (
        <>
          {viewingResume && (
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-blue-600" />
                      {viewingResume.title}
                    </CardTitle>
                    <CardDescription>
                      Resume Content Preview
                    </CardDescription>
                  </div>
                  <Button onClick={handleCloseView} variant="outline" size="sm">
                    Close
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="max-h-96 overflow-y-auto p-4 bg-gray-50 rounded-lg">
                  <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono">
                    {viewingResume.content}
                  </pre>
                </div>
              </CardContent>
            </Card>
          )}
          
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Your Resumes</h2>
            
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading resumes...</p>
                </div>
              </div>
            ) : resumes.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No resumes yet</h3>
                <p className="text-gray-600 mb-4">
                  Get started by uploading your first resume or creating one from scratch.
                </p>
                <div className="flex gap-3 justify-center">
                  <Button onClick={() => setActiveTab('upload')}>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Resume
                  </Button>
                  <Button onClick={() => setActiveTab('builder')}>
                    <Edit3 className="h-4 w-4 mr-2" />
                    Create Resume
                  </Button>
                </div>
              </div>
            ) : (
              <ResumeList
                resumes={resumes}
                onResumeDeleted={handleResumeDeleted}
                onResumeUpdated={handleResumeUpdated}
                onResumeView={handleResumeView}
                onResumeEdit={handleResumeEdit}
              />
            )}
          </div>
        </>
      )}

      {activeTab === 'upload' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Upload Resume</h2>
            <Button 
              variant="outline" 
              onClick={() => setActiveTab('list')}
            >
              Back to Resumes
            </Button>
          </div>
          <ResumeUpload 
            userId={user.id} 
            onResumeCreated={handleResumeCreated}
          />
        </div>
      )}

      {activeTab === 'builder' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Resume Builder</h2>
            <Button 
              variant="outline" 
              onClick={() => setActiveTab('list')}
            >
              Back to Resumes
            </Button>
          </div>
          <ResumeBuilder
            userId={user.id}
            onResumeCreated={handleResumeCreated}
            onResumeUpdated={handleResumeUpdated}
            initialData={editingResume || undefined}
          />
        </div>
      )}
    </div>
  );
}
