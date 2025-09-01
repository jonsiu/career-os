import { FileStorageProvider } from '../types';

export class ConvexFileStorageProvider implements FileStorageProvider {
  async uploadFile(file: File, path: string): Promise<string> {
    // TODO: Implement actual Convex file upload
    // For now, return a mock path
    return `uploads/${path}/${file.name}`;
  }

  async downloadFile(path: string): Promise<Blob> {
    // TODO: Implement actual Convex file download
    throw new Error('Not implemented yet');
  }

  async deleteFile(path: string): Promise<void> {
    // TODO: Implement actual Convex file deletion
    throw new Error('Not implemented yet');
  }

  async getFileUrl(path: string): Promise<string> {
    // TODO: Implement actual Convex file URL generation
    return `https://example.com/files/${path}`;
  }

  async listFiles(prefix: string): Promise<string[]> {
    // TODO: Implement actual Convex file listing
    return [];
  }
}
