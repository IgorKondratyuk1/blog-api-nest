import { forwardRef, Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { PostsQueryRepository } from './posts.query-repository';
import { PostsRepository } from './posts.repository';
import { BlogsModule } from '../blogs/blogs.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Post, PostSchema } from './schemas/post.schema';
import { CommentsModule } from '../comments/comments.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }]),
    forwardRef(() => BlogsModule),
    forwardRef(() => CommentsModule),
  ],
  controllers: [PostsController],
  providers: [PostsService, PostsRepository, PostsQueryRepository],
  exports: [PostsQueryRepository, PostsRepository, PostsService],
})
export class PostsModule {}
