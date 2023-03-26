import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { useContainer } from 'class-validator';
import { AppConfigService } from './config/config-services/app-config.service';
import { BadRequestExceptionFilter } from './common/exception-filters/bad-request/bad-request.filter';
import cookieParser from 'cookie-parser';
import { GlobalValidationPipe } from './common/validation-pipes/global.validation-pipe';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const appConfigService = app.get(AppConfigService);
  const PORT: number = appConfigService.port;
  console.log(JSON.stringify(appConfigService)); // Show config object

  app.setGlobalPrefix('api');
  app.enableCors();
  app.use(cookieParser());
  app.useGlobalPipes(new GlobalValidationPipe());
  app.useGlobalFilters(new BadRequestExceptionFilter());
  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  await app.listen(PORT);
}
bootstrap();
