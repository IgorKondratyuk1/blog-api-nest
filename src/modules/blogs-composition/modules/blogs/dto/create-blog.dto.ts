import { IsNotEmpty, IsString, IsUrl, MaxLength, MinLength } from 'class-validator';
import { Transform, TransformFnParams } from 'class-transformer';

export class CreateBlogDto {
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value?.trim())
  @MinLength(1)
  @MaxLength(15)
  public name: string;

  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value?.trim())
  @MinLength(1)
  @MaxLength(100)
  @IsUrl()
  public websiteUrl: string;

  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value?.trim())
  @MinLength(1)
  @MaxLength(500)
  public description: string;
}
