import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service.js';
import { AdminLoginDto } from './dto/admin-login.dto.js';
import type { AdminJwtPayload } from '../common/interfaces/jwt-payload.interface.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async adminLogin(dto: AdminLoginDto) {
    const admin = await this.prisma.admin.findUnique({
      where: { email: dto.email },
    });

    if (!admin) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!admin.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, admin.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.generateTokens({
      sub: admin.id,
      email: admin.email,
      isSuperAdmin: admin.isSuperAdmin,
    });

    const hashedRefreshToken = await bcrypt.hash(tokens.refreshToken, 10);
    await this.prisma.admin.update({
      where: { id: admin.id },
      data: {
        refreshToken: hashedRefreshToken,
        lastLoginAt: new Date(),
      },
    });

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      admin: {
        id: admin.id,
        email: admin.email,
        firstName: admin.firstName,
        lastName: admin.lastName,
        isSuperAdmin: admin.isSuperAdmin,
      },
    };
  }

  async refreshTokens(adminId: string, currentRefreshToken: string) {
    const admin = await this.prisma.admin.findUnique({
      where: { id: adminId },
    });

    if (!admin || !admin.refreshToken) {
      throw new UnauthorizedException('Access denied');
    }

    const isRefreshTokenValid = await bcrypt.compare(
      currentRefreshToken,
      admin.refreshToken,
    );

    if (!isRefreshTokenValid) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const tokens = await this.generateTokens({
      sub: admin.id,
      email: admin.email,
      isSuperAdmin: admin.isSuperAdmin,
    });

    const hashedRefreshToken = await bcrypt.hash(tokens.refreshToken, 10);
    await this.prisma.admin.update({
      where: { id: admin.id },
      data: { refreshToken: hashedRefreshToken },
    });

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async adminLogout(adminId: string) {
    await this.prisma.admin.update({
      where: { id: adminId },
      data: { refreshToken: null },
    });
    return { message: 'Logged out successfully' };
  }

  async getAdminProfile(adminId: string) {
    const admin = await this.prisma.admin.findUnique({
      where: { id: adminId },
    });
    if (!admin) throw new UnauthorizedException('Admin not found');
    const { passwordHash, refreshToken, ...result } = admin;
    return result;
  }

  private async generateTokens(payload: AdminJwtPayload) {
    const accessExpiration = this.configService.get<string>('JWT_ACCESS_EXPIRATION') || '15m';
    const refreshExpiration = this.configService.get<string>('JWT_REFRESH_EXPIRATION') || '7d';

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload as any, {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
        expiresIn: accessExpiration as any,
      }),
      this.jwtService.signAsync(payload as any, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: refreshExpiration as any,
      }),
    ]);

    return { accessToken, refreshToken };
  }
}
