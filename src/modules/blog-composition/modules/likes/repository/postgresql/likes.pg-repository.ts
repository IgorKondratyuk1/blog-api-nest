import { Injectable } from '@nestjs/common';
import { LikesRepository } from '../../interfaces/likes.repository';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { LikeEntity } from '../../entities/like.entity';
import { LikesMapper } from '../../utils/likes.mapper';
import { LikeLocation, LikeLocationsType, LikeStatus, LikeStatusType } from '../../types/like';
import { LikesDislikesCountDto } from '../../models/output/likes-dislikes-count.dto';
import { DbLike } from './types/like';

@Injectable()
export class LikesPgRepository extends LikesRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {
    super();
  }

  public async save(likeEntity: LikeEntity): Promise<boolean> {
    try {
      switch (likeEntity.locationName) {
        case LikeLocation.Comment:
          return await this.updateCommentLike(likeEntity);
        case LikeLocation.Post:
          return await this.updatePostLike(likeEntity);
        default:
          return false;
      }
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  private async updatePostLike(likeEntity: LikeEntity): Promise<boolean> {
    try {
      const updatePostLikeQuery =
        'UPDATE public.post_like SET status=$1, created_at=$2, post_id=$3, user_id=$4 WHERE id=$5;';
      const resultUpdatePostLikeQuery = await this.dataSource.query(updatePostLikeQuery, [
        likeEntity.myStatus,
        likeEntity.createdAt,
        likeEntity.locationId,
        likeEntity.userId,
        likeEntity.id,
      ]);

      console.log('resultUpdatePostLikeQuery.rowCount');
      console.log(resultUpdatePostLikeQuery.rowCount);
      console.log(resultUpdatePostLikeQuery);

      if (resultUpdatePostLikeQuery.rowCount > 0) return true;

      return false;
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  private async updateCommentLike(likeEntity: LikeEntity): Promise<boolean> {
    try {
      const updateCommentLikeQuery =
        'UPDATE public.comment_like SET status=$1, created_at=$2, comment_id=$3, user_id=$4 WHERE id=$5;';
      const resultUpdateCommentLikeQuery = await this.dataSource.query(updateCommentLikeQuery, [
        likeEntity.myStatus,
        likeEntity.createdAt,
        likeEntity.locationId,
        likeEntity.userId,
        likeEntity.id,
      ]);

      console.log('resultUpdateCommentLikeQuery.rowCount');
      console.log(resultUpdateCommentLikeQuery.rowCount);
      console.log(resultUpdateCommentLikeQuery);

      if (resultUpdateCommentLikeQuery.rowCount > 0) return true;

      return true;
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  public async create(likeEntity: LikeEntity): Promise<LikeEntity | null> {
    try {
      switch (likeEntity.locationName) {
        case LikeLocation.Comment:
          return await this.createCommentLike(likeEntity);
        case LikeLocation.Post:
          return await this.createPostLike(likeEntity);
        default:
          return null;
      }
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  private async createCommentLike(likeEntity: LikeEntity): Promise<LikeEntity | null> {
    try {
      const createCommentLikeQuery = `INSERT INTO public.comment_like(status, created_at, comment_id, user_id, id) VALUES ($1, $2, $3, $4, $5);`;
      await this.dataSource.query(createCommentLikeQuery, [
        likeEntity.myStatus,
        likeEntity.createdAt,
        likeEntity.locationId,
        likeEntity.userId,
        likeEntity.id,
      ]);

      return likeEntity;
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  private async createPostLike(likeEntity: LikeEntity): Promise<LikeEntity | null> {
    try {
      const createPostLikeQuery = `INSERT INTO public.post_like(status, created_at, post_id, user_id, id) VALUES ($1, $2, $3, $4, $5);`;
      await this.dataSource.query(createPostLikeQuery, [
        likeEntity.myStatus,
        likeEntity.createdAt,
        likeEntity.locationId,
        likeEntity.userId,
        likeEntity.id,
      ]);

      return likeEntity;
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  public async getUserLike(userId: string, locationId: string, locationName: string): Promise<LikeEntity | null> {
    switch (locationName) {
      case 'Comment':
        return await this.getCommentUserLike(userId, locationId);
      case 'Post':
        return await this.getPostUserLike(userId, locationId);
      default:
        return null;
    }
  }

  private async getCommentUserLike(userId: string, commentId: string): Promise<LikeEntity | null> {
    const selectCommentLikeQuery =
      'SELECT cl.status as "status", cl.created_at as "createdAt", cl.comment_id as "locationId", ' +
      'cl.user_id as "userId", cl.id as "id", acc.login "userLogin" ' +
      'FROM public.comment_like cl ' +
      'LEFT JOIN public."user" u ON u.id = cl.user_id ' +
      'LEFT JOIN public."account" acc ON acc.id = u.id ' +
      'WHERE cl.user_id = $1 AND cl.comment_id = $2;';

    const result: DbLike[] = await this.dataSource.query(selectCommentLikeQuery, [userId, commentId]);
    if (result.length === 0) return null;

    const dbLike = result[0];

    console.log('getCommentUserLike dbLike');
    console.log(dbLike);

    return LikesMapper.toDomainFromPlainSql(dbLike, LikeLocation.Comment);
  }

  private async getPostUserLike(userId: string, postId: string): Promise<LikeEntity | null> {
    const selectPostLikeQuery =
      'SELECT pl.status as "status", pl.created_at as "createdAt", pl.post_id as "locationId", ' +
      'pl.user_id as "userId", pl.id as "id", acc.login "userLogin" ' +
      'FROM public.post_like pl ' +
      'LEFT JOIN public."user" u ON u.id = pl.user_id ' +
      'LEFT JOIN public."account" acc ON acc.id = u.id ' +
      'WHERE pl.user_id = $1 AND pl.post_id = $2;';

    const result: DbLike[] = await this.dataSource.query(selectPostLikeQuery, [userId, postId]);
    if (result.length === 0) return null;

    const dbLike = result[0];

    console.log('getPostUserLike dbLike');
    console.log(dbLike);

    return LikesMapper.toDomainFromPlainSql(dbLike, LikeLocation.Comment);
  }

  public async getUserLikeStatus(
    userId: string,
    locationId: string,
    locationName: LikeLocationsType,
  ): Promise<LikeStatusType> {
    const foundedLike: LikeEntity | null = await this.getUserLike(userId, locationId, locationName);
    return foundedLike ? foundedLike.myStatus : LikeStatus.None;
  }

  public async getLikeOrDislikesCount(
    locationId: string,
    locationName: LikeLocationsType,
    likeStatus: LikeStatusType,
  ): Promise<number> {
    switch (locationName) {
      case 'Comment':
        return await this.getLikeOrDislikesCountOnComment(locationId, likeStatus);
      case 'Post':
        return await this.getLikeOrDislikesCountOnPost(locationId, likeStatus);
      default:
        return null;
    }
  }

  private async getLikeOrDislikesCountOnComment(commentId: string, likeStatus: LikeStatusType): Promise<number> {
    const selectLikesCount = 'SELECT count(*) FROM public.comment_like cl WHERE cl.comment_id = $1 AND cl.status = $2;';

    const result = await this.dataSource.query(selectLikesCount, [commentId, likeStatus]);
    if (result.length === 0) return 0;
    const count = parseInt(result[0].count, 10);

    console.log('getLikeOrDislikesCountOnComment count');
    console.log(count);

    return count;
  }

  private async getLikeOrDislikesCountOnPost(postId: string, likeStatus: LikeStatusType): Promise<number> {
    const selectLikesCount = 'SELECT count(*) FROM public.post_like pl WHERE pl.post_id = $1 AND pl.status = $2;';

    const result = await this.dataSource.query(selectLikesCount, [postId, likeStatus]);
    if (result.length === 0) return 0;
    const count = parseInt(result[0].count, 10);

    console.log('getLikeOrDislikesCountOnPost count');
    console.log(count);

    return count;
  }

  async getLikesAndDislikesCount(locationId: string, locationName: LikeLocationsType): Promise<LikesDislikesCountDto> {
    const likesCount: number = await this.getLikeOrDislikesCount(locationId, locationName, LikeStatus.Like);
    const dislikesCount: number = await this.getLikeOrDislikesCount(locationId, locationName, LikeStatus.Dislike);
    return new LikesDislikesCountDto(likesCount, dislikesCount);
  }

  async getLastLikesInfo(
    locationId: string,
    locationName: LikeLocationsType,
    limitCount: number,
  ): Promise<LikeEntity[]> {
    switch (locationName) {
      case LikeLocation.Comment:
        return await this.getLastCommentLikesInfo(locationId, limitCount);
      case LikeLocation.Post:
        return await this.getLastPostLikesInfo(locationId, limitCount);
      default:
        return [];
    }
  }

  async getLastCommentLikesInfo(locationId: string, limitCount: number): Promise<LikeEntity[]> {
    const selectLastCommentLikes =
      'SELECT cl.status as "status", cl.created_at as "createdAt", cl.comment_id as "locationId", ' +
      'cl.user_id as "userId", cl.id as "id", acc.login "userLogin" ' +
      'FROM public.comment_like cl ' +
      'LEFT JOIN public."user" u ON u.id = cl.user_id ' +
      'LEFT JOIN public."account" acc ON acc.id = u.account_id ' +
      'WHERE cl.status = $1 AND cl.comment_id = $2 ' +
      'ORDER BY cl.created_at DESC ' +
      'LIMIT $3;';

    const result: DbLike[] = await this.dataSource.query(selectLastCommentLikes, [
      LikeStatus.Like,
      locationId,
      limitCount,
    ]);
    if (result.length === 0) return [];

    console.log('selectLastCommentLikes result');
    console.log(result);

    return result.map((dbLike) => LikesMapper.toDomainFromPlainSql(dbLike, LikeLocation.Comment));
  }

  async getLastPostLikesInfo(locationId: string, limitCount: number): Promise<LikeEntity[]> {
    const selectLastCommentLikes =
      'SELECT pl.status as "status", pl.created_at as "createdAt", pl.post_id as "locationId", ' +
      'pl.user_id as "userId", pl.id as "id", acc.login "userLogin" ' +
      'FROM public.post_like pl ' +
      'LEFT JOIN public."user" u ON u.id = pl.user_id ' +
      'LEFT JOIN public."account" acc ON acc.id = u.account_id ' +
      'WHERE pl.status = $1 AND pl.post_id = $2 ' +
      'ORDER BY pl.created_at DESC ' +
      'LIMIT $3;';

    const result: DbLike[] = await this.dataSource.query(selectLastCommentLikes, [
      LikeStatus.Like,
      locationId,
      limitCount,
    ]);
    if (result.length === 0) return [];

    console.log('getLastPostLikesInfo result');
    console.log(result);

    return result.map((dbLike) => LikesMapper.toDomainFromPlainSql(dbLike, LikeLocation.Post));
  }

  async setBanStatusToUserLikes(userId: string, isBanned: boolean): Promise<boolean> {
    // TODO setBanStatusToUserLikes
    // try {
    //   await this.likeModel.updateMany({ userId }, { isBanned });
    //   return true;
    // } catch (e) {
    //   console.log(e);
    //   return false;
    // }
    return true;
  }

  async removeLike(locationId: string, locationName: string, userId: string): Promise<boolean> {
    try {
      let deleteQuery: string;

      switch (locationName) {
        case 'Comment':
          deleteQuery = 'DELETE FROM public.comment_like WHERE comment_id=$1 AND user_id=$2;';
          break;
        case 'Post':
          deleteQuery = 'DELETE FROM public.post_like WHERE post_id=$1 AND user_id=$2;';
          break;
        default:
          return false;
      }

      const deleteLikeResult = await this.dataSource.query(deleteQuery, [locationId, userId]);
      console.log(deleteLikeResult);
      return deleteLikeResult[1] === 1;
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  async removeLikesByLocation(locationId: string, locationName: string): Promise<boolean> {
    try {
      let deleteQuery: string;

      switch (locationName) {
        case 'Comment':
          deleteQuery = 'DELETE FROM public.comment_like WHERE comment_id=$1;';
          break;
        case 'Post':
          deleteQuery = 'DELETE FROM public.post_like WHERE post_id=$1;';
          break;
        default:
          return false;
      }

      const deleteLikeResult = await this.dataSource.query(deleteQuery, [locationId]);
      console.log(deleteLikeResult);
      return deleteLikeResult[1] >= 0;
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  async removeAll(): Promise<boolean> {
    try {
      const deleteCommentsLikesResult = await this.dataSource.query('DELETE FROM public."comment_like";');
      //console.log(deleteBlogBanResult);

      const deletePostsLikesResult = await this.dataSource.query('DELETE FROM public."post_like";');
      //console.log(deleteBlogResult);

      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }
}
