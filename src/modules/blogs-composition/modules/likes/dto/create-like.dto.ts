import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { LikeStatus, LikeStatusType } from '../types/like';

export class CreateLikeDto {
  @IsNotEmpty()
  @IsString()
  @IsEnum(LikeStatus)
  likeStatus: LikeStatusType;
}
