import { Module } from '@nestjs/common';
import { LikesService } from './likes.service';
import { LikesMongoRepository } from './repository/mongoose/likes.mongo-repository';
import { MongooseModule } from '@nestjs/mongoose';
import { LikeMongoEntity, LikeSchema } from './repository/mongoose/schemas/like.schema';
import { LikesRepository } from './interfaces/likes.repository';
import { DbConfigService } from '../../../../config/config-services/db-config.service';
import { LikesPgRepository } from './repository/postgresql/likes.pg-repository';

@Module({
  imports: [MongooseModule.forFeature([{ name: LikeMongoEntity.name, schema: LikeSchema }])],
  providers: [
    LikesService,
    LikesMongoRepository,
    LikesPgRepository,
    {
      provide: LikesRepository,
      useFactory: async (
        dbConfigService: DbConfigService,
        postgresqlLikesRepository: LikesPgRepository,
        mongooseLikesRepository: LikesMongoRepository,
      ) => {
        return dbConfigService.dbType === 'sql' ? postgresqlLikesRepository : mongooseLikesRepository;
      },
      inject: [DbConfigService, LikesPgRepository, LikesMongoRepository],
    },
  ],
  exports: [LikesService, LikesRepository],
})
export class LikesModule {}
