import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { LikeStatus, LikeStatusType } from '../types/like';

export class UpdateLikeDto {
  @IsNotEmpty()
  @IsString()
  @IsEnum(LikeStatus)
  likeStatus: LikeStatusType;
}
