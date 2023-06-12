import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { Injectable, NotFoundException } from '@nestjs/common';
import { BlogsRepository } from '../blogs.repository';

@ValidatorConstraint({ name: 'BlogExists', async: true })
@Injectable()
export class BlogExistsRule implements ValidatorConstraintInterface {
  constructor(private readonly blogsRepository: BlogsRepository) {}

  async validate(value: string) {
    try {
      const blog = await this.blogsRepository.findById(value);
      if (!blog) return false;
    } catch (e) {
      console.log(e);
      return false;
    }

    return true;
  }

  defaultMessage(args: ValidationArguments) {
    return `Blog: "${args.value}" is not exist`;
  }
}
