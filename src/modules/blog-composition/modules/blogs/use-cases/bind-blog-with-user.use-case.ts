import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogDocument } from '../schemas/blog.schema';
import { CustomErrorDto } from '../../../../../common/dto/error';
import { HttpStatus } from '@nestjs/common';
import { BlogsRepository } from '../blogs.repository';
import UserModel from '../../../../users/models/user.model';
import { UsersRepository } from '../../../../users/interfaces/users.repository';

export class BindBlogWithUserCommand {
  constructor(public userId: string, public blogId: string) {}
}

@CommandHandler(BindBlogWithUserCommand)
export class BindBlogWithUserUseCase implements ICommandHandler<BindBlogWithUserCommand> {
  constructor(private usersRepository: UsersRepository, private blogsRepository: BlogsRepository) {}

  async execute(command: BindBlogWithUserCommand): Promise<boolean | CustomErrorDto> {
    const blog: BlogDocument | null = await this.blogsRepository.findById(command.blogId);

    if (!blog) return new CustomErrorDto(HttpStatus.BAD_REQUEST, 'wrong blogId');
    if (blog.userId) return new CustomErrorDto(HttpStatus.BAD_REQUEST, 'blog is already bounded');

    const user: UserModel | null = await this.usersRepository.findById(command.userId);
    if (!user) return new CustomErrorDto(HttpStatus.BAD_REQUEST, 'wrong userId');

    blog.setOwner(user.id);
    const saveResult: boolean = await this.blogsRepository.save(blog);

    return saveResult;
  }
}
