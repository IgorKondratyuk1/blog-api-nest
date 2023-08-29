import { Global, Module } from '@nestjs/common';
import { AppConfigService } from './config-services/app-config.service';
import { DbConfigService } from './config-services/db-config.service';
import { SecurityConfigService } from './config-services/security-config.service';
import { EmailConfigService } from './config-services/email-config.service';

@Global()
@Module({
  providers: [AppConfigService, DbConfigService, SecurityConfigService, EmailConfigService],
  exports: [AppConfigService, DbConfigService, SecurityConfigService, EmailConfigService],
})
export class AppConfigModule {}
