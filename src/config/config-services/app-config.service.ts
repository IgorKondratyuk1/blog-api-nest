import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConfigurationType } from '../configuration';

@Injectable()
export class AppConfigService {
  constructor(private configService: ConfigService<ConfigurationType>) {}

  get nodeEnv(): string {
    return this.configService.get('NODE_ENV') ?? 'development';
  }

  get port(): number {
    return this.configService.get('PORT') ?? 3000; // 7542
  }
}
