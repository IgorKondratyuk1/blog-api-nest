import { Test, TestingModule } from '@nestjs/testing';
import { BloggerBlogsController } from './blogger-blogs.controller';
import { BloggerService } from './blogger.service';

describe('BloggerController', () => {
  let controller: BloggerBlogsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BloggerBlogsController],
      providers: [BloggerService],
    }).compile();

    controller = module.get<BloggerBlogsController>(BloggerBlogsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
