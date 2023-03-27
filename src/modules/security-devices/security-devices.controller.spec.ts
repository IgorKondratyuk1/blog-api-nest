import { Test, TestingModule } from '@nestjs/testing';
import { SecurityDevicesController } from './security-devices.controller';

describe('SecurityDevicesController', () => {
  let controller: SecurityDevicesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SecurityDevicesController],
    }).compile();

    controller = module.get<SecurityDevicesController>(SecurityDevicesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
