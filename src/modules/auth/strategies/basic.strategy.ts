import { BasicStrategy as Strategy } from 'passport-http';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { SecurityConfigService } from '../../../config/config-services/security-config.service';

@Injectable()
export class BasicStrategy extends PassportStrategy(Strategy) {
  constructor(private securityConfigService: SecurityConfigService) {
    super();
  }

  public validate = async (username, password): Promise<boolean> => {
    if (
      this.securityConfigService.basicUsername === username &&
      this.securityConfigService.basicPassword === password
    ) {
      return true;
    }
    throw new UnauthorizedException();
  };
}
