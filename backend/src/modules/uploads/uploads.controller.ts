import {
  Controller,
  Post,
  Delete,
  Body,
  Param,
  UseInterceptors,
  UploadedFile,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { UploadsService, UploadFolder } from './uploads.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

class PresignedUrlDto {
  folder: UploadFolder;
  filename: string;
  mimeType: string;
}

class Base64UploadDto {
  folder: UploadFolder;
  base64: string;
  mimeType: string;
}

@ApiTags('Uploads')
@ApiBearerAuth('JWT-auth')
@Controller('uploads')
export class UploadsController {
  constructor(private uploadsService: UploadsService) {}

  @Post('file')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload a file directly' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        folder: { type: 'string', enum: ['checklists', 'machines', 'profiles', 'issues', 'documents'] },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'File uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Invalid file or folder' })
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('folder') folder: UploadFolder,
    @CurrentUser('organizationId') organizationId: string,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    if (!folder) {
      throw new BadRequestException('Folder is required');
    }

    const result = await this.uploadsService.uploadFile(
      file.buffer,
      file.mimetype,
      file.originalname,
      folder,
      organizationId,
    );

    return {
      success: true,
      ...result,
    };
  }

  @Post('base64')
  @ApiOperation({ summary: 'Upload a base64 encoded file' })
  @ApiResponse({ status: 201, description: 'File uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  async uploadBase64(
    @Body() dto: Base64UploadDto,
    @CurrentUser('organizationId') organizationId: string,
  ) {
    if (!dto.base64 || !dto.mimeType || !dto.folder) {
      throw new BadRequestException('base64, mimeType and folder are required');
    }

    const result = await this.uploadsService.uploadBase64(
      dto.base64,
      dto.mimeType,
      dto.folder,
      organizationId,
    );

    return {
      success: true,
      ...result,
    };
  }

  @Post('presigned-url')
  @ApiOperation({ summary: 'Get a presigned URL for direct upload' })
  @ApiResponse({ status: 200, description: 'Presigned URL generated' })
  async getPresignedUrl(
    @Body() dto: PresignedUrlDto,
    @CurrentUser('organizationId') organizationId: string,
  ) {
    const result = await this.uploadsService.getPresignedUploadUrl(
      dto.folder,
      organizationId,
      dto.filename,
      dto.mimeType,
    );

    return {
      success: true,
      ...result,
    };
  }

  @Delete(':key')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete an uploaded file' })
  @ApiResponse({ status: 200, description: 'File deleted' })
  async deleteFile(@Param('key') key: string) {
    const deleted = await this.uploadsService.deleteFile(decodeURIComponent(key));
    return { success: deleted };
  }
}
