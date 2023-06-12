import { Module } from '@nestjs/common';
import { BloggerService } from './blogger.service';
import { BloggerBlogsController } from './blogger-blogs.controller';
import { BlogsModule } from '../blog-composition/modules/blogs/blogs.module';
import { PostsModule } from '../blog-composition/modules/posts/posts.module';
import { BloggerUsersController } from './blogger-users.controller';
import { BanModule } from '../ban/ban.module';
import { CqrsModule } from '@nestjs/cqrs';
import { CommentsModule } from '../blog-composition/modules/comments/comments.module';

@Module({
  imports: [BlogsModule, PostsModule, CommentsModule, BanModule, CqrsModule],
  controllers: [BloggerBlogsController, BloggerUsersController],
  providers: [BloggerService],
})
export class BloggerModule {}
