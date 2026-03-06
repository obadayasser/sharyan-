import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthService } from './auth.service.js';
import { AdminLoginDto } from './dto/admin-login.dto.js';
import { RefreshTokenDto } from './dto/refresh-token.dto.js';
import { AdminJwtAuthGuard } from '../common/guards/admin-jwt-auth.guard.js';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard.js';
import { CurrentAdmin } from '../common/decorators/current-admin.decorator.js';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('admin/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Admin login' })
  async adminLogin(@Body() dto: AdminLoginDto) {
    return this.authService.adminLogin(dto);
  }

  @Post('admin/refresh')
  @UseGuards(JwtRefreshGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh admin tokens' })
  async refreshTokens(
    @CurrentAdmin() admin: any,
    @Body() dto: RefreshTokenDto,
  ) {
    return this.authService.refreshTokens(admin.id, admin.currentRefreshToken);
  }

  @Post('admin/logout')
  @UseGuards(AdminJwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Admin logout' })
  async adminLogout(@CurrentAdmin() admin: any) {
    return this.authService.adminLogout(admin.id);
  }

  @Get('admin/me')
  @UseGuards(AdminJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current admin profile' })
  async getMe(@CurrentAdmin() admin: any) {
    return this.authService.getAdminProfile(admin.id);
  }
}
