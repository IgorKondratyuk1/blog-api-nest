import { Injectable } from '@nestjs/common';
import { LikeLocation, LikeStatus, LikeStatusType } from '../likes/types/like';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument } from './schemas/post.schema';
import { Model } from 'mongoose';
import { PostsMapper } from './utils/posts.mapper';
import { QueryDto } from '../../../../common/dto/query.dto';
import { Paginator } from '../../../../common/utils/paginator';
import { PaginationDto } from '../../../../common/dto/pagination';
import { ViewPostDto } from './dto/view-post.dto';
import { LikesRepository } from '../likes/likes.repository';
import { LikesDislikesCountDto } from '../likes/dto/likes-dislikes-count.dto';
import { Like } from '../likes/schemas/like.schema';

@Injectable()
export class PostsQueryRepository {
  constructor(
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    public likesRepository: LikesRepository,
  ) {}

  async findById(postId: string, currentUserId: string = null): Promise<ViewPostDto | null> {
    const post = await this.postModel.findOne({ id: postId, isBanned: false });
    if (!post) return null;

    const lastLikes: Like[] | null = await this.likesRepository.getLastLikesInfo(postId, LikeLocation.Post, 3);
    const likesDislikesCount: LikesDislikesCountDto = await this.likesRepository.getLikesAndDislikesCount(postId);
    const likeStatus: LikeStatusType = await this.likesRepository.getUserLikeStatus(
      currentUserId,
      postId,
      LikeLocation.Post,
    );

    return PostsMapper.toView(
      post,
      likeStatus,
      likesDislikesCount.likesCount,
      likesDislikesCount.dislikesCount,
      lastLikes,
    );
  }

  async findAll(queryObj: QueryDto, currentUserId: string = null): Promise<PaginationDto<ViewPostDto>> {
    const skipValue: number = Paginator.getSkipValue(queryObj.pageNumber, queryObj.pageSize);
    const sortValue: 1 | -1 = Paginator.getSortValue(queryObj.sortDirection);

    const foundedPosts: Post[] = await this.postModel
      .find({ isBanned: false })
      .sort({ [queryObj.sortBy]: sortValue })
      .skip(skipValue)
      .limit(queryObj.pageSize)
      .lean();

    const postsViewModels: ViewPostDto[] = await Promise.all(
      foundedPosts.map(async (post) => {
        return this.findById(post.id, currentUserId);
      }),
    );
    const totalCount: number = await this.postModel.countDocuments();
    const pagesCount = Paginator.getPagesCount(totalCount, queryObj.pageSize);

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
    const skipValue: number = Paginator.getSkipValue(queryObj.pageNumber, queryObj.pageSize);
    const sortValue: 1 | -1 = Paginator.getSortValue(queryObj.sortDirection);

    const foundedPosts: Post[] = await this.postModel
      .find({ blogId: blogId, isBanned: false })
      .sort({ [queryObj.sortBy]: sortValue })
      .skip(skipValue)
      .limit(queryObj.pageSize)
      .lean();

    const postsViewModels: any[] = await Promise.all(
      foundedPosts.map(async (post: any) => {
        return this.findById(post.id, currentUserId);
      }),
    );

    const totalCount: number = await this.postModel.countDocuments({
      blogId: blogId,
    });
    const pagesCount = Paginator.getPagesCount(totalCount, queryObj.pageSize);

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
    const skipValue: number = Paginator.getSkipValue(queryObj.pageNumber, queryObj.pageSize);
    const sortValue: 1 | -1 = Paginator.getSortValue(queryObj.sortDirection);

    const foundedPosts: Post[] = await this.postModel
      .find({ blogId, userId, isBanned: false })
      .sort({ [queryObj.sortBy]: sortValue })
      .skip(skipValue)
      .limit(queryObj.pageSize)
      .lean();

    const postsViewModels: any[] = await Promise.all(
      foundedPosts.map(async (post: any) => {
        return this.findById(post.id, userId);
      }),
    );

    const totalCount: number = await this.postModel.countDocuments({
      blogId: blogId,
    });
    const pagesCount = Paginator.getPagesCount(totalCount, queryObj.pageSize);

    return new PaginationDto<ViewPostDto>(
      pagesCount,
      Number(queryObj.pageNumber),
      Number(queryObj.pageSize),
      totalCount,
      postsViewModels,
    );
  }
}
