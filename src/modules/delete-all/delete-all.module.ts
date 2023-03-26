import { Module } from '@nestjs/common';
import { DeleteAllService } from './delete-all.service';
import { DeleteAllController } from './delete-all.controller';
import { UsersModule } from '../users/users.module';
import { BlogsModule } from '../blogs-composition/modules/blogs/blogs.module';
import { CommentsModule } from '../blogs-composition/modules/comments/comments.module';
import { LikesModule } from '../blogs-composition/modules/likes/likes.module';
import { PostsModule } from '../blogs-composition/modules/posts/posts.module';

@Module({
  imports: [UsersModule, BlogsModule, CommentsModule, LikesModule, PostsModule],
  controllers: [DeleteAllController],
  providers: [DeleteAllService],
})
export class DeleteAllModule {}
