import { BanUserDto } from '../../users/dto/ban-user.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SecurityDevicesService } from '../../security-devices/security-devices.service';
import { UsersService } from '../../users/users.service';
import { CustomErrorDto } from '../../../common/dto/error';
import { HttpStatus } from '@nestjs/common';
import { PostsService } from '../../blog-composition/modules/posts/posts.service';
import { CommentsService } from '../../blog-composition/modules/comments/comments.service';
import { LikesService } from '../../blog-composition/modules/likes/likes.service';

export class BanUserCommand {
  constructor(public userId: string, public banUserDto: BanUserDto) {}
}

@CommandHandler(BanUserCommand)
export class BanUserUseCase implements ICommandHandler<BanUserCommand> {
  constructor(
    private securityDevicesService: SecurityDevicesService,
    private usersService: UsersService,
    private postsService: PostsService,
    private commentsService: CommentsService,
    private likesService: LikesService,
  ) {}

  async execute(command: BanUserCommand): Promise<boolean | CustomErrorDto> {
    // 1. Set ban status to user
    const banResult: CustomErrorDto | boolean = await this.usersService.setUserBanStatus(
      command.userId,
      command.banUserDto,
    );
    if (banResult instanceof CustomErrorDto) return banResult;

    // 2. Delete all
    const deleteResult: boolean = await this.securityDevicesService.deleteAllUserSessions(command.userId);
    if (!deleteResult) return new CustomErrorDto(HttpStatus.INTERNAL_SERVER_ERROR, 'can not delete user sessions');

    // 3.1. Ban users posts
    const banPostResult: boolean = await this.postsService.setBanStatusToUserPosts(
      command.userId,
      command.banUserDto.isBanned,
    );
    if (!banPostResult) return new CustomErrorDto(HttpStatus.INTERNAL_SERVER_ERROR, 'can not ban user posts');

    // 3.2. Ban users comments
    const banCommentsResult: boolean = await this.commentsService.setBanStatusToUserComments(
      command.userId,
      command.banUserDto.isBanned,
    );
    if (!banCommentsResult) return new CustomErrorDto(HttpStatus.INTERNAL_SERVER_ERROR, 'can not ban user comments');

    // 3.3. Ban users likes
    const banLikesResult: boolean = await this.likesService.setBanStatusToUserLikes(
      command.userId,
      command.banUserDto.isBanned,
    );
    if (!banLikesResult) return new CustomErrorDto(HttpStatus.INTERNAL_SERVER_ERROR, 'can not ban user likes');

    return true;
  }
}

// 1. Map banInfo +
// 2. Guard isBanned cant login +
// 3. Ban all posts, likes, comments +
