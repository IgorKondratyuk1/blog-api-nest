import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { CommentsRepository } from './comments.repository';
import { PostDocument } from '../posts/schemas/post.schema';
import { PostsRepository } from '../posts/posts.repository';
import { UsersRepository } from '../../../users/users.repository';
import { UserDocument } from '../../../users/schemas/user.schema';
import { CommentDocument } from './schemas/comment.schema';

@Injectable()
export class CommentsService {
  constructor(
    private commentsRepository: CommentsRepository,
    private postsRepository: PostsRepository,
    private usersRepository: UsersRepository,
  ) {}

  async create(createCommentDto: CreateCommentDto, postId: string, userId: string) {
    if (!postId) throw new BadRequestException('Wrong blogId');
    if (!userId) throw new BadRequestException('Wrong userId');

    const post: PostDocument | null = await this.postsRepository.findOne(postId);
    if (!post) throw new NotFoundException('Post is not found');

    const user: UserDocument | null = await this.usersRepository.findOne(userId);
    if (!user) throw new NotFoundException('User is not found');

    return this.commentsRepository.create(
      createCommentDto,
      user.id,
      user.accountData.login,
      post.id,
    );
  }

  async findOne(id: string): Promise<CommentDocument | null> {
    return this.commentsRepository.findOne(id);
  }

  async update(id: string, updateCommentDto: UpdateCommentDto): Promise<boolean> {
    const comment = await this.commentsRepository.findOne(id);
    if (!comment) return false;

    comment.updateComment(updateCommentDto);
    const result: boolean = await this.commentsRepository.save(comment);
    return result;
  }

  async remove(id: string) {
    return this.commentsRepository.remove(id);
  }
}
