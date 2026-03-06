import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { PrismaService } from '../../prisma/prisma.service.js';
import type { AdminJwtPayload } from '../../common/interfaces/jwt-payload.interface.js';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(
    configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_REFRESH_SECRET') || 'fallback-secret',
      passReqToCallback: true as const,
    });
  }

  async validate(req: Request, payload: AdminJwtPayload) {
    const refreshToken = req.body.refreshToken;
    const admin = await this.prisma.admin.findUnique({
      where: { id: payload.sub },
    });

    if (!admin || !admin.isActive || !admin.refreshToken) {
      throw new UnauthorizedException('Access denied');
    }

    return { ...admin, currentRefreshToken: refreshToken };
  }
}
