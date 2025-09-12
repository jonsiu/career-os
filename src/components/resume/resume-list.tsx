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
      let resumeData;
      let fileName = resume.title;
      
      // Parse the resume content
      try {
        resumeData = JSON.parse(resume.content);
      } catch (error) {
        // If content is not JSON, it's raw text
        const blob = new Blob([resume.content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${fileName}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        return;
      }

      // For structured resumes, open in new window with print functionality
      // This reuses the existing ResumePreview component styling
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>${fileName}</title>
            <style>
              body { 
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                line-height: 1.6; 
                color: #333; 
                max-width: 800px; 
                margin: 0 auto; 
                padding: 20px; 
                background: white; 
              }
              .header { 
                text-align: center; 
                border-bottom: 2px solid #2563eb; 
                padding-bottom: 20px; 
                margin-bottom: 30px; 
              }
              .name { 
                font-size: 2.5em; 
                font-weight: bold; 
                color: #1e40af; 
                margin: 0; 
              }
              .contact { 
                font-size: 1.1em; 
                color: #6b7280; 
                margin: 10px 0; 
              }
              .section { 
                margin-bottom: 30px; 
              }
              .section-title { 
                font-size: 1.5em; 
                font-weight: bold; 
                color: #1e40af; 
                border-bottom: 1px solid #e5e7eb; 
                padding-bottom: 5px; 
                margin-bottom: 15px; 
              }
              .experience-item, .education-item, .project-item { 
                margin-bottom: 20px; 
                padding-left: 20px; 
                border-left: 3px solid #2563eb; 
              }
              .item-header { 
                display: flex; 
                justify-content: space-between; 
                align-items: flex-start; 
                margin-bottom: 5px; 
              }
              .item-title { 
                font-weight: bold; 
                font-size: 1.1em; 
                color: #1f2937; 
              }
              .item-company { 
                color: #2563eb; 
                font-weight: 600; 
              }
              .item-date { 
                color: #6b7280; 
                font-size: 0.9em; 
              }
              .item-description { 
                color: #4b5563; 
                margin-top: 5px; 
              }
              .skills-grid { 
                display: grid; 
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
                gap: 10px; 
              }
              .skill-item { 
                background: #f3f4f6; 
                padding: 8px 12px; 
                border-radius: 6px; 
                font-size: 0.9em; 
              }
              .summary { 
                font-style: italic; 
                color: #4b5563; 
                background: #f9fafb; 
                padding: 15px; 
                border-radius: 8px; 
                border-left: 4px solid #2563eb; 
              }
              @media print { 
                body { margin: 0; padding: 15px; } 
                .section { page-break-inside: avoid; } 
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1 class="name">${resumeData.personalInfo.firstName} ${resumeData.personalInfo.lastName}</h1>
              <div class="contact">
                ${resumeData.personalInfo.email} | ${resumeData.personalInfo.phone || ''} | ${resumeData.personalInfo.location || ''}
              </div>
            </div>
            
            ${resumeData.personalInfo.summary ? `
            <div class="section">
              <h2 class="section-title">Professional Summary</h2>
              <div class="summary">${resumeData.personalInfo.summary}</div>
            </div>
            ` : ''}
            
            ${resumeData.experience && resumeData.experience.length > 0 ? `
            <div class="section">
              <h2 class="section-title">Professional Experience</h2>
              ${resumeData.experience.map((exp: any) => `
                <div class="experience-item">
                  <div class="item-header">
                    <div>
                      <div class="item-title">${exp.title}</div>
                      <div class="item-company">${exp.company}</div>
                    </div>
                    <div class="item-date">${exp.startDate} - ${exp.current ? 'Present' : exp.endDate}</div>
                  </div>
                  ${exp.description ? `<div class="item-description">${exp.description}</div>` : ''}
                </div>
              `).join('')}
            </div>
            ` : ''}
            
            ${resumeData.education && resumeData.education.length > 0 ? `
            <div class="section">
              <h2 class="section-title">Education</h2>
              ${resumeData.education.map((edu: any) => `
                <div class="education-item">
                  <div class="item-header">
                    <div>
                      <div class="item-title">${edu.degree}</div>
                      <div class="item-company">${edu.institution}</div>
                    </div>
                    <div class="item-date">${edu.startDate} - ${edu.current ? 'Present' : edu.endDate}</div>
                  </div>
                  ${edu.gpa ? `<div class="item-description">GPA: ${edu.gpa}</div>` : ''}
                  ${edu.description ? `<div class="item-description">${edu.description}</div>` : ''}
                </div>
              `).join('')}
            </div>
            ` : ''}
            
            ${resumeData.skills && resumeData.skills.length > 0 ? `
            <div class="section">
              <h2 class="section-title">Skills</h2>
              <div class="skills-grid">
                ${resumeData.skills.map((skill: any) => `
                  <div class="skill-item">${skill.name}</div>
                `).join('')}
              </div>
            </div>
            ` : ''}
            
            ${resumeData.projects && resumeData.projects.length > 0 ? `
            <div class="section">
              <h2 class="section-title">Projects</h2>
              ${resumeData.projects.map((project: any) => `
                <div class="project-item">
                  <div class="item-header">
                    <div>
                      <div class="item-title">${project.name}</div>
                    </div>
                    <div class="item-date">${project.startDate} - ${project.current ? 'Present' : project.endDate}</div>
                  </div>
                  ${project.description ? `<div class="item-description">${project.description}</div>` : ''}
                  ${project.technologies && project.technologies.length > 0 ? `
                    <div class="item-description">
                      <strong>Technologies:</strong> ${project.technologies.join(', ')}
                    </div>
                  ` : ''}
                </div>
              `).join('')}
            </div>
            ` : ''}
          </body>
          </html>
        `);
        printWindow.document.close();
        
        // Auto-print after a short delay
        setTimeout(() => {
          printWindow.print();
        }, 500);
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
                <CardTitle className="text-xl font-bold text-gray-900 truncate">
                  {resume.title}
                </CardTitle>
                <CardDescription className="mt-1">
                  {(() => {
                    try {
                      const resumeData = JSON.parse(resume.content);
                      const name = `${resumeData.personalInfo?.firstName || ''} ${resumeData.personalInfo?.lastName || ''}`.trim();
                      return (
                        <div>
                          {name && (
                            <div className="font-medium text-gray-600 text-sm mb-2">
                              👤 {name}
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-xs text-gray-400">
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
                      📄 {typeof resume.metadata?.originalFileName === 'string' ? resume.metadata.originalFileName.split('.').pop()?.toUpperCase() || 'FILE' : 'FILE'}
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
              </div>

              {/* Resume Summary */}
              <div className="text-sm text-gray-600">
                {(() => {
                  try {
                    const resumeData = JSON.parse(resume.content);
                    return (
                      <div className="text-xs text-gray-500">
                        {resumeData.experience?.length || 0} position{(resumeData.experience?.length || 0) !== 1 ? 's' : ''} • {resumeData.education?.length || 0} degree{(resumeData.education?.length || 0) !== 1 ? 's' : ''} • {resumeData.skills?.length || 0} skill{(resumeData.skills?.length || 0) !== 1 ? 's' : ''}
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
                })() as React.ReactNode}
              </div>

              {/* File Metadata */}
              {resume.metadata?.originalFileName ? (
                <div className="text-xs text-gray-400 border-t pt-2">
                  <div className="flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    <span>Original file: {String(resume.metadata.originalFileName)}</span>
                  </div>
                </div>
              ) : null}

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
