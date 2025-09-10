import { FileStorageProvider } from '../types';
import { convexClient, api } from '../../convex-client';
import { Id } from '../../../../convex/_generated/dataModel';

export class ConvexFileStorageProvider implements FileStorageProvider {
  async uploadFile(file: File, path: string, userId: string): Promise<string> {
    try {
      const fileId = await convexClient.mutation(api.files.create, {
        userId: userId as Id<"users">,
        name: file.name,
        path: path,
        size: file.size,
        type: file.type,
        metadata: { uploadedAt: Date.now() }
      });
      
      if (!fileId) {
        throw new Error('Failed to create file record');
      }
      
      return fileId;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }

  async downloadFile(): Promise<Blob> {
    try {
      return new Blob();
    } catch (error) {
      console.error('Error downloading file:', error);
      throw error;
    }
  }

  async deleteFile(path: string): Promise<void> {
    try {
      const file = await convexClient.query(api.files.getByPath, { path });
      if (file) {
        await convexClient.mutation(api.files.remove, { id: file._id });
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  }

  async getFileUrl(path: string): Promise<string> {
    try {
      return `https://career-os.convex.cloud/files/${path}`;
    } catch (error) {
      console.error('Error getting file URL:', error);
      throw error;
    }
  }

  async listFiles(): Promise<string[]> {
    try {
      return [];
    } catch (error) {
      console.error('Error listing files:', error);
      return [];
    }
  }
}
