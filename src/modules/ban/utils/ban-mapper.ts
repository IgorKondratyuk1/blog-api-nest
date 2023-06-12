import { ViewBanInfoDto } from '../dto/output/view-ban-info.dto';
import { ViewBanExtendedInfoDto } from '../dto/output/view-ban-extended-info.dto';

export class BanMapper {
  public static toBanExtendedInfoView(
    isBanned: boolean,
    banReason: string,
    banDate: Date | null,
  ): ViewBanExtendedInfoDto {
    return new ViewBanExtendedInfoDto(isBanned, banReason, banDate);
  }

  public static toBanInfoView(isBanned: boolean, banDate: Date | null): ViewBanInfoDto {
    return new ViewBanInfoDto(isBanned, banDate);
  }
}
