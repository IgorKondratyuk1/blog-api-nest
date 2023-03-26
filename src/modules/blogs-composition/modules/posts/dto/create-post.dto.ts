import { IsNotEmpty, IsOptional, IsString, MaxLength, MinLength, Validate } from 'class-validator';
import { Transform } from 'class-transformer';
import { UserExistsRule } from '../../../../users/validators/user-exists.validator';
import { BlogExistsRule } from '../../blogs/validators/blog-exists.validator';

export class CreatePostDto {
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value?.trim())
  @MinLength(1)
  @MaxLength(30)
  title: string;

  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value?.trim())
  @MinLength(1)
  @MaxLength(100)
  shortDescription: string;

  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value?.trim())
  @MinLength(1)
  @MaxLength(1000)
  content: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  @Validate(BlogExistsRule)
  blogId: string;
}
