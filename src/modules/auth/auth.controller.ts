import {
  Controller,
  Get,
  Post,
  Body,
  Ip,
  UseGuards,
  HttpException,
  Res,
  NotFoundException,
  HttpStatus,
  HttpCode,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { Response } from 'express';
import { ExtendedLoginDataDto } from './dto/extended-login-data-dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { AuthTokensDto } from './dto/auth-tokens.dto';
import { CustomErrorDto } from '../../common/dto/error';
import { ViewAccessTokenDto } from './dto/view-access-token.dto';
import { AppConfigService } from '../../config/config-services/app-config.service';
import { SecurityConfigService } from '../../config/config-services/security-config.service';
import { JwtAccessStrictAuthGuard } from './guards/jwt-access-strict-auth.guard';
import { UsersMapper } from '../users/utils/users.mapper';
import { CreateUserDto } from '../users/models/input/create-user.dto';
import { RegistrationConfirmationDto } from './dto/registration-confirmation.dto';
import { RegistrationEmailResendDto } from './dto/registration-email-resend.dto';
import { NewPasswordDto } from './dto/new-password.dto';
import { PasswordRecoveryDto } from './dto/password-recovery.dto';
import { AuthTokenPayloadDto } from './dto/auth-token-payload.dto';
import { HeaderUserAgent } from './decorators/header-user-agent.param.decorator';
import { CurrentUserId } from './decorators/current-user-id.param.decorator';
import { CurrentTokenPayload } from './decorators/current-token-payload.param.decorator';
import { JwtRefreshAuthGuard } from './guards/jwt-refresh-auth.guard';
import { SkipThrottle, Throttle } from '@nestjs/throttler';
import { CookiesOptions } from './utils/CookiesOptions';
import { CommandBus } from '@nestjs/cqrs';
import { RegisterUserCommand } from './use-cases/register-user.use-case';
import { UsersRepository } from '../users/interfaces/users.repository';
import UserEntity from '../users/entities/user.entity';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
    private usersRepository: UsersRepository,
    private appConfigService: AppConfigService,
    private securityConfigService: SecurityConfigService,
    private commandBus: CommandBus,
  ) {}

  @SkipThrottle()
  @UseGuards(JwtAccessStrictAuthGuard)
  @Get('/me')
  async me(@CurrentTokenPayload() tokenPayload: AuthTokenPayloadDto) {
    const user: UserEntity | null = await this.usersService.findById(tokenPayload.userId);
    if (!user) throw new NotFoundException('user not found');
    return UsersMapper.toViewMe(user);
  }

  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('/login')
  async login(
    @HeaderUserAgent() title: string,
    @CurrentUserId() userId: string,
    @Ip() ip,
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const extendedLoginData = new ExtendedLoginDataDto(loginDto.loginOrEmail, loginDto.password, ip, title);
    const loginResult: AuthTokensDto | CustomErrorDto = await this.authService.login(extendedLoginData, userId);

    if (loginResult instanceof CustomErrorDto) throw new HttpException(loginResult.message, loginResult.code);

    res.cookie(
      'refreshToken',
      loginResult.refreshToken,
      CookiesOptions.createOptions(
        true,
        this.appConfigService.nodeEnv,
        this.securityConfigService.refreshTokenExpirationSeconds,
      ),
    );

    const viewAccessTokenDto: ViewAccessTokenDto = new ViewAccessTokenDto(loginResult.accessToken);
    return viewAccessTokenDto;
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('/registration')
  async registration(@Body() createUserDto: CreateUserDto) {
    const result: UserEntity | CustomErrorDto = await this.commandBus.execute(new RegisterUserCommand(createUserDto));
    if (result instanceof CustomErrorDto) throw new HttpException(result.message, result.code);
    return;
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('/registration-confirmation')
  async registrationConfirmation(@Body() registrationConfirmationDto: RegistrationConfirmationDto) {
    const result: boolean = await this.authService.confirmEmail(registrationConfirmationDto);

    if (result) {
      return;
    } else {
      throw new BadRequestException('confirmation code is not found or user is already confirmed');
    }
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('/registration-email-resending')
  async registrationEmailResending(@Body() registrationEmailResendDto: RegistrationEmailResendDto) {
    const result: boolean = await this.authService.resendConfirmCode(registrationEmailResendDto);
    if (result) {
      return;
    } else {
      throw new BadRequestException('can not resend email');
    }
  }

  @SkipThrottle()
  @UseGuards(JwtRefreshAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('/refresh-token')
  async refreshToken(
    @CurrentTokenPayload() tokenPayload: AuthTokenPayloadDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result: AuthTokensDto | CustomErrorDto = await this.authService.generateNewTokensPair(tokenPayload);
    if (result instanceof CustomErrorDto) throw new HttpException(result.message, result.code);

    res.cookie(
      'refreshToken',
      result.refreshToken,
      CookiesOptions.createOptions(
        true,
        this.appConfigService.nodeEnv,
        this.securityConfigService.refreshTokenExpirationSeconds,
      ),
    );

    const viewAccessTokenDto: ViewAccessTokenDto = new ViewAccessTokenDto(result.accessToken);
    return viewAccessTokenDto;
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('/new-password')
  async newPassword(@Body() newPasswordDto: NewPasswordDto) {
    const result: boolean = await this.authService.confirmNewPassword(
      newPasswordDto.newPassword,
      newPasswordDto.recoveryCode,
    );

    if (!result) throw new BadRequestException();
    return;
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('/password-recovery')
  async passwordRecovery(@Body() passwordRecoveryDto: PasswordRecoveryDto) {
    const result = await this.authService.sendRecoveryCode(passwordRecoveryDto);
    if (!result) throw new BadRequestException();

    return;
  }

  @SkipThrottle()
  @UseGuards(JwtRefreshAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('/logout')
  async logout(@CurrentTokenPayload() tokenPayload: AuthTokenPayloadDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.logout(tokenPayload.userId, tokenPayload.deviceId); // Refresh token not valid
    res.clearCookie('refreshToken');
    if (result instanceof CustomErrorDto) throw new HttpException(result.message, result.code);
    if (!result) throw new InternalServerErrorException();

    return;
  }
}
