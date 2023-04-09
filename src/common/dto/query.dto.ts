import { IsInt, IsNumber, IsOptional, IsString } from 'class-validator';
import { Transform, Type } from 'class-transformer';

// TODO Question: Query params are always string!
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
