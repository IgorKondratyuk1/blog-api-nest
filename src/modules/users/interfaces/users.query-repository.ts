import ViewUserDto from '../models/output/view-user.dto';
import { QueryUserDto } from '../models/input/query-user.dto';
import { PaginationDto } from '../../../common/dto/pagination';

export abstract class UsersQueryRepository {
  public abstract findAll(queryObj: QueryUserDto): Promise<PaginationDto<ViewUserDto>>;
}
