import { BlogsModule } from './modules/blogs/blogs.module';
import { PostsModule } from './modules/posts/posts.module';
import { Module } from '@nestjs/common';
import { CommentsModule } from './modules/comments/comments.module';

@Module({
  imports: [BlogsModule, PostsModule, CommentsModule],
  exports: [],
})
export class BlogsCompositionModule {}
