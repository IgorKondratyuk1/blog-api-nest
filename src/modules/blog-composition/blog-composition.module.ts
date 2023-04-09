import { BlogsModule } from './modules/blogs/blogs.module';
import { PostsModule } from './modules/posts/posts.module';
import { Module } from '@nestjs/common';
import { CommentsModule } from './modules/comments/comments.module';
import { LikesModule } from './modules/likes/likes.module';

@Module({
  imports: [BlogsModule, PostsModule, CommentsModule, LikesModule],
  exports: [BlogsModule, PostsModule, CommentsModule, LikesModule],
})
export class BlogCompositionModule {}
