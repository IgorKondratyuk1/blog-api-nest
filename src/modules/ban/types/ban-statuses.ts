export enum BanStatuses {
  ALL = 'all',
  BANNED = 'banned',
  NOTBANNED = 'notBanned',
}

//export type BanStatusesType = keyof typeof BanStatuses;
export type BanStatusesType = 'all' | 'banned' | 'notBanned';
