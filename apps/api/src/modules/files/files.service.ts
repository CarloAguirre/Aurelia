import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FileResponse, FileStorageProvider } from '@aurelia/contracts';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import { FileEntity } from './entities/file.entity';

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
    const checksum = crypto.createHash('sha256').update(file.buffer).digest('hex');

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
    const entity = await this.files.findOneBy({ id });
    if (!entity) {
      throw new NotFoundException(`File ${id} not found`);
    }
    return this.toResponse(entity);
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
