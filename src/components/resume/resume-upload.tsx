"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, FileText, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { database, fileStorage } from "@/lib/abstractions";
import { Resume } from "@/lib/abstractions/types";

interface ResumeUploadProps {
  userId: string;
  onResumeCreated?: (resume: Resume) => void;
}

export function ResumeUpload({ userId, onResumeCreated }: ResumeUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [resumeTitle, setResumeTitle] = useState('');
  const [parsedContent, setParsedContent] = useState('');

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    setUploadStatus('uploading');
    setIsUploading(true);
    setUploadProgress(0);
    setErrorMessage('');

    try {
      // Parse the file content
      const content = await parseFile(file);
      setParsedContent(content);

      // Generate a default title if none provided
      if (!resumeTitle) {
        setResumeTitle(file.name.replace(/\.[^/.]+$/, ''));
      }

      // Determine if userId is already a Convex user ID or needs to be looked up
      let convexUserId = userId;
      if (!userId.startsWith('js')) { // Convex IDs start with 'js', Clerk IDs are longer
        // This is a Clerk user ID, need to look up the Convex user ID
        const convexUser = await database.getUserByClerkId(userId);
        if (!convexUser) {
          throw new Error('User not found in database');
        }
        convexUserId = convexUser.id;
      }
      // If userId already starts with 'js', it's already a Convex user ID, use it directly

      // Upload file to storage
      const filePath = await fileStorage.uploadFile(file, `resumes/${userId}`, convexUserId);
      setUploadProgress(50);

      // Create resume in database
      const resume = await database.createResume({
        userId,
        title: resumeTitle || file.name,
        content,
        filePath,
        metadata: {
          originalFileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          uploadedAt: new Date().toISOString()
        }
      });

      setUploadProgress(100);
      setUploadStatus('success');
      
      // Call the callback if provided
      if (onResumeCreated) {
        onResumeCreated(resume);
      }

    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  }, [userId, resumeTitle, onResumeCreated]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc']
    },
    multiple: false,
    disabled: isUploading
  });

  const parseFile = async (file: File): Promise<string> => {
    if (file.type === 'application/pdf') {
      return await parsePDF(file);
    } else if (file.type.includes('word') || file.name.endsWith('.docx') || file.name.endsWith('.doc')) {
      return await parseWord(file);
    } else {
      throw new Error('Unsupported file type');
    }
  };

  const parsePDF = async (file: File): Promise<string> => {
    try {
      const pdfjsLib = await import('pdfjs-dist');
      
      // Set worker source to use local worker file
      pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
      
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      let text = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        text += pageText + '\n';
      }
      
      return text.trim();
    } catch (error) {
      console.error('Error parsing PDF:', error);
      throw new Error('Failed to parse PDF file');
    }
  };

  const parseWord = async (file: File): Promise<string> => {
    try {
      const { default: mammoth } = await import('mammoth');
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      return result.value;
    } catch (error) {
      throw new Error('Failed to parse Word document');
    }
  };

  const handleManualSubmit = async () => {
    if (!resumeTitle.trim()) {
      setErrorMessage('Please enter a resume title');
      return;
    }

    if (!parsedContent.trim()) {
      setErrorMessage('Please upload a file first');
      return;
    }

    setUploadStatus('uploading');
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const resume = await database.createResume({
        userId,
        title: resumeTitle,
        content: parsedContent,
        metadata: {
          manuallyCreated: true,
          createdAt: new Date().toISOString()
        }
      });

      setUploadProgress(100);
      setUploadStatus('success');
      
      if (onResumeCreated) {
        onResumeCreated(resume);
      }

    } catch (error) {
      console.error('Creation error:', error);
      setUploadStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Failed to create resume');
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setUploadStatus('idle');
    setUploadProgress(0);
    setErrorMessage('');
    setResumeTitle('');
    setParsedContent('');
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-blue-600" />
          Upload Resume
        </CardTitle>
        <CardDescription>
          Upload your resume in PDF or Word format, or create one manually
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* File Upload Area */}
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${isDragActive && !isDragReject ? 'border-blue-500 bg-blue-50' : ''}
            ${isDragReject ? 'border-red-500 bg-red-50' : ''}
            ${!isDragActive && !isDragReject ? 'border-gray-300 hover:border-gray-400' : ''}
            ${isUploading ? 'pointer-events-none opacity-50' : ''}
          `}
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          
          {isDragActive ? (
            <p className="text-lg font-medium text-blue-600">
              {isDragReject ? 'File type not supported' : 'Drop your resume here'}
            </p>
          ) : (
            <div>
              <p className="text-lg font-medium text-gray-900 mb-2">
                Drag & drop your resume here
              </p>
              <p className="text-sm text-gray-500">
                or click to browse files
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Supports PDF, DOCX, and DOC files
              </p>
            </div>
          )}
        </div>

        {/* Upload Progress */}
        {isUploading && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm font-medium">Uploading...</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <span className="text-xs text-gray-500">{uploadProgress}%</span>
          </div>
        )}

        {/* Success State */}
        {uploadStatus === 'success' && (
          <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-green-800 font-medium">Resume uploaded successfully!</span>
          </div>
        )}

        {/* Error State */}
        {uploadStatus === 'error' && (
          <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <span className="text-red-800">{errorMessage}</span>
          </div>
        )}

        {/* Resume Title Input */}
        <div className="space-y-2">
          <Label htmlFor="resume-title">Resume Title</Label>
          <Input
            id="resume-title"
            value={resumeTitle}
            onChange={(e) => setResumeTitle(e.target.value)}
            placeholder="e.g., Software Engineer Resume 2024"
            disabled={isUploading}
          />
        </div>

        {/* Parsed Content Preview */}
        {parsedContent && (
          <div className="space-y-2">
            <Label>Content Preview</Label>
            <div className="max-h-40 overflow-y-auto p-3 bg-gray-50 border rounded-lg text-sm text-gray-700">
              {parsedContent.length > 500 
                ? `${parsedContent.substring(0, 500)}...` 
                : parsedContent
              }
            </div>
            <p className="text-xs text-gray-500">
              {parsedContent.length} characters extracted
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          {uploadStatus === 'success' ? (
            <Button onClick={resetForm} variant="outline" className="flex-1">
              Upload Another Resume
            </Button>
          ) : (
            <>
              <Button 
                onClick={handleManualSubmit}
                disabled={isUploading || !parsedContent.trim() || !resumeTitle.trim()}
                className="flex-1"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Creating...
                  </>
                ) : (
                  'Create Resume'
                )}
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
