import { Injectable, NotFoundException } from '@nestjs/common';
import { MarkAllNotificationsReadResponse, NotificationRecipientResponse, NotificationResponse } from '@aurelia/contracts';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { NotificationRecipientEntity } from './entities/notification-recipient.entity';
import { NotificationEntity } from './entities/notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(NotificationEntity)
    private readonly notificationsRepository: Repository<NotificationEntity>,
    @InjectRepository(NotificationRecipientEntity)
    private readonly recipientsRepository: Repository<NotificationRecipientEntity>,
  ) {}

  async create(dto: CreateNotificationDto): Promise<NotificationResponse> {
    const notification = await this.notificationsRepository.save(
      this.notificationsRepository.create({
        title: dto.title,
        body: dto.body ?? null,
        category: dto.category ?? 'general',
        entityType: dto.entityType ?? null,
        entityId: dto.entityId ?? null,
        triggeredByUserId: dto.triggeredByUserId ?? null,
        metadata: dto.metadata ?? null,
      }),
    );

    const recipientUserIds = [...new Set(dto.recipientUserIds)];
    if (recipientUserIds.length > 0) {
      await this.recipientsRepository.save(
        recipientUserIds.map((userId) => this.recipientsRepository.create({ notificationId: notification.id, userId })),
      );
    }

    return this.findByIdForUser(notification.id, recipientUserIds[0] ?? null, true);
  }

  async findForUser(userId: string, unreadOnly = false): Promise<NotificationResponse[]> {
    const rows = await this.recipientsRepository.find({
      where: { userId },
      relations: { notification: { recipients: true } },
      order: { createdAt: 'DESC' },
    });

    const filteredRows = unreadOnly ? rows.filter((row) => row.readAt === null) : rows;
    return filteredRows.map((row) => this.toResponse(row.notification, row));
  }

  async markRead(notificationId: string, userId: string): Promise<NotificationResponse> {
    const recipient = await this.recipientsRepository.findOne({
      where: { notificationId, userId },
      relations: { notification: { recipients: true } },
    });
    if (!recipient) throw new NotFoundException('Notification not found for user');

    if (!recipient.readAt) {
      recipient.readAt = new Date();
      await this.recipientsRepository.save(recipient);
    }

    return this.toResponse(recipient.notification, recipient);
  }

  async markAllRead(userId: string): Promise<MarkAllNotificationsReadResponse> {
    const rows = await this.recipientsRepository.find({ where: { userId } });
    const unread = rows.filter((row) => row.readAt === null);
    const now = new Date();
    for (const row of unread) row.readAt = now;
    if (unread.length > 0) await this.recipientsRepository.save(unread);
    return { updated: unread.length };
  }

  async notifyWorkflowStarted(input: {
    workflowInstanceId: string;
    entityType: string;
    entityId: string;
    startedByUserId: string | null;
  }): Promise<void> {
    if (!input.startedByUserId) return;
    await this.create({
      title: 'Workflow iniciado',
      body: `Se inició un workflow para ${input.entityType}.`,
      category: 'workflow',
      entityType: input.entityType,
      entityId: input.entityId,
      triggeredByUserId: input.startedByUserId,
      recipientUserIds: [input.startedByUserId],
      metadata: { workflowInstanceId: input.workflowInstanceId, event: 'workflow.started' },
    });
  }

  async notifyWorkflowAdvanced(input: {
    workflowInstanceId: string;
    entityType: string;
    entityId: string;
    action: string;
    completedByUserId: string | null;
    recipientUserIds: string[];
  }): Promise<void> {
    const recipientUserIds = [...new Set(input.recipientUserIds.filter(Boolean))];
    if (recipientUserIds.length === 0) return;
    await this.create({
      title: 'Workflow actualizado',
      body: `Se registró la acción ${input.action} en un workflow de ${input.entityType}.`,
      category: 'workflow',
      entityType: input.entityType,
      entityId: input.entityId,
      triggeredByUserId: input.completedByUserId ?? undefined,
      recipientUserIds,
      metadata: { workflowInstanceId: input.workflowInstanceId, action: input.action, event: 'workflow.advanced' },
    });
  }

  private async findByIdForUser(notificationId: string, userId: string | null, includeRecipients = false): Promise<NotificationResponse> {
    const notification = await this.notificationsRepository.findOne({
      where: { id: notificationId },
      relations: { recipients: true },
    });
    if (!notification) throw new NotFoundException('Notification not found');

    const recipient = userId
      ? notification.recipients?.find((row) => row.userId === userId) ?? null
      : null;

    const response = this.toResponse(notification, recipient);
    if (includeRecipients) response.recipients = notification.recipients?.map((row) => this.toRecipientResponse(row)) ?? [];
    return response;
  }

  private toResponse(notification: NotificationEntity, recipient: NotificationRecipientEntity | null): NotificationResponse {
    return {
      id: notification.id,
      title: notification.title,
      body: notification.body,
      category: notification.category,
      entityType: notification.entityType,
      entityId: notification.entityId,
      triggeredByUserId: notification.triggeredByUserId,
      metadata: notification.metadata,
      createdAt: notification.createdAt.toISOString(),
      readAt: recipient?.readAt ? recipient.readAt.toISOString() : null,
    };
  }

  private toRecipientResponse(recipient: NotificationRecipientEntity): NotificationRecipientResponse {
    return {
      id: recipient.id,
      userId: recipient.userId,
      readAt: recipient.readAt ? recipient.readAt.toISOString() : null,
      dismissedAt: recipient.dismissedAt ? recipient.dismissedAt.toISOString() : null,
    };
  }
}
