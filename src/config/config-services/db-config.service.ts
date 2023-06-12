import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConfigurationType } from '../configuration';

@Injectable()
export class DbConfigService {
  constructor(private configService: ConfigService<ConfigurationType>) {}

  get dbType(): string {
    return 'MONGO';
  }

  get dbBaseUri(): string {
    return this.configService.get('DB', { infer: true }).MONGO.MONGO_BASE_URL ?? 'mongodb://127.0.0.1:27017/';
  }

  get dbName(): string {
    return this.configService.get('DB', { infer: true }).MONGO.MONGO_DB_NAME ?? 'blogDB';
  }
}
