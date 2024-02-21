import { forwardRef, Module } from '@nestjs/common';
import { BlogsService } from './blogs.service';
import { BlogsController } from './blogs.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { BlogMongoEntity, BlogSchema } from './repository/mongoose/schemas/blog.schema';
import { PostsModule } from '../posts/posts.module';
import { BlogExistsRule } from './validators/blog-exists.validator';
import { UsersModule } from '../../../users/users.module';
import { DbConfigService } from '../../../../config/config-services/db-config.service';
import { BlogsRepository } from './interfaces/blogs.repository';
import { BlogsQueryRepository } from './interfaces/blogs.query-repository';
import { BlogsMongoRepository } from './repository/mongoose/blogs.mongo-repository';
import { BlogsMongoQueryRepository } from './repository/mongoose/blogs.mongo-query-repository';
import { BlogsPgRepository } from './repository/postgresql/blogs.pg-repository';
import { BlogsPgQueryRepository } from './repository/postgresql/blogs.pg-query-repository';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: BlogMongoEntity.name, schema: BlogSchema }]),
    forwardRef(() => PostsModule),
    UsersModule,
  ],
  controllers: [BlogsController],
  providers: [
    BlogsService,
    BlogsMongoRepository,
    BlogsMongoQueryRepository,
    BlogsPgRepository,
    BlogsPgQueryRepository,
    BlogExistsRule,
    {
      provide: BlogsRepository,
      useFactory: async (
        dbConfigService: DbConfigService,
        postgresqlBlogsRepository: BlogsPgRepository,
        mongooseBlogsRepository: BlogsMongoRepository,
      ) => {
        return dbConfigService.dbType === 'sql' ? postgresqlBlogsRepository : mongooseBlogsRepository;
      },
      inject: [DbConfigService, BlogsPgRepository, BlogsMongoRepository],
    },
    {
      provide: BlogsQueryRepository,
      useFactory: async (
        dbConfigService: DbConfigService,
        postgresqlBlogsQueryRepository: BlogsPgQueryRepository,
        mongooseBlogsQueryRepository: BlogsMongoQueryRepository,
      ) => {
        return dbConfigService.dbType === 'sql' ? postgresqlBlogsQueryRepository : mongooseBlogsQueryRepository;
      },
      inject: [DbConfigService, BlogsPgQueryRepository, BlogsMongoQueryRepository],
    },
  ],
  exports: [BlogsRepository, BlogsQueryRepository, BlogsService],
})
export class BlogsModule {}
