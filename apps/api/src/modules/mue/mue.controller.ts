import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { RequirePermissions } from '../auth/require-permissions.decorator';
import { ControlAreaAssignmentEntity } from './entities/control-area-assignment.entity';
import { ControlVerificationItemEntity } from './entities/control-verification-item.entity';
import { CriticalControlEntity } from './entities/critical-control.entity';
import { MueEntity } from './entities/mue.entity';
import { MueService } from './mue.service';

@RequirePermissions('critical-controls:read')
@Controller('mue')
export class MueController {
  constructor(private readonly mueService: MueService) {}

  @Get()
  findMues(): Promise<MueEntity[]> {
    return this.mueService.findMues();
  }

  @Get(':id')
  findMue(@Param('id', ParseUUIDPipe) id: string): Promise<MueEntity> {
    return this.mueService.findMue(id);
  }

  @Get(':id/controls')
  findControls(@Param('id', ParseUUIDPipe) id: string): Promise<CriticalControlEntity[]> {
    return this.mueService.findControls(id);
  }

  @Get(':id/assignments')
  findAssignments(@Param('id', ParseUUIDPipe) id: string): Promise<ControlAreaAssignmentEntity[]> {
    return this.mueService.findAssignments(id);
  }
}

@RequirePermissions('critical-controls:read')
@Controller('critical-controls/catalog')
export class CriticalControlsCatalogController {
  constructor(private readonly mueService: MueService) {}

  @Get('controls')
  findControls(@Query('mueId') mueId?: string): Promise<CriticalControlEntity[]> {
    return this.mueService.findControls(mueId);
  }

  @Get('verification-items')
  findVerificationItems(@Query('criticalControlId') criticalControlId?: string): Promise<ControlVerificationItemEntity[]> {
    return this.mueService.findVerificationItems(criticalControlId);
  }

  @Get('assignments')
  findAssignments(@Query('mueId') mueId?: string): Promise<ControlAreaAssignmentEntity[]> {
    return this.mueService.findAssignments(mueId);
  }
}
