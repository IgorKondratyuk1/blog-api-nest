import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { BlogsRepository } from '../../modules/blogs/modules/blogs/blogs.repository';

@ValidatorConstraint({ name: 'BlogExists', async: true })
@Injectable()
export class BlogExistsRule implements ValidatorConstraintInterface {
  constructor(private readonly blogsRepository: BlogsRepository) {}

  async validate(value: string) {
    try {
      const blog = await this.blogsRepository.findOne(value);
      if (!blog) return false;
    } catch (error) {
      console.log(error);
      return false;
    }

    return true;
  }

  defaultMessage(args: ValidationArguments) {
    return `Blog: "${args.value}" is not exist`;
  }
}
