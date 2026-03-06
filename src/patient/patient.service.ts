import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { RegisterPatientDto } from './dto/register-patient.dto.js';
import { UpdatePatientDto } from './dto/update-patient.dto.js';
import { paginate } from '../common/utils/pagination.util.js';

@Injectable()
export class PatientService {
  constructor(private readonly prisma: PrismaService) {}

  async registerOrGet(deviceId: string, dto: RegisterPatientDto) {
    const existing = await this.prisma.patient.findUnique({ where: { deviceId } });
    if (existing) return existing;

    return this.prisma.patient.create({
      data: {
        deviceId,
        name: dto.name,
        mobile: dto.mobile,
        latitude: dto.latitude,
        longitude: dto.longitude,
        fcmToken: dto.fcmToken,
      },
    });
  }

  async getProfile(deviceId: string) {
    const patient = await this.prisma.patient.findUnique({
      where: { deviceId },
      include: {
        _count: { select: { bloodRequests: true } },
      },
    });
    if (!patient) throw new NotFoundException('Patient not found');
    return patient;
  }

  async updateProfile(deviceId: string, dto: UpdatePatientDto) {
    return this.prisma.patient.update({
      where: { deviceId },
      data: dto,
    });
  }

  async getMyRequests(patientId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const [requests, total] = await Promise.all([
      this.prisma.bloodRequest.findMany({
        where: { patientId },
        skip,
        take: limit,
        include: { _count: { select: { donationOffers: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.bloodRequest.count({ where: { patientId } }),
    ]);
    return paginate(requests, total, page, limit);
  }

  async updateFcmToken(deviceId: string, fcmToken: string) {
    return this.prisma.patient.update({
      where: { deviceId },
      data: { fcmToken },
    });
  }
}
