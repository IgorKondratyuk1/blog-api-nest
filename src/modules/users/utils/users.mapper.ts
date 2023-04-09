import ViewUserDto from '../dto/view-user.dto';
import { User, UserDocument } from '../schemas/user.schema';
import { ViewMeDto } from '../dto/view-me.dto';
import { ViewBanInfoDto } from '../dto/view-ban-info.dto';
import { BanInfo } from '../schemas/ban-info.schema';

export class UsersMapper {
  public static toView(user: User | UserDocument): ViewUserDto {
    const banInfo = UsersMapper.banView(user.banInfo);

    return new ViewUserDto(
      user.id,
      user.accountData.login,
      user.accountData.email,
      user.accountData.createdAt,
      banInfo,
    );
  }

  public static toMeView(user: User | UserDocument): ViewMeDto {
    return new ViewMeDto(user.id, user.accountData.login, user.accountData.email);
  }

  public static banView(banInfo: BanInfo): ViewBanInfoDto {
    return new ViewBanInfoDto(banInfo.isBanned, banInfo.banReason, banInfo.banDate);
  }
}
