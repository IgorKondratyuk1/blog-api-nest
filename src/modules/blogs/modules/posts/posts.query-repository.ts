import { Injectable, NotFoundException } from '@nestjs/common';
import { ExtendedLikesInfo, LikeLocation, LikeStatus, LikeStatusType } from '../likes/types/like';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument } from './schemas/post.schema';
import { Model } from 'mongoose';
import { PostsMapper } from './utils/posts.mapper';
import { FilterType, Paginator, QueryType } from '../../../../common/types/pagination';
import { Pagination } from '../../../../common/utils/pagination';

@Injectable()
export class PostsQueryRepository {
  constructor(@InjectModel(Post.name) private postModel: Model<PostDocument>) {}

  async findOne(postId: string, userId: string = null) {
    const lastLikes = null; //await this.likesRepository.getLastLikesInfo(postId, LikeLocation.Post, 3);
    const post = await this.postModel.findOne({ id: postId });
    if (!post) return null;

    const extendedLikesInfo = new ExtendedLikesInfo();
    return PostsMapper.toLimitedView(post); // mapPostTypeToPostViewModel(post, likeStatus, lastLikes);
  }

  async findAll(queryObj: QueryType, currentUserId: string = null) {
    const filters: FilterType = Pagination.getFilters(queryObj);
    const skipValue: number = Pagination.getSkipValue(filters.pageNumber, filters.pageSize);
    const sortValue: 1 | -1 = Pagination.getSortValue(filters.sortDirection);

    const foundedPosts = await this.postModel
      .find({})
      .sort({ [filters.sortBy]: sortValue })
      .skip(skipValue)
      .limit(filters.pageSize)
      .lean();

    const postsViewModels = await Promise.all(
      foundedPosts.map(async (post) => {
        const likeStatus: LikeStatusType = LikeStatus.None;
        //   await Like.getUserLikeStatus(
        //   currentUserId,
        //   post.id,
        //   LikeLocation.Post,
        // );

        const lastLikes: any | null = [];
        // await this.likesRepository.getLastLikesInfo(
        //   post.id,
        //   LikeLocation.Post,
        //   3,
        // );

        const extendedLikesInfo: ExtendedLikesInfo = new ExtendedLikesInfo();
        return PostsMapper.toLimitedView(post);
      }),
    );
    const totalCount: number = await this.postModel.countDocuments();
    const pagesCount = Pagination.getPagesCount(totalCount, filters.pageSize);

    return {
      pagesCount: pagesCount,
      page: filters.pageNumber,
      pageSize: filters.pageSize,
      totalCount: totalCount,
      items: postsViewModels,
    };
  }

  async findPostsOfBlog(
    blogId: string,
    queryObj: QueryType,
    currentUserId: string = null,
  ): Promise<Paginator<any>> {
    const filters: FilterType = Pagination.getFilters(queryObj);
    const skipValue: number = Pagination.getSkipValue(filters.pageNumber, filters.pageSize);
    const sortValue: 1 | -1 = Pagination.getSortValue(filters.sortDirection);

    const foundedPosts: any[] = await this.postModel
      .find({ blogId: blogId })
      .sort({ [filters.sortBy]: sortValue })
      .skip(skipValue)
      .limit(filters.pageSize)
      .lean();

    const postsViewModels: any[] = await Promise.all(
      foundedPosts.map(async (post: any) => {
        const likeStatus: LikeStatusType = LikeStatus.None;
        //   await Like.getUserLikeStatus(
        //   currentUserId,
        //   post.id,
        //   LikeLocation.Post,
        // );
        const lastLikes: any[] | null = [];
        // await this.likesRepository.getLastLikesInfo(
        //   post.id,
        //   LikeLocation.Post,
        //   3,
        // );

        const extendedLikesInfo: ExtendedLikesInfo = new ExtendedLikesInfo();

        return PostsMapper.toLimitedView(post);
      }),
    );

    const totalCount: number = await this.postModel.countDocuments({
      blogId: blogId,
    });
    const pagesCount = Pagination.getPagesCount(totalCount, filters.pageSize);

    return {
      pagesCount: pagesCount,
      page: filters.pageNumber,
      pageSize: filters.pageSize,
      totalCount: totalCount,
      items: postsViewModels,
    };
  }
}
