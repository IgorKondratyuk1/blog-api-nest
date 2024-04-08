import { forwardRef, Module } from '@nestjs/common';
import { CommentsController } from './comments.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { PostsModule } from '../posts/posts.module';
import { CommentsMongoRepository } from './repository/mongoose/comments.mongo-repository';
import { CommentsMongoQueryRepository } from './repository/mongoose/comments.mongo-query-repository';
import { CommentMongoEntity, CommentSchema } from './repository/mongoose/schemas/comment.schema';
import { UsersModule } from '../../../users/users.module';
import { LikesModule } from '../likes/likes.module';
import { CommentsService } from './comments.service';
import { BanModule } from '../../../ban/ban.module';
import { BlogsModule } from '../blogs/blogs.module';
import { CommentsRepository } from './interfaces/comments.repository';
import { CommentsQueryRepository } from './interfaces/comments.query-repository';
import { CommentsPgQueryRepository } from './repository/postgresql/comments.pg-query-repository';
import { CommentsPgRepository } from './repository/postgresql/comments.pg-repository';
import { DbConfigService } from '../../../../config/config-services/db-config.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: CommentMongoEntity.name, schema: CommentSchema }]),
    forwardRef(() => PostsModule),
    forwardRef(() => BlogsModule),
    UsersModule,
    LikesModule,
    BanModule,
  ],
  controllers: [CommentsController],
  providers: [
    CommentsService,
    CommentsMongoQueryRepository,
    CommentsMongoRepository,
    CommentsPgQueryRepository,
    CommentsPgRepository,
    {
      provide: CommentsRepository,
      useFactory: async (
        dbConfigService: DbConfigService,
        postgresqlCommentsRepository: CommentsPgRepository,
        mongooseCommentsRepository: CommentsMongoRepository,
      ) => {
        return dbConfigService.dbType === 'sql' ? postgresqlCommentsRepository : mongooseCommentsRepository;
      },
      inject: [DbConfigService, CommentsPgRepository, CommentsMongoRepository],
    },
    {
      provide: CommentsQueryRepository,
      useFactory: async (
        dbConfigService: DbConfigService,
        postgresqlCommentsQueryRepository: CommentsPgQueryRepository,
        mongooseCommentsQueryRepository: CommentsMongoQueryRepository,
      ) => {
        return dbConfigService.dbType === 'sql' ? postgresqlCommentsQueryRepository : mongooseCommentsQueryRepository;
      },
      inject: [DbConfigService, CommentsPgQueryRepository, CommentsMongoQueryRepository],
    },
  ],
  exports: [CommentsQueryRepository, CommentsRepository, CommentsService],
})
export class CommentsModule {}
