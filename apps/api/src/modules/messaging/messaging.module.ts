import { DynamicModule, Global, Module, Type } from '@nestjs/common';
import { DisabledEmailTransport } from './disabled-email.transport';
import { EmailTemplateService } from './email-template.service';
import { MessagingService } from './messaging.service';
import { EMAIL_TRANSPORT, EmailTransport } from './messaging.types';

export type MessagingModuleOptions = {
  emailTransport?: Type<EmailTransport>;
};

@Global()
@Module({})
export class MessagingModule {
  static register(options: MessagingModuleOptions = {}): DynamicModule {
    const emailTransport = options.emailTransport ?? DisabledEmailTransport;

    return {
      global: true,
      module: MessagingModule,
      providers: [
        EmailTemplateService,
        MessagingService,
        emailTransport,
        {
          provide: EMAIL_TRANSPORT,
          useExisting: emailTransport,
        },
      ],
      exports: [EmailTemplateService, MessagingService, EMAIL_TRANSPORT],
    };
  }
}
