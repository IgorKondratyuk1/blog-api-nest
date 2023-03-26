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
import { UsersRepository } from '../users/users.repository';
import { LoginDto } from './dto/login.dto';
import { Response } from 'express';
import { ExtendedLoginDataDto } from './dto/extended-login-data-dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { UserDocument } from '../users/schemas/user.schema';
import { AuthTokensDto } from './dto/auth-tokens.dto';
import { CustomErrorDto } from '../../common/dto/error';
import { ViewAccessTokenDto } from './dto/view-access-token.dto';
import { AppConfigService } from '../../config/config-services/app-config.service';
import { SecurityConfigService } from '../../config/config-services/security-config.service';
import { JwtAccessStrictAuthGuard } from './guards/jwt-access-strict-auth.guard';
import { UsersMapper } from '../users/utils/users.mapper';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { RegistrationConfirmationDto } from './dto/registration-confirmation.dto';
import { RegistrationEmailResendDto } from './dto/registration-email-resend.dto';
import { NewPasswordDto } from './dto/new-password.dto';
import { PasswordRecoveryDto } from './dto/password-recovery.dto';
import { AuthTokenPayloadDto } from './dto/auth-token-payload.dto';
import { HeaderUserAgent } from './decorators/header-user-agent.param.decorator';
import { CurrentUserId } from './decorators/current-user-id.param.decorator';
import { CurrentTokenPayload } from './decorators/current-token-payload.param.decorator';
import { JwtRefreshAuthGuard } from './guards/jwt-refresh-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
    private usersRepository: UsersRepository,
    private appConfigService: AppConfigService,
    private securityConfigService: SecurityConfigService,
  ) {}

  @UseGuards(JwtAccessStrictAuthGuard)
  @Get('/me')
  async me(@CurrentTokenPayload() tokenPayload: AuthTokenPayloadDto) {
    const user: UserDocument | null = await this.usersService.findById(tokenPayload.userId);
    if (!user) throw new NotFoundException('user not found');
    return UsersMapper.toMeView(user);
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
    const extendedLoginData = new ExtendedLoginDataDto(
      loginDto.loginOrEmail,
      loginDto.password,
      ip,
      title,
    );

    const loginResult: AuthTokensDto | CustomErrorDto = await this.authService.login(
      extendedLoginData,
      userId,
    );

    if (loginResult instanceof CustomErrorDto)
      throw new HttpException(loginResult.message, loginResult.code);

    // TODO carry out cookies config and combine with refresh-token route
    res.cookie('refreshToken', loginResult.refreshToken, {
      httpOnly: true,
      secure: this.appConfigService.nodeEnv !== 'development',
      maxAge: this.securityConfigService.refreshTokenExpirationSeconds * 1000, //ms from now
    });

    const viewAccessTokenDto: ViewAccessTokenDto = new ViewAccessTokenDto(loginResult.accessToken);
    return viewAccessTokenDto;
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('/registration')
  async registration(@Body() createUserDto: CreateUserDto) {
    const result: UserDocument | CustomErrorDto = await this.authService.register(createUserDto);
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
      throw new BadRequestException('user can not be confirmed'); // TODO check 400 code with ExceptionFilter
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

  @UseGuards(JwtRefreshAuthGuard)
  @Post('/refresh-token')
  async refreshToken(
    @CurrentTokenPayload() tokenPayload: AuthTokenPayloadDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result: AuthTokensDto | CustomErrorDto = await this.authService.generateNewTokensPair(
      tokenPayload,
    );
    if (result instanceof CustomErrorDto) throw new HttpException(result.message, result.code);

    // TODO carry out cookies config
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: this.appConfigService.nodeEnv !== 'development',
      maxAge: this.securityConfigService.refreshTokenExpirationSeconds * 1000 * 1000, // ms
    });

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

  @UseGuards(JwtRefreshAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('/logout')
  async logout(
    @CurrentTokenPayload() tokenPayload: AuthTokenPayloadDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.logout(tokenPayload.userId, tokenPayload.deviceId); // Refresh token not valid
    res.clearCookie('refreshToken');
    if (result instanceof CustomErrorDto) throw new HttpException(result.message, result.code);
    if (!result) throw new InternalServerErrorException();

    return;
  }
}
