export type dbSecurityDevice = {
  id: string;
  deviceId: string;
  createdAt: Date;
  userId: string;
  ip: string;
  title: string;
  isValid: boolean;
  lastActiveDate: Date;
};
