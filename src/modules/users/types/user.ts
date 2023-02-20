export type QueryUserModel = {
  searchLoginTerm?: string;
  searchEmailTerm?: string;
  pageNumber?: string;
  pageSize?: string;
  sortBy?: string;
  sortDirection?: string;
};

export type UserFilterType = {
  searchLoginTerm: string | null;
  searchEmailTerm: string | null;
  pageNumber: number;
  pageSize: number;
  sortBy: string;
  sortDirection: 'asc' | 'desc';
};
