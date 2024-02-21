import { forwardRef, Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { PostsMongoQueryRepository } from './repository/mongoose/posts.mongo-query-repository';
import { PostsMongoRepository } from './repository/mongoose/posts.mongo-repository';
import { BlogsModule } from '../blogs/blogs.module';
import { MongooseModule } from '@nestjs/mongoose';
import { PostMongoEntity, PostSchema } from './repository/mongoose/schemas/post.schema';
import { CommentsModule } from '../comments/comments.module';
import { LikesModule } from '../likes/likes.module';
import { DbConfigService } from '../../../../config/config-services/db-config.service';
import { PostsRepository } from './interfaces/posts.repository';
import { PostsPgRepository } from './repository/postgresql/posts.pg-repository';
import { PostsPgQueryRepository } from './repository/postgresql/posts.pg-query-repository';
import { PostsQueryRepository } from './interfaces/posts.query-repository';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: PostMongoEntity.name, schema: PostSchema }]),
    forwardRef(() => BlogsModule),
    forwardRef(() => CommentsModule),
    LikesModule,
  ],
  controllers: [PostsController],
  providers: [
    PostsService,
    PostsMongoRepository,
    PostsMongoQueryRepository,
    PostsPgRepository,
    PostsPgQueryRepository,
    {
      provide: PostsRepository,
      useFactory: async (
        dbConfigService: DbConfigService,
        postgresqlPostsRepository: PostsPgRepository,
        mongoosePostsRepository: PostsMongoRepository,
      ) => {
        return dbConfigService.dbType === 'sql' ? postgresqlPostsRepository : mongoosePostsRepository;
      },
      inject: [DbConfigService, PostsPgRepository, PostsMongoRepository],
    },
    {
      provide: PostsQueryRepository,
      useFactory: async (
        dbConfigService: DbConfigService,
        postgresqlPostsQueryRepository: PostsPgQueryRepository,
        mongoosePostsQueryRepository: PostsMongoQueryRepository,
      ) => {
        return dbConfigService.dbType === 'sql' ? postgresqlPostsQueryRepository : mongoosePostsQueryRepository;
      },
      inject: [DbConfigService, PostsPgQueryRepository, PostsMongoQueryRepository],
    },
  ],
  exports: [PostsQueryRepository, PostsRepository, PostsService],
})
export class PostsModule {}
