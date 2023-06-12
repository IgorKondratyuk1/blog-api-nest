import { forwardRef, Module } from '@nestjs/common';
import { CommentsController } from './comments.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { PostsModule } from '../posts/posts.module';
import { CommentsRepository } from './comments.repository';
import { CommentsQueryRepository } from './comments.query-repository';
import { Comment, CommentSchema } from './schemas/comment.schema';
import { UsersModule } from '../../../users/users.module';
import { LikesModule } from '../likes/likes.module';
import { CommentsService } from './comments.service';
import { BanModule } from '../../../ban/ban.module';
import { BlogsModule } from '../blogs/blogs.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Comment.name, schema: CommentSchema }]),
    forwardRef(() => PostsModule),
    forwardRef(() => BlogsModule),
    UsersModule,
    LikesModule,
    BanModule,
  ],
  controllers: [CommentsController],
  providers: [CommentsQueryRepository, CommentsRepository, CommentsService],
  exports: [CommentsQueryRepository, CommentsRepository, CommentsService],
})
export class CommentsModule {}
