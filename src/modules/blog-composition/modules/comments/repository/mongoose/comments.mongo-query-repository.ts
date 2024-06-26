import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CommentDocument, CommentMongoEntity } from './schemas/comment.schema';
import { Model } from 'mongoose';
import { LikeLocation, LikeStatusType } from '../../../likes/types/like';
import { CommentsMapper } from '../../utils/comments.mapper';
import { ViewPublicCommentDto } from '../../models/output/view-public-comment.dto';
import { QueryDto } from '../../../../../../common/dto/query.dto';
import { PaginationHelper } from '../../../../../../common/utils/paginationHelper';
import { PaginationDto } from '../../../../../../common/dto/pagination';
import { LikesDislikesCountDto } from '../../../likes/models/output/likes-dislikes-count.dto';
import { ViewBloggerCommentDto } from '../../models/output/view-blogger-comment.dto';
import { PostEntity } from '../../../posts/entities/post.entity';
import { BlogEntity } from '../../../blogs/entities/blog.entity';
import { CommentsQueryRepository } from '../../interfaces/comments.query-repository';
import { LikesRepository } from '../../../likes/interfaces/likes.repository';
import { BlogsRepository } from '../../../blogs/interfaces/blogs.repository';
import { PostsRepository } from '../../../posts/interfaces/posts.repository';

@Injectable()
export class CommentsMongoQueryRepository extends CommentsQueryRepository {
  constructor(
    @InjectModel(CommentMongoEntity.name) private commentModel: Model<CommentDocument>,
    private likesRepository: LikesRepository,
    private blogsRepository: BlogsRepository,
    private postsRepository: PostsRepository,
  ) {
    super();
  }

  public async findById(commentId: string, currentUserId: string = null): Promise<ViewPublicCommentDto | null> {
    const dbComment: CommentDocument | null = await this.commentModel.findOne({ id: commentId, isBanned: false });
    if (!dbComment) return null;

    const likeStatus: LikeStatusType = await this.likesRepository.getUserLikeStatus(
      currentUserId,
      commentId,
      LikeLocation.Comment,
    );

    const likesDislikesCount: LikesDislikesCountDto = await this.likesRepository.getLikesAndDislikesCount(
      commentId,
      LikeLocation.Comment,
    );

    return CommentsMapper.toPublicViewFromDomain(
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
  ): Promise<PaginationDto<ViewPublicCommentDto>> {
    const skipValue: number = PaginationHelper.getSkipValue(queryObj.pageNumber, queryObj.pageSize);
    const sortValue: 1 | -1 = PaginationHelper.getSortValue(queryObj.sortDirection);
    const filters = { postId, isBanned: false };

    const foundedComments: CommentDocument[] = await this.commentModel
      .find(filters)
      .sort({ [queryObj.sortBy]: sortValue })
      .skip(skipValue)
      .limit(queryObj.pageSize)
      .lean();

    const commentsViewModels: ViewPublicCommentDto[] = await Promise.all(
      foundedComments.map(async (comment) => {
        const likeStatus: LikeStatusType = await this.likesRepository.getUserLikeStatus(
          currentUserId,
          comment.id,
          LikeLocation.Comment,
        );

        const likesDislikesCount: LikesDislikesCountDto = await this.likesRepository.getLikesAndDislikesCount(
          comment.id,
          LikeLocation.Comment,
        );

        return CommentsMapper.toPublicViewFromDomain(
          comment,
          likeStatus,
          likesDislikesCount.likesCount,
          likesDislikesCount.dislikesCount,
        );
      }),
    );

    const totalCount: number = await this.commentModel.countDocuments(filters);
    const pagesCount = PaginationHelper.getPagesCount(totalCount, queryObj.pageSize);

    return new PaginationDto<ViewPublicCommentDto>(
      pagesCount,
      Number(queryObj.pageNumber),
      Number(queryObj.pageSize),
      totalCount,
      commentsViewModels,
    );
  }

  public async findAllCommentsOfUserBlogs(
    userId: string,
    queryObj: QueryDto,
  ): Promise<PaginationDto<ViewBloggerCommentDto>> {
    const skipValue: number = PaginationHelper.getSkipValue(queryObj.pageNumber, queryObj.pageSize);
    const sortValue: 1 | -1 = PaginationHelper.getSortValue(queryObj.sortDirection);

    const userBlogs: BlogEntity[] = await this.blogsRepository.findByUserId(userId);
    const blogIds = userBlogs.map((blog) => blog.id);

    const filters = { blogId: { $in: blogIds } };
    const foundedComments: CommentDocument[] = await this.commentModel
      .find(filters)
      .sort({ [queryObj.sortBy]: sortValue })
      .skip(skipValue)
      .limit(queryObj.pageSize)
      .lean();

    const commentsViewModels: ViewBloggerCommentDto[] = await Promise.all(
      foundedComments.map(async (comment) => {
        const likeStatus: LikeStatusType = await this.likesRepository.getUserLikeStatus(
          userId,
          comment.id,
          LikeLocation.Comment,
        );

        const likesDislikesCount: LikesDislikesCountDto = await this.likesRepository.getLikesAndDislikesCount(
          comment.id,
          LikeLocation.Comment,
        );

        const post: PostEntity | null = await this.postsRepository.findById(comment.postId);
        return CommentsMapper.toBloggerViewFromDomain(
          comment,
          post,
          likeStatus,
          likesDislikesCount.likesCount,
          likesDislikesCount.dislikesCount,
        );
      }),
    );

    const totalCount: number = await this.commentModel.countDocuments(filters);
    const pagesCount = PaginationHelper.getPagesCount(totalCount, queryObj.pageSize);

    return new PaginationDto<ViewBloggerCommentDto>(
      pagesCount,
      Number(queryObj.pageNumber),
      Number(queryObj.pageSize),
      totalCount,
      commentsViewModels,
    );
  }
}
