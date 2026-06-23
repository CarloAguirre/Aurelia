import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { AuditLogResponse } from '@aurelia/contracts';
import { AuditService } from './audit.service';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';

// TODO: restrict GET to ADMIN/VIEWER roles once auth is implemented

@Controller('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Post()
  log(@Body() dto: CreateAuditLogDto): Promise<AuditLogResponse> {
    return this.auditService.log(dto);
  }

  @Get()
  findAll(
    @Query('entityType') entityType?: string,
    @Query('entityId') entityId?: string,
  ): Promise<AuditLogResponse[]> {
    return this.auditService.findAll(entityType, entityId);
  }
}
