import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConfigurationType } from '../configuration';

@Injectable()
export class EmailConfigService {
  constructor(private configService: ConfigService<ConfigurationType>) {}

  get gmailAuthLogin(): string {
    return this.configService.get('GMAIL', { infer: true }).GMAIL_LOGIN;
  }

  get gmailAuthPassword(): string {
    return this.configService.get('GMAIL', { infer: true }).GMAIL_PASS;
  }
}
