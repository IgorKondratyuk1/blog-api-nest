import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateCommentDto {
  @IsString()
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty()
  @MinLength(20)
  @MaxLength(300)
  content: string;
}
