import { Body, Controller, Get, NotFoundException, Param, Post } from '@nestjs/common';
import type { MobileSyncBatchRequest, MobileSyncBatchResponse } from '@aurelia/contracts';
import { MobileSyncService } from './mobile-sync.service';

@Controller('mobile/sync')
export class MobileSyncController {
  constructor(private readonly mobileSyncService: MobileSyncService) {}

  @Post()
  acceptBatch(@Body() body: MobileSyncBatchRequest): Promise<MobileSyncBatchResponse> {
    return this.mobileSyncService.acceptBatch(body);
  }

  @Get(':batchId')
  getBatch(@Param('batchId') batchId: string): MobileSyncBatchResponse {
    const batch = this.mobileSyncService.getBatch(batchId);
    if (!batch) throw new NotFoundException('Mobile sync batch not found');
    return batch;
  }

  @Get()
  status() {
    return {
      broker: process.env.MOBILE_SYNC_BROKER ?? 'in-memory',
      pendingMessages: this.mobileSyncService.getPendingMessagesCount(),
      timestamp: new Date().toISOString(),
    };
  }
}
