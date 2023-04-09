import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../users/users.repository';
import { BlogDocument } from '../../blog-composition/modules/blogs/schemas/blog.schema';
import { CustomErrorDto } from '../../../common/dto/error';
import { HttpStatus } from '@nestjs/common';
import { BlogsRepository } from '../../blog-composition/modules/blogs/blogs.repository';
import { UserDocument } from '../../users/schemas/user.schema';

export class BindBlogWithUserCommand {
  constructor(public userId: string, public blogId: string) {}
}

@CommandHandler(BindBlogWithUserCommand)
export class BindBlogWithUserUseCase implements ICommandHandler<BindBlogWithUserCommand> {
  constructor(private usersRepository: UsersRepository, private blogsRepository: BlogsRepository) {}

  async execute(command: BindBlogWithUserCommand): Promise<boolean | CustomErrorDto> {
    const blog: BlogDocument | null = await this.blogsRepository.findOne(command.blogId);

    if (!blog) return new CustomErrorDto(HttpStatus.BAD_REQUEST, 'wrong blogId');
    if (blog.userId) return new CustomErrorDto(HttpStatus.BAD_REQUEST, 'blog is already bounded');

    const user: UserDocument | null = await this.usersRepository.findById(command.userId);
    if (!user) return new CustomErrorDto(HttpStatus.BAD_REQUEST, 'wrong userId');

    return true;
  }
}
