import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CustomErrorDto } from '../../../common/dto/error';
import { BloggerBanInfoRepository } from '../../ban/blogger-ban-info.repository';
import { BanService } from '../../ban/ban.service';
import { CreateBanByBloggerDto } from '../../ban/dto/input/create-ban-by-blogger.dto';
import { BloggerBanInfoDocument } from '../../ban/schemas/blogger-ban-info.schema';
import { UsersService } from '../users.service';
import { UserDocument } from '../schemas/user.schema';
import { HttpStatus } from '@nestjs/common';
import { BlogsService } from '../../blog-composition/modules/blogs/blogs.service';
import { BlogDocument } from '../../blog-composition/modules/blogs/schemas/blog.schema';

export class BanUserByBloggerCommand {
  constructor(public authorId: string, public banUserId: string, public createBanByBloggerDto: CreateBanByBloggerDto) {}
}

@CommandHandler(BanUserByBloggerCommand)
export class BanUserByBloggerUseCase implements ICommandHandler<BanUserByBloggerCommand> {
  constructor(
    private bloggerBanInfoRepository: BloggerBanInfoRepository,
    private banService: BanService,
    private usersService: UsersService,
    private blogsService: BlogsService,
  ) {}

  async execute(command: BanUserByBloggerCommand): Promise<boolean | CustomErrorDto> {
    // 1. Check if author of ban is blog owner
    const blog: BlogDocument | null = await this.blogsService.findById(command.createBanByBloggerDto.blogId);
    if (!blog) return new CustomErrorDto(HttpStatus.NOT_FOUND, 'blog is not found');
    if (blog.userId !== command.authorId)
      return new CustomErrorDto(HttpStatus.FORBIDDEN, 'can not change status for other blogs');

    // 2. Check if user for ban exists
    const user: UserDocument | null = await this.usersService.findById(command.banUserId);
    if (!user) return new CustomErrorDto(HttpStatus.NOT_FOUND, 'user for ban is not found');

    // Ban or unban user
    if (command.createBanByBloggerDto.isBanned) {
      // Search if ban already exists in db
      const foundedBan: BloggerBanInfoDocument | null = await this.bloggerBanInfoRepository.findByUserIdAndBlogId(
        command.banUserId,
        command.createBanByBloggerDto.blogId,
      );
      if (foundedBan) return true;

      // If isBanned === True - ban user
      const banResult: CustomErrorDto | boolean = await this.banService.createUserBanForBlogByBlogger(
        command.authorId,
        user.id,
        user.accountData.login,
        command.createBanByBloggerDto,
      );
      if (banResult instanceof CustomErrorDto) return banResult;

      return true;
    } else {
      // If isBanned === False - unban user
      const unbanResult: boolean = await this.banService.removeUserBanForBlogByBlogger(
        command.banUserId,
        command.createBanByBloggerDto.blogId,
      );

      return true;
    }
  }
}
