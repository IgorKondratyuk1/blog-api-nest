import { Injectable } from '@nestjs/common';
import { BlogsRepository } from '../../interfaces/blogs.repository';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { BlogEntity } from '../../entities/blog.entity';
import { DbBlog } from './types/blog';
import { BlogMapper } from '../../utils/blogs.mapper';

@Injectable()
export class BlogsPgRepository extends BlogsRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {
    super();
  }

  async save(blog: BlogEntity): Promise<boolean> {
    try {
      const updateBlogQuery =
        'UPDATE public.blog SET name=$1, description=$2, website_url=$3, is_membership=$4, created_at=$5, user_id=$6 WHERE id=$7;';
      const resultUpdateBlogQuery = await this.dataSource.query(updateBlogQuery, [
        blog.name,
        blog.description,
        blog.websiteUrl,
        blog.isMembership,
        blog.createdAt,
        blog.userId,
        blog.id,
      ]);

      console.log('resultUpdateBlogQuery');
      console.log(resultUpdateBlogQuery);

      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  async create(blog: BlogEntity): Promise<BlogEntity | null> {
    try {
      const createBlogQuery = `INSERT INTO public.blog(name, description, website_url, is_membership, created_at, user_id, id) VALUES ($1, $2, $3, $4, $5, $6, $7);`;
      await this.dataSource.query(createBlogQuery, [
        blog.name,
        blog.description,
        blog.websiteUrl,
        blog.isMembership,
        blog.createdAt,
        blog.userId,
        blog.id,
      ]);

      return blog;
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  async findById(id: string): Promise<BlogEntity | null> {
    try {
      const findBlogQuery =
        'SELECT b.id as "id", b.name as "name", b.description as "description", b.website_url as "websiteUrl", ' +
        'b.is_membership as "isMembership", b.created_at as "createdAt", b.user_id as "userId", ' +
        'sb.ban_date as "banDate", sb.id as "banId" ' +
        'FROM public.blog b ' +
        'LEFT JOIN public."sa_blog_ban" sb ON b.id = sb.blog_id ' +
        'WHERE b.id = $1;';

      const result: DbBlog[] = await this.dataSource.query(findBlogQuery, [id]);
      if (result.length === 0) return null;

      const dbBlog = result[0];

      console.log('dbBlog');
      console.log(dbBlog);

      return BlogMapper.toDomainFromPlainSql(dbBlog);
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  async findByUserId(userId: string): Promise<BlogEntity[]> {
    try {
      const findBlogQuery =
        'SELECT b.id as "id", b.name as "name", b.description as "description", b.website_url as "websiteUrl", ' +
        'b.is_membership as "isMembership", b.created_at as "createdAt", b.user_id as "userId", ' +
        'sb.ban_date as "banDate", sb.id as "banId" ' +
        'FROM public.blog b ' +
        'LEFT JOIN public."sa_blog_ban" sb ON b.id = sb.blog_id ' +
        'WHERE b.user_id = $1;';

      const results: DbBlog[] = await this.dataSource.query(findBlogQuery, [userId]);
      return results.map(BlogMapper.toDomainFromPlainSql);
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  async remove(id: string): Promise<boolean> {
    try {
      const blog: BlogEntity = await this.findById(id);
      if (!blog) return false;

      const deleteBlogBanResult = await this.dataSource.query(
        'DELETE FROM public."sa_blog_ban" sb WHERE sb.blog_id = $1;',
        [blog.id],
      );
      const deleteBlogResult = await this.dataSource.query('DELETE FROM public."blog" b WHERE b.id = $1;', [blog.id]);
      console.log(deleteBlogResult);
      return deleteBlogResult[1] === 1;
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  async removeAll(): Promise<boolean> {
    try {
      const deleteBlogBanResult = await this.dataSource.query('DELETE FROM public."sa_blog_ban";');
      //console.log(deleteBlogBanResult);

      const deleteBlogResult = await this.dataSource.query('DELETE FROM public."blog";');
      //console.log(deleteBlogResult);

      return true; // TODO result[1] >= 0;
    } catch (e) {
      console.log(e);
      return false;
    }
  }
}
