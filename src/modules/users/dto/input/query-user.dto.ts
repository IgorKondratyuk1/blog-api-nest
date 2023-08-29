import { IsOptional, IsString } from 'class-validator';
import { QueryDto } from '../../../../common/dto/query.dto';

export class QueryUserDto extends QueryDto {
  @IsOptional()
  @IsString()
  searchLoginTerm = '';

  @IsOptional()
  @IsString()
  searchEmailTerm = '';

  @IsOptional()
  @IsString()
  banStatus: 'all' | 'banned' | 'notBanned' = 'all';
}
