import { IsOptional } from 'class-validator';

// TODO add @IsString, @IsNumber. Query params are always string!
export class QueryDto {
  @IsOptional()
  searchNameTerm = '';

  @IsOptional()
  pageNumber = 1;

  @IsOptional()
  pageSize = 10;

  @IsOptional()
  sortBy = 'createdAt';

  @IsOptional()
  sortDirection: 'asc' | 'desc' = 'desc';
}
