import { Injectable, NotFoundException, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NotificationDeliveryResponse, NotificationDeliveryStatus } from '@aurelia/contracts';
import { In, Repository } from 'typeorm';
import { UserEntity } from '../users/entities/user.entity';
import { NotificationDeliveryEntity } from './entities/notification-delivery.entity';

@Injectable()
export class NotificationDeliveryService implements OnModuleInit, OnModuleDestroy {
  private retryTimer: NodeJS.Timeout | null = null;

  constructor(
    @InjectRepository(NotificationDeliveryEntity)
    private readonly deliveries: Repository<NotificationDeliveryEntity>,
    @InjectRepository(UserEntity)
    private readonly users: Repository<UserEntity>,
  ) {}

  onModuleInit(): void {
    this.retryTimer = setInterval(() => {
      void this.processDueRetries();
    }, 5 * 60 * 1000);
    this.retryTimer.unref?.();
  }

  onModuleDestroy(): void {
    if (this.retryTimer) clearInterval(this.retryTimer);
  }

  async registerInApp(notificationId: string, recipientUserIds: string[]): Promise<void> {
    const uniqueIds = [...new Set(recipientUserIds.filter(Boolean))];
    if (uniqueIds.length === 0) return;
    const users = await this.users.find({ where: { id: In(uniqueIds) } });
    const emailById = new Map(users.map((user) => [user.id, user.email]));
    const existing = await this.deliveries.find({ where: { notificationId, channel: 'in_app' } });
    const existingDestinations = new Set(existing.map((row) => row.destination));
    const now = new Date();
    const rows = uniqueIds
      .map((userId) => emailById.get(userId) ?? userId)
      .filter((destination) => !existingDestinations.has(destination))
      .map((destination) => this.deliveries.create({
        notificationId,
        channel: 'in_app',
        destination,
        status: NotificationDeliveryStatus.SENT,
        attemptCount: 1,
        maxAttempts: 1,
        lastError: null,
        nextRetryAt: null,
        sentAt: now,
        failedAt: null,
        metadata: null,
      }));
    if (rows.length > 0) await this.deliveries.save(rows);
  }

  async registerEmailAttempt(input: {
    notificationId: string;
    destination: string;
    metadata?: Record<string, unknown> | null;
  }): Promise<NotificationDeliveryResponse> {
    const row = await this.deliveries.save(this.deliveries.create({
      notificationId: input.notificationId,
      channel: 'email',
      destination: input.destination,
      status: NotificationDeliveryStatus.PENDING,
      attemptCount: 0,
      maxAttempts: 3,
      lastError: null,
      nextRetryAt: null,
      sentAt: null,
      failedAt: null,
      metadata: input.metadata ?? null,
    }));
    return this.toResponse(row);
  }

  async markSent(id: string, metadata?: Record<string, unknown>): Promise<NotificationDeliveryResponse> {
    const row = await this.getOrThrow(id);
    row.status = NotificationDeliveryStatus.SENT;
    row.attemptCount += 1;
    row.lastError = null;
    row.nextRetryAt = null;
    row.sentAt = new Date();
    row.failedAt = null;
    row.metadata = { ...(row.metadata ?? {}), ...(metadata ?? {}) };
    return this.toResponse(await this.deliveries.save(row));
  }

  async markFailed(id: string, reason: string, bounced = false, metadata?: Record<string, unknown>): Promise<NotificationDeliveryResponse> {
    const row = await this.getOrThrow(id);
    row.attemptCount += 1;
    row.lastError = reason;
    row.failedAt = new Date();
    row.status = bounced ? NotificationDeliveryStatus.BOUNCED : NotificationDeliveryStatus.FAILED;
    row.nextRetryAt = bounced || row.attemptCount >= row.maxAttempts
      ? null
      : new Date(Date.now() + this.backoffMs(row.attemptCount));
    row.metadata = { ...(row.metadata ?? {}), ...(metadata ?? {}) };
    return this.toResponse(await this.deliveries.save(row));
  }

  async retry(id: string): Promise<NotificationDeliveryResponse> {
    const row = await this.getOrThrow(id);
    if (row.status === NotificationDeliveryStatus.SENT) return this.toResponse(row);
    if (row.attemptCount >= row.maxAttempts) throw new Error('Notification delivery reached its maximum number of attempts');
    row.status = NotificationDeliveryStatus.RETRYING;
    row.nextRetryAt = new Date();
    return this.toResponse(await this.deliveries.save(row));
  }

  async list(status?: NotificationDeliveryStatus): Promise<NotificationDeliveryResponse[]> {
    const rows = await this.deliveries.find({
      where: status ? { status } : {},
      order: { createdAt: 'DESC' },
      take: 500,
    });
    return rows.map((row) => this.toResponse(row));
  }

  async countFailed(): Promise<number> {
    return this.deliveries.count({ where: { status: In([NotificationDeliveryStatus.FAILED, NotificationDeliveryStatus.BOUNCED]) } });
  }

  async processDueRetries(now = new Date()): Promise<number> {
    const candidates = await this.deliveries
      .createQueryBuilder('delivery')
      .where('delivery.status IN (:...statuses)', { statuses: [NotificationDeliveryStatus.FAILED, NotificationDeliveryStatus.RETRYING] })
      .andWhere('delivery.next_retry_at IS NOT NULL')
      .andWhere('delivery.next_retry_at <= :now', { now })
      .andWhere('delivery.attempt_count < delivery.max_attempts')
      .getMany();
    for (const row of candidates) {
      row.status = NotificationDeliveryStatus.RETRYING;
      row.nextRetryAt = new Date(now.getTime() + this.backoffMs(Math.max(1, row.attemptCount)));
    }
    if (candidates.length > 0) await this.deliveries.save(candidates);
    return candidates.length;
  }

  private async getOrThrow(id: string): Promise<NotificationDeliveryEntity> {
    const row = await this.deliveries.findOneBy({ id });
    if (!row) throw new NotFoundException(`Notification delivery ${id} not found`);
    return row;
  }

  private backoffMs(attempt: number): number {
    return Math.min(24 * 60 * 60 * 1000, 15 * 60 * 1000 * 2 ** Math.max(0, attempt - 1));
  }

  private toResponse(row: NotificationDeliveryEntity): NotificationDeliveryResponse {
    return {
      id: row.id,
      notificationId: row.notificationId,
      channel: row.channel,
      destination: row.destination,
      status: row.status,
      attemptCount: row.attemptCount,
      maxAttempts: row.maxAttempts,
      lastError: row.lastError,
      nextRetryAt: row.nextRetryAt?.toISOString() ?? null,
      sentAt: row.sentAt?.toISOString() ?? null,
      failedAt: row.failedAt?.toISOString() ?? null,
      metadata: row.metadata,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }
}
