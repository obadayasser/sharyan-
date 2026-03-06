import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service.js';
import { ALLOW_UNREGISTERED_KEY } from '../decorators/allow-unregistered.decorator.js';

@Injectable()
export class DeviceAuthGuard implements CanActivate {
  constructor(
    private readonly prisma: PrismaService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const deviceId = request.headers['x-device-id'] as string;
    const userType = request.headers['x-user-type'] as string;

    if (!deviceId) {
      throw new UnauthorizedException('X-Device-ID header is required');
    }

    if (!userType) {
      throw new UnauthorizedException('X-User-Type header is required');
    }

    const allowUnregistered = this.reflector.get<boolean>(
      ALLOW_UNREGISTERED_KEY,
      context.getHandler(),
    );

    let user: any = null;

    switch (userType.toUpperCase()) {
      case 'DONOR':
        user = await this.prisma.donor.findUnique({ where: { deviceId } });
        break;
      case 'PATIENT':
        user = await this.prisma.patient.findUnique({ where: { deviceId } });
        break;
      case 'BLOOD_BANK':
        user = await this.prisma.bloodBank.findUnique({ where: { deviceId } });
        break;
      default:
        throw new UnauthorizedException('Invalid X-User-Type header');
    }

    if (!user && !allowUnregistered) {
      throw new UnauthorizedException('Device not registered');
    }

    request.deviceUser = user;
    request.deviceId = deviceId;
    request.deviceUserType = userType.toUpperCase();
    return true;
  }
}
