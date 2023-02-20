import { IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreatePostDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  @MaxLength(30)
  title: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  shortDescription: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  @MaxLength(1000)
  content: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  blogId?: string;
}
