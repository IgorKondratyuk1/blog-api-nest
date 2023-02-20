import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Comment, CommentDocument } from './schemas/comment.schema';
import { Model } from 'mongoose';
import { LikeLocation, LikeStatus, LikeStatusType } from '../likes/types/like';
import { CommentsMapper } from './utils/comments.mapper';
import { FilterType, Paginator, QueryType } from '../../../../common/types/pagination';
import { ViewCommentDto } from './dto/view-comment.dto';
import { Pagination } from '../../../../common/utils/pagination';

@Injectable()
export class CommentsQueryRepository {
  constructor(@InjectModel(Comment.name) private commentModel: Model<CommentDocument>) {}

  async findOne(commentId: string, userId: string = null): Promise<any> {
    const dbComment: CommentDocument | null = await this.commentModel.findOne({ id: commentId });
    if (!dbComment) return null;

    const likeStatus: LikeStatusType = LikeStatus.None;
    return CommentsMapper.toView(dbComment);
  }

  async findCommentsOfPost(
    postId: string,
    queryObj: QueryType,
    currentUserId: string = null,
  ): Promise<Paginator<ViewCommentDto>> {
    const filters: FilterType = Pagination.getFilters(queryObj);
    const skipValue: number = Pagination.getSkipValue(filters.pageNumber, filters.pageSize);
    const sortValue: 1 | -1 = Pagination.getSortValue(filters.sortDirection);

    const foundedComments: any[] = await this.commentModel
      .find({ postId })
      .sort({ [filters.sortBy]: sortValue })
      .skip(skipValue)
      .limit(filters.pageSize)
      .lean();

    const commentsViewModels: any[] = await Promise.all(
      foundedComments.map(async (comment) => {
        // const likeStatus: LikeStatusType = await Like.getUserLikeStatus(
        //   currentUserId,
        //   comment.id,
        //   LikeLocation.Comment,
        // );
        return CommentsMapper.toView(comment);
      }),
    );

    const totalCount: number = await this.commentModel.countDocuments({ postId });
    const pagesCount = Pagination.getPagesCount(totalCount, filters.pageSize);

    return {
      pagesCount: pagesCount,
      page: filters.pageNumber,
      pageSize: filters.pageSize,
      totalCount: totalCount,
      items: commentsViewModels,
    };
  }
}
