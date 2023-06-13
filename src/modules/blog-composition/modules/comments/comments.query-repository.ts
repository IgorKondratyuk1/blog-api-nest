import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Comment, CommentDocument } from './schemas/comment.schema';
import { Model } from 'mongoose';
import { LikeLocation, LikeStatusType } from '../likes/types/like';
import { CommentsMapper } from './utils/comments.mapper';
import { ViewPublicCommentDto } from './dto/view-public-comment.dto';
import { QueryDto } from '../../../../common/dto/query.dto';
import { Paginator } from '../../../../common/utils/paginator';
import { PaginationDto } from '../../../../common/dto/pagination';
import { LikesRepository } from '../likes/likes.repository';
import { LikesDislikesCountDto } from '../likes/dto/likes-dislikes-count.dto';
import { BlogsRepository } from '../blogs/blogs.repository';
import { BlogDocument } from '../blogs/schemas/blog.schema';
import { ViewBloggerCommentDto } from './dto/view-blogger-comment.dto';
import { PostsRepository } from '../posts/posts.repository';
import { PostDocument } from '../posts/schemas/post.schema';

@Injectable()
export class CommentsQueryRepository {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
    private likesRepository: LikesRepository,
    private blogsRepository: BlogsRepository,
    private postsRepository: PostsRepository,
  ) {}

  public async findById(commentId: string, currentUserId: string = null): Promise<ViewPublicCommentDto | null> {
    const dbComment: CommentDocument | null = await this.commentModel.findOne({ id: commentId, isBanned: false });
    if (!dbComment) return null;

    const likeStatus: LikeStatusType = await this.likesRepository.getUserLikeStatus(
      currentUserId,
      commentId,
      LikeLocation.Comment,
    );

    const likesDislikesCount: LikesDislikesCountDto = await this.likesRepository.getLikesAndDislikesCount(commentId);

    return CommentsMapper.toPublicView(
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
    const skipValue: number = Paginator.getSkipValue(queryObj.pageNumber, queryObj.pageSize);
    const sortValue: 1 | -1 = Paginator.getSortValue(queryObj.sortDirection);
    const filters = { postId, isBanned: false };

    const foundedComments: Comment[] = await this.commentModel
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
        );

        return CommentsMapper.toPublicView(
          comment,
          likeStatus,
          likesDislikesCount.likesCount,
          likesDislikesCount.dislikesCount,
        );
      }),
    );

    const totalCount: number = await this.commentModel.countDocuments(filters);
    const pagesCount = Paginator.getPagesCount(totalCount, queryObj.pageSize);

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
    const skipValue: number = Paginator.getSkipValue(queryObj.pageNumber, queryObj.pageSize);
    const sortValue: 1 | -1 = Paginator.getSortValue(queryObj.sortDirection);

    const userBlogs: BlogDocument[] = await this.blogsRepository.findByUserId(userId);
    const blogIds = userBlogs.map((blog) => blog.id);

    const filters = { blogId: { $in: blogIds } };
    const foundedComments: Comment[] = await this.commentModel
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
        );

        const post: PostDocument | null = await this.postsRepository.findById(comment.postId);
        return CommentsMapper.toBloggerView(
          comment,
          post,
          likeStatus,
          likesDislikesCount.likesCount,
          likesDislikesCount.dislikesCount,
        );
      }),
    );

    const totalCount: number = await this.commentModel.countDocuments(filters);
    const pagesCount = Paginator.getPagesCount(totalCount, queryObj.pageSize);

    return new PaginationDto<ViewBloggerCommentDto>(
      pagesCount,
      Number(queryObj.pageNumber),
      Number(queryObj.pageSize),
      totalCount,
      commentsViewModels,
    );
  }
}
