import { Module } from '@nestjs/common';
import { TestingService } from './testing.service';
import { TestingController } from './testing.controller';
import { UsersModule } from '../users/users.module';
import { BlogsModule } from '../blogs/modules/blogs/blogs.module';
import { CommentsModule } from '../blogs/modules/comments/comments.module';
import { LikesModule } from '../blogs/modules/likes/likes.module';
import { PostsModule } from '../blogs/modules/posts/posts.module';

@Module({
  imports: [UsersModule, BlogsModule, CommentsModule, LikesModule, PostsModule],
  controllers: [TestingController],
  providers: [TestingService],
})
export class TestingModule {}
