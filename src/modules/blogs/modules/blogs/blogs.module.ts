import { forwardRef, Module } from '@nestjs/common';
import { BlogsService } from './blogs.service';
import { BlogsController } from './blogs.controller';
import { BlogsQueryRepository } from './blogs.query-repository';
import { BlogsRepository } from './blogs.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { Blog, BlogSchema } from './schemas/blog.schema';
import { PostsModule } from '../posts/posts.module';

// TODO Provides - local scope (module), export: global scope
@Module({
  imports: [
    MongooseModule.forFeature([{ name: Blog.name, schema: BlogSchema }]),
    forwardRef(() => PostsModule),
  ],
  controllers: [BlogsController],
  providers: [BlogsService, BlogsRepository, BlogsQueryRepository],
  exports: [BlogsRepository],
})
export class BlogsModule {}
