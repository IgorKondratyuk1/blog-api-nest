import { IsNotEmpty, IsString, IsUrl, MaxLength, MinLength } from 'class-validator';

export class CreateBlogDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  @MaxLength(15)
  public name: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  @IsUrl()
  public websiteUrl: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  public description: string;
}
