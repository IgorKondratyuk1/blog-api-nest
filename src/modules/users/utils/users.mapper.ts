import ViewUserDto from '../dto/view-user.dto';
import { User, UserDocument } from '../schemas/user.schema';

export class UsersMapper {
  public static toView(user: User | UserDocument) {
    return new ViewUserDto(
      user.id,
      user.accountData.login,
      user.accountData.email,
      user.accountData.createdAt,
    );
  }
}
