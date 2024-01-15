import cookieParser from 'cookie-parser';
import { GlobalValidationPipe } from './common/validation-pipes/global.validation-pipe';
import { BadRequestExceptionFilter } from './common/exception-filters/bad-request/bad-request.filter';
import { useContainer } from 'class-validator';
import { AppModule } from './app.module';
import { INestApplication } from '@nestjs/common';
import { UnauthorizedExceptionFilter } from './common/exception-filters/unauthorized/unauthorized.filter';

export const setupApp = (app: INestApplication) => {
  app.setGlobalPrefix('api');
  app.enableCors();
  app.use(cookieParser());
  app.useGlobalPipes(new GlobalValidationPipe());
  app.useGlobalFilters(new BadRequestExceptionFilter());
  app.useGlobalFilters(new UnauthorizedExceptionFilter());
  useContainer(app.select(AppModule), { fallbackOnErrors: true });
};
