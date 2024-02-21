import { Injectable } from '@nestjs/common';
import { CommentsRepository } from '../blog-composition/modules/comments/comments.repository';
import { UsersRepository } from '../users/interfaces/users.repository';
import { PostsRepository } from '../blog-composition/modules/posts/interfaces/posts.repository';
import { BlogsRepository } from '../blog-composition/modules/blogs/interfaces/blogs.repository';

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
    // TODO add ban service, likes, devices
    return true;
  }
}
