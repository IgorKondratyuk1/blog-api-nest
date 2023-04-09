import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Comment, CommentDocument } from './schemas/comment.schema';
import { Model } from 'mongoose';
import { LikeLocation, LikeStatusType } from '../likes/types/like';
import { CommentsMapper } from './utils/comments.mapper';
import { ViewCommentDto } from './dto/view-comment.dto';
import { QueryDto } from '../../../../common/dto/query.dto';
import { Paginator } from '../../../../common/utils/paginator';
import { PaginationDto } from '../../../../common/dto/pagination';
import { LikesRepository } from '../likes/likes.repository';
import { LikesDislikesCountDto } from '../likes/dto/likes-dislikes-count.dto';

@Injectable()
export class CommentsQueryRepository {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
    private likesRepository: LikesRepository,
  ) {}

  public async findById(commentId: string, currentUserId: string = null): Promise<ViewCommentDto | null> {
    const dbComment: CommentDocument | null = await this.commentModel.findOne({ id: commentId, isBanned: false });
    if (!dbComment) return null;

    const likeStatus: LikeStatusType = await this.likesRepository.getUserLikeStatus(
      currentUserId,
      commentId,
      LikeLocation.Comment,
    );

    const likesDislikesCount: LikesDislikesCountDto = await this.likesRepository.getLikesAndDislikesCount(commentId);

    return CommentsMapper.toView(
      dbComment,
      likeStatus,
      likesDislikesCount.likesCount,
      likesDislikesCount.dislikesCount,
    );
  }

  public async findCommentsOfPost(
    postId: string,
    queryObj: QueryDto,
    currentUserId: string = null,
  ): Promise<PaginationDto<ViewCommentDto>> {
    const skipValue: number = Paginator.getSkipValue(queryObj.pageNumber, queryObj.pageSize);
    const sortValue: 1 | -1 = Paginator.getSortValue(queryObj.sortDirection);

    const foundedComments: Comment[] = await this.commentModel
      .find({ postId, isBanned: false })
      .sort({ [queryObj.sortBy]: sortValue })
      .skip(skipValue)
      .limit(queryObj.pageSize)
      .lean();

    const commentsViewModels: ViewCommentDto[] = await Promise.all(
      foundedComments.map(async (comment) => {
        const likeStatus: LikeStatusType = await this.likesRepository.getUserLikeStatus(
          currentUserId,
          comment.id,
          LikeLocation.Comment,
        );

        const likesDislikesCount: LikesDislikesCountDto = await this.likesRepository.getLikesAndDislikesCount(
          comment.id,
        );

        return CommentsMapper.toView(
          comment,
          likeStatus,
          likesDislikesCount.likesCount,
          likesDislikesCount.dislikesCount,
        );
      }),
    );

    const totalCount: number = await this.commentModel.countDocuments({ postId });
    const pagesCount = Paginator.getPagesCount(totalCount, queryObj.pageSize);

    return new PaginationDto<ViewCommentDto>(
      pagesCount,
      Number(queryObj.pageNumber),
      Number(queryObj.pageSize),
      totalCount,
      commentsViewModels,
    );
  }
}
