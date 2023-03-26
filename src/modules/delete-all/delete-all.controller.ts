import { Controller, Param, Delete, HttpCode } from '@nestjs/common';
import { DeleteAllService } from './delete-all.service';

@Controller('testing')
export class DeleteAllController {
  constructor(private readonly testingService: DeleteAllService) {}

  @HttpCode(204)
  @Delete('/all-data')
  async remove() {
    return await this.testingService.removeAll();
  }
}
