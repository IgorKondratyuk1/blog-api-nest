import { forwardRef, Module } from '@nestjs/common';
import { CommentsController } from './comments.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { PostsModule } from '../posts/posts.module';
import { CommentsRepository } from './comments.repository';
import { CommentsQueryRepository } from './comments.query-repository';
import { Comment, CommentSchema } from './schemas/comment.schema';
import { UsersModule } from '../../../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Comment.name, schema: CommentSchema }]),
    forwardRef(() => PostsModule),
    UsersModule,
  ],
  controllers: [CommentsController],
  providers: [CommentsRepository, CommentsQueryRepository],
  exports: [CommentsQueryRepository, CommentsRepository],
})
export class CommentsModule {}
