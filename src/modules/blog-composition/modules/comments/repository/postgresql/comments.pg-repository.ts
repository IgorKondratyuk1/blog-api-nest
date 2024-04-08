import { Injectable } from '@nestjs/common';
import { CommentEntity } from '../../entities/comment.entity';
import { CommentsRepository } from '../../interfaces/comments.repository';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { DbComment } from './types/comment';
import { CommentsMapper } from '../../utils/comments.mapper';

@Injectable()
export class CommentsPgRepository extends CommentsRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {
    super();
  }

  async save(commentEntity: CommentEntity): Promise<boolean> {
    try {
      const updateCommentQuery =
        'UPDATE public.comment SET content=$1, post_id=$2, user_id=$3, is_banned=$4 WHERE id=$5';
      const resultUpdateCommentQuery = await this.dataSource.query(updateCommentQuery, [
        commentEntity.content,
        commentEntity.postId,
        commentEntity.commentatorInfo.userId,
        commentEntity.isBanned,
        commentEntity.id,
      ]);

      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  async create(commentEntity: CommentEntity): Promise<CommentEntity | null> {
    try {
      const createCommentQuery = `INSERT INTO public.comment(created_at, content, post_id, user_id, is_banned, id) VALUES ($1, $2, $3, $4, $5, $6);`;
      await this.dataSource.query(createCommentQuery, [
        commentEntity.createdAt,
        commentEntity.content,
        commentEntity.postId,
        commentEntity.commentatorInfo.userId,
        commentEntity.isBanned,
        commentEntity.id,
      ]);

      return commentEntity;
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  async findById(id: string): Promise<CommentEntity | null> {
    try {
      const findCommentQuery =
        'SELECT ct.created_at as "createdAt", ct.content as "content", ct.post_id as "postId", pt.blog_id as "blogId", ' +
        'ct.user_id as "userId", acc.login as "userLogin", ct.id as "id", ct.is_banned as "isBanned" ' +
        'FROM public.comment ct ' +
        'LEFT JOIN public."user" u ON u.id = ct.user_id ' +
        'LEFT JOIN public."account" acc ON acc.id = u.id ' +
        'LEFT JOIN public."post" pt ON pt.id = ct.post_id ' +
        'WHERE ct.id = $1;';

      const result: DbComment[] = await this.dataSource.query(findCommentQuery, [id]);
      if (result.length === 0) return null;

      const dbComment: DbComment = result[0];

      console.log('findComment');
      console.log(dbComment);

      return CommentsMapper.toDomainFromPlainSql(dbComment);
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  async setBanStatusToUserComments(userId: string, isBanned: boolean) {
    try {
      const updateCommentQuery = 'UPDATE public.comment SET is_banned=$1 WHERE user_id=$2;';
      const resultUpdateCommentQuery = await this.dataSource.query(updateCommentQuery, [isBanned, userId]);

      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  async remove(id: string): Promise<boolean> {
    try {
      const deleteCommentResult = await this.dataSource.query('DELETE FROM public.comment WHERE id=$1;', [id]);
      console.log(deleteCommentResult);
      return deleteCommentResult[1] === 1;
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  async removeAll() {
    try {
      const deleteCommentsResult = await this.dataSource.query('DELETE FROM public.comment;');
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }
}
