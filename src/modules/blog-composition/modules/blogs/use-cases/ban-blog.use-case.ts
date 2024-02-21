import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CustomErrorDto } from '../../../../../common/dto/error';
import { BanBlogDto } from '../models/input/ban-blog.dto';
import { PostsService } from '../../posts/posts.service';
import { BlogsService } from '../blogs.service';
import { HttpStatus } from '@nestjs/common';

export class BanBlogCommand {
  constructor(public blogId: string, public banBlogDto: BanBlogDto) {}
}

@CommandHandler(BanBlogCommand)
export class BanBlogUseCase implements ICommandHandler<BanBlogCommand> {
  constructor(private blogsService: BlogsService, private postsService: PostsService) {}

  async execute(command: BanBlogCommand): Promise<boolean | CustomErrorDto> {
    // 1. Ban blog
    const banResult: CustomErrorDto | boolean = await this.blogsService.setBlogBanStatus(
      command.blogId,
      command.banBlogDto,
    );
    if (banResult instanceof CustomErrorDto) return banResult;

    // 2. Ban all posts of blog
    const banPostsResult: boolean = await this.postsService.setBanStatusByBlogId(
      command.blogId,
      command.banBlogDto.isBanned,
    );
    if (!banPostsResult) return new CustomErrorDto(HttpStatus.INTERNAL_SERVER_ERROR, 'can not ban posts of blog');

    return true;
  }
}
