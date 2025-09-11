"use client";

import { useState } from "react";
import { Resume } from "@/lib/abstractions/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Eye, 
  Edit, 
  Trash2, 
  FileText, 
  Calendar,
  MoreVertical,
  Download
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { database } from "@/lib/abstractions";

interface ResumeListProps {
  resumes: Resume[];
  onResumeDeleted: (resumeId: string) => void;
  onResumeUpdated: (resume: Resume) => void;
  onResumeView?: (resume: Resume) => void;
  onResumeEdit?: (resume: Resume) => void;
}

export function ResumeList({ resumes, onResumeDeleted, onResumeUpdated, onResumeView, onResumeEdit }: ResumeListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (resumeId: string) => {
    if (!confirm('Are you sure you want to delete this resume? This action cannot be undone.')) {
      return;
    }

    try {
      setDeletingId(resumeId);
      await database.deleteResume(resumeId);
      onResumeDeleted(resumeId);
    } catch (error) {
      console.error('Failed to delete resume:', error);
      alert('Failed to delete resume. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleDownload = async (resume: Resume) => {
    try {
      if (resume.filePath) {
        // TODO: Implement actual file download
        alert('Download functionality coming soon!');
      } else {
        // For manually created resumes, create a text file
        const blob = new Blob([resume.content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${resume.title}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Failed to download resume:', error);
      alert('Failed to download resume. Please try again.');
    }
  };

  const handleView = (resume: Resume) => {
    if (onResumeView) {
      onResumeView(resume);
    } else {
      // Fallback: show resume content in a modal or alert
      alert(`Resume: ${resume.title}\n\nContent:\n${resume.content.substring(0, 500)}...`);
    }
  };

  const handleEdit = (resume: Resume) => {
    if (onResumeEdit) {
      onResumeEdit(resume);
    } else {
      // Fallback: show edit message
      alert(`Edit functionality for "${resume.title}" coming soon!`);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };


  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {resumes.map((resume) => (
        <Card key={resume.id} className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <CardTitle className="text-lg font-semibold text-gray-900 truncate">
                  {resume.title}
                </CardTitle>
                <CardDescription className="mt-1">
                  {(() => {
                    try {
                      const resumeData = JSON.parse(resume.content);
                      const name = `${resumeData.personalInfo?.firstName || ''} ${resumeData.personalInfo?.lastName || ''}`.trim();
                      const summary = resumeData.personalInfo?.summary || '';
                      return (
                        <div>
                          {name && (
                            <div className="font-medium text-gray-700 text-base mb-1">
                              👤 {name}
                            </div>
                          )}
                          <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                            <Calendar className="h-3 w-3" />
                            Updated {formatDate(resume.updatedAt)}
                          </div>
                        </div>
                      );
                    } catch (error) {
                      return (
                        <div>
                          <div className="text-sm text-gray-500 flex items-center gap-1">
                            <FileText className="h-4 w-4" />
                            Raw resume content
                          </div>
                          <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                            <Calendar className="h-3 w-3" />
                            Updated {formatDate(resume.updatedAt)}
                          </div>
                        </div>
                      );
                    }
                  })()}
                </CardDescription>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleDownload(resume)}>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleView(resume)}>
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleEdit(resume)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => handleDelete(resume.id)}
                    className="text-red-600 focus:text-red-600"
                    disabled={deletingId === resume.id}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {deletingId === resume.id ? 'Deleting...' : 'Delete'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          
          <CardContent className="pt-0">
            <div className="space-y-3">
              {/* File Type Badge */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {resume.filePath ? (
                    <Badge variant="secondary" className="text-xs">
                      📄 {resume.filePath.split('.').pop()?.toUpperCase() || 'FILE'}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs">
                      ✏️ Manual
                    </Badge>
                  )}
                  {resume.metadata?.fileSize ? (
                    <span className="text-xs text-gray-500">
                      {(Number(resume.metadata.fileSize) / 1024).toFixed(1)} KB
                    </span>
                  ) : null}
                </div>
                {(() => {
                  try {
                    const resumeData = JSON.parse(resume.content);
                    const isComplete = resumeData.personalInfo?.firstName && 
                                     resumeData.personalInfo?.email && 
                                     (resumeData.experience?.length > 0 || resumeData.education?.length > 0);
                    return isComplete ? (
                      <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                        ✅ Complete
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs text-orange-600 border-orange-200">
                        ⚠️ Incomplete
                      </Badge>
                    );
                  } catch (error) {
                    return (
                      <Badge variant="outline" className="text-xs text-gray-500">
                        📝 Raw Text
                      </Badge>
                    );
                  }
                })()}
              </div>

              {/* Simple Resume Info */}
              <div className="text-sm text-gray-600">
                {(() => {
                  try {
                    const resumeData = JSON.parse(resume.content);
                    const name = `${resumeData.personalInfo?.firstName || ''} ${resumeData.personalInfo?.lastName || ''}`.trim();
                    return (
                      <div className="space-y-1">
                        {name && (
                          <div className="text-gray-700 font-medium">
                            👤 {name}
                          </div>
                        )}
                        <div className="text-xs text-gray-500">
                          {resumeData.experience?.length || 0} experiences • {resumeData.education?.length || 0} education • {resumeData.skills?.length || 0} skills
                        </div>
                      </div>
                    );
                  } catch (error) {
                    return (
                      <div className="text-xs text-gray-500 flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        <span>Raw resume content</span>
                      </div>
                    );
                  }
                })()}
              </div>

              {/* Quick Actions */}
              <div className="flex gap-2 pt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => handleDownload(resume)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => handleView(resume)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
