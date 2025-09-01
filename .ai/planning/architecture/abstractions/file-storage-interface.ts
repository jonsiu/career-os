// File storage abstraction interface for vendor switching
export interface FileStorageProvider {
  // File upload operations
  generateUploadUrl(fileName: string, contentType?: string): Promise<string>;
  uploadFile(file: File, fileName?: string): Promise<FileUploadResult>;
  
  // File retrieval operations
  getFileUrl(fileId: string): Promise<string>;
  downloadFile(fileId: string): Promise<Blob>;
  
  // File management operations
  deleteFile(fileId: string): Promise<void>;
  updateFileMetadata(fileId: string, metadata: FileMetadata): Promise<void>;
  
  // File listing and search
  listUserFiles(userId: string, filters?: FileFilters): Promise<FileInfo[]>;
  searchFiles(userId: string, query: string): Promise<FileInfo[]>;
}

// File operation result types
export interface FileUploadResult {
  fileId: string;
  fileName: string;
  fileSize: number;
  contentType: string;
  url: string;
  uploadedAt: number;
}

export interface FileInfo {
  fileId: string;
  fileName: string;
  fileSize: number;
  contentType: string;
  url: string;
  metadata: FileMetadata;
  uploadedAt: number;
  updatedAt: number;
}

export interface FileMetadata {
  userId?: string;
  resumeId?: string;
  description?: string;
  tags?: string[];
  isPublic?: boolean;
  customFields?: Record<string, any>;
}

export interface FileFilters {
  contentType?: string;
  dateRange?: {
    start: number;
    end: number;
  };
  tags?: string[];
  isPublic?: boolean;
}

// Resume-specific file operations
export interface ResumeFileStorage extends FileStorageProvider {
  // Resume-specific operations
  uploadResume(file: File, userId: string, resumeId?: string): Promise<ResumeFileResult>;
  getResumeFile(resumeId: string): Promise<ResumeFileInfo | null>;
  updateResumeFile(resumeId: string, file: File): Promise<ResumeFileResult>;
  deleteResumeFile(resumeId: string): Promise<void>;
  
  // Resume file analysis
  extractResumeText(fileId: string): Promise<string>;
  validateResumeFormat(file: File): Promise<ValidationResult>;
}

export interface ResumeFileResult extends FileUploadResult {
  resumeId: string;
  extractedText?: string;
  validationResult?: ValidationResult;
}

export interface ResumeFileInfo extends FileInfo {
  resumeId: string;
  extractedText?: string;
  lastAnalyzed?: number;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  format: string;
  pageCount?: number;
}

// File processing and analysis
export interface FileProcessor {
  // Text extraction
  extractText(fileId: string, format: string): Promise<string>;
  
  // Document analysis
  analyzeDocument(fileId: string): Promise<DocumentAnalysis>;
  
  // Format conversion
  convertFormat(fileId: string, targetFormat: string): Promise<string>;
  
  // OCR processing
  performOCR(fileId: string): Promise<string>;
}

export interface DocumentAnalysis {
  fileId: string;
  textContent: string;
  wordCount: number;
  pageCount: number;
  sections: DocumentSection[];
  metadata: DocumentMetadata;
  processingTime: number;
}

export interface DocumentSection {
  type: string; // "header", "experience", "education", "skills", etc.
  content: string;
  confidence: number;
  boundingBox?: BoundingBox;
}

export interface DocumentMetadata {
  title?: string;
  author?: string;
  creationDate?: string;
  lastModified?: string;
  keywords?: string[];
  language?: string;
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
  page: number;
}

// Error handling
export class FileStorageError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'FileStorageError';
  }
}

export class FileValidationError extends Error {
  constructor(
    message: string,
    public validationErrors: string[]
  ) {
    super(message);
    this.name = 'FileValidationError';
  }
}

// Configuration interface
export interface FileStorageConfig {
  provider: 'convex' | 'aws-s3' | 'google-cloud-storage' | 'azure-blob';
  bucket?: string;
  region?: string;
  maxFileSize?: number;
  allowedFileTypes?: string[];
  publicUrl?: string;
  credentials?: {
    accessKeyId?: string;
    secretAccessKey?: string;
    sessionToken?: string;
  };
}

// File type constants
export const RESUME_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'text/html'
] as const;

export const MAX_RESUME_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const FILE_TYPE_EXTENSIONS = {
  'application/pdf': '.pdf',
  'application/msword': '.doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
  'text/plain': '.txt',
  'text/html': '.html'
} as const;
