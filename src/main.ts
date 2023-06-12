import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppConfigService } from './config/config-services/app-config.service';
import { INestApplication } from '@nestjs/common';
import { setupApp } from './setup-app';

async function bootstrap() {
  const app: INestApplication = await NestFactory.create(AppModule);
  const appConfigService = app.get(AppConfigService);
  const PORT: number = appConfigService.port;
  console.log(JSON.stringify(appConfigService)); // Show config object
  setupApp(app);
  await app.listen(PORT);
}
bootstrap();
