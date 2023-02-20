import { Controller, Param, Delete, HttpCode } from '@nestjs/common';
import { TestingService } from './testing.service';

@Controller('testing')
export class TestingController {
  constructor(private readonly testingService: TestingService) {}

  @HttpCode(204)
  @Delete('/all-data')
  async remove() {
    return await this.testingService.removeAll();
  }
}
