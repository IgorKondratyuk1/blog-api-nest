export class FilterDto {
  constructor(
    public searchNameTerm: string | null = null,
    public pageNumber: number,
    public pageSize: number,
    public sortBy: string,
    public sortDirection: 'asc' | 'desc' = 'asc',
  ) {}
}
