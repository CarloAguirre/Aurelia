import {
  BadRequestException,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileResponse } from '@aurelia/contracts';
import { FilesService } from './files.service';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  upload(
    @UploadedFile() file: Express.Multer.File,
    @Query('uploadedByUserId') uploadedByUserId?: string,
  ): Promise<FileResponse> {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    return this.filesService.saveUpload(file, uploadedByUserId);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<FileResponse> {
    return this.filesService.findOne(id);
  }
}
