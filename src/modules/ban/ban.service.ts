import { HttpStatus, Injectable } from '@nestjs/common';
import { BloggerBanInfoRepository } from './blogger-ban-info.repository';
import { CustomErrorDto } from '../../common/dto/error';
import { BloggerBanInfoDocument } from './schemas/blogger-ban-info.schema';
import { CreateBanByBloggerDto } from './dto/input/create-ban-by-blogger.dto';
import { BanByBloggerDto } from './dto/ban-by-blogger.dto';
import { BanLocation } from './types/ban-locations';

@Injectable()
export class BanService {
  constructor(private bloggerBanInfoRepository: BloggerBanInfoRepository) {}

  async createUserBanForBlogByBlogger(
    authorId: string,
    banUserId: string,
    banUserLogin: string,
    createBanByBloggerDto: CreateBanByBloggerDto,
  ): Promise<boolean | CustomErrorDto> {
    const banByBloggerDto: BanByBloggerDto = new BanByBloggerDto(
      banUserId,
      banUserLogin,
      createBanByBloggerDto.banReason,
      authorId,
      createBanByBloggerDto.blogId,
      BanLocation.Blog,
    );

    const newBan: BloggerBanInfoDocument | null = await this.bloggerBanInfoRepository.create(banByBloggerDto);
    if (!newBan) {
      return new CustomErrorDto(HttpStatus.INTERNAL_SERVER_ERROR, 'can not ban user');
    }
    return true;
  }

  async removeUserBanForBlogByBlogger(banUserId: string, blogId: string): Promise<boolean> {
    return await this.bloggerBanInfoRepository.removeByUserIdAndBlogId(banUserId, blogId);
  }
}
