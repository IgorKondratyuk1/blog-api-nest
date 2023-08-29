import { IsOptional, IsString } from 'class-validator';
import { QueryDto } from '../../../../common/dto/query.dto';

export class QueryBannedUserDto extends QueryDto {
  @IsOptional()
  @IsString()
  searchLoginTerm = '';
}
