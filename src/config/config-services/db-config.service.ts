import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConfigurationType } from '../configuration';

@Injectable()
export class DbConfigService {
  constructor(private configService: ConfigService<ConfigurationType>) {}

  get dbType(): string {
    return this.configService.get('DB', { infer: true }).REPOSITORY_TYPE ?? 'mongo';
  }

  get mongodbUri(): string {
    return this.configService.get('DB', { infer: true }).MONGO.MONGO_BASE_URL ?? 'mongodb://127.0.0.1:27017/';
  }

  get mongodbName(): string {
    return this.configService.get('DB', { infer: true }).MONGO.MONGO_DB_NAME ?? 'blogDB';
  }

  get pgHost(): string {
    return this.configService.get('DB', { infer: true }).PG.PG_HOST ?? 'localhost';
  }

  get pgPort(): number {
    const port: string = this.configService.get('DB', { infer: true }).PG.PG_PORT;
    return port ? Number(port) : 5432;
  }

  get pgUsername(): string {
    return this.configService.get('DB', { infer: true }).PG.PG_USERNAME ?? 'postgres';
  }

  get pgPassword(): string {
    return this.configService.get('DB', { infer: true }).PG.PG_PASSWORD ?? 'admin';
  }

  get pgDbName(): string {
    return this.configService.get('DB', { infer: true }).PG.PG_DB_NAME ?? 'SocialNetwork';
  }
}
