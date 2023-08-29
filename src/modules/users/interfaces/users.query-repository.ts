import ViewUserDto from '../dto/output/view-user.dto';
import { QueryUserDto } from '../dto/input/query-user.dto';
import { PaginationDto } from '../../../common/dto/pagination';

export abstract class UsersQueryRepository {
  public abstract findAll(queryObj: QueryUserDto): Promise<PaginationDto<ViewUserDto>>;
}
