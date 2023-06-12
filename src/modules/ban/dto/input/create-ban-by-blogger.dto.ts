import { IsBoolean, IsNotEmpty, IsString, Length, Validate, ValidateIf } from 'class-validator';
import { BlogExistsRule } from '../../../blog-composition/modules/blogs/validators/blog-exists.validator';

export class CreateBanByBloggerDto {
  @IsNotEmpty()
  @IsBoolean()
  public isBanned: boolean;

  // TODO make other bans with ValidateIf
  @ValidateIf((object) => object.isBanned === true)
  @IsNotEmpty()
  @IsString()
  @Length(20, 600)
  public banReason: string;

  @IsNotEmpty()
  @IsString()
  @Validate(BlogExistsRule)
  public blogId: string;
}
