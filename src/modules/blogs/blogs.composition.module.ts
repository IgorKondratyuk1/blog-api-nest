import { BlogsModule } from './modules/blogs/blogs.module';
import { PostsModule } from './modules/posts/posts.module';
import { Module } from '@nestjs/common';
import { CommentsModule } from './modules/comments/comments.module';

// TODO Question: Provides - local scope (module), export: global scope
@Module({
  imports: [BlogsModule, PostsModule, CommentsModule],
  exports: [],
})
export class BlogsCompositionModule {}
