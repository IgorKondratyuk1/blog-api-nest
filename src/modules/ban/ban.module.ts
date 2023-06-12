import { Module } from '@nestjs/common';
import { BanService } from './ban.service';
import { BloggerBanInfoRepository } from './blogger-ban-info.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { BloggerBanInfo, BloggerBanInfoSchema } from './schemas/blogger-ban-info.schema';
import { BanQueryRepository } from './ban.query-repository';

@Module({
  imports: [MongooseModule.forFeature([{ name: BloggerBanInfo.name, schema: BloggerBanInfoSchema }])],
  providers: [BanService, BloggerBanInfoRepository, BanQueryRepository],
  exports: [BanService, BloggerBanInfoRepository, BanQueryRepository],
})
export class BanModule {}
