import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
//import { AppConfigModule } from '../../config/app-config.module';
import { EmailManagerService } from './email-manager.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { EmailConfigService } from '../../config/config-services/email-config.service';

@Module({
  imports: [
    //AppConfigModule,
    MailerModule.forRootAsync({
      //imports: [AppConfigModule],
      inject: [EmailConfigService],
      useFactory: async (emailConfigService: EmailConfigService) => {
        return {
          transport: {
            host: 'smtp.gmail.com',
            auth: {
              user: emailConfigService.gmailAuthLogin,
              pass: emailConfigService.gmailAuthPassword,
            },
          },
        };
      },
    }),
  ],
  providers: [EmailService, EmailManagerService],
  exports: [EmailManagerService],
})
export class EmailModule {}
