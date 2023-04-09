import { BadRequestException, ValidationPipe } from '@nestjs/common';

export class GlobalValidationPipe extends ValidationPipe {
  constructor() {
    super({
      stopAtFirstError: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      forbidNonWhitelisted: true,
      exceptionFactory: (errors) => {
        const errorsForResponse = [];

        errors.forEach((e) => {
          const keys = Object.keys(e.constraints);
          keys.forEach((k) => {
            errorsForResponse.push({ field: e.property, message: e.constraints[k] });
          });
        });
        throw new BadRequestException(errorsForResponse);
      },
    });
  }
}
