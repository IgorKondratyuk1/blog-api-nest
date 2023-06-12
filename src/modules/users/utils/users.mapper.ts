import ViewUserDto from '../dto/view-user.dto';
import { User, UserDocument } from '../schemas/user.schema';
import { ViewMeDto } from '../dto/view-me.dto';
import { BanMapper } from '../../ban/utils/ban-mapper';
import ViewUserInfoDto from '../dto/view-user-info.dto';
import { BloggerBanInfo } from '../../ban/schemas/blogger-ban-info.schema';

export class UsersMapper {
  public static toView(user: User | UserDocument): ViewUserDto {
    const banInfo = BanMapper.toBanExtendedInfoView(
      user.banInfo.isBanned,
      user.banInfo.banReason,
      user.banInfo.banDate,
    );

    return new ViewUserDto(
      user.id,
      user.accountData.login,
      user.accountData.email,
      user.accountData.createdAt,
      banInfo,
    );
  }

  public static toViewInfo(bloggerBanInfo: BloggerBanInfo, isBanned: boolean): ViewUserInfoDto {
    const banInfo = BanMapper.toBanExtendedInfoView(isBanned, bloggerBanInfo.banReason, bloggerBanInfo.createdAt);

    return new ViewUserInfoDto(bloggerBanInfo.userId, bloggerBanInfo.userLogin, banInfo);
  }

  public static toMeView(user: User | UserDocument): ViewMeDto {
    return new ViewMeDto(user.id, user.accountData.login, user.accountData.email);
  }
}
