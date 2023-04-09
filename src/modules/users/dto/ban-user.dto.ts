import { IsBoolean, IsNotEmpty, IsString, Length } from 'class-validator';

export class BanUserDto {
  @IsNotEmpty()
  @IsBoolean()
  isBanned: boolean;

  @IsNotEmpty()
  @IsString()
  @Length(20, 600)
  banReason: string;
}
