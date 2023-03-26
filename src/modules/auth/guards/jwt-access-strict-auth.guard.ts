import { AuthGuard } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtAccessStrictAuthGuard extends AuthGuard('jwt-access-strict') {}
