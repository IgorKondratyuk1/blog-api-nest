// Ban Info Schema (in postgresql sa_user_ban)

export default class SaUserBanInfo {
  constructor(public isBanned: boolean, public banDate: Date | null, public banReason: string | null) {}
}
