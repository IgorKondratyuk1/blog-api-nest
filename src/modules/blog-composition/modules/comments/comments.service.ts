import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { CommentsRepository } from './comments.repository';
import { CommentDocument } from './schemas/comment.schema';
import { CustomErrorDto } from '../../../../common/dto/error';
import { LikeLocation, LikeStatusType } from '../likes/types/like';
import { LikesService } from '../likes/likes.service';
import { CommentsMapper } from './utils/comments.mapper';
import { ViewPublicCommentDto } from './dto/view-public-comment.dto';
import { BloggerBanInfoRepository } from '../../../ban/blogger-ban-info.repository';
import { BloggerBanInfoDocument } from '../../../ban/schemas/blogger-ban-info.schema';
import { UsersRepository } from '../../../users/interfaces/users.repository';
import UserEntity from '../../../users/entities/user.entity';
import { PostEntity } from '../posts/entities/post.entity';
import { PostsRepository } from '../posts/interfaces/posts.repository';

@Injectable()
export class CommentsService {
  constructor(
    private commentsRepository: CommentsRepository,
    private postsRepository: PostsRepository,
    private usersRepository: UsersRepository,
    private likesService: LikesService,
    private bloggerBanInfoRepository: BloggerBanInfoRepository,
  ) {}

  async create(
    createCommentDto: CreateCommentDto,
    postId: string,
    userId: string,
  ): Promise<ViewPublicCommentDto | CustomErrorDto> {
    const post: PostEntity | null = await this.postsRepository.findById(postId);
    if (!post) return new CustomErrorDto(HttpStatus.NOT_FOUND, 'post is not found');

    // TODO to Use-case
    // Check if user can create comment
    const banInfo: BloggerBanInfoDocument | null = await this.bloggerBanInfoRepository.findByUserIdAndBlogId(
      userId,
      post.blogId,
    );
    if (banInfo) return new CustomErrorDto(HttpStatus.FORBIDDEN, 'banned user for blog can not create comments');

    const user: UserEntity | null = await this.usersRepository.findById(userId);
    if (!user) return new CustomErrorDto(HttpStatus.NOT_FOUND, 'user is not found');

    const comment: CommentDocument | null = await this.commentsRepository.create(
      createCommentDto,
      user.id,
      user.accountData.login,
      post.id,
      post.blogId,
    );
    if (!comment) return new CustomErrorDto(HttpStatus.INTERNAL_SERVER_ERROR, 'comment is not created');

    return CommentsMapper.toPublicView(comment);
  }

  async findOne(id: string): Promise<CommentDocument | null> {
    return this.commentsRepository.findById(id);
  }

  async update(id: string, userId: string, updateCommentDto: UpdateCommentDto): Promise<boolean | CustomErrorDto> {
    const comment: CommentDocument | null = await this.commentsRepository.findById(id);
    if (!comment) return new CustomErrorDto(HttpStatus.NOT_FOUND, 'comment not found');
    if (comment.commentatorInfo.userId !== userId)
      return new CustomErrorDto(HttpStatus.FORBIDDEN, 'user can not update not his comment');

    comment.updateComment(updateCommentDto);
    const result: boolean = await this.commentsRepository.save(comment);
    return result;
  }

  async updateLikeStatus(
    id: string,
    userId: string,
    userLogin: string,
    status: LikeStatusType,
  ): Promise<boolean | CustomErrorDto> {
    const comment: CommentDocument | null = await this.commentsRepository.findById(id);
    if (!comment) return new CustomErrorDto(HttpStatus.NOT_FOUND, 'comment not found');

    const result = await this.likesService.like(userId, userLogin, LikeLocation.Comment, comment.id, status);
    if (!result) return false;

    return true;
  }

  async setBanStatusToUserComments(userId: string, isBanned: boolean): Promise<boolean> {
    return await this.commentsRepository.setBanStatusToUserComments(userId, isBanned);
  }

  async remove(id: string, userId: string): Promise<boolean | CustomErrorDto> {
    const comment: CommentDocument | null = await this.commentsRepository.findById(id);
    if (!comment) return new CustomErrorDto(HttpStatus.NOT_FOUND, 'comment not found');
    if (comment.commentatorInfo.userId !== userId)
      return new CustomErrorDto(HttpStatus.FORBIDDEN, 'comment can not be deleted by another user');

    return this.commentsRepository.remove(id);
  }

  async removeAllComments() {
    await this.likesService.removeAll();
    return this.commentsRepository.removeAll();
  }
}
