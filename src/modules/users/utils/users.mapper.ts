import ViewUserDto from '../dto/view-user.dto';
import { User, UserDocument } from '../schemas/user.schema';
import { ViewMeDto } from '../dto/view-me.dto';

export class UsersMapper {
  public static toView(user: User | UserDocument): ViewUserDto {
    return new ViewUserDto(
      user.id,
      user.accountData.login,
      user.accountData.email,
      user.accountData.createdAt,
    );
  }

  public static toMeView(user: User | UserDocument): ViewMeDto {
    return new ViewMeDto(user.id, user.accountData.login, user.accountData.email);
  }
}
