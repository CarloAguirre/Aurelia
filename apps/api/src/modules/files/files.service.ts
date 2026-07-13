import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FileResponse, FileStorageProvider } from '@aurelia/contracts';
import { Repository } from 'typeorm';
import { createHash } from 'crypto';
import { access, readFile } from 'fs/promises';
import { FileEntity } from './entities/file.entity';

export interface FileContentResponse {
  path: string;
  filename: string;
  mimeType: string | null;
}

@Injectable()
export class FilesService {
  constructor(
    @InjectRepository(FileEntity)
    private readonly files: Repository<FileEntity>,
  ) {}

  async saveUpload(
    file: Express.Multer.File,
    uploadedByUserId?: string,
  ): Promise<FileResponse> {
    const checksum = await this.calculateChecksum(file);

    const entity = this.files.create({
      storageProvider: FileStorageProvider.LOCAL,
      blobPath: file.path ?? null,
      originalFilename: file.originalname,
      mimeType: file.mimetype ?? null,
      sizeBytes: file.size ?? null,
      checksumSha256: checksum,
      uploadedByUserId: uploadedByUserId ?? null,
    });

    return this.toResponse(await this.files.save(entity));
  }

  async findOne(id: string): Promise<FileResponse> {
    const entity = await this.findEntityOrThrow(id);
    return this.toResponse(entity);
  }

  async getContent(id: string): Promise<FileContentResponse> {
    const entity = await this.findEntityOrThrow(id);
    if (entity.storageProvider !== FileStorageProvider.LOCAL || !entity.blobPath) {
      throw new NotFoundException(`File content ${id} not found`);
    }
    await access(entity.blobPath).catch(() => {
      throw new NotFoundException(`File content ${id} not found`);
    });
    return {
      path: entity.blobPath,
      filename: entity.originalFilename,
      mimeType: entity.mimeType,
    };
  }

  private async findEntityOrThrow(id: string): Promise<FileEntity> {
    const entity = await this.files.findOneBy({ id });
    if (!entity) {
      throw new NotFoundException(`File ${id} not found`);
    }
    return entity;
  }

  private async calculateChecksum(file: Express.Multer.File): Promise<string> {
    const content = file.buffer ?? (file.path ? await readFile(file.path) : null);
    if (!content) {
      throw new BadRequestException('Uploaded file content is not available');
    }
    return createHash('sha256').update(content).digest('hex');
  }

  private toResponse(entity: FileEntity): FileResponse {
    return {
      id: entity.id,
      storageProvider: entity.storageProvider,
      containerName: entity.containerName,
      blobPath: entity.blobPath,
      externalUrl: entity.externalUrl,
      originalFilename: entity.originalFilename,
      mimeType: entity.mimeType,
      sizeBytes: entity.sizeBytes,
      checksumSha256: entity.checksumSha256,
      uploadedByUserId: entity.uploadedByUserId,
      uploadedAt: entity.uploadedAt.toISOString(),
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString(),
    };
  }
}
