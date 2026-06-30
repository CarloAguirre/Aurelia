import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { NotificationEntity } from './entities/notification.entity';
import { NotificationRecipientEntity } from './entities/notification-recipient.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      NotificationEntity,
      NotificationRecipientEntity,
    ]),
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
