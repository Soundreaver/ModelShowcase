import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import { Request, Response } from 'express';

// Simple local file storage service as fallback when cloud storage isn't configured
export class LocalStorageService {
  private uploadsDir: string;

  constructor() {
    this.uploadsDir = path.join(process.cwd(), 'uploads');
    this.ensureUploadsDir();
  }

  private ensureUploadsDir() {
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
    }
  }

  async getUploadURL(): Promise<string> {
    const objectId = randomUUID();
    // Return full URL for Uppy compatibility
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? process.env.API_BASE_URL || 'http://localhost:5000'
      : 'http://localhost:5000';
    return `${baseUrl}/api/upload/${objectId}`;
  }

  async handleUpload(req: Request, res: Response) {
    try {
      const objectId = req.params.objectId;
      const filePath = path.join(this.uploadsDir, objectId);
      
      const fileStream = fs.createWriteStream(filePath);
      req.pipe(fileStream);

      fileStream.on('finish', () => {
        const stats = fs.statSync(filePath);
        res.json({
          success: true,
          filePath: `/api/files/${objectId}`,
          message: 'File uploaded successfully',
          fileSize: stats.size,
        });
      });

      fileStream.on('error', (error) => {
        console.error('File stream write error:', error);
        res.status(500).json({ error: 'Upload failed' });
      });

    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ error: 'Upload failed' });
    }
  }

  async serveFile(req: Request, res: Response) {
    try {
      const objectId = req.params.objectId;
      const filePath = path.join(this.uploadsDir, objectId);
      
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'File not found' });
      }

      res.setHeader('Content-Type', 'application/octet-stream');
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);

    } catch (error) {
      console.error('File serve error:', error);
      res.status(500).json({ error: 'Failed to serve file' });
    }
  }

  normalizeObjectEntityPath(rawPath: string): string {
    // For local storage, just return the path as-is
    return rawPath;
  }
}
