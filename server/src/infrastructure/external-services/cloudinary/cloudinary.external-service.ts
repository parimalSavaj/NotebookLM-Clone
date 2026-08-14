import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import { ICloudinaryService, UploadResult } from "./cloudinary.external-service.interface.ts";

interface CloudinaryConfig {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
  uploadPreset: string;
}

export class CloudinaryExternalService implements ICloudinaryService {
  private static instance: CloudinaryExternalService | null = null;
  private readonly uploadPreset: string;

  private constructor(config: CloudinaryConfig) {
    this.uploadPreset = config.uploadPreset;

    cloudinary.config({
      cloud_name: config.cloudName,
      api_key: config.apiKey,
      api_secret: config.apiSecret,
      secure: true,
    });
  }

  static getInstance(config: CloudinaryConfig): CloudinaryExternalService {
    if (!CloudinaryExternalService.instance) {
      CloudinaryExternalService.instance = new CloudinaryExternalService(config);
    }
    return CloudinaryExternalService.instance;
  }

  async uploadPdf(fileBuffer: Buffer, filename: string, notebookId: string): Promise<UploadResult> {
    // Folder structure: notebooklm/sources/{notebookId}/
    const folder = `notebooklm/sources/${notebookId}`;

    // Clean filename: remove extension, replace spaces with dashes, lowercase
    const cleanName = filename
      .replace(/\.pdf$/i, "")
      .replace(/\s+/g, "-")
      .toLowerCase();

    const result = await new Promise<UploadApiResponse>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: "raw",
          folder,
          public_id: cleanName,
          upload_preset: this.uploadPreset,
          overwrite: false,
          format: "pdf",
        },
        (error, result) => {
          if (error) return reject(error);
          if (!result) return reject(new Error("Cloudinary returned no result"));
          resolve(result);
        }
      );

      uploadStream.end(fileBuffer);
    });

    return {
      publicId: result.public_id,
      url: result.url,
      secureUrl: result.secure_url,
      format: result.format,
      bytes: result.bytes,
      originalFilename: filename,
    };
  }

  async deleteFile(publicId: string): Promise<void> {
    await cloudinary.uploader.destroy(publicId, { resource_type: "raw" });
  }

  getSignedDownloadUrl(publicId: string): string {
    return cloudinary.utils.private_download_url(publicId, "pdf", {
      resource_type: "raw",
      expires_at: Math.floor(Date.now() / 1000) + 3600, // 1 hour expiry
    });
  }
}
