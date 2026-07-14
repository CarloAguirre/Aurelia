import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query, Req } from '@nestjs/common';
import { MarkAllNotificationsReadResponse, NotificationResponse } from '@aurelia/contracts';
import type { AuthenticatedRequest } from '../auth/authenticated-request';
import { RequirePermissions } from '../auth/require-permissions.decorator';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { NotificationRecipientStateService } from './notification-recipient-state.service';
import { NotificationsService } from './notifications.service';

@RequirePermissions('notifications:read')
@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly notificationRecipientStateService: NotificationRecipientStateService,
  ) {}

  @Get()
  findMine(
    @Req() request: AuthenticatedRequest,
    @Query('unreadOnly') unreadOnly?: string,
  ): Promise<NotificationResponse[]> {
    return this.notificationsService.findForUser(request.user.sub, unreadOnly === 'true');
  }

  @RequirePermissions('notifications:write')
  @Post()
  create(@Body() dto: CreateNotificationDto): Promise<NotificationResponse> {
    return this.notificationsService.create(dto);
  }

  @Patch(':id/read')
  markRead(
    @Req() request: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<NotificationResponse> {
    return this.notificationsService.markRead(id, request.user.sub);
  }

  @Patch(':id/dismiss')
  dismiss(
    @Req() request: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<MarkAllNotificationsReadResponse> {
    return this.notificationRecipientStateService.dismiss(id, request.user.sub);
  }

  @Patch(':id/inspection-thread/dismiss')
  dismissInspectionThread(
    @Req() request: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<MarkAllNotificationsReadResponse> {
    return this.notificationRecipientStateService.readAndDismissPreviousInspectionThread(id, request.user.sub);
  }
}
