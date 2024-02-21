import { CreatePostDto } from './create-post.dto';
import { IsNotEmpty, IsString, MaxLength, MinLength, Validate } from 'class-validator';
import { Transform } from 'class-transformer';
import { BlogExistsRule } from '../../../blogs/validators/blog-exists.validator';

export class UpdatePostDto {
  @IsString()
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(30)
  title: string;

  @IsString()
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(100)
  shortDescription: string;

  @IsString()
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(1000)
  content: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(100)
  @Validate(BlogExistsRule)
  blogId: string;
}
