import { IsInt, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryDto {
  @IsOptional()
  @IsString()
  searchNameTerm = '';

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  pageNumber = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  pageSize = 10;

  @IsOptional()
  @IsString()
  sortBy = 'createdAt';

  @IsOptional()
  @IsString()
  sortDirection: 'asc' | 'desc' = 'desc';
}
