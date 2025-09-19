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
  Download,
  Loader2
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { database, analysis } from "@/lib/abstractions";
import { PDFDownloadLink } from '@react-pdf/renderer';
import { ResumePDFDocument } from './resume-pdf';
import { ResumeQualityScore } from "@/lib/abstractions/types";
import { AdvancedResumeAnalysis } from "@/lib/abstractions/providers/advanced-resume-analysis";

interface ResumeListProps {
  resumes: Resume[];
  onResumeDeleted: (resumeId: string) => void;
  onResumeUpdated: (resume: Resume) => void;
  onResumeView?: (resume: Resume) => void;
  onResumeEdit?: (resume: Resume) => void;
}

export function ResumeList({ resumes, onResumeDeleted, onResumeUpdated, onResumeView, onResumeEdit }: ResumeListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [qualityScores, setQualityScores] = useState<Record<string, ResumeQualityScore>>({});
  const [loadingScores, setLoadingScores] = useState<Set<string>>(new Set());
  const [advancedAnalyses, setAdvancedAnalyses] = useState<Record<string, AdvancedResumeAnalysis>>({});
  const [loadingAdvanced, setLoadingAdvanced] = useState<Set<string>>(new Set());

  const loadQualityScore = async (resumeId: string) => {
    if (qualityScores[resumeId] || loadingScores.has(resumeId)) return;
    
    try {
      setLoadingScores(prev => new Set(prev).add(resumeId));
      const resume = await analysis.getResumeById(resumeId);
      if (resume) {
        const score = await analysis.scoreResumeQuality(resume);
        setQualityScores(prev => ({ ...prev, [resumeId]: score }));
      }
    } catch (error) {
      console.error('Failed to load quality score:', error);
    } finally {
      setLoadingScores(prev => {
        const newSet = new Set(prev);
        newSet.delete(resumeId);
        return newSet;
      });
    }
  };

  const loadAdvancedAnalysis = async (resumeId: string) => {
    if (advancedAnalyses[resumeId] || loadingAdvanced.has(resumeId)) return;
    
    try {
      setLoadingAdvanced(prev => new Set(prev).add(resumeId));
      const resume = await analysis.getResumeById(resumeId);
      if (resume) {
        const advancedAnalysis = await analysis.performAdvancedResumeAnalysis(resume);
        setAdvancedAnalyses(prev => ({ ...prev, [resumeId]: advancedAnalysis }));
      }
    } catch (error) {
      console.error('Failed to load advanced analysis:', error);
    } finally {
      setLoadingAdvanced(prev => {
        const newSet = new Set(prev);
        newSet.delete(resumeId);
        return newSet;
      });
    }
  };

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

  const isStructuredResume = (resume: Resume) => {
    try {
      const data = JSON.parse(resume.content);
      return data && data.personalInfo && data.personalInfo.firstName;
    } catch {
      return false;
    }
  };

  const cleanFileName = (fileName: string) => {
    // Remove any existing file extensions
    return fileName.replace(/\.[^/.]+$/, '');
  };

  const handleDownload = async (resume: Resume) => {
    try {
      if (!isStructuredResume(resume)) {
        // If content is not structured, download as text file
        const blob = new Blob([resume.content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${cleanFileName(resume.title)}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        return;
      }
      
      // For structured resumes, the PDFDownloadLink will handle the download
      // This function is kept for the dropdown menu compatibility
      
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
                  {isStructuredResume(resume) ? (
                    <PDFDownloadLink
                      document={<ResumePDFDocument resumeData={JSON.parse(resume.content)} title={resume.title} />}
                      fileName={`${cleanFileName(resume.title)}.pdf`}
                    >
                      {({ blob, url, loading, error }) => (
                        <DropdownMenuItem disabled={loading}>
                          <Download className="h-4 w-4 mr-2" />
                          {loading ? 'Generating PDF...' : 'Download PDF'}
                        </DropdownMenuItem>
                      )}
                    </PDFDownloadLink>
                  ) : (
                    <DropdownMenuItem onClick={() => handleDownload(resume)}>
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </DropdownMenuItem>
                  )}
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

              {/* Analysis Options */}
              <div className="border-t pt-2 space-y-2">
                {/* Basic Quality Score */}
                <div className="flex items-center justify-between">
                  {qualityScores[resume.id] ? (
                    <>
                      <div className="flex items-center gap-2">
                        <div className={`text-sm font-bold ${
                          qualityScores[resume.id].overallScore >= 80 ? 'text-green-600' :
                          qualityScores[resume.id].overallScore >= 70 ? 'text-blue-600' :
                          qualityScores[resume.id].overallScore >= 60 ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {qualityScores[resume.id].overallScore}/100
                        </div>
                        <span className="text-xs text-gray-500">Basic Score</span>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => loadQualityScore(resume.id)}
                        className="text-xs h-6 px-2"
                      >
                        Refresh
                      </Button>
                    </>
                  ) : (
                    <>
                      <span className="text-xs text-gray-500">Basic Analysis</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => loadQualityScore(resume.id)}
                        disabled={loadingScores.has(resume.id)}
                        className="text-xs h-6 px-2"
                      >
                        {loadingScores.has(resume.id) ? (
                          <>
                            <Loader2 className="h-3 w-3 animate-spin mr-1" />
                            Analyzing...
                          </>
                        ) : (
                          'Basic'
                        )}
                      </Button>
                    </>
                  )}
                </div>

                {/* Advanced Analysis */}
                <div className="flex items-center justify-between">
                  {advancedAnalyses[resume.id] ? (
                    <>
                      <div className="flex items-center gap-2">
                        <div className={`text-sm font-bold ${
                          advancedAnalyses[resume.id].overallScore >= 80 ? 'text-green-600' :
                          advancedAnalyses[resume.id].overallScore >= 70 ? 'text-blue-600' :
                          advancedAnalyses[resume.id].overallScore >= 60 ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {advancedAnalyses[resume.id].overallScore}/100
                        </div>
                        <span className="text-xs text-gray-500">Advanced Score</span>
                        <Badge variant="secondary" className="text-xs">Research-Based</Badge>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => loadAdvancedAnalysis(resume.id)}
                        className="text-xs h-6 px-2"
                      >
                        Refresh
                      </Button>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">Advanced Analysis</span>
                        <Badge variant="outline" className="text-xs">Academic Research</Badge>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => loadAdvancedAnalysis(resume.id)}
                        disabled={loadingAdvanced.has(resume.id)}
                        className="text-xs h-6 px-2"
                      >
                        {loadingAdvanced.has(resume.id) ? (
                          <>
                            <Loader2 className="h-3 w-3 animate-spin mr-1" />
                            Analyzing...
                          </>
                        ) : (
                          'Advanced'
                        )}
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex gap-2 pt-2">
                {isStructuredResume(resume) ? (
                  <PDFDownloadLink
                    document={<ResumePDFDocument resumeData={JSON.parse(resume.content)} title={resume.title} />}
                    fileName={`${cleanFileName(resume.title)}.pdf`}
                    className="flex-1"
                  >
                    {({ blob, url, loading, error }) => (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        disabled={loading}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        {loading ? 'Generating...' : 'Download PDF'}
                      </Button>
                    )}
                  </PDFDownloadLink>
                ) : (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleDownload(resume)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                )}
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
