import { Injectable } from '@nestjs/common';
import { PostsRepository } from '../../interfaces/posts.repository';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { PostEntity } from '../../entities/post.entity';
import { PostMapper } from '../../utils/postMapper';
import { DbPost } from './types/post';

@Injectable()
export class PostsPgRepository extends PostsRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {
    super();
  }

  async save(post: PostEntity): Promise<boolean> {
    try {
      const updatePostQuery =
        'UPDATE public."post" SET title=$1, short_description=$2, content=$3, blog_id=$4, user_id=$5, created_at=$6, is_banned=$7 WHERE id=$8;';
      const resultUpdatePostQuery = await this.dataSource.query(updatePostQuery, [
        post.title,
        post.shortDescription,
        post.content,
        post.blogId,
        post.userId,
        post.createdAt,
        post.isBanned,
        post.id,
      ]);

      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  async create(post: PostEntity): Promise<PostEntity | null> {
    try {
      const createPostQuery = `INSERT INTO public."post"(id, title, short_description, content, blog_id, user_id, created_at, is_banned) VALUES ($1, $2, $3, $4, $5, $6, $7, $8);`;
      await this.dataSource.query(createPostQuery, [
        post.id,
        post.title,
        post.shortDescription,
        post.content,
        post.blogId,
        post.userId,
        post.createdAt,
        post.isBanned,
      ]);

      return post;
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  async findById(id: string): Promise<PostEntity | null> {
    try {
      const findBlogQuery =
        'SELECT pt.title as "title", pt.short_description as "shortDescription", pt.content as "content", ' +
        'pt.blog_id as "blogId", pt.user_id as "userId", pt.id as "id", pt.created_at as "createdAt", pt.is_banned as "isBanned", ' +
        'bt.name as "blogName" ' +
        'FROM public."post" pt ' +
        'LEFT JOIN public.blog bt ON pt.blog_id = bt.id ' +
        'WHERE pt.id = $1;';

      const result: DbPost[] = await this.dataSource.query(findBlogQuery, [id]);
      if (result.length === 0) return null;

      const dbPost = result[0];
      console.log('dbPost: \n' + dbPost);

      return PostMapper.toDomainFromPlainSql(dbPost);
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  async findByUserId(userId: string): Promise<PostEntity[]> {
    try {
      const findPostQuery =
        'SELECT pt.title as "title", pt.short_description as "shortDescription", pt.content as "content", ' +
        'pt.blog_id as "blogId", pt.user_id as "userId", pt.id as "id", pt.created_at as "createdAt", pt.is_banned as "isBanned", ' +
        'bt.name as "blogName" ' +
        'FROM public."post" pt ' +
        'LEFT JOIN public.blog bt ON pt.blog_id = bt.id ' +
        'WHERE pt.user_id = $1;';

      const results: DbPost[] = await this.dataSource.query(findPostQuery, [userId]);
      return results.map(PostMapper.toDomainFromPlainSql);
    } catch (e) {
      console.log(e);
      return [];
    }
  }

  async setBanStatusByUserId(userId: string, isBanned: boolean): Promise<boolean> {
    try {
      const updatePostQuery = 'UPDATE public."post" SET is_banned=$1 WHERE user_id=$2;';
      const resultUpdatePostQuery = await this.dataSource.query(updatePostQuery, [isBanned, userId]);

      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  async setBanStatusByBlogId(blogId: string, isBanned: boolean): Promise<boolean> {
    try {
      const updatePostQuery = 'UPDATE public."post" SET is_banned=$1 WHERE blog_id=$2;';
      const resultUpdatePostQuery = await this.dataSource.query(updatePostQuery, [isBanned, blogId]);

      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  async remove(id: string): Promise<boolean> {
    try {
      const post: PostEntity = await this.findById(id);
      if (!post) return false;

      const deletePostResult = await this.dataSource.query('DELETE FROM public."post" pt WHERE pt.id = $1;', [post.id]);
      console.log(deletePostResult);
      return deletePostResult[1] === 1;
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  async removeAll(): Promise<boolean> {
    try {
      const deleteBlogResult = await this.dataSource.query('DELETE FROM public."post";');
      //console.log(deleteBlogResult);

      return true; // TODO result[1] >= 0;
    } catch (e) {
      console.log(e);
      return false;
    }
  }
}
