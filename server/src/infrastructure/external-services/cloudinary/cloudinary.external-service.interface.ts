export interface UploadResult {
  publicId: string;
  url: string;
  secureUrl: string;
  format: string;
  bytes: number;
  originalFilename: string;
}

export interface ICloudinaryService {
  uploadPdf(fileBuffer: Buffer, filename: string, notebookId: string): Promise<UploadResult>;
  getSignedDownloadUrl(publicId: string): string;
  deleteFile(publicId: string): Promise<void>;
}
