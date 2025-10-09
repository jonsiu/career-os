import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { 
  Upload, 
  FileText, 
  AlertCircle, 
  CheckCircle, 
  Loader2, 
  ArrowRight,
  ArrowLeft,
  Info
} from "lucide-react";
import { database, fileStorage } from "@/lib/abstractions";
import { Resume } from "@/lib/abstractions/types";
import { useToast } from "@/hooks/use-toast";

interface ResumeUploadStepProps {
  userId: string;
  onNext: (resume: Resume) => void;
  onBack: () => void;
}

interface PdfTextItem {
  str: string;
}

export function ResumeUploadStep({ userId, onNext, onBack }: ResumeUploadStepProps) {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [resumeTitle, setResumeTitle] = useState('');
  const [parsedContent, setParsedContent] = useState('');
  const [uploadedResume, setUploadedResume] = useState<Resume | null>(null);

  const parseFile = useCallback(async (file: File): Promise<string> => {
    if (file.type === 'application/pdf') {
      return await parsePDF(file);
    } else if (file.type.includes('word') || file.name.endsWith('.docx') || file.name.endsWith('.doc')) {
      return await parseWord(file);
    } else {
      throw new Error('Unsupported file type');
    }
  }, []);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    setUploadStatus('uploading');
    setIsUploading(true);
    setUploadProgress(0);
    setErrorMessage('');

    try {
      // Step 1: Extract raw text from PDF/DOCX
      const rawContent = await parseFile(file);
      setParsedContent(rawContent);
      setUploadProgress(25);

      // Auto-suggest title from filename if not already set
      if (!resumeTitle.trim()) {
        const suggestedTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
        setResumeTitle(suggestedTitle);
      }

      let convexUserId = userId;
      if (!userId.startsWith('js')) {
        const convexUser = await database.getUserByClerkId(userId);
        if (!convexUser) {
          throw new Error('User not found in database');
        }
        convexUserId = convexUser.id;
      }

      // Step 2: Upload file to storage
      const filePath = await fileStorage.uploadFile(file, `resumes/${userId}`, convexUserId);
      setUploadProgress(50);

      // Step 3: Parse content with AI to get structured data
      console.log('🤖 ResumeUpload: Starting AI parsing...');
      const structuredData = await (database as any).parseResumeContent(rawContent);
      console.log('✅ ResumeUpload: AI parsing completed', structuredData);
      setUploadProgress(75);

      // Step 4: Store both raw content and structured data
      const resume = await database.createResume({
        userId,
        title: resumeTitle || file.name,
        content: JSON.stringify(structuredData),
        filePath,
        metadata: {
          originalFileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          uploadedAt: new Date().toISOString(),
          rawContent: rawContent,
          parsedWithAI: true
        }
      });

      setUploadProgress(100);
      setUploadStatus('success');
      setUploadedResume(resume);
      
      toast({
        title: 'Resume uploaded successfully!',
        description: `Your resume "${resumeTitle || file.name}" is ready for analysis.`,
      });

    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus('error');
      const errorMsg = error instanceof Error ? error.message : 'Upload failed';
      setErrorMessage(errorMsg);
      
      toast({
        title: 'Upload failed',
        description: errorMsg,
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  }, [userId, resumeTitle, parseFile, toast]);

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

  const parsePDF = async (file: File): Promise<string> => {
    try {
      const pdfjsLib = await import('pdfjs-dist');
      
      pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
      
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      let text = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str || '')
          .join(' ');
        text += pageText + '\n';
      }
      
      return text.trim();
    } catch (err) {
      console.error('Error parsing PDF:', err);
      throw new Error('Failed to parse PDF file');
    }
  };

  const parseWord = async (file: File): Promise<string> => {
    try {
      const { default: mammoth } = await import('mammoth');
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      return result.value;
    } catch (err) {
      throw new Error('Failed to parse Word document');
    }
  };

  const handleContinue = () => {
    if (uploadedResume) {
      onNext(uploadedResume);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="p-3 bg-blue-100 rounded-full">
            <FileText className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Upload Your Resume</h2>
        <p className="text-gray-600">
          Upload your current resume to get started with CareerOS. We'll analyze it and provide personalized recommendations.
        </p>
      </div>

      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Why upload your resume?</p>
              <ul className="space-y-1 text-blue-700">
                <li>• Get instant quality analysis and scoring</li>
                <li>• Receive personalized improvement recommendations</li>
                <li>• Track your progress as you make changes</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* File Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Resume Upload</CardTitle>
          <CardDescription>
            Drag and drop your resume file or click to browse
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
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
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm font-medium">Processing your resume...</span>
              </div>
              <Progress value={uploadProgress} className="w-full" />
              <span className="text-xs text-gray-500 text-center block">{uploadProgress}%</span>
            </div>
          )}

          {/* Success State */}
          {uploadStatus === 'success' && (
            <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
              <div>
                <p className="text-green-800 font-medium">Resume uploaded successfully!</p>
                <p className="text-green-700 text-sm">Your resume is ready for analysis.</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {uploadStatus === 'error' && (
            <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
              <div>
                <p className="text-red-800 font-medium">Upload failed</p>
                <p className="text-red-700 text-sm">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Resume Title Input */}
          <div className="space-y-2">
            <Label htmlFor="resume-title" className="text-base font-medium">
              Resume Title *
            </Label>
            <Input
              id="resume-title"
              value={resumeTitle}
              onChange={(e) => setResumeTitle(e.target.value)}
              placeholder="e.g., Senior Software Engineer Resume"
              disabled={isUploading}
              className="text-base"
            />
            <p className="text-sm text-gray-500">
              Give your resume a meaningful name to help you identify it later
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button onClick={onBack} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        
        <Button 
          onClick={handleContinue}
          disabled={!uploadedResume || isUploading}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Continue
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
