import { IsBoolean, IsNotEmpty } from 'class-validator';

export class BanBlogDto {
  @IsNotEmpty()
  @IsBoolean()
  isBanned: boolean;
}
