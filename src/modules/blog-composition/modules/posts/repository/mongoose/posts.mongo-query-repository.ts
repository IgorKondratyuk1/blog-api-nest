import { Injectable } from '@nestjs/common';
import { LikeLocation, LikeStatusType } from '../../../likes/types/like';
import { InjectModel } from '@nestjs/mongoose';
import { PostMongoEntity, PostDocument } from './schemas/post.schema';
import { Model } from 'mongoose';
import { PostMapper } from '../../utils/postMapper';
import { QueryDto } from '../../../../../../common/dto/query.dto';
import { PaginationHelper } from '../../../../../../common/utils/paginationHelper';
import { PaginationDto } from '../../../../../../common/dto/pagination';
import { LikesRepository } from '../../../likes/likes.repository';
import { LikesDislikesCountDto } from '../../../likes/dto/likes-dislikes-count.dto';
import { Like } from '../../../likes/schemas/like.schema';
import { ViewPostDto } from '../../models/output/view-post.dto';
import { PostsQueryRepository } from '../../interfaces/posts.query-repository';

@Injectable()
export class PostsMongoQueryRepository extends PostsQueryRepository {
  constructor(
    @InjectModel(PostMongoEntity.name) private postModel: Model<PostDocument>,
    public likesRepository: LikesRepository,
  ) {
    super();
  }

  async findOne(postId: string, currentUserId: string = null): Promise<ViewPostDto | null> {
    const post = await this.postModel.findOne({ id: postId, isBanned: false });
    if (!post) return null;

    const lastLikes: Like[] | null = await this.likesRepository.getLastLikesInfo(postId, LikeLocation.Post, 3);
    const likesDislikesCount: LikesDislikesCountDto = await this.likesRepository.getLikesAndDislikesCount(postId);
    const likeStatus: LikeStatusType = await this.likesRepository.getUserLikeStatus(
      currentUserId,
      postId,
      LikeLocation.Post,
    );

    return PostMapper.toView(
      post,
      likeStatus,
      likesDislikesCount.likesCount,
      likesDislikesCount.dislikesCount,
      lastLikes,
    );
  }

  async findAll(queryObj: QueryDto, currentUserId: string = null): Promise<PaginationDto<ViewPostDto>> {
    const skipValue: number = PaginationHelper.getSkipValue(queryObj.pageNumber, queryObj.pageSize);
    const sortValue: 1 | -1 = PaginationHelper.getSortValue(queryObj.sortDirection);
    const filters = { isBanned: false };

    const foundedPosts = await this.findPostByFilters(filters, queryObj, sortValue, skipValue);

    const postsViewModels: ViewPostDto[] = await Promise.all(
      foundedPosts.map(async (post) => {
        return this.findOne(post.id, currentUserId);
      }),
    );
    const totalCount: number = await this.postModel.countDocuments(filters);
    const pagesCount = PaginationHelper.getPagesCount(totalCount, queryObj.pageSize);

    return new PaginationDto<ViewPostDto>(
      pagesCount,
      Number(queryObj.pageNumber),
      Number(queryObj.pageSize),
      totalCount,
      postsViewModels,
    );
  }

  async findPostsOfBlog(
    blogId: string,
    queryObj: QueryDto,
    currentUserId: string = null,
  ): Promise<PaginationDto<ViewPostDto>> {
    const skipValue: number = PaginationHelper.getSkipValue(queryObj.pageNumber, queryObj.pageSize);
    const sortValue: 1 | -1 = PaginationHelper.getSortValue(queryObj.sortDirection);
    const filters = { blogId: blogId, isBanned: false }; // TODO make method for filters (in other classes also) Filters Fabric

    const foundedPosts = await this.findPostByFilters(filters, queryObj, sortValue, skipValue);

    const postsViewModels: any[] = await Promise.all(
      foundedPosts.map(async (post: PostMongoEntity) => {
        return this.findOne(post.id, currentUserId);
      }),
    );

    const totalCount: number = await this.postModel.countDocuments(filters);
    const pagesCount: number = PaginationHelper.getPagesCount(totalCount, queryObj.pageSize);

    return new PaginationDto<ViewPostDto>(
      pagesCount,
      Number(queryObj.pageNumber),
      Number(queryObj.pageSize),
      totalCount,
      postsViewModels,
    );
  }

  async findPostsOfBlogByUserId(
    blogId: string,
    queryObj: QueryDto,
    userId: string,
  ): Promise<PaginationDto<ViewPostDto>> {
    const skipValue: number = PaginationHelper.getSkipValue(queryObj.pageNumber, queryObj.pageSize);
    const sortValue: 1 | -1 = PaginationHelper.getSortValue(queryObj.sortDirection);
    const filters = { blogId, userId, isBanned: false };

    const foundedPosts = await this.findPostByFilters(filters, queryObj, sortValue, skipValue);

    const postsViewModels: any[] = await Promise.all(
      foundedPosts.map(async (post: any) => {
        return this.findOne(post.id, userId);
      }),
    );

    const totalCount: number = await this.postModel.countDocuments(filters);
    const pagesCount = PaginationHelper.getPagesCount(totalCount, queryObj.pageSize);

    return new PaginationDto<ViewPostDto>(
      pagesCount,
      Number(queryObj.pageNumber),
      Number(queryObj.pageSize),
      totalCount,
      postsViewModels,
    );
  }

  async findPostByFilters(filters, queryObj, sortValue, skipValue): Promise<PostMongoEntity[]> {
    return this.postModel
      .find(filters)
      .sort({ [queryObj.sortBy]: sortValue })
      .skip(skipValue)
      .limit(queryObj.pageSize)
      .lean();
  }
}
