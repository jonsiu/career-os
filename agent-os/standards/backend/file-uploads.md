## File upload handling

- **File Type Validation**: Validate file types by magic number/MIME type, not just extension, to prevent malicious uploads
- **Size Limits**: Enforce file size limits at both client and server level; reject oversized files early
- **Storage Strategy**: Use object storage (S3, R2, etc.) for scalability; avoid storing files in database or local filesystem
- **Signed URLs**: Generate pre-signed URLs for direct client-to-storage uploads to reduce server load
- **Virus Scanning**: Scan uploaded files for malware before making them accessible to other users
- **Access Control**: Verify user has permission to access file before serving; use signed URLs with expiration for private files
- **Image Optimization**: Automatically resize and optimize images server-side; generate multiple sizes for responsive images
- **Progress Indicators**: Support chunked uploads for large files with progress tracking and resume capability
- **Content Delivery**: Serve static files through CDN with appropriate cache headers for performance
- **Cleanup Strategy**: Implement cleanup jobs to remove orphaned files and old temporary uploads
- **Metadata Storage**: Store file metadata (name, size, type, upload date, uploader) in database separate from file content
- **Secure Filenames**: Sanitize and/or hash filenames to prevent directory traversal and naming conflicts
