import { Module } from '@nestjs/common';
import { BloggerService } from './blogger.service';
import { BloggerController } from './blogger.controller';
import { BlogsModule } from '../blog-composition/modules/blogs/blogs.module';
import { PostsModule } from '../blog-composition/modules/posts/posts.module';

@Module({
  imports: [BlogsModule, PostsModule],
  controllers: [BloggerController],
  providers: [BloggerService],
})
export class BloggerModule {}
