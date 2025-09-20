import { Resume } from '@/lib/abstractions/types';

/**
 * Generate a SHA-256 hash of resume content for change detection
 */
export async function generateContentHash(resume: Resume): Promise<string> {
  // Create a normalized version of the resume content for hashing
  const normalizedContent = normalizeResumeContent(resume);
  
  // Convert to Uint8Array and hash
  const encoder = new TextEncoder();
  const data = encoder.encode(normalizedContent);
  
  // Use Web Crypto API for SHA-256 hashing
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  
  // Convert to hex string
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return hashHex;
}

/**
 * Normalize resume content for consistent hashing
 * This removes whitespace differences and normalizes formatting
 */
function normalizeResumeContent(resume: Resume): string {
  // Start with basic resume metadata
  let normalized = `title:${resume.title}`;
  
  // Add content (normalized)
  normalized += `|content:${normalizeText(resume.content)}`;
  
  // Add file path if exists
  if (resume.filePath) {
    normalized += `|filePath:${resume.filePath}`;
  }
  
  // Add relevant metadata fields that affect analysis
  if (resume.metadata) {
    const relevantMetadata = {
      originalFileName: resume.metadata.originalFileName,
      fileSize: resume.metadata.fileSize,
      fileType: resume.metadata.fileType,
      // Don't include timestamps as they don't affect content analysis
    };
    
    normalized += `|metadata:${JSON.stringify(relevantMetadata)}`;
  }
  
  return normalized;
}

/**
 * Normalize text content by removing extra whitespace and standardizing formatting
 */
function normalizeText(text: string): string {
  return text
    .replace(/\s+/g, ' ') // Replace multiple whitespace with single space
    .replace(/\n\s*\n/g, '\n') // Remove empty lines
    .trim() // Remove leading/trailing whitespace
    .toLowerCase(); // Normalize case for consistent comparison
}

/**
 * Check if resume content has changed by comparing hashes
 */
export async function hasContentChanged(
  resume: Resume, 
  previousHash: string
): Promise<boolean> {
  const currentHash = await generateContentHash(resume);
  return currentHash !== previousHash;
}

/**
 * Generate a content hash for a resume content string (for quick checks)
 */
export async function generateContentHashFromString(content: string): Promise<string> {
  const encoder = new TextEncoder();
  const normalizedContent = normalizeText(content);
  const data = encoder.encode(normalizedContent);
  
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return hashHex;
}
