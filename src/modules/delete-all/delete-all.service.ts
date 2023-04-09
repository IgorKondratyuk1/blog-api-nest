import { Injectable } from '@nestjs/common';
import { PostsRepository } from '../blog-composition/modules/posts/posts.repository';
import { BlogsRepository } from '../blog-composition/modules/blogs/blogs.repository';
import { UsersRepository } from '../users/users.repository';
import { CommentsRepository } from '../blog-composition/modules/comments/comments.repository';

@Injectable()
export class DeleteAllService {
  constructor(
    private postsRepository: PostsRepository,
    private blogsRepository: BlogsRepository,
    private commentsRepository: CommentsRepository,
    private usersRepository: UsersRepository,
  ) {}

  async removeAll() {
    await this.blogsRepository.removeAll();
    await this.postsRepository.removeAll();
    await this.commentsRepository.removeAll();
    await this.usersRepository.removeAll();
    return true;
  }
}
