import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';
import { NotificationEntity } from './notification.entity';

@Entity('notification_recipients')
export class NotificationRecipientEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index('idx_notification_recipients_notification')
  @Column({ name: 'notification_id', type: 'uuid' })
  notificationId: string;

  @ManyToOne(() => NotificationEntity, (notification) => notification.recipients, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'notification_id' })
  notification: NotificationEntity;

  @Index('idx_notification_recipients_user')
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column({ name: 'read_at', type: 'timestamptz', nullable: true })
  readAt: Date | null;

  @Column({ name: 'dismissed_at', type: 'timestamptz', nullable: true })
  dismissedAt: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
