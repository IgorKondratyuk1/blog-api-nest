import { IsOptional } from 'class-validator';
import { QueryDto } from '../../../common/dto/query.dto';

export class QueryUserDto extends QueryDto {
  @IsOptional()
  searchLoginTerm = '';

  @IsOptional()
  searchEmailTerm = '';
}
