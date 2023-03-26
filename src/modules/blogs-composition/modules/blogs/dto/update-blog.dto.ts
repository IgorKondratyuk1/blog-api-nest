import { IsNotEmpty, IsString, IsUrl, MaxLength, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateBlogDto {
  @IsString()
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(15)
  public name: string;

  @IsString()
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(100)
  @IsUrl()
  public websiteUrl: string;

  @IsString()
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(500)
  public description: string;
}
