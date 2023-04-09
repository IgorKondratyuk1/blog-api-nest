import { Test, TestingModule } from '@nestjs/testing';
import { SuperAdminBlogsController } from './super-admin-blogs.controller';
import { SuperAdminService } from './super-admin.service';

describe('SuperAdminController', () => {
  let controller: SuperAdminBlogsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SuperAdminBlogsController],
      providers: [SuperAdminService],
    }).compile();

    controller = module.get<SuperAdminBlogsController>(SuperAdminBlogsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
