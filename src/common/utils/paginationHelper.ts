export class PaginationHelper {
  public static getSkipValue(pageNumber: number, pageSize: number) {
    return (pageNumber - 1) * pageSize;
  }

  public static getSortValue(sortDirection: string) {
    return sortDirection === 'asc' ? 1 : -1;
  }

  public static getPagesCount(totalCount: number, pageSize: number) {
    return Math.ceil(totalCount / pageSize);
  }
}
