// import { FilterType, QueryType } from '../../common/dto/pagination';
// import { QueryUserModel, UserFilterType } from '../dto/user';
//
// export class UsersPagination {
//   public static getFilters(query: QueryType) {
//     const filters: FilterType = {
//       searchNameTerm: query.searchNameTerm || null,
//       pageNumber: query.pageNumber ? +query.pageNumber : 1,
//       pageSize: query.pageSize ? +query.pageSize : 10,
//       sortBy: query.sortBy || 'createdAt',
//       sortDirection: query.sortDirection === 'asc' ? 'asc' : 'desc',
//     };
//
//     return filters;
//   }
//
//   public static getUserFilters(query: QueryUserModel) {
//     const filters: UserFilterType = {
//       searchEmailTerm: query.searchEmailTerm || null,
//       searchLoginTerm: query.searchLoginTerm || null,
//       pageNumber: query.pageNumber ? +query.pageNumber : 1,
//       pageSize: query.pageSize ? +query.pageSize : 10,
//       sortBy: query.sortBy || 'createdAt',
//       sortDirection: query.sortDirection === 'asc' ? 'asc' : 'desc',
//     };
//
//     return filters;
//   }
//
//   public static getSkipValue(pageNumber: number, pageSize: number) {
//     return (pageNumber - 1) * pageSize;
//   }
//
//   public static getSortValue(sortDirection: string) {
//     return sortDirection === 'asc' ? 1 : -1;
//   }
//
//   public static getPagesCount(totalCount: number, pageSize: number) {
//     return Math.ceil(totalCount / pageSize);
//   }
// }
