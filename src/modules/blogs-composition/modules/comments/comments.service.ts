import { BadRequestException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { CommentsRepository } from './comments.repository';
import { PostDocument } from '../posts/schemas/post.schema';
import { PostsRepository } from '../posts/posts.repository';
import { UserDocument } from '../../../users/schemas/user.schema';
import { CommentDocument } from './schemas/comment.schema';
import { UsersService } from '../../../users/users.service';
import { CustomErrorDto } from '../../../../common/dto/error';
import { UsersRepository } from '../../../users/users.repository';
import { LikeLocation, LikeStatusType } from '../likes/types/like';
import { LikesService } from '../likes/likes.service';
import { CommentsMapper } from './utils/comments.mapper';
import { ViewCommentDto } from './dto/view-comment.dto';

@Injectable()
export class CommentsService {
  constructor(
    private commentsRepository: CommentsRepository,
    private postsRepository: PostsRepository,
    private usersRepository: UsersRepository,
    private likesService: LikesService,
  ) {}

  async create(
    createCommentDto: CreateCommentDto,
    postId: string,
    userId: string,
  ): Promise<ViewCommentDto | CustomErrorDto> {
    const post: PostDocument | null = await this.postsRepository.findById(postId);
    if (!post) return new CustomErrorDto(HttpStatus.NOT_FOUND, 'post is not found');

    const user: UserDocument | null = await this.usersRepository.findById(userId);
    if (!user) return new CustomErrorDto(HttpStatus.NOT_FOUND, 'user is not found');

    const comment: CommentDocument | null = await this.commentsRepository.create(
      createCommentDto,
      user.id,
      user.accountData.login,
      post.id,
    );
    if (!comment)
      return new CustomErrorDto(HttpStatus.INTERNAL_SERVER_ERROR, 'comment is not created');

    return CommentsMapper.toView(comment);
  }

  async findOne(id: string): Promise<CommentDocument | null> {
    return this.commentsRepository.findById(id);
  }

  async update(
    id: string,
    userId: string,
    updateCommentDto: UpdateCommentDto,
  ): Promise<boolean | CustomErrorDto> {
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
    //debugger;
    const comment: CommentDocument | null = await this.commentsRepository.findById(id);
    if (!comment) return new CustomErrorDto(HttpStatus.NOT_FOUND, 'comment not found');

    const result = await this.likesService.like(
      userId,
      userLogin,
      LikeLocation.Comment,
      comment.id,
      status,
    );
    if (!result) return false;

    return true;
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
