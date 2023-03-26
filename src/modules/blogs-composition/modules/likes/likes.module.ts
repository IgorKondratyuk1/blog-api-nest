import { Module } from '@nestjs/common';
import { LikesService } from './likes.service';
import { LikesRepository } from './likes.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { Like, LikeSchema } from './schemas/like.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Like.name, schema: LikeSchema }])],
  providers: [LikesService, LikesRepository],
  exports: [LikesService, LikesRepository],
})
export class LikesModule {}
