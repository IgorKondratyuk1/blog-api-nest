export class CreateSecurityDeviceDto {
  constructor(public userId: string, public ip: string, public title: string) {}
}
