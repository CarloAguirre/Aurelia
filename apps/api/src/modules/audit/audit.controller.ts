import { Controller, Get, Query } from '@nestjs/common';
import { AuditLogResponse } from '@aurelia/contracts';
import { AuditService } from './audit.service';

@Controller('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  findAll(
    @Query('entityType') entityType?: string,
    @Query('entityId') entityId?: string,
  ): Promise<AuditLogResponse[]> {
    return this.auditService.findAll(entityType, entityId);
  }
}
