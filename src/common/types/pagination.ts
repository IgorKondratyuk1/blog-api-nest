export type QueryType = {
  searchNameTerm?: string;
  pageNumber?: string;
  pageSize?: string;
  sortBy?: string;
  sortDirection?: string;
};

export type Paginator<T> = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: Array<T>;
};

export type FilterType = {
  searchNameTerm?: string | null;
  pageNumber: number;
  pageSize: number;
  sortBy: string;
  sortDirection: 'asc' | 'desc';
};
