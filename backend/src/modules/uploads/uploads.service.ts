import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';

export type UploadFolder =
  | 'checklists'
  | 'machines'
  | 'profiles'
  | 'issues'
  | 'documents';

interface UploadResult {
  key: string;
  url: string;
  publicUrl: string;
}

@Injectable()
export class UploadsService {
  private readonly logger = new Logger(UploadsService.name);
  private s3Client: S3Client | null = null;
  private bucket: string;
  private publicUrl: string;
  private region: string;

  constructor(private configService: ConfigService) {
    this.initializeS3();
  }

  private initializeS3() {
    const accessKeyId = this.configService.get<string>('AWS_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get<string>('AWS_SECRET_ACCESS_KEY');
    this.bucket = this.configService.get<string>('S3_BUCKET', 'smartop-uploads');
    this.region = this.configService.get<string>('AWS_REGION', 'eu-central-1');
    this.publicUrl = this.configService.get<string>(
      'S3_PUBLIC_URL',
      `https://${this.bucket}.s3.${this.region}.amazonaws.com`,
    );

    // Support for Cloudflare R2 (S3-compatible)
    const endpoint = this.configService.get<string>('S3_ENDPOINT');

    if (!accessKeyId || !secretAccessKey) {
      this.logger.warn('S3/R2 credentials not configured. Upload service disabled.');
      return;
    }

    this.s3Client = new S3Client({
      region: this.region,
      endpoint: endpoint || undefined,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      forcePathStyle: !!endpoint, // Required for R2
    });

    this.logger.log('S3 client initialized successfully');
  }

  private generateKey(folder: UploadFolder, organizationId: string, filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase() || 'jpg';
    const uniqueId = randomUUID();
    const timestamp = Date.now();
    return `${organizationId}/${folder}/${timestamp}-${uniqueId}.${ext}`;
  }

  private validateFile(
    buffer: Buffer,
    mimeType: string,
    maxSizeMB: number = 10,
  ): void {
    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/heic',
      'application/pdf',
    ];

    if (!allowedMimeTypes.includes(mimeType)) {
      throw new BadRequestException(
        `Invalid file type: ${mimeType}. Allowed: ${allowedMimeTypes.join(', ')}`,
      );
    }

    const maxSize = maxSizeMB * 1024 * 1024;
    if (buffer.length > maxSize) {
      throw new BadRequestException(
        `File size exceeds ${maxSizeMB}MB limit`,
      );
    }
  }

  async uploadFile(
    buffer: Buffer,
    mimeType: string,
    originalFilename: string,
    folder: UploadFolder,
    organizationId: string,
  ): Promise<UploadResult> {
    if (!this.s3Client) {
      throw new BadRequestException('Upload service not configured');
    }

    this.validateFile(buffer, mimeType);

    const key = this.generateKey(folder, organizationId, originalFilename);

    try {
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: buffer,
          ContentType: mimeType,
          CacheControl: 'max-age=31536000', // 1 year cache
          Metadata: {
            'original-filename': originalFilename,
            'organization-id': organizationId,
          },
        }),
      );

      const publicUrl = `${this.publicUrl}/${key}`;

      this.logger.log(`File uploaded: ${key}`);

      return {
        key,
        url: key,
        publicUrl,
      };
    } catch (error) {
      this.logger.error(`Upload failed for ${originalFilename}:`, error);
      throw new BadRequestException('Failed to upload file');
    }
  }

  async uploadBase64(
    base64Data: string,
    mimeType: string,
    folder: UploadFolder,
    organizationId: string,
  ): Promise<UploadResult> {
    // Remove data URL prefix if present
    const base64Clean = base64Data.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Clean, 'base64');

    const ext = mimeType.split('/')[1] || 'jpg';
    const filename = `upload.${ext}`;

    return this.uploadFile(buffer, mimeType, filename, folder, organizationId);
  }

  async deleteFile(key: string): Promise<boolean> {
    if (!this.s3Client) {
      return false;
    }

    try {
      await this.s3Client.send(
        new DeleteObjectCommand({
          Bucket: this.bucket,
          Key: key,
        }),
      );

      this.logger.log(`File deleted: ${key}`);
      return true;
    } catch (error) {
      this.logger.error(`Delete failed for ${key}:`, error);
      return false;
    }
  }

  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    if (!this.s3Client) {
      throw new BadRequestException('Upload service not configured');
    }

    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    return getSignedUrl(this.s3Client, command, { expiresIn });
  }

  async getPresignedUploadUrl(
    folder: UploadFolder,
    organizationId: string,
    filename: string,
    mimeType: string,
    expiresIn: number = 3600,
  ): Promise<{ uploadUrl: string; key: string; publicUrl: string }> {
    if (!this.s3Client) {
      throw new BadRequestException('Upload service not configured');
    }

    const key = this.generateKey(folder, organizationId, filename);

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: mimeType,
    });

    const uploadUrl = await getSignedUrl(this.s3Client, command, { expiresIn });
    const publicUrl = `${this.publicUrl}/${key}`;

    return { uploadUrl, key, publicUrl };
  }

  getPublicUrl(key: string): string {
    return `${this.publicUrl}/${key}`;
  }
}
