import { HttpStatus, Injectable } from '@nestjs/common';
import { CustomErrorDto } from '../../common/dto/error';
import { EmailManagerService } from '../email/email-manager.service';
import { SecurityDevicesService } from '../security-devices/security-devices.service';
import { CreateSecurityDeviceDto } from '../security-devices/dto/create-security-device.dto';
import { ExtendedLoginDataDto } from './dto/extended-login-data-dto';
import { JwtService } from '@nestjs/jwt';
import { AuthTokensDto } from './dto/auth-tokens.dto';
import { RegistrationConfirmationDto } from './dto/registration-confirmation.dto';
import { RegistrationEmailResendDto } from './dto/registration-email-resend.dto';
import { PasswordRecoveryDto } from './dto/password-recovery.dto';
import { AuthTokenPayloadDto } from './dto/auth-token-payload.dto';
import { SecurityConfigService } from '../../config/config-services/security-config.service';
import { UsersRepository } from '../users/interfaces/users.repository';
import { SecurityDeviceModel } from '../security-devices/models/security-device.model';
import IdGenerator from '../../common/utils/id-generator';
import { SecurityDevicesRepository } from '../security-devices/interfaces/security-devices.repository';
import UserEntity from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    //private usersService: UsersService,
    private usersRepository: UsersRepository,
    private securityDevicesRepository: SecurityDevicesRepository,
    private securityDevicesService: SecurityDevicesService,
    private emailManagerService: EmailManagerService,
    private jwtService: JwtService,
    private securityConfigService: SecurityConfigService,
  ) {}

  async validateUser(loginOrEmail: string, password: string): Promise<UserEntity | null> {
    // 1. Get user
    const user: UserEntity | null = await this.usersRepository.findUserByLoginOrEmail(loginOrEmail);
    if (!user) return null;

    const isPasswordCorrect: boolean = await user.isPasswordCorrect(password);
    if (!isPasswordCorrect) return null;

    return user;
  }

  // async register(createUserDto: CreateUserDto): Promise<UserDocument | CustomErrorDto> {
  //   // 1. Create new user
  //   const createdUser: UserDocument | null = await this.usersRepository.create(createUserDto);
  //   if (!createdUser) return new CustomErrorDto(HttpStatus.NOT_FOUND, 'user not found');
  //
  //   try {
  //     // 2. Try to send password confirmation email
  //     await this.emailManagerService.sendEmailConfirmationMessage(createdUser);
  //   } catch (error) {
  //     // 2.1. If Error occurred, then delete user
  //     console.error(error);
  //     await this.usersRepository.remove(createdUser.id);
  //     return new CustomErrorDto(
  //       HttpStatus.SERVICE_UNAVAILABLE,
  //       'error occurred while try to send email',
  //     );
  //   }
  //
  //   return createdUser;
  // }

  async login(extendedLoginDataDto: ExtendedLoginDataDto, userId: string): Promise<AuthTokensDto | CustomErrorDto> {
    if (!userId) return new CustomErrorDto(HttpStatus.BAD_REQUEST, 'error in login step, user not transferred');

    const createSecurityDeviceDto: CreateSecurityDeviceDto = new CreateSecurityDeviceDto(
      userId,
      extendedLoginDataDto.ip,
      extendedLoginDataDto.title,
    );

    // 3. Create device session
    const createdSession: SecurityDeviceModel | null = await this.securityDevicesService.createDeviceSession(
      createSecurityDeviceDto,
    );

    if (!createdSession) {
      return new CustomErrorDto(HttpStatus.INTERNAL_SERVER_ERROR, 'can not create new device session');
    }

    const tokensPayload = {
      userId: createdSession.userId,
      deviceId: createdSession.deviceId,
      lastActiveDate: createdSession.lastActiveDate,
    };

    const authTokens = new AuthTokensDto(
      this.jwtService.sign(tokensPayload, {
        secret: this.securityConfigService.jwtSecret,
        expiresIn: this.securityConfigService.accessTokenExpirationSeconds,
      }),
      this.jwtService.sign(tokensPayload, {
        secret: this.securityConfigService.jwtSecret,
        expiresIn: this.securityConfigService.refreshTokenExpirationSeconds,
      }),
    );

    return authTokens;
  }

  async confirmEmail(registrationConfirmationDto: RegistrationConfirmationDto): Promise<boolean> {
    const code = registrationConfirmationDto.code;
    const user: UserEntity | null = await this.usersRepository.findUserByEmailConfirmationCode(code);

    if (!user) return false;
    if (!user.canBeConfirmed(code)) return false;

    await user.confirm(code);
    const result: boolean = await this.usersRepository.save(user);
    return result;
  }

  async resendConfirmCode(registrationEmailResendDto: RegistrationEmailResendDto): Promise<boolean> {
    const email = registrationEmailResendDto.email;
    const user: UserEntity | null = await this.usersRepository.findUserByLoginOrEmail(email);
    if (!user) return false;
    if (user.emailConfirmation.isConfirmed) return false;

    user.setEmailConfirmationCode(IdGenerator.generate());
    await this.usersRepository.save(user);

    try {
      await this.emailManagerService.sendEmailConfirmationMessage(user);
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  async generateNewTokensPair(tokenPayloadDto: AuthTokenPayloadDto): Promise<AuthTokensDto | CustomErrorDto> {
    const { deviceId, userId, lastActiveDate } = tokenPayloadDto;
    if (!deviceId || !userId || !lastActiveDate) return new CustomErrorDto(HttpStatus.BAD_REQUEST, 'wrong token data');

    // 1. Search user
    const user: UserEntity | null = await this.usersRepository.findById(userId);
    if (!user) return new CustomErrorDto(HttpStatus.NOT_FOUND, 'user not found');

    // 2. Search user`s device session
    const deviceSession: SecurityDeviceModel | null = await this.securityDevicesService.findDeviceSessionByDeviceId(
      deviceId,
    );

    if (!deviceSession) return new CustomErrorDto(HttpStatus.NOT_FOUND, 'device session is not found');

    // 3. Check version of refresh token by issued Date (issued Date like unique version of refresh token)
    if (deviceSession.lastActiveDate.toISOString() !== lastActiveDate) {
      return new CustomErrorDto(HttpStatus.BAD_REQUEST, 'device session is reused, it is not unique');
    }

    // 4. Update refresh token issued Date
    deviceSession.setLastActiveDate(new Date());
    const updateResult = await this.securityDevicesRepository.save(deviceSession);
    if (!updateResult) throw new Error('Session is not updated');

    const tokensPayload = {
      userId: deviceSession.userId,
      deviceId: deviceSession.deviceId,
      lastActiveDate: deviceSession.lastActiveDate,
    };

    return new AuthTokensDto(
      this.jwtService.sign(tokensPayload, {
        secret: this.securityConfigService.jwtSecret,
        expiresIn: this.securityConfigService.accessTokenExpirationSeconds,
      }),
      this.jwtService.sign(tokensPayload, {
        secret: this.securityConfigService.jwtSecret,
        expiresIn: this.securityConfigService.refreshTokenExpirationSeconds,
      }),
    );
  }

  async sendRecoveryCode(passwordRecoveryDto: PasswordRecoveryDto): Promise<boolean> {
    const email = passwordRecoveryDto.email;
    const user: UserEntity | null = await this.usersRepository.findUserByLoginOrEmail(email);
    if (!user) return false;

    await user.createNewPasswordRecoveryCode();
    await this.usersRepository.save(user);

    try {
      await this.emailManagerService.sendPasswordRecoveryMessage(user);
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  async confirmNewPassword(newPassword: string, recoveryCode: string): Promise<boolean> {
    const user: UserEntity | null = await this.usersRepository.findUserByPasswordConfirmationCode(recoveryCode);
    console.log(user);
    if (!user) return false;

    await user.setPassword(newPassword);
    await this.usersRepository.save(user);
    return true;
  }

  async logout(userId: string, deviceId: string): Promise<boolean | CustomErrorDto> {
    return await this.securityDevicesService.deleteDeviceSession(userId, deviceId);
  }
}
