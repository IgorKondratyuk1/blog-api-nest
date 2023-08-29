import { FilterDto } from '../../../../common/dto/filter.dto';

export class UserFilterDto extends FilterDto {
  public searchLoginTerm: string | null;
  public searchEmailTerm: string | null;

  constructor(pageNumber, pageSize, sortBy, sortDirection, searchLoginTerm, searchEmailTerm) {
    super(null, pageNumber, pageSize, sortBy, sortDirection);
    searchLoginTerm = null;
    searchEmailTerm = null;
  }
}
